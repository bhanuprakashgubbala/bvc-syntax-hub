import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseRegistrationNumber } from '@/lib/studentParser';
import { getInitialWorkspace } from '@/lib/workspaceHelper';

// In-memory cache fallback for instant OTP resolution
const otpMemoryStore = global._otpStore || new Map();
if (process.env.NODE_ENV !== 'production') {
  global._otpStore = otpMemoryStore;
}

const MAX_ATTEMPTS = 5;

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 6-digit verification code.' },
        { status: 400 }
      );
    }

    const now = Date.now();
    let memEntry = otpMemoryStore.get(normalizedEmail);
    let dbRecord = null;

    // Check database if not found in memory
    try {
      dbRecord = await db.verificationCode.findFirst({
        where: {
          email: normalizedEmail,
          expiresAt: { gte: new Date(now) },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (dbErr) {
      console.warn('[VERIFY OTP DB FETCH WARN]:', dbErr.message);
    }

    // Determine current attempts and active code
    const activeCode = memEntry?.code || dbRecord?.code;
    const isExpired = (!memEntry || now > memEntry.expiresAt) && !dbRecord;
    let currentAttempts = (memEntry?.attempts ?? dbRecord?.attempts) || 0;

    if (!activeCode || isExpired) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP.' },
        { status: 400 }
      );
    }

    // Check if max attempts already exceeded
    if (currentAttempts >= MAX_ATTEMPTS) {
      // Invalidate code
      otpMemoryStore.delete(normalizedEmail);
      try {
        await db.verificationCode.deleteMany({ where: { email: normalizedEmail } });
      } catch (e) {}

      return NextResponse.json(
        {
          success: false,
          error: 'Maximum verification attempts exceeded. Please request a new verification code.',
        },
        { status: 400 }
      );
    }

    // Check if code matches
    if (activeCode !== cleanCode) {
      currentAttempts += 1;

      // Update attempts in memory
      if (memEntry) {
        memEntry.attempts = currentAttempts;
        otpMemoryStore.set(normalizedEmail, memEntry);
      }

      // Update attempts in DB
      try {
        if (dbRecord) {
          await db.verificationCode.update({
            where: { id: dbRecord.id },
            data: { attempts: currentAttempts },
          });
        }
      } catch (e) {}

      if (currentAttempts >= MAX_ATTEMPTS) {
        // Invalidate code
        otpMemoryStore.delete(normalizedEmail);
        try {
          await db.verificationCode.deleteMany({ where: { email: normalizedEmail } });
        } catch (e) {}

        return NextResponse.json(
          {
            success: false,
            error: 'Maximum verification attempts exceeded. Please request a new verification code.',
          },
          { status: 400 }
        );
      }

      const remainingAttempts = MAX_ATTEMPTS - currentAttempts;
      return NextResponse.json(
        {
          success: false,
          error: `Invalid or expired OTP. (${remainingAttempts} ${remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining)`,
        },
        { status: 400 }
      );
    }

    // --- CODE IS VALID! ---
    // 1. Immediately invalidate OTP to protect against replay / reuse
    otpMemoryStore.delete(normalizedEmail);
    try {
      await db.verificationCode.deleteMany({
        where: { email: normalizedEmail },
      });
    } catch (dbErr) {
      console.warn('[OTP DELETE WARN]:', dbErr.message);
    }

    // 2. Parse student metadata
    const parsed = parseRegistrationNumber(normalizedEmail);

    // 3. Find or create student account in database
    let user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: normalizedEmail,
          password: `verified_otp_${Math.random().toString(36).slice(2)}`,
          fullName: parsed.fullName,
          studentId: parsed.studentId,
          organization: parsed.college || 'BVC Group',
          department: parsed.department,
          batchYear: parsed.batchYear,
          totalPoints: 0,
          emailVerified: new Date(),
          workspaceData: getInitialWorkspace(parsed.fullName, parsed.branchShort),
        },
      });
    } else {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          department: user.department || parsed.department,
          studentId: user.studentId || parsed.studentId,
          batchYear: user.batchYear || parsed.batchYear,
        },
      });
    }

    console.log(`[AUTH SUCCESS] User ${normalizedEmail} successfully verified via OTP.`);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully.',
      user: {
        ...user,
        department: (user.department || parsed.department || '').replace(/\s*\([^)]*Section[^)]*\)/gi, ''),
        branchName: parsed.branchName,
        branchShort: parsed.branchShort,
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal verification failure. Please try again.' },
      { status: 500 }
    );
  }
}
