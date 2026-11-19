import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const tasksCache = new Map();
const CACHE_TTL_MS = 8000;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const rollNumber = searchParams.get('rollNumber');
    const cacheKey = `${studentId || ''}_${rollNumber || ''}`;

    const nowTime = Date.now();
    const cached = tasksCache.get(cacheKey);
    if (cached && nowTime - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, {
        headers: { 'Cache-Control': 'private, max-age=8, stale-while-revalidate=15' }
      });
    }

    let student = null;
    if (studentId) {
      student = await db.user.findUnique({
        where: { id: studentId },
        include: { section: true }
      });
    } else if (rollNumber) {
      student = await db.user.findFirst({
        where: { rollNumber },
        include: { section: true }
      });
    }

    // If no student specified, return all active tasks or sample
    let sectionId = student?.sectionId;
    
    // If student has no section assigned yet, find default section CSE-A
    if (!sectionId) {
      const defaultSec = await db.section.findFirst({ where: { name: 'CSE-A' } });
      sectionId = defaultSec?.id;
    }

    const tasks = await db.task.findMany({
      where: sectionId ? { sectionId } : {},
      include: {
        subject: true,
        section: true,
        faculty: {
          select: { id: true, fullName: true, email: true }
        },
        observations: student ? {
          where: { studentId: student.id }
        } : false
      },
      orderBy: { openTime: 'asc' }
    });

    const now = new Date();

    const formattedTasks = tasks.map(t => {
      let availability = 'ACTIVE';
      const open = new Date(t.openTime);
      const close = new Date(t.closeTime);

      if (now < open) {
        availability = 'UPCOMING';
      } else if (now > close) {
        availability = 'CLOSED';
      }

      const observation = t.observations && t.observations.length > 0 ? t.observations[0] : null;

      return {
        id: t.id,
        title: t.title,
        experimentNumber: t.experimentNumber,
        description: t.description,
        instructions: t.instructions,
        aim: t.aim,
        language: t.language,
        starterCode: t.starterCode,
        maxMarks: t.maxMarks,
        openTime: t.openTime,
        closeTime: t.closeTime,
        availability,
        subject: t.subject?.name || 'Computer Science',
        subjectCode: t.subject?.code || 'CS',
        section: t.section?.name || 'CSE',
        facultyName: t.faculty?.fullName || 'Faculty Member',
        observation: observation ? {
          id: observation.id,
          status: observation.status,
          marksAwarded: observation.facultyFinalMarks ?? observation.marksAwarded,
          facultyFinalMarks: observation.facultyFinalMarks,
          aiRecommendedMarks: observation.aiRecommendedMarks,
          aiEvaluationReport: observation.aiEvaluationReport,
          aim: observation.aim || t.aim || '',
          algorithm: observation.algorithm || '',
          programCode: observation.programCode || '',
          executionOutput: observation.executionOutput || '',
          result: observation.result || '',
          date: observation.date || '',
          submittedAt: observation.submittedAt,
          evaluatedAt: observation.evaluatedAt,
          feedback: observation.facultyRemarks || observation.feedback,
          facultyRemarks: observation.facultyRemarks || observation.feedback,
          facultyAction: observation.facultyAction,
          facultyName: t.faculty?.fullName || 'Faculty Member'
        } : null
      };
    });

    const responseData = {
      success: true,
      student: student ? {
        id: student.id,
        fullName: student.fullName,
        rollNumber: student.rollNumber,
        section: student.section?.name || 'CSE-A'
      } : null,
      tasks: formattedTasks
    };

    tasksCache.set(cacheKey, { data: responseData, timestamp: nowTime });

    return NextResponse.json(responseData, {
      headers: { 'Cache-Control': 'private, max-age=8, stale-while-revalidate=15' }
    });
  } catch (error) {
    console.error('Error fetching student tasks:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

