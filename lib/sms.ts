import Zavu from '@zavudev/sdk';

const zavuApiKey = process.env.ZAVU_API_KEY;
const zavuSender = process.env.ZAVU_SENDER;

let zavu: Zavu | null = null;
if (zavuApiKey) {
  zavu = new Zavu({ apiKey: zavuApiKey });
}

export function normalizePhone(input: string): string {
  const raw = String(input || '').trim();
  if (!raw) return '';

  // Keep leading + if present, remove non-digits elsewhere.
  const startsWithPlus = raw.startsWith('+');
  const digits = raw.replace(/\D/g, '');

  if (!digits) return '';

  // Convert 00-prefixed international notation to +.
  if (raw.startsWith('00')) {
    return `+${digits.slice(2)}`;
  }

  if (startsWithPlus) {
    return `+${digits}`;
  }

  // Fallback: assume already contains country code but missing +.
  return `+${digits}`;
}

export async function sendPhoneVerificationSms(phone: string, code: string) {
  if (!zavu) {
    throw new Error('SMS provider is not configured. Set ZAVU_API_KEY.');
  }

  if (!zavuSender) {
    throw new Error('SMS sender is not configured. Set ZAVU_SENDER (sender profile ID).');
  }

  const to = normalizePhone(phone);
  if (!/^\+[1-9]\d{7,14}$/.test(to)) {
    throw new Error('Phone number must be in international format (E.164), e.g. +14155551234');
  }

  await zavu.messages.send({
    to,
    channel: 'sms',
    text: `Your Niche verification code is ${code}. It expires in 10 minutes.`,
    'Zavu-Sender': zavuSender,
  });
}
