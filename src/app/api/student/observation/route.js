import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { evaluateObservation } from '@/utils/observationEvaluator';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');
    const studentIdParam = searchParams.get('studentId');
    const rollNumber = searchParams.get('rollNumber');
    const email = searchParams.get('email');

    if (!taskId) {
      return NextResponse.json({ success: false, error: 'Task ID is required' }, { status: 400 });
    }

    // Resolve individual student account
    let student = null;
    if (studentIdParam) {
      student = await db.user.findFirst({
        where: {
          OR: [
            { id: studentIdParam },
            { rollNumber: studentIdParam },
            { studentId: studentIdParam },
            { email: studentIdParam }
          ]
        }
      });
    }
    if (!student && rollNumber) {
      student = await db.user.findFirst({
        where: {
          OR: [
            { rollNumber },
            { studentId: rollNumber },
            { email: { startsWith: rollNumber } }
          ]
        }
      });
    }
    if (!student && email) {
      student = await db.user.findFirst({ where: { email } });
    }

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        subject: true,
        section: true,
        faculty: {
          select: { id: true, fullName: true, email: true, department: true }
        }
      }
    });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    let observation = null;
    if (student) {
      observation = await db.digitalObservation.findFirst({
        where: {
          taskId,
          studentId: student.id
        },
        include: {
          history: {
            orderBy: { submittedAt: 'desc' }
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      task,
      observation,
      student: student ? {
        id: student.id,
        fullName: student.fullName,
        rollNumber: student.rollNumber,
        email: student.email,
        section: student.section?.name || 'CSE-A'
      } : null
    });
  } catch (error) {
    console.error('Error fetching observation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    let {
      taskId,
      studentId,
      rollNumber,
      email,
      aim = '',
      algorithm = '',
      programCode = '',
      executionOutput = '',
      result = '',
      studentRemarks = '',
      executedCodeSnapshot = '',
      executedOutputSnapshot = '',
      executedLanguage = 'java',
      executionStatus = 'SUCCESS',
      exitCode = 0,
      isDraft = false
    } = body;

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Resolve individual student
    let student = null;
    if (studentId) {
      student = await db.user.findFirst({
        where: {
          OR: [
            { id: studentId },
            { rollNumber: studentId },
            { studentId: studentId },
            { email: studentId }
          ]
        }
      });
    }
    if (!student && rollNumber) {
      student = await db.user.findFirst({
        where: {
          OR: [
            { rollNumber },
            { studentId: rollNumber },
            { email: { startsWith: rollNumber } }
          ]
        }
      });
    }
    if (!student && email) {
      student = await db.user.findFirst({ where: { email } });
    }
    if (!student) {
      student = await db.user.findFirst({ where: { role: 'STUDENT' } });
    }

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student account not found.' },
        { status: 400 }
      );
    }

    const finalStudentId = student.id;

    // Fetch Task & Assigned Faculty
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: { section: true, subject: true, faculty: true }
    });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const now = new Date();

    // Check deadlines for non-draft submissions
    if (!isDraft) {
      if (now > new Date(task.closeTime)) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Task submission closed on ${new Date(task.closeTime).toLocaleString()}. Submissions are no longer accepted.` 
          },
          { status: 400 }
        );
      }

      if (now < new Date(task.openTime)) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Task has not opened yet. Submissions open on ${new Date(task.openTime).toLocaleString()}.` 
          },
          { status: 400 }
        );
      }

      // Validations: Program code and output must not be empty
      if (!programCode || programCode.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Program source code cannot be empty. Please execute your code in Code Space.' },
          { status: 400 }
        );
      }

      if (!executionOutput || executionOutput.trim().length === 0 || executionOutput.includes('⚠️ Click Run') || executionOutput.includes('❌')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'A verified successful compiler execution output is required. Please ensure code executes with exit code 0.' 
          },
          { status: 400 }
        );
      }

      if (!aim || !aim.trim()) {
        return NextResponse.json(
          { success: false, error: 'Aim of the experiment is required.' },
          { status: 400 }
        );
      }

      if (!algorithm || !algorithm.trim()) {
        return NextResponse.json(
          { success: false, error: 'Algorithm / Step-by-step logic is required.' },
          { status: 400 }
        );
      }

      if (!result || !result.trim()) {
        return NextResponse.json(
          { success: false, error: 'Result / Conclusion statement is required.' },
          { status: 400 }
        );
      }
    }

    // Check whether student manually modified auto-populated program or output
    const hasManualModifications = 
      Boolean(executedCodeSnapshot && programCode.trim() !== executedCodeSnapshot.trim()) ||
      Boolean(executedOutputSnapshot && executionOutput.trim() !== executedOutputSnapshot.trim());

    // Date formatted as DD-MM-YYYY
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    // Find existing observation
    const existing = await db.digitalObservation.findFirst({
      where: { 
        taskId, 
        studentId: finalStudentId 
      }
    });

    // Run Automated 10-Mark AI Evaluation if not draft
    let aiEvaluation = null;
    if (!isDraft) {
      aiEvaluation = evaluateObservation({
        task,
        aim,
        algorithm,
        programCode,
        executionOutput,
        result,
        studentRemarks,
        executedCodeSnapshot: executedCodeSnapshot || existing?.executedCodeSnapshot || programCode,
        executedOutputSnapshot: executedOutputSnapshot || existing?.executedOutputSnapshot || executionOutput,
        language: executedLanguage || task.language,
        exitCode,
        executionStatus
      });
    }

    // Status progression:
    // NOT_STARTED -> CODING_IN_PROGRESS -> EXECUTION_SUCCESSFUL -> OBSERVATION_PENDING -> SUBMITTED_FOR_EVALUATION -> AI_EVALUATION_COMPLETED -> FACULTY_REVIEW_PENDING
    let finalStatus = 'OBSERVATION_PENDING';
    if (isDraft) {
      finalStatus = existing?.status === 'APPROVED' ? 'APPROVED' : (existing?.status === 'CORRECTION_REQUIRED' ? 'CORRECTION_REQUIRED' : 'OBSERVATION_PENDING');
    } else {
      finalStatus = existing?.status === 'CORRECTION_REQUIRED' ? 'RESUBMITTED' : 'SUBMITTED_FOR_EVALUATION';
    }

    const observationData = {
      experimentNumber: task.experimentNumber,
      experimentName: task.title,
      date: dateStr,
      aim: (aim || '').trim(),
      algorithm: (algorithm || '').trim(),
      programCode: programCode || '',
      executionOutput: executionOutput || '',
      result: (result || '').trim(),
      studentRemarks: (studentRemarks || '').trim(),
      executedCodeSnapshot: executedCodeSnapshot || existing?.executedCodeSnapshot || programCode,
      executedOutputSnapshot: executedOutputSnapshot || existing?.executedOutputSnapshot || executionOutput,
      executedLanguage: executedLanguage || task.language,
      executionStatus: executionStatus || 'SUCCESS',
      hasManualModifications,
      executionSuccessful: true,
      status: finalStatus
    };

    if (!isDraft && aiEvaluation) {
      observationData.aiRecommendedMarks = aiEvaluation.totalMarks;
      observationData.aiEvaluationReport = JSON.stringify(aiEvaluation);
      observationData.submittedAt = new Date();
      // Initially faculty status is review pending unless already approved
      if (existing?.status !== 'APPROVED') {
        observationData.facultyAction = null;
      }
    }

    let observation;
    if (existing) {
      observation = await db.digitalObservation.update({
        where: { id: existing.id },
        data: observationData
      });
    } else {
      observation = await db.digitalObservation.create({
        data: {
          taskId,
          studentId: finalStudentId,
          facultyId: task.facultyId,
          sectionId: task.sectionId,
          subjectId: task.subjectId,
          ...observationData
        }
      });
    }

    // Record in ObservationHistory for version tracking & audit trail
    if (!isDraft) {
      const historyCount = await db.observationHistory.count({
        where: { observationId: observation.id }
      });

      await db.observationHistory.create({
        data: {
          observationId: observation.id,
          version: historyCount + 1,
          action: existing?.status === 'CORRECTION_REQUIRED' ? 'RESUBMITTED' : 'SUBMITTED',
          aim: observation.aim,
          algorithm: observation.algorithm,
          programCode: observation.programCode,
          executionOutput: observation.executionOutput,
          result: observation.result,
          studentRemarks: observation.studentRemarks,
          executedCodeSnapshot: observation.executedCodeSnapshot,
          executedOutputSnapshot: observation.executedOutputSnapshot,
          hasManualModifications: observation.hasManualModifications,
          aiRecommendedMarks: observation.aiRecommendedMarks,
          aiEvaluationReport: observation.aiEvaluationReport,
          facultyFinalMarks: observation.facultyFinalMarks,
          facultyRemarks: observation.facultyRemarks,
          status: observation.status
        }
      }).catch(err => console.error("Error creating observation history:", err));
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId: finalStudentId,
        role: 'STUDENT',
        action: isDraft ? 'OBSERVATION_DRAFT_SAVED' : 'OBSERVATION_SUBMITTED',
        details: `${isDraft ? 'Saved draft for' : 'Submitted observation for'} Experiment ${task.experimentNumber} (${task.title}) to faculty ${task.faculty?.fullName}`
      }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: isDraft 
        ? 'Progress saved to your personal account successfully!' 
        : `Digital Laboratory Observation submitted successfully to ${task.faculty?.fullName || 'assigned faculty'}!`,
      observation,
      aiEvaluation
    });
  } catch (error) {
    console.error('Error in student observation API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
