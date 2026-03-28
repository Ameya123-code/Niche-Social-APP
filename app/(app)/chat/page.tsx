'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageCircle, Sparkles } from 'lucide-react';
import { DEMO_CONVERSATIONS } from '@/lib/demo-chat';

type Conversation = {
  id: string;
  partner: { id: string; name: string; age: number; city?: string; profileImageUrl?: string | null };
  level: number;
  totalXp: number;
  unlockedFeatures: string[];
  lastMessage?: { content?: string; createdAt?: string } | null;
  lastMessageAt?: string;
};

const maskUrls = (value: string) => value.replace(/(https?:\/\/\S+|www\.\S+)/gi, '[link hidden]');

const levelTag = (level: number) =>
  level >= 40 ? 'Event suggestions unlocked' : level >= 25 ? 'Video call unlocked' : level >= 20 ? 'Voice call unlocked' : level >= 15 ? 'Video unlocked' : level >= 10 ? 'Images unlocked' : level >= 5 ? 'GIF/emoji unlocked' : 'Text only';

export default function ChatListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      try {
        const res = await fetch('/api/conversations', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        const list = (data?.conversations ?? []) as Conversation[];
        const byId = new Map<string, Conversation>();
        [...DEMO_CONVERSATIONS, ...list].forEach((c) => byId.set(c.id, c));
        setConversations(Array.from(byId.values()));
      } catch {
        setConversations(DEMO_CONVERSATIONS);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">Chats</h1>
            <p className="text-sm text-gray-500">Your matches and active conversations</p>
          </div>
          <button
            onClick={() => router.push('/cards')}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300"
          >
            Discover more
          </button>
        </div>

        {loading ? (
          <div className="h-[40vh] flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
            <MessageCircle className="w-10 h-10 mx-auto text-gray-400" />
            <p className="mt-2 font-semibold text-black dark:text-white">No chats yet</p>
            <p className="text-sm text-gray-500 mt-1">Right-swipe people to start conversations.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="block rounded-2xl border border-gray-200 dark:border-gray-800 p-3 hover:border-rose-300 dark:hover:border-rose-700 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white text-sm font-bold flex items-center justify-center overflow-hidden">
                    {conv.partner.profileImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={conv.partner.profileImageUrl} alt={conv.partner.name} className="w-full h-full object-cover" />
                    ) : (
                      conv.partner.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-black dark:text-white truncate">
                        {conv.partner.name}, {conv.partner.age}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {conv.id.startsWith('demo_conv_') ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            Demo
                          </span>
                        ) : null}
                        <span className="text-[11px] text-gray-400">
                          LVL {conv.level}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {conv.lastMessage?.content ? maskUrls(conv.lastMessage.content) : 'Start your conversation'}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-[11px] text-rose-500 inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {levelTag(conv.level)}
                      </p>
                      <div className="text-[10px] text-gray-400">
                        {conv.totalXp} XP
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
