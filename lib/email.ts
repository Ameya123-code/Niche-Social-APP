const mailerSendApiKey = process.env.MAILERSEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

export function isEmailProviderConfigured() {
  return Boolean(mailerSendApiKey && emailFrom);
}

function ensureConfigured() {
  if (!isEmailProviderConfigured()) {
    const missing: string[] = [];
    if (!mailerSendApiKey) missing.push('MAILERSEND_API_KEY');
    if (!emailFrom) missing.push('EMAIL_FROM');
    throw new Error(`Email provider is not configured. Missing: ${missing.join(', ')}.`);
  }
}

async function sendMailerSendEmail(to: string, subject: string, html: string, text: string) {
  ensureConfigured();

  const response = await fetch('https://api.mailersend.com/v1/email', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mailerSendApiKey!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: { email: emailFrom! },
      to: [{ email: to }],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`MailerSend request failed (${response.status}): ${body || 'Unknown error'}`);
  }
}

export async function sendEmailVerificationCode(to: string, code: string) {
  await sendMailerSendEmail(
    to,
    'Verify your email',
    `<p>Your verification code is <strong>${code}</strong>.</p><p>This code expires in 15 minutes.</p>`,
    `Your verification code is ${code}. This code expires in 15 minutes.`
  );
}

export async function sendPasswordResetCode(to: string, code: string) {
  await sendMailerSendEmail(
    to,
    'Reset your password',
    `<p>Your password reset code is <strong>${code}</strong>.</p><p>This code expires in 15 minutes.</p>`,
    `Your password reset code is ${code}. This code expires in 15 minutes.`
  );
}
