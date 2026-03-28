import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getLevelFromXp, getUnlockedFeatures, calculateXp, isFeatureUnlocked } from '@/lib/chat-level';
import { getPusherServer, pusherChannel, PUSHER_EVENTS } from '@/lib/pusher';

type Params = { params: Promise<{ id: string }> };

/** Verify the authenticated user is a member of this conversation */
async function getConversationForUser(convId: string, userId: string) {
  return prisma.conversation.findFirst({
    where: {
      id: convId,
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: { level: true },
  });
}

/**
 * GET /api/conversations/[id]/messages
 * Returns paginated messages. Newer messages first.
 *
 * Query params:
 *   cursor  — message ID to paginate from (exclusive)
 *   limit   — (default 40, max 100)
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const conv = await getConversationForUser(id, authUser.userId);
    if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const limit = Math.min(100, parseInt(url.searchParams.get('limit') ?? '40', 10));

    const messages = await prisma.message.findMany({
      where: {
        conversationId: id,
        ...(cursor ? { createdAt: { lt: (await prisma.message.findUnique({ where: { id: cursor }, select: { createdAt: true } }))?.createdAt } } : {}),
      },
      include: {
        sender: { select: { id: true, name: true, profileImageUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });

    const hasMore = messages.length > limit;
    const page = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    return NextResponse.json({ messages: page.reverse(), nextCursor }, { status: 200 });
  } catch (error) {
    console.error('GET /api/conversations/[id]/messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Sends a message. Calculates XP, checks feature lock, pushes via Pusher.
 *
 * Body: { type: string, content: string }
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: convId } = await params;
    const conv = await getConversationForUser(convId, authUser.userId);
    if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    const body = await request.json();
    const { type = 'text', content } = body as { type?: string; content: string };

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const currentLevel = conv.level?.level ?? 1;
    const totalXp = conv.level?.totalXp ?? 0;

    // ── Feature lock check ──────────────────────────────────────────────────
    // Maps incoming message type → the ChatFeature that must be unlocked
    const featureMap: Record<string, string> = {
      emoji: 'emoji',
      gif: 'gif',
      image: 'image',
      video: 'video',
      voice_note: 'voice_call',
    };

    const requiredFeature = featureMap[type];
    if (requiredFeature && !isFeatureUnlocked(currentLevel, requiredFeature as import('@/lib/chat-level').ChatFeature)) {
      return NextResponse.json(
        { error: `Feature "${type}" unlocks at a higher level.`, currentLevel },
        { status: 403 }
      );
    }

    // ── XP calculation ──────────────────────────────────────────────────────
    // Get or create XP record for this sender in this conversation
    let xpRecord = await prisma.userConversationXp.findUnique({
      where: { userId_conversationId: { userId: authUser.userId, conversationId: convId } },
    });
    if (!xpRecord) {
      xpRecord = await prisma.userConversationXp.create({
        data: { userId: authUser.userId, conversationId: convId },
      });
    }

    // Find the last message sender (for reply bonus)
    const lastMsg = await prisma.message.findFirst({
      where: { conversationId: convId },
      orderBy: { createdAt: 'desc' },
      select: { senderId: true },
    });

    const xpResult = calculateXp(content, authUser.userId, xpRecord, lastMsg?.senderId ?? null);

    // ── Persist message + update XP atomically ──────────────────────────────
    const [newMessage] = await prisma.$transaction(async (tx) => {
      // Create the message
      const msg = await tx.message.create({
        data: {
          conversationId: convId,
          senderId: authUser.userId,
          type,
          content,
          xpAwarded: xpResult.xp,
        },
        include: {
          sender: { select: { id: true, name: true, profileImageUrl: true } },
        },
      });

      // Update conversation lastMessageAt
      await tx.conversation.update({
        where: { id: convId },
        data: { lastMessageAt: new Date() },
      });

      // Update sender's XP anti-spam record
      await tx.userConversationXp.update({
        where: { userId_conversationId: { userId: authUser.userId, conversationId: convId } },
        data: xpResult.updates,
      });

      // Update conversation XP pool
      if (xpResult.xp > 0) {
        const newTotalXp = totalXp + xpResult.xp;
        const newLevel = getLevelFromXp(newTotalXp);

        await tx.chatLevel.upsert({
          where: { conversationId: convId },
          create: { conversationId: convId, level: newLevel, totalXp: newTotalXp },
          update: { totalXp: newTotalXp, level: newLevel },
        });
      }

      return [msg];
    });

    // ── Pusher broadcast ────────────────────────────────────────────────────
    try {
      const pusher = getPusherServer();
      await pusher.trigger(
        pusherChannel.conversation(convId),
        PUSHER_EVENTS.NEW_MESSAGE,
        {
          message: newMessage,
          xpAwarded: xpResult.xp,
          xpReason: xpResult.reason,
        }
      );

      // Level-up event if XP crossed a threshold
      if (xpResult.xp > 0) {
        const updatedLevel = await prisma.chatLevel.findUnique({ where: { conversationId: convId } });
        if (updatedLevel && updatedLevel.level > currentLevel) {
          await pusher.trigger(pusherChannel.conversation(convId), PUSHER_EVENTS.LEVEL_UP, {
            newLevel: updatedLevel.level,
            unlockedFeatures: getUnlockedFeatures(updatedLevel.level),
          });
        }
      }
    } catch (pusherErr) {
      // Non-fatal: message is already saved
      console.warn('Pusher trigger failed:', pusherErr);
    }

    return NextResponse.json(
      { message: newMessage, xpAwarded: xpResult.xp, xpReason: xpResult.reason },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/conversations/[id]/messages error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
