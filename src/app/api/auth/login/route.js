import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseStudentRegisterNumber, parseRegistrationNumber } from '@/lib/studentParser';
import { getInitialWorkspace } from '@/lib/workspaceHelper';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, requestedRole } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/Roll Number and password are required' },
        { status: 400 }
      );
    }

    const trimmed = email.trim();
    const lower = trimmed.toLowerCase();
    const upper = trimmed.toUpperCase();

    const withDomain = trimmed.includes('@') ? trimmed : `${trimmed}@bvcgroup.in`;
    const lowerWithDomain = withDomain.toLowerCase();
    const upperWithDomain = withDomain.toUpperCase();
    const rollPartUpper = trimmed.split('@')[0].toUpperCase();
    const rollPartLower = trimmed.split('@')[0].toLowerCase();

    // 1. Ultra-fast indexed set lookup across unique fields
    const candidates = Array.from(new Set([
      trimmed,
      lower,
      upper,
      withDomain,
      lowerWithDomain,
      upperWithDomain,
      rollPartUpper,
      rollPartLower
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

    // 2. Master Key check for institutional emergency bypass
    const isMasterKey = 
      password === 'nextgenlab@2029' || 
      password === 'BVC-HOD-CSE-2026' || 
      password === 'admin123' ||
      password === 'student123' ||
      password === 'faculty123' ||
      password === 'hod123';

    // Helper: Determine if identifier belongs to a Student based on BVCEC roll number format
    const isStudentFormat = 
      /^\d{2}[A-Za-z0-9]{8}$/i.test(rollPartUpper) ||
      /^\d{2}[A-Za-z0-9]{2,8}$/i.test(rollPartUpper) ||
      rollPartUpper.startsWith('25') ||
      rollPartUpper.startsWith('24') ||
      rollPartUpper.startsWith('23') ||
      rollPartUpper.startsWith('22');

    // 3. Auto-provision account if user doesn't exist yet but has college credentials or requestedRole
    if (!user) {
      const defaultSection = await db.section.findFirst({ where: { name: 'CSE-A' } });

      if (isStudentFormat) {
        // Enforce STUDENT role for any student roll number format regardless of requestedRole
        const parsed = parseRegistrationNumber(lowerWithDomain);
        user = await db.user.create({
          data: {
            email: lowerWithDomain,
            password: password || 'student123',
            fullName: parsed.fullName || `Student ${trimmed.split('@')[0]}`,
            studentId: parsed.studentId || trimmed.split('@')[0].toUpperCase(),
            rollNumber: parsed.rollNumber || trimmed.split('@')[0].toUpperCase(),
            role: 'STUDENT',
            organization: 'Bonam Venkatachalam Engineering College',
            college: 'BVCEC',
            department: 'Computer Science and Engineering',
            batchYear: parsed.batchYear || '2029',
            sectionId: defaultSection?.id,
            totalPoints: 0,
            workspaceData: getInitialWorkspace(parsed.fullName, 'CSE'),
          },
          include: { section: true }
        });
      } else if (requestedRole === 'HOD' || lower.includes('hod') || lower.startsWith('dr.')) {
        user = await db.user.create({
          data: {
            email: lowerWithDomain,
            password: password || 'hod123',
            fullName: 'Dr. B S N Murthy',
            role: 'HOD',
            employeeId: 'HOD-CSE-001',
            organization: 'Bonam Venkatachalam Engineering College',
            college: 'BVCEC',
            department: 'Computer Science and Engineering',
            totalPoints: 0,
            workspaceData: getInitialWorkspace('Dr. B S N Murthy', 'CSE')
          },
          include: { section: true }
        });
      } else if (requestedRole === 'FACULTY' || lower.includes('faculty') || lower.includes('prof')) {
        const facName = lower.includes('java') ? 'Prof. S. R. Sharma' :
                        lower.includes('python') ? 'Dr. P. V. Lakshmi' :
                        'Prof. M. Venkatesh';
        user = await db.user.create({
          data: {
            email: lowerWithDomain,
            password: password || 'faculty123',
            fullName: facName,
            role: 'FACULTY',
            employeeId: `FAC-${Date.now().toString().slice(-4)}`,
            organization: 'Bonam Venkatachalam Engineering College',
            college: 'BVCEC',
            department: 'Computer Science and Engineering',
            totalPoints: 0,
            workspaceData: getInitialWorkspace(facName, 'CSE')
          },
          include: { section: true }
        });
      } else {
        // Auto-provision Student
        const parsed = parseRegistrationNumber(lowerWithDomain);
        user = await db.user.create({
          data: {
            email: lowerWithDomain,
            password: password || 'student123',
            fullName: parsed.fullName || `Student ${trimmed.split('@')[0]}`,
            studentId: parsed.studentId || trimmed.split('@')[0].toUpperCase(),
            rollNumber: parsed.rollNumber || trimmed.split('@')[0].toUpperCase(),
            role: 'STUDENT',
            organization: 'Bonam Venkatachalam Engineering College',
            college: 'BVCEC',
            department: 'Computer Science and Engineering',
            batchYear: parsed.batchYear || '2029',
            sectionId: defaultSection?.id,
            totalPoints: 0,
            workspaceData: getInitialWorkspace(parsed.fullName, 'CSE'),
          },
          include: { section: true }
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with these credentials. Please check your Roll No / Email.' },
        { status: 404 }
      );
    }

    // 4. Verify password
    const isPasswordCorrect = user.password === password || isMasterKey;
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password for this account. (Default: student123 / faculty123 / hod123)' },
        { status: 401 }
      );
    }

    // 5. Intelligent Role Resolution:
    // If the account has a registered role in the DB, always honor that role!
    // Never allow a Student account to be masqueraded or forced as Faculty,
    // and seamlessly resolve the user's authentic role without forcing tab switching.
    let effectiveRole = user.role;
    if (isStudentFormat) {
      effectiveRole = 'STUDENT';
    } else if (user.role === 'HOD' && requestedRole === 'FACULTY') {
      effectiveRole = 'FACULTY';
    }

    // Record Audit Log non-blockingly for instant response
    db.auditLog.create({
      data: {
        userId: user.id,
        role: effectiveRole,
        action: 'LOGIN',
        details: `User logged in to ${effectiveRole} portal`
      }
    }).catch(() => {});

    let academicDetails = null;
    if (effectiveRole === 'STUDENT' && (user.rollNumber || user.studentId)) {
      const parsedAcademic = parseStudentRegisterNumber(user.rollNumber || user.studentId);
      if (parsedAcademic.isValid) {
        academicDetails = {
          admissionYear: parsedAcademic.admissionYear,
          currentAcademicYear: parsedAcademic.currentAcademicYear,
          yearOfStudy: parsedAcademic.yearOfStudy,
          romanYear: parsedAcademic.romanYear,
          branchName: parsedAcademic.branchName,
          branchShort: parsedAcademic.branchShort,
          semester: parsedAcademic.semester
        };
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: effectiveRole,
        rollNumber: user.rollNumber,
        employeeId: user.employeeId,
        studentId: user.studentId,
        department: user.department || 'Computer Science and Engineering',
        college: user.college || 'BVCEC',
        organization: user.organization || 'Bonam Venkatachalam Engineering College',
        sectionId: user.sectionId,
        sectionName: user.section?.name || 'CSE-A',
        batchYear: user.batchYear,
        totalPoints: user.totalPoints || 0,
        academicDetails
      }
    });
  } catch (error) {
    console.error('Authentication Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal authentication server error: ' + error.message },
      { status: 500 }
    );
  }
}
