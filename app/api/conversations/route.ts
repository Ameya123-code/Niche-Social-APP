import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getLevelFromXp, getUnlockedFeatures } from '@/lib/chat-level';
import { DEMO_CONVERSATIONS } from '@/lib/demo-chat';

/** Ensures consistent ordering: lower ID is always userA */
function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/**
 * GET /api/conversations
 * Returns all conversations for the authenticated user, sorted by latest message.
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
      where: {
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
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            type: true,
            content: true,
            senderId: true,
            createdAt: true,
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    const formatted = conversations.map((conv) => {
      const partner =
        conv.userAId === authUser.userId ? conv.userB : conv.userA;
      const level = conv.level?.level ?? 1;
      return {
        id: conv.id,
        partner,
        level,
        totalXp: conv.level?.totalXp ?? 0,
        unlockedFeatures: getUnlockedFeatures(level),
        lastMessage: conv.messages[0] ?? null,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      };
    });

    return NextResponse.json(
      { conversations: formatted.length > 0 ? formatted : DEMO_CONVERSATIONS },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/conversations error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

/**
 * POST /api/conversations
 * Creates a conversation between the authenticated user and another user.
 * Idempotent — returns existing conversation if one already exists.
 *
 * Body: { partnerId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { partnerId } = await request.json();
    if (!partnerId) {
      return NextResponse.json({ error: 'partnerId is required' }, { status: 400 });
    }
    if (partnerId === authUser.userId) {
      return NextResponse.json({ error: 'Cannot start a conversation with yourself' }, { status: 400 });
    }

    // Verify both users exist
    const partner = await prisma.user.findUnique({ where: { id: partnerId }, select: { id: true } });
    if (!partner) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [userAId, userBId] = orderedPair(authUser.userId, partnerId);

    // Upsert conversation
    const conversation = await prisma.conversation.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      create: {
        userAId,
        userBId,
        level: { create: { level: 1, totalXp: 0 } },
      },
      update: {},
      include: {
        level: true,
        userA: { select: { id: true, name: true, profileImageUrl: true } },
        userB: { select: { id: true, name: true, profileImageUrl: true } },
      },
    });

    const level = conversation.level?.level ?? 1;
    return NextResponse.json(
      {
        conversation: {
          ...conversation,
          unlockedFeatures: getUnlockedFeatures(level),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/conversations error:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
