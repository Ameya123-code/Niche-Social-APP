import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { isFeatureUnlocked } from '@/lib/chat-level';
import { getPusherServer, pusherChannel, PUSHER_EVENTS } from '@/lib/pusher';

type Params = { params: Promise<{ id: string }> };

type CallSignalType =
  | 'call_request'
  | 'offer'
  | 'answer'
  | 'ice_candidate'
  | 'end_call'
  | 'reject_call';

type CallMode = 'voice' | 'video';

/**
 * POST /api/conversations/[id]/call/signal
 * Broadcasts WebRTC signaling payloads to both members of a conversation.
 *
 * Body: {
 *   type: 'call_request' | 'offer' | 'answer' | 'ice_candidate' | 'end_call' | 'reject_call',
 *   mode?: 'voice' | 'video',
 *   payload?: unknown
 * }
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: convId } = await params;
    const conv = await prisma.conversation.findFirst({
      where: {
        id: convId,
        OR: [{ userAId: authUser.userId }, { userBId: authUser.userId }],
      },
      include: { level: true },
    });

    if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    const body = (await request.json().catch(() => ({}))) as {
      type?: CallSignalType;
      mode?: CallMode;
      payload?: unknown;
    };

    const type = body.type;
    const mode: CallMode = body.mode === 'video' ? 'video' : 'voice';

    if (!type) {
      return NextResponse.json({ error: 'Signal type is required' }, { status: 400 });
    }

    const allowedTypes: CallSignalType[] = ['call_request', 'offer', 'answer', 'ice_candidate', 'end_call', 'reject_call'];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Unsupported signal type' }, { status: 400 });
    }

    // Gating only on call start.
    if (type === 'call_request') {
      const level = conv.level?.level ?? 1;
      const needed = mode === 'video' ? 'video_call' : 'voice_call';
      if (!isFeatureUnlocked(level, needed)) {
        return NextResponse.json(
          { error: `${mode} calls are locked for this conversation level`, currentLevel: level },
          { status: 403 }
        );
      }
    }

    const pusher = getPusherServer();
    await pusher.trigger(pusherChannel.conversation(convId), PUSHER_EVENTS.CALL_SIGNAL, {
      type,
      mode,
      payload: body.payload ?? null,
      conversationId: convId,
      fromUserId: authUser.userId,
      sentAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('POST /api/conversations/[id]/call/signal error:', error);
    return NextResponse.json({ error: 'Failed to broadcast call signal' }, { status: 500 });
  }
}
