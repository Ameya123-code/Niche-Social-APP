'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Palette,
  WandSparkles,
  Camera,
  Plus,
  Minus,
} from 'lucide-react';
import ProfileCard from '@/components/ReactBitsProfileCard';

interface CardUser {
  id: string;
  name: string;
  age: number;
  profileImageUrl?: string | null;
  selfDescription?: string | null;
  preferences?: { music: string; hobbies: string; [k: string]: string };
  mutualInterests?: string[];
  compatibilityScore?: number;
  opinions?: { id: string; content: string; hashtags: string; createdAt: string }[];
  cardDesign?: {
    isCustomized?: boolean;
    themeId: string;
    stickers: string[];
    borderStyle?: 'glass' | 'neon' | 'minimal';
    fontStyle?: 'modern' | 'mono' | 'playful';
    backgroundMode?: 'theme' | 'gif' | 'image' | 'gradient';
    gifUrl?: string;
    updatedAt: string;
  };
}

type CardTheme = {
  id: string;
  name: string;
  shell: string;
  gradient: string;
  pill: string;
  text: string;
  opinion: string;
  glow: string;
};

const CARD_THEMES: CardTheme[] = [
  {
    id: 'rose',
    name: 'Rose Pulse',
    shell: 'from-rose-500/90 via-pink-500/85 to-fuchsia-600/90',
    gradient: 'linear-gradient(135deg,#f43f5e,#ec4899,#a21caf)',
    pill: 'bg-white/20 text-white border-white/20',
    text: 'text-white',
    opinion: 'bg-white/12 border-white/15 text-white',
    glow: 'shadow-pink-500/30',
  },
  {
    id: 'midnight',
    name: 'Midnight Glass',
    shell: 'from-slate-900 via-indigo-900 to-violet-900',
    gradient: 'linear-gradient(135deg,#0f172a,#312e81,#4c1d95)',
    pill: 'bg-white/10 text-slate-100 border-white/15',
    text: 'text-slate-100',
    opinion: 'bg-white/5 border-white/10 text-slate-100',
    glow: 'shadow-indigo-500/25',
  },
  {
    id: 'sunset',
    name: 'Sunset Pop',
    shell: 'from-orange-500 via-rose-500 to-pink-600',
    gradient: 'linear-gradient(135deg,#f97316,#f43f5e,#ec4899)',
    pill: 'bg-black/20 text-white border-white/20',
    text: 'text-white',
    opinion: 'bg-black/20 border-white/15 text-white',
    glow: 'shadow-rose-500/30',
  },
  {
    id: 'ocean',
    name: 'Ocean Wave',
    shell: 'from-sky-700 via-cyan-500 to-teal-700',
    gradient: 'linear-gradient(135deg,#0369a1,#06b6d4,#0f766e)',
    pill: 'bg-white/15 text-white border-white/20',
    text: 'text-white',
    opinion: 'bg-white/10 border-white/15 text-white',
    glow: 'shadow-cyan-500/30',
  },
  {
    id: 'forest',
    name: 'Forest Night',
    shell: 'from-emerald-900 via-green-700 to-lime-700',
    gradient: 'linear-gradient(135deg,#065f46,#166534,#65a30d)',
    pill: 'bg-white/12 text-white border-white/20',
    text: 'text-white',
    opinion: 'bg-white/10 border-white/15 text-white',
    glow: 'shadow-emerald-500/30',
  },
  {
    id: 'violet',
    name: 'Violet Storm',
    shell: 'from-violet-700 via-purple-600 to-indigo-700',
    gradient: 'linear-gradient(135deg,#6d28d9,#9333ea,#4338ca)',
    pill: 'bg-white/14 text-white border-white/20',
    text: 'text-white',
    opinion: 'bg-white/10 border-white/15 text-white',
    glow: 'shadow-violet-500/30',
  },
  {
    id: 'aurora',
    name: 'Aurora Flow',
    shell: 'from-cyan-400 via-emerald-400 to-violet-400',
    gradient: 'linear-gradient(135deg,#22d3ee,#34d399,#a78bfa)',
    pill: 'bg-black/15 text-white border-white/20',
    text: 'text-white',
    opinion: 'bg-black/15 border-white/15 text-white',
    glow: 'shadow-cyan-400/35',
  },
  {
    id: 'ember',
    name: 'Ember Flame',
    shell: 'from-amber-700 via-red-600 to-orange-800',
    gradient: 'linear-gradient(135deg,#b45309,#dc2626,#9a3412)',
    pill: 'bg-black/20 text-white border-white/20',
    text: 'text-white',
    opinion: 'bg-black/20 border-white/15 text-white',
    glow: 'shadow-orange-500/35',
  },
  {
    id: 'mono-noir',
    name: 'Mono Noir',
    shell: 'from-zinc-900 via-neutral-800 to-black',
    gradient: 'linear-gradient(135deg,#111827,#262626,#09090b)',
    pill: 'bg-white/10 text-zinc-100 border-white/15',
    text: 'text-zinc-100',
    opinion: 'bg-white/5 border-white/10 text-zinc-100',
    glow: 'shadow-zinc-500/25',
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    shell: 'from-pink-400 via-indigo-400 to-cyan-400',
    gradient: 'linear-gradient(135deg,#f472b6,#818cf8,#22d3ee)',
    pill: 'bg-black/20 text-white border-white/20',
    text: 'text-white',
    opinion: 'bg-black/20 border-white/15 text-white',
    glow: 'shadow-pink-400/35',
  },
];

const QUICK_GIFS = [
  'https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif',
  'https://media.giphy.com/media/l0HlNaQ6gWfllcjDO/giphy.gif',
  'https://media.giphy.com/media/xUPGcguWZHRC2HyBRS/giphy.gif',
];

const INTEREST_SECTIONS: Array<{
  id: string;
  title: string;
  values: string[];
}> = [
  {
    id: 'identity',
    title: 'Identity-Level',
    values: ['Gym Lifestyle', 'Runner', 'Yogi', 'Casual Gamer', 'Competitive Gamer', 'Entrepreneur', 'Builder', 'Creative Artist', 'Developer', 'Student', 'Freelancer'],
  },
  {
    id: 'activities',
    title: 'Activity-Based',
    values: ['Football', 'Cricket', 'Badminton', 'Basketball', 'Tennis', 'Gym', 'FPS Gaming', 'RPG Gaming', 'Traveling', 'Cooking', 'Photography', 'Music Jamming'],
  },
  {
    id: 'opinions',
    title: 'Thinking & Opinions',
    values: ['Current Events', 'Tech Trends', 'Movies & Pop Culture', 'Debates', 'Hot Takes', 'Unpopular Opinions', 'Remote work vs office', 'AI will replace jobs'],
  },
  {
    id: 'taste',
    title: 'Taste & Preferences',
    values: ['Pop Music', 'Hip-Hop', 'Indie Music', 'Movies', 'Series', 'Anime', 'Podcasts', 'YouTube Niches', 'Coffee Culture', 'Street Food'],
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    values: ['Introvert', 'Extrovert', 'Ambivert', 'Night Owl', 'Early Riser', 'Party Person', 'Chill Vibes', 'Luxury Travel', 'Backpacking', 'Small Groups'],
  },
  {
    id: 'local',
    title: 'Local Context',
    values: ['Looking for football buddies', 'Open to café hopping this weekend', 'Attending local events', 'Weekend city explorer', 'Nearby co-working buddy'],
  },
];

const BORDER_STYLES: Array<{ id: 'glass' | 'neon' | 'minimal'; label: string }> = [
  { id: 'glass', label: 'Glass' },
  { id: 'neon', label: 'Neon' },
  { id: 'minimal', label: 'Minimal' },
];

const FONT_STYLES: Array<{ id: 'modern' | 'mono' | 'playful'; label: string }> = [
  { id: 'modern', label: 'Modern' },
  { id: 'mono', label: 'Mono' },
  { id: 'playful', label: 'Playful' },
];

const emojiByInterest: Record<string, string> = {
  music: '🎵',
  art: '🎨',
  tech: '💻',
  travel: '✈️',
  coffee: '☕',
  food: '🍜',
  books: '📚',
  fitness: '💪',
  gaming: '🎮',
  movies: '🎬',
  startups: '🚀',
  networking: '🤝',
};

const parseList = (s?: string) => {
  try {
    return s ? (JSON.parse(s) as string[]) : [];
  } catch {
    return [];
  }
};

const parseTags = (s?: string) => {
  try {
    return s ? (JSON.parse(s) as string[]) : [];
  } catch {
    return [];
  }
};

const toSticker = (value: string) => {
  const key = value.toLowerCase().trim();
  return emojiByInterest[key] ?? '✨';
};

/** Decode a gradient stored as JSON (mode=gradient) into a CSS string for innerGradient. */
const parseGradientCss = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  try {
    const g = JSON.parse(raw) as { type?: string; angle?: number; colors?: string[] };
    if (g?.type === 'gradient' && Array.isArray(g.colors) && g.colors.length >= 2) {
      return `linear-gradient(${g.angle ?? 135}deg, ${g.colors.join(', ')})`;
    }
  } catch { /* not JSON */ }
  return undefined;
};

const clampLevel = (n: number) => Math.max(1, Math.min(5, n));

export default function CardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<CardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [designLoaded, setDesignLoaded] = useState(false);
  const [isDesignReady, setIsDesignReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [swiping, setSwiping] = useState<null | 'like' | 'pass'>(null);
  const [selectedThemeId, setSelectedThemeId] = useState('rose');
  const [myStickers, setMyStickers] = useState<string[]>([]);
  const [activeInterestSection, setActiveInterestSection] = useState<string>('all');
  const [interestQuery, setInterestQuery] = useState('');
  const [stickerInput, setStickerInput] = useState('');
  const [borderStyle, setBorderStyle] = useState<'glass' | 'neon' | 'minimal'>('glass');
  const [fontStyle, setFontStyle] = useState<'modern' | 'mono' | 'playful'>('modern');
  const [backgroundMode, setBackgroundMode] = useState<'theme' | 'gif' | 'image' | 'gradient'>('theme');
  const [gifUrl, setGifUrl] = useState('');
  const [gradientColors, setGradientColors] = useState<string[]>(['#7c3aed', '#ec4899']);
  const [gradientAngle, setGradientAngle] = useState(135);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [savingDesign, setSavingDesign] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const MAX_INTERESTS = 30;

  const openProfileCustomizer = useCallback(() => {
    localStorage.setItem('open_profile_editor_tab', 'card');
    router.push('/profile');
  }, [router]);

  useEffect(() => {
    const loadMyDesign = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setDesignLoaded(true);
        setIsDesignReady(true);
        return;
      }
      try {
        const res = await fetch('/api/users/me/card-design', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const design = data?.cardDesign;
        if (design?.themeId && CARD_THEMES.some((t) => t.id === design.themeId)) {
          setSelectedThemeId(design.themeId);
        }
        if (Array.isArray(design?.stickers)) {
          setMyStickers(design.stickers.slice(0, MAX_INTERESTS));
        }
        if (design?.borderStyle) setBorderStyle(design.borderStyle);
        if (design?.fontStyle) setFontStyle(design.fontStyle);
        if (design?.backgroundMode) setBackgroundMode(design.backgroundMode);
        if (typeof design?.gifUrl === 'string') {
          if (design.backgroundMode === 'gradient') {
            // gifUrl stores gradient JSON — parse colors/angle back out
            try {
              const g = JSON.parse(design.gifUrl) as { type?: string; colors?: string[]; angle?: number };
              if (g?.type === 'gradient' && Array.isArray(g.colors) && g.colors.length >= 2) {
                setGradientColors(g.colors.slice(0, 5));
                if (typeof g.angle === 'number') setGradientAngle(Math.max(0, Math.min(360, g.angle)));
              }
            } catch { /* ignore */ }
          } else {
            setGifUrl(design.gifUrl);
          }
        }
        // Load existing profile avatar
        const meRes = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
        if (meRes.ok) {
          const meData = await meRes.json() as { user?: { profileImageUrl?: string | null } };
          if (meData?.user?.profileImageUrl) setAvatarPreviewUrl(meData.user.profileImageUrl);
        }
        setIsDesignReady(Boolean(design?.isCustomized));
      } catch {
        /* ignore */
      } finally {
        setDesignLoaded(true);
      }
    };

    loadMyDesign();
  }, [MAX_INTERESTS]);

  const saveMyDesign = useCallback(async (forceCustomized = false) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    setSavingDesign(true);
    try {
      const response = await fetch('/api/users/me/card-design', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isCustomized: forceCustomized || isDesignReady,
          themeId: selectedThemeId,
          stickers: myStickers,
          borderStyle,
          fontStyle,
          backgroundMode,
          gifUrl: backgroundMode === 'gradient'
            ? JSON.stringify({ type: 'gradient', angle: gradientAngle, colors: gradientColors })
            : gifUrl,
        }),
      });
      if (!response.ok) return false;
      return true;
    } catch {
      return false;
    } finally {
      setSavingDesign(false);
    }
  }, [backgroundMode, borderStyle, fontStyle, gifUrl, gradientAngle, gradientColors, isDesignReady, myStickers, selectedThemeId]);

  /** Upload the pending avatar file, update user profile image, return the stored URL. */
  const uploadAvatar = useCallback(async (): Promise<string | null> => {
    if (!avatarFile) return avatarPreviewUrl || null;
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', avatarFile);
      const uploadRes = await fetch('/api/uploads/image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!uploadRes.ok) return null;
      const { url } = await uploadRes.json() as { url?: string };
      if (!url) return null;
      // Persist as profile image
      await fetch('/api/users/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileImageUrl: url }),
      });
      setAvatarPreviewUrl(url);
      setAvatarFile(null);
      return url;
    } catch {
      return null;
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [avatarFile, avatarPreviewUrl]);

  /** Save everything and mark design as ready so swipe feed loads. */
  const handleFinishSetup = useCallback(async () => {
    await uploadAvatar();
    const ok = await saveMyDesign(true);
    if (ok) setIsDesignReady(true);
  }, [uploadAvatar, saveMyDesign]);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/cards', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards ?? []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isDesignReady) return;
    fetchCards();
  }, [fetchCards, isDesignReady]);

  const handleAction = async (userId: string, action: 'like' | 'pass') => {
    setSwiping(action);
    const token = localStorage.getItem('auth_token');
    let matchedConversationId: string | null = null;
    try {
      const res = await fetch(`/api/cards/${userId}/${action}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (action === 'like' && data?.matched && typeof data?.conversationId === 'string') {
        matchedConversationId = data.conversationId;
      }
    } catch {
      /* ignore */
    }
    setTimeout(() => {
      setCards((prev) => prev.slice(1));
      setSwiping(null);
      setExpanded(false);
      if (matchedConversationId) {
        router.push(`/chat/${matchedConversationId}`);
      }
    }, 320);
  };

  if (!designLoaded || (isDesignReady && loading)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
        <p className="text-gray-500 text-sm">Preparing your card space…</p>
      </div>
    );
  }

  if (!isDesignReady) {
    const previewTheme = CARD_THEMES.find((t) => t.id === selectedThemeId) ?? CARD_THEMES[0];
    const previewStickers = myStickers.length > 0 ? myStickers : ['✨', '💬', '🎧'];
    const normalizedQuery = interestQuery.trim().toLowerCase();
    const filteredSections = INTEREST_SECTIONS
      .filter((section) => activeInterestSection === 'all' || section.id === activeInterestSection)
      .map((section) => ({
        ...section,
        values: normalizedQuery
          ? section.values.filter((value) => value.toLowerCase().includes(normalizedQuery))
          : section.values,
      }))
      .filter((section) => section.values.length > 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-rose-50 dark:from-black dark:via-zinc-950 dark:to-zinc-900 px-4 py-8">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-5">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl p-5 sm:p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-rose-500 font-semibold">Required setup</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mt-1">Create your card first</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Before swiping, finish your card style in your Profile customizer.
              </p>
              <button
                onClick={openProfileCustomizer}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-fuchsia-500"
              >
                Open Profile Customizer
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-2">
                <Camera className="w-3.5 h-3.5" /> Avatar photo
              </p>
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {avatarPreviewUrl ? (
                      <img src={avatarPreviewUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug">
                    {avatarPreviewUrl ? 'Looking good! Tap to change.' : 'Add a photo to show on your card.'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG or WebP · max 5 MB</p>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="mt-2 px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-rose-400 hover:text-rose-500 transition"
                  >
                    Choose photo
                  </button>
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setAvatarFile(file);
                  const prev = avatarPreviewUrl;
                  if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
                  setAvatarPreviewUrl(URL.createObjectURL(file));
                }}
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" /> Theme
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CARD_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedThemeId(theme.id)}
                    className={`rounded-xl p-2 text-xs font-medium border text-left ${
                      selectedThemeId === theme.id
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <span className="block w-full h-1.5 rounded-full mb-1.5" style={{ background: theme.gradient }} />
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Border style</p>
                <div className="space-y-2">
                  {BORDER_STYLES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setBorderStyle(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl border text-xs ${
                        borderStyle === item.id
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Font style</p>
                <div className="space-y-2">
                  {FONT_STYLES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setFontStyle(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl border text-xs ${
                        fontStyle === item.id
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Background</p>
              <div className="flex gap-1.5 flex-wrap mb-3">
                {(['theme', 'gradient', 'gif'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setBackgroundMode(mode)}
                    className={`px-3 py-2 rounded-xl text-xs border transition ${
                      backgroundMode === mode
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {mode === 'theme' ? '🎨 Theme' : mode === 'gradient' ? '🌈 Gradient' : '📽️ GIF / Image'}
                  </button>
                ))}
              </div>

              {backgroundMode === 'gradient' && (
                <div className="space-y-3">
                  {/* Color stops */}
                  <div className="space-y-2">
                    {gradientColors.map((color, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const next = [...gradientColors];
                            next[i] = e.target.value;
                            setGradientColors(next);
                          }}
                          className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 p-0.5 bg-white dark:bg-gray-900"
                        />
                        <div
                          className="flex-1 h-9 rounded-lg border border-gray-200 dark:border-gray-700"
                          style={{ background: color }}
                        />
                        {gradientColors.length > 2 && (
                          <button
                            type="button"
                            onClick={() => setGradientColors(gradientColors.filter((_, idx) => idx !== i))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {gradientColors.length < 5 && (
                      <button
                        type="button"
                        onClick={() => setGradientColors([...gradientColors, '#ffffff'])}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-rose-500 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add color stop
                      </button>
                    )}
                  </div>

                  {/* Direction */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Direction</span>
                      <span>{gradientAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={gradientAngle}
                      onChange={(e) => setGradientAngle(Number(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                    <div className="flex gap-1.5 mt-1.5">
                      {([{ label: '→', val: 90 }, { label: '↘', val: 135 }, { label: '↓', val: 180 }, { label: '↗', val: 45 }] as const).map(({ label, val }) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setGradientAngle(val)}
                          className={`w-8 h-8 rounded-lg text-xs border transition ${
                            gradientAngle === val
                              ? 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-900/20'
                              : 'border-gray-200 dark:border-gray-700 text-gray-500'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live swatch */}
                  <div
                    className="h-10 rounded-xl shadow-inner"
                    style={{ background: `linear-gradient(${gradientAngle}deg, ${gradientColors.join(', ')})` }}
                  />
                </div>
              )}

              {backgroundMode === 'gif' && (
                <div className="space-y-2">
                  <input
                    value={gifUrl}
                    onChange={(e) => setGifUrl(e.target.value)}
                    placeholder="Paste GIF or image URL"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                  />
                  <div className="flex flex-wrap gap-2">
                    {QUICK_GIFS.map((gif) => (
                      <button
                        key={gif}
                        type="button"
                        onClick={() => setGifUrl(gif)}
                        className="px-2 py-1 rounded-lg text-[11px] border border-gray-200 dark:border-gray-700"
                      >
                        Use sample GIF
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Interests</p>
              <p className="text-[11px] text-gray-500 mb-2">Selected: {myStickers.length}/{MAX_INTERESTS}</p>

              <div className="mb-2 overflow-x-auto scrollbar-hide">
                <div className="flex gap-1.5 w-max pr-1">
                  <button
                    type="button"
                    onClick={() => setActiveInterestSection('all')}
                    className={`px-2.5 py-1.5 rounded-full border text-xs whitespace-nowrap ${activeInterestSection === 'all' ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                  >
                    All sections
                  </button>
                  {INTEREST_SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveInterestSection(section.id)}
                      className={`px-2.5 py-1.5 rounded-full border text-xs whitespace-nowrap ${activeInterestSection === section.id ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
              </div>

              <input
                value={interestQuery}
                onChange={(e) => setInterestQuery(e.target.value)}
                placeholder="Search interests"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs mb-2"
              />

              <div className="max-h-52 overflow-y-auto rounded-2xl border border-gray-200 dark:border-gray-700 p-2.5 space-y-3 mb-2">
                {filteredSections.length === 0 && (
                  <p className="text-xs text-gray-500">No matches. Add custom interest below.</p>
                )}

                {filteredSections.map((section) => (
                  <div key={section.id}>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{section.title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {section.values.map((value) => {
                        const active = myStickers.includes(value);
                        return (
                          <button
                            key={`${section.id}-${value}`}
                            type="button"
                            onClick={() => {
                              if (active) {
                                setMyStickers((prev) => prev.filter((v) => v !== value));
                              } else {
                                setMyStickers((prev) => [...new Set([...prev, value])].slice(0, MAX_INTERESTS));
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-full border text-xs ${active ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={stickerInput}
                  onChange={(e) => setStickerInput(e.target.value)}
                  placeholder="Add custom interest"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                />
                <button
                  onClick={() => {
                    const next = stickerInput.trim();
                    if (!next) return;
                    const merged = [...new Set([...myStickers, next])].slice(0, MAX_INTERESTS);
                    setMyStickers(merged);
                    setStickerInput('');
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500 text-white"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleFinishSetup}
                disabled={savingDesign || isUploadingAvatar}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white font-semibold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {savingDesign || isUploadingAvatar ? 'Saving…' : 'Save design & start swiping →'}
              </button>
              <button
                onClick={openProfileCustomizer}
                className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline-offset-2 hover:underline transition"
              >
                Or open full Profile Customizer
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-gray-500 mb-3">Live preview</p>
            <ProfileCard
              avatarUrl={avatarPreviewUrl}
              bannerUrl=""
              avatarFrame="none"
              name="You, 24"
              title="Opinion-first profile — share what you think, not just how you look."
              handle="you"
              status="Setting up card"
              themeId={selectedThemeId}
              borderStyle={borderStyle}
              fontStyle={fontStyle}
              backgroundMode={backgroundMode}
              gifUrl={backgroundMode === 'gif' || backgroundMode === 'image' ? gifUrl : undefined}
              innerGradient={backgroundMode === 'gradient' ? `linear-gradient(${gradientAngle}deg, ${gradientColors.join(', ')})` : undefined}
              enableTilt={false}
              showUserInfo={false}
              interests={previewStickers}
            />
          </div>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-8 text-center">
        <Heart className="w-16 h-16 text-red-200" />
        <h2 className="text-2xl font-bold text-black dark:text-white">You&apos;re all caught up</h2>
        <p className="text-gray-500 text-sm">No more opinion cards right now.</p>
        <button
          onClick={fetchCards}
          className="mt-2 px-8 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition"
        >
          Refresh
        </button>
      </div>
    );
  }

  const card = cards[0];
  const hobbies: string[] = parseList(card.preferences?.hobbies);
  const music: string[] = parseList(card.preferences?.music);
  const interests = [...hobbies, ...music].slice(0, 6);
  const opinions = card.opinions ?? [];
  const opinionTags = opinions.flatMap((o) => parseTags(o.hashtags)).slice(0, 5);

  const displayedThemeId = card.cardDesign?.themeId && CARD_THEMES.some((t) => t.id === card.cardDesign?.themeId)
    ? card.cardDesign.themeId
    : selectedThemeId;

  const displayedBorderStyle = card.cardDesign?.borderStyle ?? borderStyle;
  const displayedFontStyle = card.cardDesign?.fontStyle ?? fontStyle;
  const displayedBackgroundMode = card.cardDesign?.backgroundMode ?? backgroundMode;
  const displayedGifUrl = card.cardDesign?.gifUrl ?? gifUrl;

  const custom = Array.isArray(card.cardDesign?.stickers)
    ? card.cardDesign.stickers
        .map((s) => (typeof s === 'string' ? s.trim() : ''))
        .filter(Boolean)
        .slice(0, 10)
    : [];

  const stickers =
    custom.length > 0
      ? custom.map((s) => ({ emoji: s, label: 'custom' }))
      : (() => {
          const pool = [...interests, ...opinionTags]
            .map((item) => ({ emoji: toSticker(item), label: item }))
            .filter((v, idx, arr) => arr.findIndex((x) => x.emoji === v.emoji) === idx)
            .slice(0, 5);
          return pool.length > 0
            ? pool
            : [{ emoji: '✨', label: 'vibes' }, { emoji: '💬', label: 'opinions' }];
        })();

  const cardInterests =
    custom.length > 0
      ? custom.slice(0, 8)
      : [...interests, ...opinionTags].filter(Boolean).slice(0, 8);

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-black select-none">
      <div className="px-5 sm:px-6 lg:px-8 pt-4 pb-3">
        <h1 className="text-2xl font-bold text-black dark:text-white">Opinion Discover</h1>
        <p className="text-sm text-gray-500">{cards.length} {cards.length === 1 ? 'person' : 'people'} in your queue</p>
      </div>

      <div className="px-5 sm:px-6 lg:px-8 pb-3">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-3">
          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-2">
            <WandSparkles className="w-3.5 h-3.5" />
            Card customizer
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={openProfileCustomizer}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-rose-300 text-rose-600 bg-rose-50 dark:bg-rose-900/20"
            >
              Open profile customizer
            </button>
            <button
              onClick={() => saveMyDesign(false)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700"
            >
              {savingDesign ? 'Saving…' : 'Quick save current style'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 sm:px-6 lg:px-8 pb-4 overflow-hidden flex items-center justify-center">
        <div className="h-full w-full max-w-2xl flex flex-col">
          <div className="flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.95, y: 14 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  x: swiping === 'like' ? 420 : swiping === 'pass' ? -420 : 0,
                  rotate: swiping === 'like' ? 13 : swiping === 'pass' ? -13 : 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.9}
                dragDirectionLock
                whileDrag={{ scale: 0.98 }}
                onDragEnd={(_, info) => {
                  if (swiping) return;
                  if (info.offset.x > 110 || info.velocity.x > 550) {
                    handleAction(card.id, 'like');
                    return;
                  }
                  if (info.offset.x < -110 || info.velocity.x < -550) {
                    handleAction(card.id, 'pass');
                  }
                }}
                className="w-full"
              >
                <ProfileCard
                  avatarUrl={card.profileImageUrl || ''}
                  bannerUrl=""
                  avatarFrame="none"
                  name={`${card.name}, ${card.age}`}
                  title={opinions[0]?.content ?? card.selfDescription ?? 'No opinion yet — swipe to discover someone with your vibe.'}
                  handle={card.name.toLowerCase().replace(/\s+/g, '')}
                  status="Open to chat"
                  themeId={displayedThemeId}
                  borderStyle={displayedBorderStyle}
                  fontStyle={displayedFontStyle}
                  backgroundMode={displayedBackgroundMode}
                  gifUrl={displayedBackgroundMode === 'gif' || displayedBackgroundMode === 'image' ? displayedGifUrl : undefined}
                  innerGradient={displayedBackgroundMode === 'gradient' ? parseGradientCss(displayedGifUrl) : undefined}
                  enableTilt={false}
                  showUserInfo={true}
                  contactText="Connect"
                  opinionCount={opinions.length}
                  likeCount={Math.max(0, Math.round((card.compatibilityScore ?? 50) / 5))}
                  interests={cardInterests}
                  onContactClick={() => {}}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 px-0 space-y-3 overflow-y-auto scrollbar-hide">
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((i) => (
                    <span key={i} className="px-3 py-1 text-xs rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-200">
                      #{i}
                    </span>
                  ))}
                </div>
              )}

              {opinions.length > 1 && (
                <div className="space-y-2">
                  <button
                    onClick={() => setExpanded((v) => !v)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {opinions.length} opinion threads
                    {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        {opinions.slice(1, 4).map((op) => (
                          <div key={op.id} className="rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3">
                            <p className="text-xs text-gray-700 dark:text-gray-100">{op.content}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
