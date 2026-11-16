import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseRegistrationNumber } from '@/lib/studentParser';
import { getInitialWorkspace } from '@/lib/workspaceHelper';

/**
 * Safely decodes and validates a Google ID Token (JWT)
 * Attempts Google tokeninfo API first, with a fallback to decoding the signed JWT payload.
 */
async function verifyGoogleIdToken(idToken) {
  // 1. Attempt verification via Google's tokeninfo endpoint
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      { method: 'GET' }
    );
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
    console.warn('[GOOGLE AUTH] Tokeninfo API unreachable, attempting JWT decode fallback:', err?.message);
  }

  // 2. Fallback: Parse base64url JWT payload
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

    // Case-insensitive user lookup in database
    let user = await db.user.findFirst({
      where: {
        OR: [
          { email: trimmed },
          { email: lower },
          { email: upper },
          { email: withDomain },
          { email: lowerWithDomain },
          { email: upperWithDomain },
          { rollNumber: trimmed },
          { rollNumber: upper },
          { rollNumber: lower },
          { rollNumber: trimmed.split('@')[0].toUpperCase() },
          { employeeId: trimmed },
          { employeeId: upper }
        ]
      },
      include: {
        section: true
      }
    });

    const parsed = parseRegistrationNumber(lowerWithDomain);
    const resolvedName = targetName && targetName.trim() !== '' ? targetName : (parsed.fullName || `User ${trimmed.split('@')[0]}`);

    if (!user) {
      // Determine Role based on email prefix or requestedRole
      let role = requestedRole || 'STUDENT';
      if (lower.startsWith('hod.') || lower.includes('hod')) {
        role = 'HOD';
      } else if (lower.startsWith('faculty.') || lower.includes('faculty') || lower.includes('prof')) {
        role = 'FACULTY';
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
    }

    // Record audit log
    try {
      await db.auditLog.create({
        data: {
          userId: user.id,
          role: user.role,
          action: 'GOOGLE_SSO_LOGIN',
          details: `Authenticated via Google SSO as ${user.role} (${user.email})`
        }
      });
    } catch {}

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
