import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

let resend: Resend | null = null;

if (resendApiKey) {
  resend = new Resend(resendApiKey);
}

function ensureConfigured() {
  if (!resend || !emailFrom) {
    throw new Error('Email provider is not configured. Set RESEND_API_KEY and EMAIL_FROM.');
  }
}

export async function sendEmailVerificationCode(to: string, code: string) {
  ensureConfigured();

  await resend!.emails.send({
    from: emailFrom!,
    to,
    subject: 'Verify your email',
    html: `<p>Your verification code is <strong>${code}</strong>.</p><p>This code expires in 15 minutes.</p>`,
  });
}

export async function sendPasswordResetCode(to: string, code: string) {
  ensureConfigured();

  await resend!.emails.send({
    from: emailFrom!,
    to,
    subject: 'Reset your password',
    html: `<p>Your password reset code is <strong>${code}</strong>.</p><p>This code expires in 15 minutes.</p>`,
  });
}
