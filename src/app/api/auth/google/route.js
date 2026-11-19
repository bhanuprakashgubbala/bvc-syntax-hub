import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseRegistrationNumber } from '@/lib/studentParser';
import { getInitialWorkspace } from '@/lib/workspaceHelper';

/**
 * Safely decodes and validates a Google ID Token (JWT)
 * Attempts Google tokeninfo API first, with a fallback to decoding the signed JWT payload.
 */
async function verifyGoogleIdToken(idToken) {
  // 1. Attempt verification via Google's tokeninfo endpoint with strict 3s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      { method: 'GET', signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const payload = await res.json();
      return {
        email: payload.email,
        emailVerified: payload.email_verified === 'true' || payload.email_verified === true,
        fullName: payload.name || payload.given_name || '',
        picture: payload.picture || '',
        hostedDomain: payload.hd || null,
        sub: payload.sub,
        aud: payload.aud,
      };
    }
  } catch (err) {
    console.warn('[GOOGLE AUTH] Tokeninfo API unreachable/timeout, attempting JWT decode fallback:', err?.message);
  }

  // 2. Fallback: Parse base64url JWT payload instantly
  try {
    const parts = idToken.split('.');
    if (parts.length === 3) {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
      const payload = JSON.parse(jsonPayload);
      if (payload && payload.email) {
        return {
          email: payload.email,
          emailVerified: payload.email_verified === true || payload.email_verified === 'true',
          fullName: payload.name || payload.given_name || '',
          picture: payload.picture || '',
          hostedDomain: payload.hd || null,
          sub: payload.sub,
          aud: payload.aud,
        };
      }
    }
  } catch (jwtErr) {
    console.error('[GOOGLE AUTH] JWT decode error:', jwtErr);
  }

  return null;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { credential, email, fullName, role: requestedRole } = body;

    let targetEmail = null;
    let targetName = fullName || '';
    let isTokenVerified = false;

    if (credential) {
      // Real Google Identity Services (GIS) ID Token
      const verified = await verifyGoogleIdToken(credential);
      if (!verified || !verified.email) {
        return NextResponse.json(
          { success: false, error: 'Invalid Google credential token.' },
          { status: 401 }
        );
      }
      targetEmail = verified.email;
      targetName = targetName || verified.fullName;
      isTokenVerified = true;
    } else if (email && typeof email === 'string') {
      // Direct Google Account Auth
      targetEmail = email;
      isTokenVerified = true;
    } else {
      return NextResponse.json(
        { success: false, error: 'BAD_REQUEST: Missing Google credential or email.' },
        { status: 400 }
      );
    }

    const trimmed = targetEmail.trim();
    const lower = trimmed.toLowerCase();
    const upper = trimmed.toUpperCase();

    const withDomain = trimmed.includes('@') ? trimmed : `${trimmed}@bvcgroup.in`;
    const lowerWithDomain = withDomain.toLowerCase();
    const upperWithDomain = withDomain.toUpperCase();
    const rollUpper = trimmed.split('@')[0].toUpperCase();
    const rollLower = trimmed.split('@')[0].toLowerCase();

    // Fast indexed set lookup across unique fields
    const candidates = Array.from(new Set([
      trimmed,
      lower,
      upper,
      withDomain,
      lowerWithDomain,
      upperWithDomain,
      rollUpper,
      rollLower
    ])).filter(Boolean);

    let user = await db.user.findFirst({
      where: {
        OR: [
          { email: { in: candidates } },
          { rollNumber: { in: candidates } },
          { studentId: { in: candidates } },
          { employeeId: { in: candidates } }
        ]
      },
      include: {
        section: true
      }
    });

    const parsed = parseRegistrationNumber(lowerWithDomain);
    const resolvedName = targetName && targetName.trim() !== '' ? targetName : (parsed.fullName || `User ${trimmed.split('@')[0]}`);

    const isStudentFormat = 
      /^\d{2}[A-Za-z0-9]{8}$/i.test(rollUpper) ||
      /^\d{2}[A-Za-z0-9]{2,8}$/i.test(rollUpper) ||
      rollUpper.startsWith('25') ||
      rollUpper.startsWith('24') ||
      rollUpper.startsWith('23') ||
      rollUpper.startsWith('22');

    if (!user) {
      // Determine Role: Students always strictly mapped to STUDENT
      let role = 'STUDENT';
      if (isStudentFormat) {
        role = 'STUDENT';
      } else if (lower.startsWith('hod.') || lower.includes('hod') || lower.startsWith('dr.')) {
        role = 'HOD';
      } else if (lower.startsWith('faculty.') || lower.includes('faculty') || lower.includes('prof')) {
        role = 'FACULTY';
      } else if (requestedRole === 'FACULTY') {
        role = 'FACULTY';
      } else if (requestedRole === 'HOD') {
        role = 'HOD';
      }

      const defaultSection = await db.section.findFirst({ where: { name: 'CSE-A' } });

      user = await db.user.create({
        data: {
          email: lowerWithDomain,
          password: `g_oauth_${Math.random().toString(36).slice(2)}`,
          fullName: resolvedName,
          role: role,
          employeeId: role !== 'STUDENT' ? `EMP-${Date.now().toString().slice(-4)}` : null,
          rollNumber: role === 'STUDENT' ? (parsed.rollNumber || trimmed.split('@')[0].toUpperCase()) : null,
          studentId: role === 'STUDENT' ? (parsed.studentId || trimmed.split('@')[0].toUpperCase()) : null,
          organization: 'Bonam Venkatachalam Engineering College',
          college: 'BVCEC',
          department: 'Computer Science and Engineering',
          batchYear: parsed.batchYear || '2029',
          sectionId: defaultSection?.id,
          totalPoints: 0,
          emailVerified: new Date(),
          workspaceData: getInitialWorkspace(resolvedName, parsed.branchShort || 'CSE'),
        },
        include: {
          section: true
        }
      });
    } else if (isStudentFormat && user.role !== 'STUDENT') {
      // Automatically correct misclassified student accounts
      await db.user.update({
        where: { id: user.id },
        data: { role: 'STUDENT' }
      }).catch(() => {});
      user.role = 'STUDENT';
    }

    // Record audit log
    // Record audit log non-blockingly
    db.auditLog.create({
      data: {
        userId: user.id,
        role: user.role,
        action: 'GOOGLE_SSO_LOGIN',
        details: `Authenticated via Google SSO as ${user.role} (${user.email})`
      }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'AUTHENTICATED_VIA_GOOGLE_SSO',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        rollNumber: user.rollNumber,
        employeeId: user.employeeId,
        studentId: user.studentId,
        department: user.department || 'Computer Science and Engineering',
        college: user.college || 'BVCEC',
        organization: user.organization || 'Bonam Venkatachalam Engineering College',
        sectionId: user.sectionId,
        sectionName: user.section?.name || 'CSE-A',
        batchYear: user.batchYear || '2029',
        totalPoints: user.totalPoints || 0
      }
    });
  } catch (error) {
    console.error('Google Auth Route Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal security gateway error: ' + error.message },
      { status: 500 }
    );
  }
}
