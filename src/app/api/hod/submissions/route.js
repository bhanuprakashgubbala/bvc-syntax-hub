import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get('sectionId');
    const subjectId = searchParams.get('subjectId');
    const facultyId = searchParams.get('facultyId');
    const status = searchParams.get('status');

    const where = {
      ...(sectionId && sectionId !== 'ALL' ? { sectionId } : {}),
      ...(subjectId && subjectId !== 'ALL' ? { subjectId } : {}),
      ...(facultyId && facultyId !== 'ALL' ? { facultyId } : {}),
      ...(status && status !== 'ALL' ? { status } : {})
    };

    const observations = await db.digitalObservation.findMany({
      where,
      include: {
        task: {
          select: { id: true, title: true, experimentNumber: true, maxMarks: true }
        },
        student: {
          select: { id: true, fullName: true, rollNumber: true, email: true, department: true }
        },
        subject: {
          select: { id: true, name: true, code: true }
        },
        section: {
          select: { id: true, name: true }
        },
        faculty: {
          select: { id: true, fullName: true, email: true }
        },
        history: {
          orderBy: { submittedAt: 'desc' }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    const totalSubmissions = observations.length;
    const approvedCount = observations.filter(o => o.status === 'APPROVED' || o.status === 'EVALUATED').length;
    const correctionCount = observations.filter(o => o.status === 'CORRECTION_REQUIRED').length;
    const pendingCount = observations.filter(o => o.status === 'SUBMITTED_FOR_EVALUATION' || o.status === 'RESUBMITTED' || o.status === 'SUBMITTED').length;

    // Faculty-wise evaluation statistics
    const facultyMap = {};
    for (const obs of observations) {
      const fId = obs.facultyId || obs.task?.facultyId || 'unassigned';
      const fName = obs.faculty?.fullName || 'Assigned Faculty';
      if (!facultyMap[fId]) {
        facultyMap[fId] = {
          facultyId: fId,
          facultyName: fName,
          totalSubmissions: 0,
          approvedCount: 0,
          pendingCount: 0,
          correctionCount: 0,
          totalMarksSum: 0,
          evaluatedMarksCount: 0
        };
      }
      facultyMap[fId].totalSubmissions++;
      if (obs.status === 'APPROVED' || obs.status === 'EVALUATED') {
        facultyMap[fId].approvedCount++;
        if (obs.facultyFinalMarks || obs.marksAwarded) {
          facultyMap[fId].totalMarksSum += (obs.facultyFinalMarks || obs.marksAwarded);
          facultyMap[fId].evaluatedMarksCount++;
        }
      } else if (obs.status === 'CORRECTION_REQUIRED') {
        facultyMap[fId].correctionCount++;
      } else {
        facultyMap[fId].pendingCount++;
      }
    }

    const facultyStats = Object.values(facultyMap).map(f => ({
      ...f,
      averageMarks: f.evaluatedMarksCount > 0 ? (f.totalMarksSum / f.evaluatedMarksCount).toFixed(1) : 'N/A'
    }));

    // Section-wise submission reports
    const sectionMap = {};
    for (const obs of observations) {
      const sName = obs.section?.name || 'CSE';
      if (!sectionMap[sName]) {
        sectionMap[sName] = {
          sectionName: sName,
          totalSubmissions: 0,
          approvedCount: 0,
          pendingCount: 0
        };
      }
      sectionMap[sName].totalSubmissions++;
      if (obs.status === 'APPROVED' || obs.status === 'EVALUATED') {
        sectionMap[sName].approvedCount++;
      } else {
        sectionMap[sName].pendingCount++;
      }
    }
    const sectionStats = Object.values(sectionMap);

    return NextResponse.json({
      success: true,
      stats: { totalSubmissions, evaluatedCount: approvedCount, approvedCount, correctionCount, pendingCount },
      facultyStats,
      sectionStats,
      observations
    });
  } catch (error) {
    console.error('Error fetching department submissions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
