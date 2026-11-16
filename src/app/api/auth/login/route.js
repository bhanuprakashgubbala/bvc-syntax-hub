import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseStudentRegisterNumber, parseRegistrationNumber } from '@/lib/studentParser';

function getInitialWorkspace(studentName, branchShort) {
  return JSON.stringify({
    fileSystem: [
      {
        id: 'folder-src',
        name: `${branchShort || 'Code'} Workspace`,
        type: 'folder',
        isOpen: true,
        children: [
          {
            id: 'file-main-py',
            name: 'main.py',
            type: 'file',
            language: 'python',
            code: `# Personal Codespace for ${studentName} (${branchShort || 'Engineering'})\nprint("Welcome to your personal Codespace!")\n`,
            lastOutput: '',
            lastStdin: '',
          },
          {
            id: 'file-solution-java',
            name: 'Solution.java',
            type: 'file',
            language: 'java',
            code: `public class Solution {\n    public static void main(String[] args) {\n        System.out.println("BVCEC CSE Lab Environment Ready.");\n    }\n}\n`,
            lastOutput: '',
            lastStdin: '',
          },
        ],
      },
    ],
    activeFileId: 'file-main-py',
  });
}

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

    // 1. Case-insensitive lookup across email, rollNumber, employeeId, studentId
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
          { employeeId: upper },
          { employeeId: lower },
          { studentId: trimmed },
          { studentId: upper }
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

    // 3. Auto-provision account if user doesn't exist yet but has college credentials or requestedRole
    if (!user) {
      const defaultSection = await db.section.findFirst({ where: { name: 'CSE-A' } });

      if (requestedRole === 'HOD' || lower.includes('hod')) {
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

    // 5. Role Verification - Allow seamless switching if user role matches
    let effectiveRole = user.role;
    if (requestedRole && requestedRole.toUpperCase() !== user.role.toUpperCase()) {
      // If user is HOD, they can access faculty portal
      if (user.role === 'HOD' && requestedRole === 'FACULTY') {
        effectiveRole = 'FACULTY';
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: `This account is registered as ${user.role}. Please click the ${user.role} tab above to sign in.` 
          },
          { status: 403 }
        );
      }
    }

    // Record Audit Log safely
    try {
      await db.auditLog.create({
        data: {
          userId: user.id,
          role: effectiveRole,
          action: 'LOGIN',
          details: `User logged in to ${effectiveRole} portal`
        }
      });
    } catch {}

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
