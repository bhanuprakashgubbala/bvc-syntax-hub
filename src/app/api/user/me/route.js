import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseRegistrationNumber } from '@/lib/studentParser';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
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

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        studentId: user.studentId || parsed.studentId,
        department: (user.department || parsed.department || '').replace(/\s*\([^)]*Section[^)]*\)/gi, ''),
        batchYear: user.batchYear || parsed.batchYear,
        branchName: parsed.branchName,
        branchShort: parsed.branchShort,
        college: parsed.college,
      },
    });
  } catch (error) {
    console.error('Fetch Current User Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
