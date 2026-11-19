import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      observationId, 
      marksAwarded, 
      feedback, 
      facultyRemarks,
      action = 'APPROVED', // 'APPROVED' | 'MODIFIED' | 'CORRECTION_REQUIRED' | 'REJECTED'
      facultyId,
      marksBreakdown
    } = body;

    if (!observationId) {
      return NextResponse.json({ success: false, error: 'Observation ID is required' }, { status: 400 });
    }

    const obs = await db.digitalObservation.findUnique({
      where: { id: observationId },
      include: { task: true, student: true }
    });

    if (!obs) {
      return NextResponse.json({ success: false, error: 'Observation not found' }, { status: 404 });
    }

    // Determine final status & marks
    let finalStatus = 'APPROVED';
    let finalMarks = marksAwarded !== undefined && marksAwarded !== null ? parseFloat(marksAwarded) : (obs.aiRecommendedMarks || 0);
    const finalRemarks = facultyRemarks || feedback || obs.facultyRemarks || '';

    if (action === 'CORRECTION_REQUIRED') {
      finalStatus = 'CORRECTION_REQUIRED';
    } else if (action === 'REJECTED') {
      finalStatus = 'REJECTED';
      finalMarks = 0;
    } else if (action === 'MODIFIED') {
      finalStatus = 'APPROVED';
    } else {
      finalStatus = 'APPROVED';
    }

    let validFacultyId = obs.facultyId || obs.task?.facultyId;
    if (facultyId) {
      const facultyUser = await db.user.findUnique({ where: { id: facultyId }, select: { id: true } });
      if (facultyUser) {
        validFacultyId = facultyUser.id;
      }
    }

    let updatedReport = obs.aiEvaluationReport;
    if (marksBreakdown) {
      try {
        const parsedReport = updatedReport ? JSON.parse(updatedReport) : {};
        parsedReport.facultyEvaluation = {
          evaluator: 'FACULTY_MANUAL',
          marksBreakdown: {
            aim: marksBreakdown.aim !== undefined ? parseFloat(marksBreakdown.aim) : 2,
            algorithm: marksBreakdown.algorithm !== undefined ? parseFloat(marksBreakdown.algorithm) : 3,
            compilation: marksBreakdown.compilation !== undefined ? parseFloat(marksBreakdown.compilation) : 2,
            execution: marksBreakdown.execution !== undefined ? parseFloat(marksBreakdown.execution) : 3,
            total: finalMarks
          },
          facultyId: validFacultyId,
          evaluatedAt: new Date().toISOString()
        };
        updatedReport = JSON.stringify(parsedReport);
      } catch (e) {
        updatedReport = JSON.stringify({ facultyEvaluation: { marksBreakdown, total: finalMarks } });
      }
    }

    const updated = await db.digitalObservation.update({
      where: { id: observationId },
      data: {
        marksAwarded: Math.round(finalMarks),
        facultyFinalMarks: finalMarks,
        feedback: finalRemarks,
        facultyRemarks: finalRemarks,
        facultyAction: action,
        status: finalStatus,
        evaluatedAt: new Date(),
        aiEvaluationReport: updatedReport,
        ...(validFacultyId ? { facultyId: validFacultyId } : {})
      },
      include: {
        task: true,
        student: {
          select: { id: true, fullName: true, rollNumber: true, email: true }
        },
        section: true,
        subject: true
      }
    });

    // Record in ObservationHistory
    const historyCount = await db.observationHistory.count({
      where: { observationId: obs.id }
    });

    await db.observationHistory.create({
      data: {
        observationId: obs.id,
        version: historyCount + 1,
        action: action,
        aim: obs.aim,
        algorithm: obs.algorithm,
        programCode: obs.programCode,
        executionOutput: obs.executionOutput,
        result: obs.result,
        studentRemarks: obs.studentRemarks,
        executedCodeSnapshot: obs.executedCodeSnapshot,
        executedOutputSnapshot: obs.executedOutputSnapshot,
        hasManualModifications: obs.hasManualModifications,
        aiRecommendedMarks: obs.aiRecommendedMarks,
        aiEvaluationReport: obs.aiEvaluationReport,
        facultyFinalMarks: finalMarks,
        facultyRemarks: finalRemarks,
        status: finalStatus
      }
    }).catch(err => console.error("Error creating observation history:", err));

    // Update student totalPoints if approved with marks
    if (finalStatus === 'APPROVED' && finalMarks > 0) {
      await db.user.update({
        where: { id: obs.studentId },
        data: {
          totalPoints: { increment: Math.round(finalMarks) }
        }
      }).catch(() => {});
    }

    // Audit Log
    if (validFacultyId) {
      await db.auditLog.create({
        data: {
          userId: validFacultyId,
          role: 'FACULTY',
          action: `OBSERVATION_${action}`,
          details: `Faculty ${action} observation for ${obs.student?.fullName} (Exp ${obs.experimentNumber}). Marks: ${finalMarks}/10. Remarks: ${finalRemarks}`
        }
      }).catch(() => {});
    }

    return NextResponse.json({ 
      success: true, 
      message: `Observation evaluation saved with status: ${finalStatus}`,
      observation: updated 
    });
  } catch (error) {
    console.error('Error evaluating observation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
