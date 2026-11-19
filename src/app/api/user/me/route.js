import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseRegistrationNumber } from '@/lib/studentParser';

// In-memory micro-cache for user profile responses (TTL 15 seconds)
const userProfileCache = new Map();
const CACHE_TTL_MS = 15000;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const now = Date.now();
    const cached = userProfileCache.get(userId);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(
        { success: true, user: cached.data },
        { headers: { 'Cache-Control': 'private, max-age=15, stale-while-revalidate=30' } }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        studentId: true,
        organization: true,
        department: true,
        batchYear: true,
        totalPoints: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const parsed = parseRegistrationNumber(user.email);
    const userData = {
      ...user,
      studentId: user.studentId || parsed.studentId,
      department: (user.department || parsed.department || '').replace(/\s*\([^)]*Section[^)]*\)/gi, ''),
      batchYear: user.batchYear || parsed.batchYear,
      branchName: parsed.branchName,
      branchShort: parsed.branchShort,
      college: parsed.college,
    };

    userProfileCache.set(userId, { data: userData, timestamp: now });

    return NextResponse.json(
      { success: true, user: userData },
      { headers: { 'Cache-Control': 'private, max-age=15, stale-while-revalidate=30' } }
    );
  } catch (error) {
    console.error('Fetch Current User Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
