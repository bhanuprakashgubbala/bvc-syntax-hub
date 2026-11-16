import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const facultyId = searchParams.get('facultyId');

    const where = facultyId ? { facultyId } : {};

    const tasks = await db.task.findMany({
      where,
      include: {
        subject: true,
        section: {
          include: {
            _count: { select: { students: true } }
          }
        },
        _count: {
          select: { observations: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    const tasksWithStatus = tasks.map(t => {
      let status = 'ACTIVE';
      if (now < new Date(t.openTime)) {
        status = 'UPCOMING';
      } else if (now > new Date(t.closeTime)) {
        status = 'CLOSED';
      }
      return {
        ...t,
        computedStatus: status
      };
    });

    return NextResponse.json({ success: true, tasks: tasksWithStatus });
  } catch (error) {
    console.error('Error fetching faculty tasks:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      facultyId,
      subjectId,
      sectionId,
      title,
      experimentNumber,
      description,
      aim,
      instructions,
      language = 'java',
      starterCode,
      maxMarks = 20,
      openTime,
      closeTime
    } = body;

    if (!facultyId || !subjectId || !sectionId || !title || !experimentNumber || !openTime || !closeTime) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing: faculty, subject, section, title, experiment number, open time, close time.' },
        { status: 400 }
      );
    }

    // STRICT VALIDATION: Check if faculty is actually allocated to this section & subject by HOD
    const allocation = await db.facultyAllocation.findFirst({
      where: {
        facultyId,
        subjectId,
        sectionId
      }
    });

    if (!allocation) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ACCESS DENIED: You are not assigned to this subject and section combination by the HOD.' 
        },
        { status: 403 }
      );
    }

    const task = await db.task.create({
      data: {
        facultyId,
        subjectId,
        sectionId,
        title,
        experimentNumber,
        description: description || title,
        aim: aim || `To implement and execute ${title} in ${language}.`,
        instructions: instructions || 'Execute code cleanly, verify all edge cases, and complete the digital observation.',
        language: language.toLowerCase(),
        starterCode: starterCode || '',
        maxMarks: parseInt(maxMarks, 10) || 20,
        openTime: new Date(openTime),
        closeTime: new Date(closeTime)
      },
      include: {
        subject: true,
        section: true
      }
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('id');
    const facultyId = searchParams.get('facultyId');

    if (!taskId) {
      return NextResponse.json({ success: false, error: 'Task ID is required' }, { status: 400 });
    }

    // Verify ownership
    const task = await db.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    if (facultyId && task.facultyId !== facultyId) {
      return NextResponse.json({ success: false, error: 'Unauthorized to delete this task' }, { status: 403 });
    }

    await db.task.delete({ where: { id: taskId } });

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

