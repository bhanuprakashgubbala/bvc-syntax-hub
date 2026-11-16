import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const sections = await db.section.findMany({
      include: {
        _count: { select: { students: true, tasks: true, observations: true } },
        allocations: {
          include: {
            faculty: { select: { id: true, fullName: true, email: true } },
            subject: { select: { id: true, code: true, name: true } }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const subjects = await db.subject.findMany({
      include: {
        _count: { select: { tasks: true, allocations: true } }
      },
      orderBy: { code: 'asc' }
    });

    return NextResponse.json({ success: true, sections, subjects });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, name, code, academicYear = '2025-2026', semester = 'IV Semester (2-2)' } = body;

    if (type === 'subject') {
      if (!name || !code) {
        return NextResponse.json({ success: false, error: 'Subject code and name are required' }, { status: 400 });
      }
      const existing = await db.subject.findUnique({ where: { code } });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Subject with this code already exists' }, { status: 409 });
      }
      const subject = await db.subject.create({
        data: { name, code }
      });
      return NextResponse.json({ success: true, subject });
    } else {
      // Default: create section
      if (!name) {
        return NextResponse.json({ success: false, error: 'Section name is required (e.g. CSE-D)' }, { status: 400 });
      }
      const existing = await db.section.findFirst({ where: { name, academicYear } });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Section with this name and academic year already exists' }, { status: 409 });
      }
      const section = await db.section.create({
        data: { name, academicYear, semester }
      });
      return NextResponse.json({ success: true, section });
    }
  } catch (error) {
    console.error('Error creating section/subject:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

