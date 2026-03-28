import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const mailerSendApiKey = process.env.MAILERSEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;
const mailerSendTemplateId = process.env.MAILERSEND_TEMPLATE_ID ?? 'jy7zpl97703g5vx6';

let smtpTransport: nodemailer.Transporter | null = null;

function isSmtpConfigured() {
  return Boolean(smtpHost && smtpPort && smtpUser && smtpPass && emailFrom);
}

function getSmtpTransport() {
  if (!isSmtpConfigured()) return null;
  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }
  return smtpTransport;
}

export function isEmailProviderConfigured() {
  return isSmtpConfigured() || Boolean(mailerSendApiKey && emailFrom && mailerSendTemplateId);
}

export function isEmailSenderVerificationError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return error.message.includes('MS42207') || error.message.includes('from.email domain must be verified');
}

function ensureConfigured() {
  if (!isEmailProviderConfigured()) {
    const missing: string[] = [];
    if (!emailFrom) missing.push('EMAIL_FROM');
    if (!smtpHost) missing.push('SMTP_HOST');
    if (!smtpPort) missing.push('SMTP_PORT');
    if (!smtpUser) missing.push('SMTP_USER');
    if (!smtpPass) missing.push('SMTP_PASS');
    if (!mailerSendApiKey) missing.push('MAILERSEND_API_KEY');
    if (!mailerSendTemplateId) missing.push('MAILERSEND_TEMPLATE_ID');
    throw new Error(`Email provider is not configured. Missing: ${missing.join(', ')}.`);
  }
}

function getPersonalizationName(email: string) {
  const localPart = email.split('@')[0] ?? 'there';
  return localPart.replace(/[._-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

async function sendMailerSendTemplateEmail(
  to: string,
  data: {
    subject: string;
    title: string;
    code: string;
    preheader: string;
    message: string;
    action: string;
  }
) {
  ensureConfigured();

  const response = await fetch('https://api.mailersend.com/v1/email', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mailerSendApiKey!}`,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({
      from: { email: emailFrom! },
      to: [{ email: to }],
      subject: data.subject,
      personalization: [
        {
          email: to,
          data: {
            name: getPersonalizationName(to),
            account_name: 'Niche',
            subject: data.subject,
            title: data.title,
            code: data.code,
            preheader: data.preheader,
            message: data.message,
            action: data.action,
          },
        },
      ],
      template_id: mailerSendTemplateId,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`MailerSend request failed (${response.status}): ${body || 'Unknown error'}`);
  }
}

async function sendSmtpEmail(to: string, data: { subject: string; code: string; message: string }) {
  const transport = getSmtpTransport();
  if (!transport) {
    throw new Error('SMTP provider is not configured.');
  }

  await transport.sendMail({
    from: emailFrom!,
    to,
    subject: data.subject,
    text: `${data.message}\n\nCode: ${data.code}`,
    html: `<p>${data.message}</p><p><strong>Code: ${data.code}</strong></p>`,
  });
}

export async function sendEmailVerificationCode(to: string, code: string) {
  if (isSmtpConfigured()) {
    await sendSmtpEmail(to, {
      subject: 'Verify your email',
      code,
      message: 'Use this verification code to confirm your email address. This code expires in 15 minutes.',
    });
    return;
  }

  await sendMailerSendTemplateEmail(to, {
    subject: 'Verify your email',
    title: 'Verify your email',
    code,
    preheader: 'Your verification code is ready.',
    message: 'Use this verification code to confirm your email address. This code expires in 15 minutes.',
    action: 'Verify Email',
  });
}

export async function sendPasswordResetCode(to: string, code: string) {
  if (isSmtpConfigured()) {
    await sendSmtpEmail(to, {
      subject: 'Reset your password',
      code,
      message: 'Use this reset code to change your password. This code expires in 15 minutes.',
    });
    return;
  }

  await sendMailerSendTemplateEmail(to, {
    subject: 'Reset your password',
    title: 'Reset your password',
    code,
    preheader: 'Your reset code is ready.',
    message: 'Use this reset code to change your password. This code expires in 15 minutes.',
    action: 'Reset Password',
  });
}
