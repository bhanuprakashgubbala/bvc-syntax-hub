import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { workspaceData: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, workspaceData: user.workspaceData });
  } catch (error) {
    console.error("Fetch Workspace Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId, workspaceData } = await req.json();

    if (!userId || !workspaceData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await db.user.update({
      where: { id: userId },
      data: { workspaceData: JSON.stringify(workspaceData) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save Workspace Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
