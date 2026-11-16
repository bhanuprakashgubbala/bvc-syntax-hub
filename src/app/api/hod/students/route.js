import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get('sectionId');

    const where = {
      role: 'STUDENT',
      ...(sectionId ? { sectionId } : {})
    };

    const students = await db.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        rollNumber: true,
        studentId: true,
        department: true,
        sectionId: true,
        section: {
          select: { id: true, name: true, academicYear: true, semester: true }
        },
        _count: {
          select: { observations: true, submissions: true }
        }
      },
      orderBy: { rollNumber: 'asc' }
    });

    return NextResponse.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { fullName, email, rollNumber, password = 'student123', sectionId } = body;

    if (!fullName || !email || !rollNumber || !sectionId) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, roll number, and section are required.' },
        { status: 400 }
      );
    }

    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ success: false, error: 'Student with this email already exists' }, { status: 409 });
    }

    const existingRoll = await db.user.findFirst({ where: { rollNumber } });
    if (existingRoll) {
      return NextResponse.json({ success: false, error: 'Student with this roll number already exists' }, { status: 409 });
    }

    const student = await db.user.create({
      data: {
        fullName,
        email,
        password,
        rollNumber,
        studentId: rollNumber,
        role: 'STUDENT',
        sectionId,
        department: 'Computer Science & Engineering',
        college: 'BVCEC',
        organization: 'Bonam Venkatachalam Engineering College'
      },
      include: { section: true }
    });

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

