import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const faculties = await db.user.findMany({
      where: { role: 'FACULTY' },
      select: {
        id: true,
        fullName: true,
        email: true,
        employeeId: true,
        department: true,
        password: true,
        createdAt: true,
        allocations: {
          include: {
            subject: true,
            section: true
          }
        },
        createdTasks: {
          select: { id: true, title: true, sectionId: true, subjectId: true }
        }
      },
      orderBy: { fullName: 'asc' }
    });

    return NextResponse.json({ success: true, faculties });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { fullName, email, password = 'faculty123', employeeId, department = 'Computer Science & Engineering' } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, error: 'Full name and email are required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const normalizedEmail = trimmedEmail.includes('@') ? trimmedEmail : `${trimmedEmail}@bvcgroup.in`;

    const existing = await db.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { email: trimmedEmail }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const faculty = await db.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: password.trim() || 'faculty123',
        role: 'FACULTY',
        employeeId: employeeId?.trim() || `FAC-CSE-${Math.floor(100 + Math.random() * 900)}`,
        department,
        college: 'BVCEC',
        organization: 'Bonam Venkatachalam Engineering College'
      }
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: faculty.id,
        role: 'HOD',
        action: 'FACULTY_REGISTERED',
        details: `Registered new faculty: ${faculty.fullName} (${faculty.email})`
      }
    }).catch(() => {});

    return NextResponse.json({ success: true, faculty });
  } catch (error) {
    console.error('Error creating faculty:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, fullName, email, employeeId, password, department } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Faculty ID is required for updating.' }, { status: 400 });
    }

    const faculty = await db.user.findUnique({
      where: { id }
    });

    if (!faculty) {
      return NextResponse.json({ success: false, error: 'Faculty not found.' }, { status: 404 });
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName.trim();
    if (employeeId) updateData.employeeId = employeeId.trim();
    if (password && password.trim()) updateData.password = password.trim();
    if (department) updateData.department = department.trim();

    if (email && email.trim()) {
      const trimmedEmail = email.trim().toLowerCase();
      const normalizedEmail = trimmedEmail.includes('@') ? trimmedEmail : `${trimmedEmail}@bvcgroup.in`;
      
      // Check if another user has this email
      const emailConflict = await db.user.findFirst({
        where: {
          email: normalizedEmail,
          NOT: { id }
        }
      });
      if (emailConflict) {
        return NextResponse.json({ success: false, error: 'Another account already uses this email address.' }, { status: 409 });
      }
      updateData.email = normalizedEmail;
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        employeeId: true,
        department: true,
        role: true
      }
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: id,
        role: 'HOD',
        action: 'FACULTY_UPDATED',
        details: `Updated faculty: ${updated.fullName} (${updated.email})`
      }
    }).catch(() => {});

    return NextResponse.json({ success: true, faculty: updated, message: 'Faculty updated successfully.' });
  } catch (error) {
    console.error('Error updating faculty:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Faculty ID is required.' }, { status: 400 });
    }

    const faculty = await db.user.findUnique({
      where: { id },
      include: {
        allocations: true,
        createdTasks: true
      }
    });

    if (!faculty) {
      return NextResponse.json({ success: false, error: 'Faculty member not found.' }, { status: 404 });
    }

    // Clean up allocations and tasks if any
    await db.facultyAllocation.deleteMany({ where: { facultyId: id } });
    await db.task.deleteMany({ where: { facultyId: id } });
    await db.user.delete({ where: { id } });

    // Audit log
    await db.auditLog.create({
      data: {
        role: 'HOD',
        action: 'FACULTY_DELETED',
        details: `Deleted faculty account: ${faculty.fullName} (${faculty.email})`
      }
    }).catch(() => {});

    return NextResponse.json({ success: true, message: `Faculty ${faculty.fullName} removed successfully.` });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
