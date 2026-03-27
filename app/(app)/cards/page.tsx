'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  X,
  Star,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Sparkles,
  Palette,
  Lock,
  Phone,
  Video,
  ImageIcon,
  WandSparkles,
} from 'lucide-react';

interface CardUser {
  id: string;
  name: string;
  age: number;
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
    backgroundMode?: 'theme' | 'gif';
    gifUrl?: string;
    updatedAt: string;
  };
}

type CardTheme = {
  id: string;
  name: string;
  shell: string;
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
    pill: 'bg-white/20 text-white border-white/20',
    text: 'text-white',
    opinion: 'bg-white/12 border-white/15 text-white',
    glow: 'shadow-pink-500/30',
  },
  {
    id: 'midnight',
    name: 'Midnight Glass',
    shell: 'from-slate-900 via-indigo-900 to-violet-900',
    pill: 'bg-white/10 text-slate-100 border-white/15',
    text: 'text-slate-100',
    opinion: 'bg-white/5 border-white/10 text-slate-100',
    glow: 'shadow-indigo-500/25',
  },
  {
    id: 'sunset',
    name: 'Sunset Pop',
    shell: 'from-orange-500 via-rose-500 to-pink-600',
    pill: 'bg-black/20 text-white border-white/20',
    text: 'text-white',
    opinion: 'bg-black/20 border-white/15 text-white',
    glow: 'shadow-rose-500/30',
  },
];

const QUICK_GIFS = [
  'https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif',
  'https://media.giphy.com/media/l0HlNaQ6gWfllcjDO/giphy.gif',
  'https://media.giphy.com/media/xUPGcguWZHRC2HyBRS/giphy.gif',
];

const STICKER_PACKS = {
  vibes: ['✨', '💫', '🔥', '💎'],
  chill: ['☕', '🌙', '🎧', '🫶'],
  social: ['💬', '🤝', '🎉', '😎'],
  nerd: ['🧠', '📚', '💻', '🎮'],
};

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

const clampLevel = (n: number) => Math.max(1, Math.min(5, n));

export default function CardsPage() {
  const [cards, setCards] = useState<CardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [designLoaded, setDesignLoaded] = useState(false);
  const [isDesignReady, setIsDesignReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [swiping, setSwiping] = useState<null | 'like' | 'pass'>(null);
  const [selectedThemeId, setSelectedThemeId] = useState('rose');
  const [myStickers, setMyStickers] = useState<string[]>([]);
  const [stickerInput, setStickerInput] = useState('');
  const [borderStyle, setBorderStyle] = useState<'glass' | 'neon' | 'minimal'>('glass');
  const [fontStyle, setFontStyle] = useState<'modern' | 'mono' | 'playful'>('modern');
  const [backgroundMode, setBackgroundMode] = useState<'theme' | 'gif'>('theme');
  const [gifUrl, setGifUrl] = useState('');
  const [savingDesign, setSavingDesign] = useState(false);

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
          setMyStickers(design.stickers.slice(0, 10));
        }
        if (design?.borderStyle) setBorderStyle(design.borderStyle);
        if (design?.fontStyle) setFontStyle(design.fontStyle);
        if (design?.backgroundMode) setBackgroundMode(design.backgroundMode);
        if (typeof design?.gifUrl === 'string') setGifUrl(design.gifUrl);
        setIsDesignReady(Boolean(design?.isCustomized));
      } catch {
        /* ignore */
      } finally {
        setDesignLoaded(true);
      }
    };

    loadMyDesign();
  }, []);

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
          gifUrl,
        }),
      });
      if (!response.ok) return false;
      return true;
    } catch {
      return false;
    } finally {
      setSavingDesign(false);
    }
  }, [backgroundMode, borderStyle, fontStyle, gifUrl, isDesignReady, myStickers, selectedThemeId]);

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
    try {
      await fetch(`/api/cards/${userId}/${action}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      /* ignore */
    }
    setTimeout(() => {
      setCards((prev) => prev.slice(1));
      setSwiping(null);
      setExpanded(false);
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

    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-rose-50 dark:from-black dark:via-zinc-950 dark:to-zinc-900 px-4 py-8">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-5">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl p-5 sm:p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-rose-500 font-semibold">Required setup</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mt-1">Create your card first</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Before swiping, build your card style with Discord-like controls: themes, borders, fonts, stickers, and GIF backgrounds.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" /> Theme
              </p>
              <div className="grid grid-cols-3 gap-2">
                {CARD_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedThemeId(theme.id)}
                    className={`rounded-xl p-2 text-xs font-medium border ${
                      selectedThemeId === theme.id
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
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
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setBackgroundMode('theme')}
                  className={`px-3 py-2 rounded-xl text-xs border ${
                    backgroundMode === 'theme'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Theme Gradient
                </button>
                <button
                  onClick={() => setBackgroundMode('gif')}
                  className={`px-3 py-2 rounded-xl text-xs border ${
                    backgroundMode === 'gif'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  GIF Background
                </button>
              </div>
              {backgroundMode === 'gif' && (
                <div className="space-y-2">
                  <input
                    value={gifUrl}
                    onChange={(e) => setGifUrl(e.target.value)}
                    placeholder="Paste GIF URL"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                  />
                  <div className="flex flex-wrap gap-2">
                    {QUICK_GIFS.map((gif) => (
                      <button
                        key={gif}
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
              <p className="text-xs font-semibold text-gray-500 mb-2">Stickers & emoji</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {Object.entries(STICKER_PACKS).map(([name, pack]) => (
                  <button
                    key={name}
                    onClick={() => {
                      const merged = [...myStickers, ...pack].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 10);
                      setMyStickers(merged);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs border border-gray-200 dark:border-gray-700"
                  >
                    + {name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={stickerInput}
                  onChange={(e) => setStickerInput(e.target.value)}
                  placeholder="Add custom emoji"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                />
                <button
                  onClick={() => {
                    const next = stickerInput.trim();
                    if (!next) return;
                    const merged = [...myStickers, next].slice(0, 10);
                    setMyStickers(merged);
                    setStickerInput('');
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500 text-white"
                >
                  Add
                </button>
              </div>
            </div>

            <button
              disabled={savingDesign}
              onClick={async () => {
                const ok = await saveMyDesign(true);
                if (ok) setIsDesignReady(true);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white font-semibold shadow-lg disabled:opacity-60"
            >
              {savingDesign ? 'Saving your card…' : 'Continue to Discover'}
            </button>
          </div>

          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-gray-500 mb-3">Live preview</p>
            <div
              className={`rounded-3xl p-5 min-h-[380px] border ${
                borderStyle === 'neon'
                  ? 'border-fuchsia-300/80 shadow-[0_0_30px_rgba(217,70,239,0.35)]'
                  : borderStyle === 'minimal'
                    ? 'border-white/50'
                    : 'border-white/20'
              } ${fontStyle === 'mono' ? 'font-mono' : fontStyle === 'playful' ? 'font-serif' : 'font-sans'} ${
                backgroundMode === 'gif' && gifUrl ? 'bg-black' : `bg-gradient-to-br ${previewTheme.shell}`
              }`}
              style={
                backgroundMode === 'gif' && gifUrl
                  ? {
                      backgroundImage: `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.55)), url(${gifUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : undefined
              }
            >
              <h3 className={`text-2xl font-bold ${previewTheme.text}`}>You, 24</h3>
              <p className="text-white/80 text-sm mt-1">Opinion-first profile</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {previewStickers.map((s, i) => (
                  <span key={`${s}-${i}`} className="px-3 py-1 rounded-full text-xs bg-black/30 text-white border border-white/20">
                    {s}
                  </span>
                ))}
              </div>
              <div className={`mt-5 rounded-2xl border p-4 ${previewTheme.opinion}`}>
                <p className="text-white text-sm">“I love real conversations, not small talk.”</p>
              </div>
            </div>
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

  const activeTheme = CARD_THEMES.find((t) => t.id === displayedThemeId) ?? CARD_THEMES[0];

  const connectionScore = (card.compatibilityScore ?? 50) + Math.min(opinions.length * 7, 21) + Math.min(interests.length * 4, 24);
  const level = clampLevel(Math.ceil(connectionScore / 28));
  const progressPct = Math.min(100, Math.round((connectionScore / 140) * 100));
  const finalLevelUnlocked = level >= 5;

  const borderClass =
    displayedBorderStyle === 'neon'
      ? 'border-fuchsia-300/80 shadow-[0_0_30px_rgba(217,70,239,0.35)]'
      : displayedBorderStyle === 'minimal'
        ? 'border-white/50'
        : 'border-white/20';

  const fontClass = displayedFontStyle === 'mono' ? 'font-mono' : displayedFontStyle === 'playful' ? 'font-serif' : 'font-sans';

  const cardBackgroundStyle =
    displayedBackgroundMode === 'gif' && displayedGifUrl
      ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,.40), rgba(0,0,0,.60)), url(${displayedGifUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : undefined;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black select-none">
      <div className="px-5 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-black dark:text-white">Opinion Discover</h1>
        <p className="text-sm text-gray-500">{cards.length} {cards.length === 1 ? 'person' : 'people'} in your queue</p>
      </div>

      <div className="px-5 pb-3">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-3">
          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-2">
            <WandSparkles className="w-3.5 h-3.5" />
            Card customizer
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsDesignReady(false)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-rose-300 text-rose-600 bg-rose-50 dark:bg-rose-900/20"
            >
              Open customizer
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

      <div className="flex-1 px-4 pb-4 overflow-hidden">
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
            className={`h-full rounded-3xl overflow-hidden shadow-2xl ${activeTheme.glow} border ${borderClass} ${fontClass} ${displayedBackgroundMode === 'gif' && displayedGifUrl ? 'bg-black' : `bg-gradient-to-br ${activeTheme.shell}`} flex flex-col`}
            style={cardBackgroundStyle}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className={`text-3xl font-bold ${activeTheme.text}`}>{card.name}, {card.age}</h2>
                  <p className="text-white/75 text-sm">Opinion-first profile</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full border text-xs font-semibold flex items-center gap-1 ${activeTheme.pill}`}>
                  <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                  {card.compatibilityScore ?? 50}%
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {stickers.map((s, idx) => (
                  <span key={`${s.label}-${idx}`} className="inline-flex items-center gap-1 rounded-full bg-black/20 border border-white/15 px-3 py-1 text-xs text-white">
                    <span>{s.emoji}</span>
                    <span className="opacity-90">{s.label}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="px-5 pb-4">
              <div className={`rounded-2xl border p-4 ${activeTheme.opinion}`}>
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/70 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Top opinion
                </p>
                <p className="text-sm leading-relaxed text-white">
                  {opinions[0]?.content ?? card.selfDescription ?? 'No opinion yet — swipe to discover someone with your vibe.'}
                </p>
              </div>
            </div>

            <div className="px-5 space-y-3 overflow-y-auto pb-4">
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((i) => (
                    <span key={i} className="px-3 py-1 text-xs rounded-full bg-black/25 border border-white/15 text-white">
                      #{i}
                    </span>
                  ))}
                </div>
              )}

              {opinions.length > 1 && (
                <div className="space-y-2">
                  <button
                    onClick={() => setExpanded((v) => !v)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white/85 hover:text-white transition"
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
                          <div key={op.id} className="rounded-xl bg-black/20 border border-white/10 p-3">
                            <p className="text-xs text-white/95">{op.content}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="rounded-2xl bg-black/25 border border-white/10 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/75">Connection level</p>
                  <p className="text-xs font-bold text-white">Lv {level}/5</p>
                </div>
                <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  {[
                    { icon: Phone, label: 'Phone Call' },
                    { icon: Video, label: 'Video Call' },
                    { icon: ImageIcon, label: 'Send Photos' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const unlocked = finalLevelUnlocked;
                    return (
                      <div key={item.label} className="rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-center text-white/90">
                        <div className="flex items-center justify-center gap-1">
                          <Icon className="w-3.5 h-3.5" />
                          {!unlocked && <Lock className="w-3 h-3 text-white/60" />}
                        </div>
                        <p className="mt-1">{item.label}</p>
                        <p className={`mt-0.5 text-[10px] ${unlocked ? 'text-emerald-300' : 'text-white/55'}`}>
                          {unlocked ? 'Unlocked' : 'Final level'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-2 mt-auto flex gap-3">
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => handleAction(card.id, 'pass')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
                Pass
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => handleAction(card.id, 'like')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white text-rose-600 font-semibold hover:bg-rose-50 transition shadow-lg"
              >
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                Like
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
