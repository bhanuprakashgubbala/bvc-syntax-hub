import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, problemId, language, code, status, executionTimeMs, pointsEarned } = body;

    if (!problemId || !code) {
      return NextResponse.json({ success: false, error: 'Problem ID and Code are required' }, { status: 400 });
    }

    let targetUserId = userId;
    // Fallback if userId not provided: pick first user or find by email
    if (!targetUserId) {
      const firstUser = await db.user.findFirst();
      if (firstUser) targetUserId = firstUser.id;
    }

    let submission = null;
    if (targetUserId) {
      submission = await db.submission.create({
        data: {
          userId: targetUserId,
          problemId: problemId,
          language: language || 'python',
          code: code,
          status: status || 'Accepted',
          executionTimeMs: executionTimeMs ? parseInt(executionTimeMs, 10) : 50,
        }
      });

      // Award points if accepted
      if (status === 'Accepted' && pointsEarned) {
        await db.user.update({
          where: { id: targetUserId },
          data: {
            totalPoints: {
              increment: parseInt(pointsEarned, 10) || 10
            }
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Submission recorded successfully',
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
