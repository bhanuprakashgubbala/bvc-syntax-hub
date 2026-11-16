import nodemailer from 'nodemailer';

/**
 * Creates and returns a Nodemailer transporter based on environment variables.
 * Supports Gmail (App Password) as well as custom SMTP hosts.
 */
function createTransporter() {
  const smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || process.env.EMAIL_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || '').trim();
  const smtpHost = (process.env.SMTP_HOST || '').trim();
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : null;
  const isSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  if (!smtpUser || !smtpPass) {
    return {
      transporter: null,
      error: 'SMTP_CREDENTIALS_MISSING',
      message: 'SMTP credentials (SMTP_USER and SMTP_PASS) are not configured in environment variables.',
    };
  }

  try {
    let transporterConfig;

    if (smtpHost) {
      transporterConfig = {
        host: smtpHost,
        port: smtpPort || (isSecure ? 465 : 587),
        secure: isSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      };
    } else {
      // Default to Gmail service
      transporterConfig = {
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      };
    }

    const transporter = nodemailer.createTransport(transporterConfig);
    return { transporter, smtpUser, smtpPass, smtpHost, isSecure, error: null };
  } catch (err) {
    return {
      transporter: null,
      error: 'TRANSPORTER_INIT_FAILED',
      message: err.message,
    };
  }
}

/**
 * Test SMTP connection
 */
export async function verifySmtpConnection() {
  const { transporter, error, message } = createTransporter();
  if (!transporter) {
    return { ok: false, error, message };
  }

  try {
    await transporter.verify();
    return { ok: true, message: 'SMTP connection verified successfully.' };
  } catch (err) {
    let diagnostic = err.message;
    if (err.code === 'EAUTH') {
      diagnostic = 'Authentication failed. If using Gmail, ensure 2-Step Verification is ON and you are using a 16-character Google App Password (not your normal Gmail password).';
    } else if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      diagnostic = `Network connection to SMTP server timed out or was refused (${err.code}). Check port, firewall, and host settings.`;
    }
    return { ok: false, error: err.code || 'SMTP_VERIFY_ERROR', message: diagnostic };
  }
}

/**
 * Sends a 6-digit OTP verification email to the specified recipient.
 *
 * @param {string} recipientEmail - Target student email
 * @param {string} otp - 6-digit verification code
 * @param {number} expiresInMinutes - Expiry time in minutes (default 5)
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string, errorCode?: string }>}
 */
export async function sendOtpEmail(recipientEmail, otp, expiresInMinutes = 5) {
  const { transporter, smtpUser, error, message } = createTransporter();

  if (!transporter) {
    console.error(`[EMAIL DISPATCH ERROR] Cannot send email to ${recipientEmail}: ${message}`);
    return {
      success: false,
      errorCode: error,
      error: 'Email delivery failed. Email service is not configured.',
    };
  }

  const fromSender = process.env.SMTP_FROM || `"NextGen Labs" <${smtpUser}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NextGen Labs Verification Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 520px; background-color: #121217; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 32px 32px 24px 32px; text-align: center; background: linear-gradient(180deg, rgba(79, 70, 229, 0.15) 0%, rgba(18, 18, 23, 0) 100%);">
                  <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 12px; color: #ffffff; font-weight: bold; font-size: 22px; margin-bottom: 12px; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);">
                    NL
                  </div>
                  <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">NextGen Labs</h1>
                  <p style="margin: 6px 0 0 0; font-size: 13px; color: #a1a1aa; font-weight: 500;">Campus Learning & Assessment Platform</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 0 32px 32px 32px;">
                  <p style="font-size: 15px; line-height: 24px; color: #e4e4e7; margin: 0 0 20px 0;">
                    Hello,
                  </p>
                  <p style="font-size: 14px; line-height: 22px; color: #a1a1aa; margin: 0 0 24px 0;">
                    Please use the following 6-digit one-time verification code to complete your authentication.
                  </p>

                  <!-- OTP Box -->
                  <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #38bdf8; padding: 4px 0; text-indent: 10px;">
                      ${otp}
                    </div>
                    <div style="font-size: 12px; color: #71717a; margin-top: 10px;">
                      ⏱ This code expires in <strong style="color: #e4e4e7;">${expiresInMinutes} minutes</strong>
                    </div>
                  </div>

                  <!-- Security Advisory -->
                  <div style="background-color: rgba(245, 158, 11, 0.08); border-left: 3px solid #f59e0b; padding: 12px 14px; border-radius: 6px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 12px; line-height: 18px; color: #fbbf24;">
                      <strong>Security Tip:</strong> Never share this OTP with anyone, including college staff or administrators. Our team will never ask for your verification code.
                    </p>
                  </div>

                  <p style="font-size: 12px; line-height: 18px; color: #71717a; margin: 0;">
                    If you did not request this verification code, please ignore this email or contact platform support if you have concerns.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 32px; background-color: #0c0c0e; border-top: 1px solid #27272a; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #52525b;">
                    © ${new Date().getFullYear()} NextGen Labs • BVC Group of Institutions
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textContent = `
NextGen Labs - Verification Code

Your one-time verification code is: ${otp}

This code will expire in ${expiresInMinutes} minutes.
Do not share this code with anyone.

If you did not request this code, please ignore this email.
© NextGen Labs - BVC Group of Institutions
  `.trim();

  try {
    const info = await transporter.sendMail({
      from: fromSender,
      to: recipientEmail,
      subject: `${otp} is your NextGen Labs verification code`,
      text: textContent,
      html: htmlContent,
    });

    console.log(`[EMAIL DISPATCH] Successfully delivered OTP email to ${recipientEmail}. MessageId: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err) {
    console.error(`[EMAIL DISPATCH ERROR] Failed sending to ${recipientEmail}:`, err);
    let userFriendlyError = 'Email delivery failed. Please try again.';

    if (err.code === 'EAUTH') {
      console.error('[SMTP AUTH FAILURE] Check SMTP_USER and SMTP_PASS. For Gmail, use a 16-character App Password.');
    } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      console.error(`[SMTP CONNECTION ERROR] Failed to connect to SMTP host: ${err.message}`);
    }

    return {
      success: false,
      errorCode: err.code || 'SMTP_SEND_FAILED',
      error: userFriendlyError,
      details: err.message,
    };
  }
}
