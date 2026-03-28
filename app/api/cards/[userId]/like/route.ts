import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getPusherServer, pusherChannel, PUSHER_EVENTS } from '@/lib/pusher';

/** Ensures consistent pair ordering for Conversation uniqueness */
function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

// POST /api/cards/[userId]/like
export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId: likedUserId } = await params;

    if (likedUserId === authUser.userId) {
      return NextResponse.json({ error: 'Cannot like yourself' }, { status: 400 });
    }

    // Demo cards are virtual (not persisted in DB)
    if (likedUserId.startsWith('demo_')) {
      return NextResponse.json({ success: true, demo: true }, { status: 200 });
    }

    // Record the like
    await prisma.userLike.upsert({
      where: { userId_likedUserId: { userId: authUser.userId, likedUserId } },
      create: { userId: authUser.userId, likedUserId },
      update: {},
    });

    // ── Check for mutual like (match!) ──────────────────────────────────────
    const mutualLike = await prisma.userLike.findUnique({
      where: { userId_likedUserId: { userId: likedUserId, likedUserId: authUser.userId } },
    });

    if (mutualLike) {
      // It's a match — create a conversation (idempotent)
      const [userAId, userBId] = orderedPair(authUser.userId, likedUserId);

      const conversation = await prisma.conversation.upsert({
        where: { userAId_userBId: { userAId, userBId } },
        create: {
          userAId,
          userBId,
          level: { create: { level: 1, totalXp: 0 } },
        },
        update: {},
        include: {
          userA: { select: { id: true, name: true, profileImageUrl: true } },
          userB: { select: { id: true, name: true, profileImageUrl: true } },
        },
      });

      // Notify both users via Pusher inbox channels
      try {
        const pusher = getPusherServer();
        const partner =
          conversation.userAId === authUser.userId ? conversation.userB : conversation.userA;

        await Promise.all([
          pusher.trigger(pusherChannel.userInbox(authUser.userId), PUSHER_EVENTS.MATCH_CREATED, {
            conversationId: conversation.id,
            partner,
          }),
          pusher.trigger(pusherChannel.userInbox(likedUserId), PUSHER_EVENTS.MATCH_CREATED, {
            conversationId: conversation.id,
            partner: conversation.userAId === authUser.userId ? conversation.userA : conversation.userB,
          }),
        ]);
      } catch (pusherErr) {
        console.warn('Pusher match notification failed:', pusherErr);
      }

      return NextResponse.json(
        { success: true, matched: true, conversationId: conversation.id },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, matched: false }, { status: 200 });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Failed to like user' }, { status: 500 });
  }
}

