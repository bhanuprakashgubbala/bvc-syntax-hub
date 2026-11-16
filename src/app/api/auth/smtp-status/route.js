import { NextResponse } from 'next/server';
import { verifySmtpConnection } from '@/lib/emailService';

export async function GET() {
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || process.env.EMAIL_USER;
  const isConfigured = Boolean(smtpUser && (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD));

  if (!isConfigured) {
    return NextResponse.json({
      configured: false,
      message: 'SMTP credentials are not configured in .env.local.',
      provider: 'none',
      help: 'Add SMTP_USER and SMTP_PASS (Gmail 16-character App Password) to .env.local to enable real email OTP delivery.',
    });
  }

  const check = await verifySmtpConnection();

  return NextResponse.json({
    configured: true,
    connected: check.ok,
    message: check.message,
    errorCode: check.error || null,
    account: smtpUser ? `${smtpUser.slice(0, 3)}***@${smtpUser.split('@')[1] || ''}` : null,
  });
}
