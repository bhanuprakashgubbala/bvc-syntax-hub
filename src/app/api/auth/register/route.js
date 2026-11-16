import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseStudentRegisterNumber } from '@/lib/studentParser';

function getInitialWorkspace(studentName, branchShort) {
  return JSON.stringify({
    fileSystem: [
      {
        id: 'folder-src',
        name: `${branchShort || 'Lab'} Workspace`,
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
            code: `public class Solution {\n    public static void main(String[] args) {\n        System.out.println("BVCEC Lab Environment Ready.");\n    }\n}\n`,
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
    const { registerNumber, studentName, mobileNumber, password, confirmPassword } = body;

    // 1. Validate required fields presence
    if (!registerNumber || !studentName || !mobileNumber || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'All fields are mandatory: Register Number, Student Name, Mobile Number, and Password.' 
        },
        { status: 400 }
      );
    }

    // 2. Validate Register Number using institutional parser
    const parsed = parseStudentRegisterNumber(registerNumber);
    if (!parsed.isValid) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: 400 }
      );
    }

    // 3. Validate Student Name
    const cleanName = studentName.trim();
    if (cleanName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Student Name must be at least 2 characters.' },
        { status: 400 }
      );
    }

    // 4. Validate Registered Mobile Number (10 digits)
    const cleanMobile = mobileNumber.toString().trim().replace(/[\s-+()]/g, '');
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(cleanMobile)) {
      return NextResponse.json(
        { success: false, error: 'Registered Mobile Number must be a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    // 5. Validate Password and Confirmation
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Password and Confirm Password do not match.' },
        { status: 400 }
      );
    }

    // 6. Check for duplicate registration
    const institutionalEmail = `${parsed.registerNumber.toLowerCase()}@bvcgroup.in`;
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { rollNumber: parsed.registerNumber },
          { rollNumber: parsed.registerNumber.toLowerCase() },
          { studentId: parsed.registerNumber },
          { email: institutionalEmail },
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Register Number ${parsed.registerNumber} is already registered. Please sign in with your credentials.` 
        },
        { status: 409 }
      );
    }

    // 7. Ensure Section exists for the student's branch
    const sectionName = `${parsed.branchShort}-A`;
    let section = await db.section.findFirst({
      where: { name: sectionName }
    });

    if (!section) {
      // Create section if not exists
      let dept = await db.department.findFirst({
        where: { code: parsed.branchShort }
      });
      if (!dept) {
        dept = await db.department.create({
          data: {
            code: parsed.branchShort,
            name: parsed.department,
            college: 'Bonam Venkatachalam Engineering College, Odalarevu'
          }
        });
      }

      section = await db.section.create({
        data: {
          name: sectionName,
          departmentId: dept.id,
          academicYear: parsed.academicYearFull,
          semester: parsed.semester
        }
      });
    }

    // 8. Create new Student User
    const newUser = await db.user.create({
      data: {
        email: institutionalEmail,
        password: password,
        fullName: cleanName,
        role: 'STUDENT',
        rollNumber: parsed.registerNumber,
        studentId: parsed.registerNumber,
        phone: cleanMobile,
        organization: 'Bonam Venkatachalam Engineering College',
        college: 'BVCEC',
        department: parsed.department,
        batchYear: parsed.batchPassingYear,
        sectionId: section.id,
        totalPoints: 0,
        workspaceData: getInitialWorkspace(cleanName, parsed.branchShort)
      },
      include: {
        section: true
      }
    });

    // 9. Audit log entry
    try {
      await db.auditLog.create({
        data: {
          userId: newUser.id,
          role: 'STUDENT',
          action: 'REGISTER',
          details: `Student account created: ${parsed.registerNumber} (${cleanName}) - Branch: ${parsed.branchShort}, Academic Year: ${parsed.currentAcademicYear}`
        }
      });
    } catch (e) {
      console.warn('Audit log creation error:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Student account registered successfully! Entering student portal...',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: 'STUDENT',
        rollNumber: newUser.rollNumber,
        studentId: newUser.studentId,
        department: newUser.department,
        college: newUser.college,
        organization: newUser.organization,
        sectionId: newUser.sectionId,
        sectionName: newUser.section?.name || sectionName,
        batchYear: newUser.batchYear,
        totalPoints: newUser.totalPoints || 0,
        academicDetails: {
          admissionYear: parsed.admissionYear,
          currentAcademicYear: parsed.currentAcademicYear,
          yearOfStudy: parsed.yearOfStudy,
          branchName: parsed.branchName,
          branchShort: parsed.branchShort,
        }
      }
    });

  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed: ' + error.message },
      { status: 500 }
    );
  }
}
