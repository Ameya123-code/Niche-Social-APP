'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Pusher from 'pusher-js';
import { ArrowLeft, Send, Zap } from 'lucide-react';
import { DEMO_CONVERSATIONS, DEMO_MESSAGES } from '@/lib/demo-chat';

type Partner = { id: string; name: string; age: number; city?: string; profileImageUrl?: string | null };
type Conversation = {
  id: string;
  partner: Partner;
  level: number;
  totalXp: number;
  unlockedFeatures: string[];
};

type Msg = {
  id: string;
  senderId: string;
  content: string;
  type: string;
  xpAwarded?: number;
  createdAt: string;
  sender?: { id: string; name: string };
};

export default function ChatDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [myId, setMyId] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [xpHint, setXpHint] = useState('');

  const isDemo = id?.startsWith('demo_conv_');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token || !id) return;

    const run = async () => {
      setLoading(true);
      try {
        const meRes = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          setMyId(meData?.user?.id ?? 'me');
        }

        if (isDemo) {
          const demoConv = DEMO_CONVERSATIONS.find((c) => c.id === id);
          setConversation((demoConv as unknown as Conversation) ?? null);
          setMessages((DEMO_MESSAGES[id] ?? []) as unknown as Msg[]);
          setLoading(false);
          return;
        }

        const [convRes, msgRes] = await Promise.all([
          fetch(`/api/conversations/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/conversations/${id}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!convRes.ok) {
          router.replace('/chat');
          return;
        }

        const convData = await convRes.json();
        const msgData = msgRes.ok ? await msgRes.json() : { messages: [] };

        setConversation(convData?.conversation ?? null);
        setMessages(msgData?.messages ?? []);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, isDemo, router]);

  useEffect(() => {
    if (!id || isDemo) return;
    const token = localStorage.getItem('auth_token');
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!token || !key || !cluster) return;

    const pusher = new Pusher(key, {
      cluster,
      channelAuthorization: {
        endpoint: '/api/pusher/auth',
        transport: 'ajax',
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const channel = pusher.subscribe(`private-conv-${id}`);
    const onMessage = (payload: { message?: Msg; xpReason?: string }) => {
      if (payload?.message) {
        setMessages((prev) => [...prev, payload.message!]);
      }
      if (payload?.xpReason && payload.xpReason !== 'ok') {
        setXpHint(payload.xpReason.replaceAll('_', ' '));
        setTimeout(() => setXpHint(''), 2200);
      }
    };
    channel.bind('message:new', onMessage);

    return () => {
      channel.unbind('message:new', onMessage);
      pusher.unsubscribe(`private-conv-${id}`);
      pusher.disconnect();
    };
  }, [id, isDemo]);

  const canSend = useMemo(() => {
    if (!conversation) return false;
    return (conversation.level ?? 1) >= 1;
  }, [conversation]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending || !conversation) return;

    if (isDemo) {
      const newMsg: Msg = {
        id: `demo_local_${Date.now()}`,
        senderId: myId || 'me',
        sender: { id: myId || 'me', name: 'You' },
        content: text.trim(),
        type: 'text',
        xpAwarded: 2,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
      setText('');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'text', content: text.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.message) {
        setMessages((prev) => [...prev, data.message]);
        setText('');
      }
      if (data?.xpReason && data.xpReason !== 'ok') {
        setXpHint(data.xpReason.replaceAll('_', ' '));
        setTimeout(() => setXpHint(''), 2200);
      }
    } finally {
      setSending(false);
    }
  };

  if (loading || !conversation) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-10 h-10 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-white dark:bg-black flex flex-col">
      <header className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
        <button onClick={() => router.push('/chat')} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white font-semibold flex items-center justify-center overflow-hidden">
          {conversation.partner.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={conversation.partner.profileImageUrl} alt={conversation.partner.name} className="w-full h-full object-cover" />
          ) : (
            conversation.partner.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-black dark:text-white truncate">
            {conversation.partner.name}, {conversation.partner.age}
          </p>
          <p className="text-xs text-rose-500">LVL {conversation.level} · {conversation.totalXp} XP</p>
        </div>
      </header>

      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-900 flex items-center gap-2 text-xs text-gray-500">
        <Zap className="w-3.5 h-3.5 text-rose-500" />
        Unlocked: {conversation.unlockedFeatures.join(', ') || 'text'}
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((m) => {
          const mine = m.senderId === myId || m.senderId === 'me';
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${mine
                  ? 'bg-rose-500 text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 rounded-bl-md'
                }`}
              >
                <p>{m.content}</p>
                <p className={`text-[10px] mt-1 ${mine ? 'text-rose-100' : 'text-gray-500'}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {typeof m.xpAwarded === 'number' ? ` · +${m.xpAwarded}xp` : ''}
                </p>
              </div>
            </div>
          );
        })}
      </main>

      <form onSubmit={submit} className="p-3 border-t border-gray-200 dark:border-gray-800">
        {xpHint ? (
          <p className="text-[11px] mb-1 text-amber-500">No XP: {xpHint}</p>
        ) : null}
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={canSend ? 'Type a message...' : 'Chat locked'}
            disabled={!canSend || sending}
            className="flex-1 h-11 rounded-xl border border-gray-300 dark:border-gray-700 px-3 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            type="submit"
            disabled={!canSend || sending || !text.trim()}
            className="h-11 w-11 rounded-xl bg-rose-500 text-white disabled:opacity-50 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
