import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getLevelFromXp, getUnlockedFeatures } from '@/lib/chat-level';

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/conversations/[id]
 * Returns a single conversation with partner info and level.
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: convId } = await params;

    const conv = await prisma.conversation.findFirst({
      where: {
        id: convId,
        OR: [{ userAId: authUser.userId }, { userBId: authUser.userId }],
      },
      include: {
        userA: {
          select: { id: true, name: true, profileImageUrl: true, age: true, city: true },
        },
        userB: {
          select: { id: true, name: true, profileImageUrl: true, age: true, city: true },
        },
        level: true,
      },
    });

    if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    const partner = conv.userAId === authUser.userId ? conv.userB : conv.userA;
    const level = conv.level?.level ?? 1;

    return NextResponse.json({
      conversation: {
        id: conv.id,
        partner,
        level,
        totalXp: conv.level?.totalXp ?? 0,
        unlockedFeatures: getUnlockedFeatures(level),
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      },
    });
  } catch (error) {
    console.error('GET /api/conversations/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}
