/**
 * Pusher real-time configuration
 *
 * Required environment variables:
 *   PUSHER_APP_ID          — from pusher.com dashboard
 *   PUSHER_SECRET          — from pusher.com dashboard
 *   NEXT_PUBLIC_PUSHER_KEY — from pusher.com dashboard
 *   NEXT_PUBLIC_PUSHER_CLUSTER — e.g. "us2", "eu", "ap1"
 *
 * Free tier: 200k messages/day, 100 concurrent connections (Sandbox plan)
 */

import Pusher from 'pusher';

// Server-side Pusher instance (used in API routes only)
export function getPusherServer(): Pusher {
  return new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'us2',
    useTLS: true,
  });
}

// Channel naming helpers
export const pusherChannel = {
  conversation: (conversationId: string) => `private-conv-${conversationId}`,
  userInbox: (userId: string) => `private-inbox-${userId}`,
} as const;

// Event names
export const PUSHER_EVENTS = {
  NEW_MESSAGE: 'message:new',
  LEVEL_UP: 'level:up',
  TYPING_START: 'client-typing-start',
  TYPING_STOP: 'client-typing-stop',
  MATCH_CREATED: 'match:created',
} as const;
