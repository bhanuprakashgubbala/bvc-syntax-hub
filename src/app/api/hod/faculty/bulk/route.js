import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { facultyList } = body;

    if (!Array.isArray(facultyList) || facultyList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please provide a non-empty list of faculty records to upload.' },
        { status: 400 }
      );
    }

    const created = [];
    const skipped = [];

    for (const item of facultyList) {
      const fullName = (item.fullName || item['Full Name'] || item.name || '').trim();
      const rawEmail = (item.email || item['Email'] || item['Email Address'] || '').trim().toLowerCase();
      const employeeId = (item.employeeId || item['Employee ID'] || item.empId || item['Emp ID'] || '').trim();
      const department = (item.department || item['Department'] || 'Computer Science and Engineering').trim();
      const password = (item.password || item['Password'] || 'faculty123').trim();
      const phone = (item.phone || item['Phone'] || item.mobile || '').trim();

      // Check required fields
      if (!fullName || !rawEmail) {
        skipped.push({
          fullName: fullName || 'Unknown',
          email: rawEmail || 'Missing Email',
          reason: 'Full Name and Email are mandatory fields.'
        });
        continue;
      }

      const normalizedEmail = rawEmail.includes('@') ? rawEmail : `${rawEmail}@bvcgroup.in`;

      // Check for duplicate user
      const existing = await db.user.findFirst({
        where: {
          OR: [
            { email: normalizedEmail },
            { email: rawEmail }
          ]
        }
      });

      if (existing) {
        skipped.push({
          fullName,
          email: normalizedEmail,
          reason: 'An account with this email address already exists.'
        });
        continue;
      }

      const generatedEmpId = employeeId || `FAC-CSE-${Math.floor(100 + Math.random() * 900)}`;

      // Initial workspace for faculty
      const workspaceData = JSON.stringify({
        fileSystem: [
          {
            id: 'folder-faculty',
            name: `${fullName} Workspace`,
            type: 'folder',
            isOpen: true,
            children: [
              {
                id: 'file-sample',
                name: 'lab_demo.py',
                type: 'file',
                language: 'python',
                code: `# Faculty Workspace: ${fullName}\nprint("BVCEC Lab Ready.")\n`,
                lastOutput: '',
                lastStdin: '',
              }
            ]
          }
        ],
        activeFileId: 'file-sample'
      });

      const newFaculty = await db.user.create({
        data: {
          fullName,
          email: normalizedEmail,
          password: password || 'faculty123',
          role: 'FACULTY',
          employeeId: generatedEmpId,
          department,
          college: 'BVCEC',
          organization: 'Bonam Venkatachalam Engineering College',
          phone: phone || null,
          totalPoints: 0,
          workspaceData
        }
      });

      created.push({
        id: newFaculty.id,
        fullName: newFaculty.fullName,
        email: newFaculty.email,
        employeeId: newFaculty.employeeId,
        department: newFaculty.department
      });
    }

    // Record institutional audit log
    if (created.length > 0) {
      try {
        await db.auditLog.create({
          data: {
            role: 'HOD',
            action: 'BULK_FACULTY_UPLOAD',
            details: `HOD bulk registered ${created.length} faculty members. ${skipped.length} skipped.`
          }
        });
      } catch (e) {
        console.warn('Audit log creation error:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk registration completed: ${created.length} faculty registered successfully${skipped.length > 0 ? `, ${skipped.length} skipped.` : '.'}`,
      createdCount: created.length,
      skippedCount: skipped.length,
      created,
      skipped
    });

  } catch (error) {
    console.error('Error during bulk faculty upload:', error);
    return NextResponse.json(
      { success: false, error: 'Bulk upload failed: ' + error.message },
      { status: 500 }
    );
  }
}
