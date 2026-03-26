import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { VERIFICATION_TYPES } from '@/lib/verification';

// POST /api/auth/verification/phone/confirm
export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (body?.firebaseVerified === true) {
      await prisma.user.update({ where: { id: authUser.userId }, data: { isPhoneVerified: true } });
      return NextResponse.json({ message: 'Phone verified successfully' }, { status: 200 });
    }

    const code = String(body?.code || '').trim();
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });
    }

    const token = await prisma.verificationToken.findFirst({
      where: {
        userId: authUser.userId,
        type: VERIFICATION_TYPES.PHONE_VERIFY,
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
      prisma.user.update({ where: { id: authUser.userId }, data: { isPhoneVerified: true } }),
    ]);

    return NextResponse.json({ message: 'Phone verified successfully' }, { status: 200 });
  } catch (error) {
    console.error('Phone verification confirm error:', error);
    return NextResponse.json({ error: 'Failed to verify phone' }, { status: 500 });
  }
}
