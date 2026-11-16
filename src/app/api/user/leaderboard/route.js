import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseRegistrationNumber } from '@/lib/studentParser';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const users = await db.user.findMany({
      orderBy: { totalPoints: 'desc' },
      take: limit,
      select: {
        id: true,
        fullName: true,
        email: true,
        studentId: true,
        department: true,
        batchYear: true,
        organization: true,
        totalPoints: true,
        createdAt: true,
      }
    });

    const parsedUsers = users.map((u, index) => {
      const parsed = parseRegistrationNumber(u.email);
      return {
        rank: index + 1,
        id: u.id,
        name: u.fullName || parsed.fullName || 'Student',
        email: u.email,
        studentId: u.studentId || parsed.studentId,
        department: (u.department || parsed.department || 'Computer Science').replace(/\s*\([^)]*Section[^)]*\)/gi, ''),
        branchShort: parsed.branchShort || 'CSE',
        college: u.organization || parsed.college || 'BVC Group',
        points: u.totalPoints || 0,
      };
    });

    return NextResponse.json({
      success: true,
      leaderboard: parsedUsers
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
