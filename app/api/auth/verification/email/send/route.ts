import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { generateSixDigitCode, getExpiryDate, VERIFICATION_TYPES } from '@/lib/verification';
import { isEmailProviderConfigured, sendEmailVerificationCode } from '@/lib/email';

// POST /api/auth/verification/email/send
export async function POST(request: NextRequest) {
  try {
    const emailConfigured = isEmailProviderConfigured();

    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: authUser.userId }, select: { id: true, email: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const code = generateSixDigitCode();

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        type: VERIFICATION_TYPES.EMAIL_VERIFY,
        code,
        expiresAt: getExpiryDate(15),
      },
    });

    if (emailConfigured) {
      await sendEmailVerificationCode(user.email, code);
      return NextResponse.json({ message: 'Verification code sent to email' }, { status: 200 });
    }

    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        {
          message: 'Email provider not configured. Using dev verification code fallback.',
          devVerificationCode: code,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Email service is temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Email verification send error:', error);
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
  }
}
