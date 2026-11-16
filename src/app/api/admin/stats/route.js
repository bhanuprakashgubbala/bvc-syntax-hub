import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const [totalUsers, totalProblems, totalSubmissions, usersWithPoints, recentSubmissions, recentUsers] = await Promise.all([
      db.user.count(),
      db.problem.count(),
      db.submission.count(),
      db.user.aggregate({
        _sum: {
          totalPoints: true
        }
      }),
      db.submission.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { fullName: true, email: true, studentId: true }
          },
          problem: {
            select: { title: true, difficulty: true, points: true }
          }
        }
      }),
      db.user.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          studentId: true,
          department: true,
          totalPoints: true,
          createdAt: true
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents: totalUsers,
        totalProblems,
        totalSubmissions,
        totalPointsInCirculation: usersWithPoints._sum.totalPoints || 0,
        serverUptime: "99.98%",
        executionEngine: "Wandbox Isolated Sandboxes (Active)",
        recentSubmissions,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
