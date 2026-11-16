import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const facultyId = searchParams.get('facultyId');
    const status = searchParams.get('status');
    const sectionId = searchParams.get('sectionId');
    const subjectId = searchParams.get('subjectId');

    if (!facultyId) {
      return NextResponse.json({ success: false, error: 'Faculty ID is required' }, { status: 400 });
    }

    // Match observations where task was created by this faculty, or directly assigned
    const tasks = await db.task.findMany({
      where: { facultyId },
      select: { id: true }
    });
    const taskIds = tasks.map(t => t.id);

    const where = {
      OR: [
        { taskId: { in: taskIds } },
        { facultyId: facultyId }
      ],
      ...(status && status !== 'ALL' ? { status } : {}),
      ...(sectionId ? { sectionId } : {}),
      ...(subjectId ? { subjectId } : {})
    };

    const observations = await db.digitalObservation.findMany({
      where,
      include: {
        task: true,
        student: {
          select: { id: true, fullName: true, rollNumber: true, email: true, department: true }
        },
        subject: true,
        section: true,
        history: {
          orderBy: { submittedAt: 'desc' }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    // Compute faculty evaluation stats
    const totalSubmissions = observations.length;
    const approvedCount = observations.filter(o => o.status === 'APPROVED' || o.status === 'EVALUATED').length;
    const correctionCount = observations.filter(o => o.status === 'CORRECTION_REQUIRED').length;
    const pendingCount = observations.filter(o => o.status === 'SUBMITTED_FOR_EVALUATION' || o.status === 'RESUBMITTED' || o.status === 'SUBMITTED').length;

    return NextResponse.json({ 
      success: true, 
      stats: { totalSubmissions, approvedCount, correctionCount, pendingCount },
      observations 
    });
  } catch (error) {
    console.error('Error fetching faculty observations:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
