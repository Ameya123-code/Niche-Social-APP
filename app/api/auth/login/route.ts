import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const candidates = await prisma.$queryRaw<Array<{
      id: string;
      email: string;
      phone: string;
      name: string;
      age: number;
      isEmailVerified: boolean;
      isPhoneVerified: boolean;
      password: string;
      isAgeVerified: boolean;
      profileImageUrl: string | null;
      createdAt: Date;
    }>>`
      SELECT "id", "email", "phone", "name", "age", "password", "isAgeVerified", "profileImageUrl", "createdAt"
      , "isEmailVerified", "isPhoneVerified"
      FROM "User"
      WHERE LOWER("email") = LOWER(${email.trim()})
      LIMIT 10
    `;

    if (!candidates.length) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    let user = null as null | (typeof candidates)[number];
    for (const candidate of candidates) {
      const passwordValid = await comparePassword(normalizedPassword, candidate.password);
      if (passwordValid) {
        user = candidate;
        break;
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = generateToken({ userId: user.id, email: user.email, isEmailVerified: user.isEmailVerified });

    return NextResponse.json(
      {
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          age: user.age,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          isAgeVerified: user.isAgeVerified,
          profileImageUrl: user.profileImageUrl,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
