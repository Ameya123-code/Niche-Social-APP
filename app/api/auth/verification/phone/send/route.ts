import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { generateSixDigitCode, getExpiryDate, VERIFICATION_TYPES } from '@/lib/verification';
import { normalizePhone, sendPhoneVerificationSms } from '@/lib/sms';

// POST /api/auth/verification/phone/send
export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({} as Record<string, unknown>));

    const user = await prisma.user.findUnique({ where: { id: authUser.userId }, select: { id: true, phone: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let targetPhone = user.phone;

    const countryCode = String(body?.countryCode || '').trim();
    const phoneNumber = String(body?.phoneNumber || '').trim();
    if (countryCode && phoneNumber) {
      const ccDigits = countryCode.replace(/\D/g, '');
      const numDigits = phoneNumber.replace(/\D/g, '');
      targetPhone = normalizePhone(`+${ccDigits}${numDigits}`);
    }

    if (!/^\+[1-9]\d{7,14}$/.test(targetPhone)) {
      return NextResponse.json(
        { error: 'Phone number must be valid international format (e.g. +14155551234)' },
        { status: 400 }
      );
    }

    if (targetPhone !== user.phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone: targetPhone, NOT: { id: user.id } }, select: { id: true } });
      if (existingPhone) {
        return NextResponse.json({ error: 'Phone number is already in use' }, { status: 409 });
      }
      await prisma.user.update({ where: { id: user.id }, data: { phone: targetPhone, isPhoneVerified: false } });
    }

    const code = generateSixDigitCode();

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        type: VERIFICATION_TYPES.PHONE_VERIFY,
        code,
        expiresAt: getExpiryDate(10),
      },
    });

    await sendPhoneVerificationSms(targetPhone, code);

    return NextResponse.json({ message: 'Verification code sent to phone' }, { status: 200 });
  } catch (error) {
    console.error('Phone verification send error:', error);
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
  }
}
