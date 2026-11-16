import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const problems = await db.problem.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });

    return NextResponse.json({ success: true, problems });
  } catch (error) {
    console.error('Fetch problems error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, difficulty, description, points } = body;

    if (!title || !description) {
      return NextResponse.json({ success: false, error: 'Title and description are required.' }, { status: 400 });
    }

    const problem = await db.problem.create({
      data: {
        title: title.trim(),
        difficulty: difficulty || 'Easy',
        description: description.trim(),
        points: points ? parseInt(points, 10) : 10
      }
    });

    return NextResponse.json({ success: true, message: 'Problem created successfully', problem });
  } catch (error) {
    console.error('Create problem error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, title, difficulty, description, points } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Problem ID is required.' }, { status: 400 });
    }

    const problem = await db.problem.update({
      where: { id },
      data: {
        title: title?.trim(),
        difficulty,
        description: description?.trim(),
        points: points ? parseInt(points, 10) : undefined
      }
    });

    return NextResponse.json({ success: true, message: 'Problem updated successfully', problem });
  } catch (error) {
    console.error('Update problem error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Problem ID is required.' }, { status: 400 });
    }

    await db.problem.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Delete problem error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
