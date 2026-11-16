import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseRegistrationNumber } from '@/lib/studentParser';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        studentId: true,
        organization: true,
        department: true,
        batchYear: true,
        totalPoints: true,
        createdAt: true,
        _count: {
          select: { submissions: true }
        }
      }
    });

    const parsedUsers = users.map(u => {
      const parsed = parseRegistrationNumber(u.email);
      return {
        ...u,
        fullName: u.fullName || parsed.fullName || 'Student',
        studentId: u.studentId || parsed.studentId,
        department: (u.department || parsed.department || 'Computer Science').replace(/\s*\([^)]*Section[^)]*\)/gi, ''),
        branchShort: parsed.branchShort || 'CSE',
        college: u.organization || parsed.college || 'BVC Group',
        submissionCount: u._count.submissions
      };
    });

    const filtered = search
      ? parsedUsers.filter(u => 
          u.fullName.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.studentId && u.studentId.toLowerCase().includes(search.toLowerCase()))
        )
      : parsedUsers;

    return NextResponse.json({ success: true, users: filtered });
  } catch (error) {
    console.error('Fetch admin users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, totalPoints, fullName, department } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        totalPoints: totalPoints !== undefined ? parseInt(totalPoints, 10) : undefined,
        fullName: fullName?.trim() || undefined,
        department: department?.trim() || undefined
      }
    });

    return NextResponse.json({ success: true, message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    await db.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Student account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
