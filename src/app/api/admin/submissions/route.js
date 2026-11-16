import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const submissions = await db.submission.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentId: true,
            department: true
          }
        },
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            points: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    console.error('Fetch admin submissions error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
