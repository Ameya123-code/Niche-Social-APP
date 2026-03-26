import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// POST /api/cards/[userId]/like
export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId: likedUserId } = await params;

    if (likedUserId === authUser.userId) {
      return NextResponse.json({ error: 'Cannot like yourself' }, { status: 400 });
    }

    await prisma.userLike.upsert({
      where: { userId_likedUserId: { userId: authUser.userId, likedUserId } },
      create: { userId: authUser.userId, likedUserId },
      update: {},
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Failed to like user' }, { status: 500 });
  }
}
