import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const facultyId = searchParams.get('facultyId');

    if (!facultyId) {
      return NextResponse.json({ success: false, error: 'Faculty ID is required' }, { status: 400 });
    }

    const allocations = await db.facultyAllocation.findMany({
      where: { facultyId },
      include: {
        subject: true,
        section: {
          include: {
            _count: { select: { students: true } }
          }
        }
      },
      orderBy: { section: { name: 'asc' } }
    });

    return NextResponse.json({
      success: true,
      allocations
    });
  } catch (error) {
    console.error('Error fetching faculty allocations:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

