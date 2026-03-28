import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getPusherServer } from '@/lib/pusher';

/**
 * POST /api/pusher/auth
 * Authenticates a Pusher private channel subscription.
 * Called automatically by the Pusher client SDK.
 *
 * The channel name encodes the resource (e.g. private-conv-<convId>).
 * We verify the user has access before signing the token.
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const socketId = formData.get('socket_id') as string;
    const channelName = formData.get('channel_name') as string;

    if (!socketId || !channelName) {
      return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
    }

    // Channel access control
    // private-conv-<convId>  → user must be a member of that conversation
    // private-inbox-<userId> → user must be the owner
    if (channelName.startsWith('private-inbox-')) {
      const ownerId = channelName.replace('private-inbox-', '');
      if (ownerId !== authUser.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (channelName.startsWith('private-conv-')) {
      const { default: prisma } = await import('@/lib/prisma');
      const convId = channelName.replace('private-conv-', '');
      const conv = await prisma.conversation.findFirst({
        where: {
          id: convId,
          OR: [{ userAId: authUser.userId }, { userBId: authUser.userId }],
        },
        select: { id: true },
      });
      if (!conv) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    } else {
      return NextResponse.json({ error: 'Unknown channel' }, { status: 403 });
    }

    const pusher = getPusherServer();
    const authResponse = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}
