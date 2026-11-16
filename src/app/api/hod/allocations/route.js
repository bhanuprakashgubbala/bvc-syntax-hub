import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const allocations = await db.facultyAllocation.findMany({
      include: {
        faculty: {
          select: { id: true, fullName: true, email: true, employeeId: true }
        },
        subject: {
          select: { id: true, code: true, name: true }
        },
        section: {
          select: {
            id: true,
            name: true,
            academicYear: true,
            semester: true,
            _count: { select: { students: true } }
          }
        }
      },
      orderBy: [
        { section: { name: 'asc' } },
        { subject: { name: 'asc' } }
      ]
    });

    const faculties = await db.user.findMany({
      where: { role: 'FACULTY' },
      select: { id: true, fullName: true, email: true, employeeId: true },
      orderBy: { fullName: 'asc' }
    });

    const subjects = await db.subject.findMany({
      orderBy: { code: 'asc' }
    });

    const sections = await db.section.findMany({
      include: {
        _count: { select: { students: true } }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      allocations,
      faculties,
      subjects,
      sections
    });
  } catch (error) {
    console.error('Error fetching allocations:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { facultyId, subjectId, sectionId, sectionIds, academicYear = '2025-2026', action } = body;

    if (!facultyId || !subjectId) {
      return NextResponse.json(
        { success: false, error: 'Faculty and Subject are required.' },
        { status: 400 }
      );
    }

    // Toggle action for direct 1-click checkbox allocation
    if (action === 'toggle' && sectionId) {
      const existing = await db.facultyAllocation.findFirst({
        where: { facultyId, subjectId, sectionId, academicYear }
      });

      if (existing) {
        await db.facultyAllocation.delete({ where: { id: existing.id } });
        return NextResponse.json({
          success: true,
          action: 'removed',
          allocated: false,
          message: 'Section allocation removed'
        });
      } else {
        const created = await db.facultyAllocation.create({
          data: { facultyId, subjectId, sectionId, academicYear },
          include: { faculty: true, subject: true, section: true }
        });
        return NextResponse.json({
          success: true,
          action: 'created',
          allocated: true,
          allocation: created,
          message: 'Section allocated successfully'
        });
      }
    }

    // Support multiple checkbox selections (array of sectionIds) or single sectionId
    const targetSectionIds = Array.isArray(sectionIds) && sectionIds.length > 0 
      ? sectionIds 
      : (sectionId ? [sectionId] : []);

    if (targetSectionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select at least one Section checkbox (e.g. CSE-A, CSE-B).' },
        { status: 400 }
      );
    }

    const createdAllocations = [];
    const alreadyAllocated = [];

    for (const secId of targetSectionIds) {
      const existing = await db.facultyAllocation.findFirst({
        where: {
          facultyId,
          subjectId,
          sectionId: secId,
          academicYear
        }
      });

      if (existing) {
        alreadyAllocated.push(secId);
      } else {
        const newAllocation = await db.facultyAllocation.create({
          data: {
            facultyId,
            subjectId,
            sectionId: secId,
            academicYear
          },
          include: {
            faculty: true,
            subject: true,
            section: true
          }
        });
        createdAllocations.push(newAllocation);

        // Audit log
        await db.auditLog.create({
          data: {
            userId: facultyId,
            role: 'HOD',
            action: 'ALLOCATION_CREATED',
            details: `Allocated ${newAllocation.faculty.fullName} to ${newAllocation.subject.name} for ${newAllocation.section.name}`
          }
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      message: `Allocated to ${createdAllocations.length} section(s). ${alreadyAllocated.length > 0 ? `(${alreadyAllocated.length} already assigned)` : ''}`,
      allocations: createdAllocations
    });
  } catch (error) {
    console.error('Error creating allocation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Allocation ID is required' }, { status: 400 });
    }

    await db.facultyAllocation.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Allocation removed successfully' });
  } catch (error) {
    console.error('Error deleting allocation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
