import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { evaluateSubmission } from '@/lib/compiler/evaluator';

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      userId, 
      problemId, 
      language, 
      code, 
      server = 'default',
      evaluate = true,
      status: incomingStatus, 
      executionTimeMs: incomingTimeMs, 
      pointsEarned: incomingPoints 
    } = body;

    if (!problemId || !code) {
      return NextResponse.json({ success: false, error: 'Problem ID and Code are required' }, { status: 400 });
    }

    let targetUserId = userId;
    if (!targetUserId) {
      const firstUser = await db.user.findFirst();
      if (firstUser) targetUserId = firstUser.id;
    }

    // Fetch problem details including test cases
    let problem = null;
    try {
      problem = await db.problem.findUnique({
        where: { id: problemId }
      });
    } catch (e) {}

    let evaluationResult = null;
    let finalStatus = incomingStatus || 'Accepted';
    let finalExecTime = incomingTimeMs ? parseInt(incomingTimeMs, 10) : 50;
    let finalPoints = incomingPoints !== undefined ? parseInt(incomingPoints, 10) : (problem?.points || 10);

    // If real evaluation is requested, execute program against test cases
    if (evaluate) {
      let testCases = [];
      if (problem?.testCases) {
        try {
          testCases = typeof problem.testCases === 'string' ? JSON.parse(problem.testCases) : problem.testCases;
        } catch (e) {
          testCases = [];
        }
      }

      evaluationResult = await evaluateSubmission({
        code,
        language,
        testCases,
        serverId: server,
        maxPoints: problem?.points || 10
      });

      finalStatus = evaluationResult.status;
      finalExecTime = evaluationResult.executionTimeMs;
      finalPoints = evaluationResult.pointsEarned;
    }

    let submission = null;
    if (targetUserId) {
      submission = await db.submission.create({
        data: {
          userId: targetUserId,
          problemId: problemId,
          language: language || 'python',
          code: code,
          status: finalStatus,
          executionTimeMs: finalExecTime,
        }
      });

      // Award points if accepted
      if (finalStatus === 'Accepted' && finalPoints > 0) {
        await db.user.update({
          where: { id: targetUserId },
          data: {
            totalPoints: {
              increment: finalPoints
            }
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      status: finalStatus,
      isAccepted: finalStatus === 'Accepted',
      executionTimeMs: finalExecTime,
      pointsEarned: finalPoints,
      message: finalStatus === 'Accepted' ? 'Solution Accepted!' : `Submission verdict: ${finalStatus}`,
      evaluation: evaluationResult,
      submission
    });
  } catch (error) {
    console.error('Submission recording error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get('problemId');
    const userId = searchParams.get('userId');

    const where = {};
    if (problemId) where.problemId = problemId;
    if (userId) where.userId = userId;

    const submissions = await db.submission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            studentId: true,
          }
        },
        problem: {
          select: {
            title: true,
            points: true,
          }
        }
      }
    });

    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
