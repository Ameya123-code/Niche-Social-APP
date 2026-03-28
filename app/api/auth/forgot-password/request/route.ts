import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateSixDigitCode, getExpiryDate, VERIFICATION_TYPES } from '@/lib/verification';
import { isEmailSenderVerificationError, sendPasswordResetCode } from '@/lib/email';

// POST /api/auth/forgot-password/request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({ where: { OR: [{ email }, { email: body?.email?.trim() || '' }] } });

    // Do not leak whether the user exists.
    if (!user) {
      return NextResponse.json({ message: 'If this account exists, a reset code has been sent.' }, { status: 200 });
    }

    const code = generateSixDigitCode();

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        type: VERIFICATION_TYPES.PASSWORD_RESET,
        code,
        expiresAt: getExpiryDate(15),
      },
    });

    try {
      await sendPasswordResetCode(user.email, code);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production' && isEmailSenderVerificationError(error)) {
        return NextResponse.json(
          {
            message: 'Dev fallback active because MailerSend sender domain is not verified.',
            devResetCode: code,
          },
          { status: 200 }
        );
      }

      throw error;
    }

    return NextResponse.json({ message: 'If this account exists, a reset code has been sent.' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password request error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
