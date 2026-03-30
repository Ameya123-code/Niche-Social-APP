import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { generateToken, hashPassword } from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(8),
  name: z.string().min(2).max(80),
  birthDate: z.string().datetime(),
  password: z.string().min(8),
  selfDescription: z.string().max(500).optional(),
  profileImageUrl: z
    .string()
    .refine(
      (v) => v.startsWith('/api/uploads/image/') || /^https?:\/\//.test(v),
      'Invalid profileImageUrl'
    )
    .optional(),
});

const getAgeFromBirthDate = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

// POST /api/auth/register
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, phone, name, birthDate, password, selfDescription, profileImageUrl } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const birth = new Date(birthDate);
    const age = getAgeFromBirthDate(birth);

    if (age < 18) {
      return NextResponse.json({ error: 'You must be at least 18 years old' }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { email: email.trim() }, { phone }],
      },
      select: { id: true, email: true, phone: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            existingUser.email === email
              ? 'Email is already in use'
              : 'Phone number is already in use',
        },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(normalizedPassword);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        phone,
        name,
        age,
        isAgeVerified: true,
        password: hashedPassword,
        selfDescription,
        profileImageUrl,
        preferences: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        age: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isAgeVerified: true,
        profileImageUrl: true,
        createdAt: true,
      },
    });

    const token = generateToken({ userId: user.id, email: user.email, isEmailVerified: user.isEmailVerified });

    return NextResponse.json(
      {
        message: 'Account created successfully.',
        token,
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
