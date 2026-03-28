'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Pusher from 'pusher-js';
import ProfileCard from '@/components/ReactBitsProfileCard';

type IncomingLikePayload = {
  fromUserId: string;
  compatibilityScore: number;
  senderCard: {
    id: string;
    name: string;
    age: number;
    profileImageUrl?: string | null;
    selfDescription?: string | null;
    mutualInterests?: string[];
    cardDesign?: {
      themeId?: string;
      borderStyle?: 'glass' | 'neon' | 'minimal';
      fontStyle?: 'modern' | 'mono' | 'playful';
      backgroundMode?: 'theme' | 'gif' | 'image' | 'gradient';
      gifUrl?: string;
      stickers?: string[];
    };
  };
};

const parseGradientCss = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  try {
    const g = JSON.parse(raw) as { type?: string; angle?: number; colors?: string[] };
    if (g?.type === 'gradient' && Array.isArray(g.colors) && g.colors.length >= 2) {
      return `linear-gradient(${g.angle ?? 135}deg, ${g.colors.join(', ')})`;
    }
  } catch {
    // noop
  }
  return undefined;
};

export default function LikeNotificationPopup() {
  const router = useRouter();
  const [queue, setQueue] = useState<IncomingLikePayload[]>([]);
  const [processing, setProcessing] = useState(false);

  const current = queue[0] ?? null;

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    let pusher: Pusher | null = null;
    let cleanup: (() => void) | null = null;

    const setup = async () => {
      const meRes = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) return;

      const meData = await meRes.json();
      const userId = meData?.user?.id as string | undefined;
      if (!userId) return;

      const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
      const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
      if (!key || !cluster) return;

      pusher = new Pusher(key, {
        cluster,
        channelAuthorization: {
          endpoint: '/api/pusher/auth',
          transport: 'ajax',
          headers: { Authorization: `Bearer ${token}` },
        },
      });

      const inboxChannel = pusher.subscribe(`private-inbox-${userId}`);
      const onLike = (payload: IncomingLikePayload) => {
        setQueue((prev) => [...prev, payload]);
      };
      const onMatch = (payload: { conversationId?: string }) => {
        if (payload?.conversationId) router.push(`/chat/${payload.conversationId}`);
      };

      inboxChannel.bind('like:received', onLike);
      inboxChannel.bind('match:created', onMatch);

      cleanup = () => {
        inboxChannel.unbind('like:received', onLike);
        inboxChannel.unbind('match:created', onMatch);
        pusher?.unsubscribe(`private-inbox-${userId}`);
        pusher?.disconnect();
      };
    };

    setup();

    return () => {
      cleanup?.();
      pusher?.disconnect();
    };
  }, [router]);

  const compatibility = useMemo(() => {
    if (!current) return 0;
    return Math.max(0, Math.min(100, Math.round(current.compatibilityScore ?? 0)));
  }, [current]);

  const dismiss = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  const accept = useCallback(async () => {
    if (!current || processing) return;
    setProcessing(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/cards/${current.fromUserId}/like`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      setQueue((prev) => prev.slice(1));
      if (data?.matched && data?.conversationId) {
        router.push(`/chat/${data.conversationId}`);
      } else {
        router.push('/chat');
      }
    } finally {
      setProcessing(false);
    }
  }, [current, processing, router]);

  if (!current) return null;

  const card = current.senderCard;
  const mode = card.cardDesign?.backgroundMode ?? 'theme';
  const gifUrl = card.cardDesign?.gifUrl;

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white dark:bg-zinc-900 shadow-2xl p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500">New right swipe</p>
        <h3 className="text-lg font-bold text-black dark:text-white mt-1">
          {card.name} liked your profile
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">Accept to auto-open chat.</p>

        <div className="mt-3 scale-[0.83] origin-top -mb-8">
          <ProfileCard
            avatarUrl={card.profileImageUrl || ''}
            name={`${card.name}, ${card.age}`}
            title={card.selfDescription || 'Liked your vibe'}
            handle={card.name.toLowerCase().replace(/\s+/g, '')}
            status="Wants to connect"
            themeId={card.cardDesign?.themeId ?? 'rose'}
            borderStyle={card.cardDesign?.borderStyle ?? 'glass'}
            fontStyle={card.cardDesign?.fontStyle ?? 'modern'}
            backgroundMode={mode}
            gifUrl={mode === 'gif' || mode === 'image' ? gifUrl : undefined}
            innerGradient={mode === 'gradient' ? parseGradientCss(gifUrl) : undefined}
            interests={card.mutualInterests?.slice(0, 6) ?? []}
            enableTilt={false}
            showUserInfo
          />
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
            <span>Compatibility</span>
            <span>{compatibility}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500"
              style={{ width: `${compatibility}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={dismiss}
            className="h-10 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300"
          >
            Not now
          </button>
          <button
            onClick={accept}
            disabled={processing}
            className="h-10 rounded-xl bg-rose-500 text-white text-sm font-semibold disabled:opacity-50"
          >
            {processing ? 'Accepting…' : 'Accept & Chat'}
          </button>
        </div>
      </div>
    </div>
  );
}
