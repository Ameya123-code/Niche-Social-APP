import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

const getAgeFromBirthDate = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

// GET /api/users/me — returns authenticated user's full profile
export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        age: true,
        selfDescription: true,
        profileImageUrl: true,
        isAgeVerified: true,
        createdAt: true,
        preferences: true,
        opinions: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, content: true, hashtags: true, createdAt: true },
        },
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('GET /api/users/me error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/users/me — update profile fields
export async function PUT(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, birthDate, selfDescription, profileImageUrl } = body;

    const derivedAge = birthDate ? getAgeFromBirthDate(new Date(birthDate)) : undefined;

    const updated = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        ...(name && { name }),
        ...(birthDate && { birthDate: new Date(birthDate) }),
        ...(derivedAge !== undefined && { age: derivedAge }),
        ...(selfDescription !== undefined && { selfDescription }),
        ...(profileImageUrl !== undefined && { profileImageUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        selfDescription: true,
        profileImageUrl: true,
        isAgeVerified: true,
      },
    });

    return NextResponse.json({ user: updated }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/users/me error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
