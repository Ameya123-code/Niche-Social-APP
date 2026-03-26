export const VERIFICATION_TYPES = {
  EMAIL_VERIFY: 'EMAIL_VERIFY',
  PHONE_VERIFY: 'PHONE_VERIFY',
  PASSWORD_RESET: 'PASSWORD_RESET',
} as const;

export type VerificationType = (typeof VERIFICATION_TYPES)[keyof typeof VERIFICATION_TYPES];

export const generateSixDigitCode = () => String(Math.floor(100000 + Math.random() * 900000));

export const getExpiryDate = (minutes: number) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  return d;
};
