import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/auth/session
// Lightweight DB-backed session validation for protected app shell.
export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        isEmailVerified: true,
        isAgeVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Session invalid' }, { status: 401 });
    }

    if (!user.isEmailVerified) {
      return NextResponse.json({ error: 'Email not verified', requiresVerification: true }, { status: 403 });
    }

    if (!user.isAgeVerified) {
      return NextResponse.json({ error: 'Age not verified', requiresVerification: true }, { status: 403 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ error: 'Failed to validate session' }, { status: 500 });
  }
}
