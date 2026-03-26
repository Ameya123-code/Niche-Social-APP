import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { VERIFICATION_TYPES } from '@/lib/verification';

// POST /api/auth/forgot-password/reset
export async function POST(request: Request) {
  try {
    const prismaClient = prisma as any;
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const code = String(body?.code || '').trim();
    const newPassword = String(body?.newPassword || '').trim();

    if (!email || !/^\d{6}$/.test(code) || newPassword.length < 8) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({ where: { OR: [{ email }, { email: body?.email?.trim() || '' }] } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid reset attempt' }, { status: 400 });
    }

    const token = await prismaClient.verificationToken.findFirst({
      where: {
        userId: user.id,
        type: VERIFICATION_TYPES.PASSWORD_RESET,
        code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!token) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    const hashed = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
      prismaClient.verificationToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
    ]);

    return NextResponse.json({ message: 'Password reset successful' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password reset error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
