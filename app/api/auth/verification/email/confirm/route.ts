import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken, getUserFromRequest } from '@/lib/auth';
import { VERIFICATION_TYPES } from '@/lib/verification';

// POST /api/auth/verification/email/confirm
export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const code = String(body?.code || '').trim();
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });
    }

    const token = await prisma.verificationToken.findFirst({
      where: {
        userId: authUser.userId,
        type: VERIFICATION_TYPES.EMAIL_VERIFY,
        code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!token) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.verificationToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
      prisma.user.update({ where: { id: authUser.userId }, data: { isEmailVerified: true } }),
    ]);

    const refreshedToken = generateToken({
      userId: authUser.userId,
      email: authUser.email,
      isEmailVerified: true,
    });

    return NextResponse.json({ message: 'Email verified successfully', token: refreshedToken }, { status: 200 });
  } catch (error) {
    console.error('Email verification confirm error:', error);
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
  }
}
