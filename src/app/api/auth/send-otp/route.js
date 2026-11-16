import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { parseRegistrationNumber } from '@/lib/studentParser';
import { sendOtpEmail } from '@/lib/emailService';

// Global memory cache for instant OTP verification, cooldowns, and attempt tracking
const otpMemoryStore = global._otpStore || new Map();
if (process.env.NODE_ENV !== 'production') {
  global._otpStore = otpMemoryStore;
}

const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes (300 seconds)

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid institutional email address.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    // STRICT INSTITUTIONAL POLICY: Must be @bvcgroup.in or @nextgenlabs.co
    if (!normalizedEmail.endsWith('@bvcgroup.in') && !normalizedEmail.endsWith('@nextgenlabs.co')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access restricted. Please use your official university email ending in @bvcgroup.in.',
        },
        { status: 403 }
      );
    }

    // 1. Check Resend Cooldown (60 seconds)
    const existingEntry = otpMemoryStore.get(normalizedEmail);
    const now = Date.now();

    if (existingEntry && existingEntry.lastSentAt) {
      const elapsed = now - existingEntry.lastSentAt;
      if (elapsed < RESEND_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          {
            success: false,
            error: 'Please wait before requesting another OTP.',
            retryAfter: remainingSeconds,
          },
          { status: 429 }
        );
      }
    }

    // Also check database for recent code within 60s
    try {
      const recentDbCode = await db.verificationCode.findFirst({
        where: { email: normalizedEmail },
        orderBy: { createdAt: 'desc' },
      });
      if (recentDbCode) {
        const dbElapsed = now - new Date(recentDbCode.createdAt).getTime();
        if (dbElapsed < RESEND_COOLDOWN_MS) {
          const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - dbElapsed) / 1000);
          return NextResponse.json(
            {
              success: false,
              error: 'Please wait before requesting another OTP.',
              retryAfter: remainingSeconds,
            },
            { status: 429 }
          );
        }
      }
    } catch (dbErr) {
      console.warn('[OTP COOLDOWN DB CHECK WARN]', dbErr.message);
    }

    // 2. Parse student metadata
    const parsed = parseRegistrationNumber(normalizedEmail);

    // 3. Generate cryptographically secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(now + OTP_EXPIRY_MS);

    // 4. Send email via email service
    console.log(`[AUTH] Dispatching OTP verification email to: ${normalizedEmail}`);
    const emailResult = await sendOtpEmail(normalizedEmail, otp, 5);

    if (!emailResult.success) {
      console.error(`[AUTH ERROR] Email delivery failed for ${normalizedEmail}:`, emailResult.error);
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || 'Email delivery failed. Please try again.',
          errorCode: emailResult.errorCode,
        },
        { status: 500 }
      );
    }

    // 5. Store in memory store
    otpMemoryStore.set(normalizedEmail, {
      code: otp,
      expiresAt: expiresAt.getTime(),
      lastSentAt: now,
      attempts: 0,
    });

    // 6. Store in Prisma database
    try {
      await db.verificationCode.deleteMany({
        where: { email: normalizedEmail },
      });

      await db.verificationCode.create({
        data: {
          email: normalizedEmail,
          code: otp,
          expiresAt,
          attempts: 0,
        },
      });
    } catch (dbErr) {
      console.warn('[OTP DB STORE WARN] VerificationCode write fallback to memory:', dbErr.message);
    }

    // Safe response - NEVER include the OTP in client response
    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully.',
      email: normalizedEmail,
      expiresIn: 300,
      cooldownSeconds: 60,
      studentMeta: {
        isValid: parsed.isValid,
        branchName: parsed.branchName,
        branchShort: parsed.branchShort,
        college: parsed.college,
        batchYear: parsed.batchYear,
        studentId: parsed.studentId,
      },
    });
  } catch (error) {
    console.error('Send OTP Fatal Error:', error);
    return NextResponse.json(
      { success: false, error: 'Email delivery failed. Please try again.' },
      { status: 500 }
    );
  }
}
