'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  User,
  Image as ImageIcon,
  Palette,
  FileText,
  Sparkles,
  Layers,
  Upload,
  Check,
  Loader2,
} from 'lucide-react';
import { useProfileStore } from '@/store/profile';
import { useThemeStore, THEME_PALETTES } from '@/store/theme';
import { useUIStore, type EditorTab } from '@/store/ui';
import { Avatar } from './Avatar';
import { Banner } from './Banner';
import { DecorationLayer } from './DecorationLayer';
import ProfileCard from '@/components/ReactBitsProfileCard';
import { DECORATION_FRAMES } from './Avatar';
import { BADGE_PRESETS } from './DecorationLayer';

// ─── Card Design constants (mirror from cards page) ─────────────────────────

const CARD_THEMES = [
  { id: 'rose',         name: 'Rose Pulse',      shell: 'from-rose-500/90 via-pink-500/85 to-fuchsia-600/90', gradient: 'linear-gradient(135deg,#f43f5e,#ec4899,#a21caf)' },
  { id: 'midnight',     name: 'Midnight Glass',  shell: 'from-slate-900 via-indigo-900 to-violet-900', gradient: 'linear-gradient(135deg,#0f172a,#312e81,#4c1d95)' },
  { id: 'sunset',       name: 'Sunset Pop',      shell: 'from-orange-500 via-rose-500 to-pink-600', gradient: 'linear-gradient(135deg,#f97316,#f43f5e,#ec4899)' },
  { id: 'ocean',        name: 'Ocean Wave',      shell: 'from-sky-700 via-cyan-500 to-teal-700', gradient: 'linear-gradient(135deg,#0369a1,#06b6d4,#0f766e)' },
  { id: 'forest',       name: 'Forest Night',    shell: 'from-emerald-900 via-green-700 to-lime-700', gradient: 'linear-gradient(135deg,#065f46,#166534,#65a30d)' },
  { id: 'violet',       name: 'Violet Storm',    shell: 'from-violet-700 via-purple-600 to-indigo-700', gradient: 'linear-gradient(135deg,#6d28d9,#9333ea,#4338ca)' },
  { id: 'aurora',       name: 'Aurora Flow',     shell: 'from-cyan-400 via-emerald-400 to-violet-400', gradient: 'linear-gradient(135deg,#22d3ee,#34d399,#a78bfa)' },
  { id: 'ember',        name: 'Ember Flame',     shell: 'from-amber-700 via-red-600 to-orange-800', gradient: 'linear-gradient(135deg,#b45309,#dc2626,#9a3412)' },
  { id: 'mono-noir',    name: 'Mono Noir',       shell: 'from-zinc-900 via-neutral-800 to-black', gradient: 'linear-gradient(135deg,#111827,#262626,#09090b)' },
  { id: 'cotton-candy', name: 'Cotton Candy',    shell: 'from-pink-400 via-indigo-400 to-cyan-400', gradient: 'linear-gradient(135deg,#f472b6,#818cf8,#22d3ee)' },
];
const BORDER_STYLES = ['glass', 'neon', 'minimal'] as const;
const FONT_STYLES   = ['modern', 'mono', 'playful'] as const;

type InterestOption = {
  id: string;
  label: string;
  emoji: string;
};

const INTEREST_SECTIONS: Array<{
  id: string;
  label: string;
  options: InterestOption[];
}> = [
  {
    id: 'identity',
    label: 'Identity',
    options: [
      { id: 'gym-lifestyle', label: 'Gym Lifestyle', emoji: '🏋️' },
      { id: 'runner', label: 'Runner', emoji: '🏃' },
      { id: 'yogi', label: 'Yogi', emoji: '🧘' },
      { id: 'entrepreneur', label: 'Entrepreneur', emoji: '🚀' },
      { id: 'builder', label: 'Builder', emoji: '🛠️' },
      { id: 'creative-artist', label: 'Creative Artist', emoji: '🎨' },
      { id: 'writer', label: 'Writer', emoji: '✍️' },
      { id: 'filmmaker', label: 'Filmmaker', emoji: '🎬' },
      { id: 'tech-nerd', label: 'Tech Nerd', emoji: '🤓' },
      { id: 'developer', label: 'Developer', emoji: '💻' },
      { id: 'student', label: 'Student', emoji: '🎓' },
      { id: 'corporate-professional', label: 'Corporate Professional', emoji: '💼' },
      { id: 'freelancer', label: 'Freelancer', emoji: '🧑‍💻' },
    ],
  },
  {
    id: 'activities',
    label: 'Activities',
    options: [
      { id: 'football', label: 'Football', emoji: '⚽' },
      { id: 'cricket', label: 'Cricket', emoji: '🏏' },
      { id: 'badminton', label: 'Badminton', emoji: '🏸' },
      { id: 'basketball', label: 'Basketball', emoji: '🏀' },
      { id: 'tennis', label: 'Tennis', emoji: '🎾' },
      { id: 'gym', label: 'Gym', emoji: '🏋️' },
      { id: 'fitness-training', label: 'Fitness Training', emoji: '💪' },
      { id: 'traveling', label: 'Traveling', emoji: '✈️' },
      { id: 'cooking', label: 'Cooking', emoji: '🍳' },
      { id: 'food-exploration', label: 'Food Exploration', emoji: '🍜' },
      { id: 'photography', label: 'Photography', emoji: '📸' },
      { id: 'dancing', label: 'Dancing', emoji: '🕺' },
      { id: 'music-jamming', label: 'Music Jamming', emoji: '🎵' },
    ],
  },
  {
    id: 'games',
    label: 'Games',
    options: [
      { id: 'valorant', label: 'Valorant', emoji: '🎯' },
      { id: 'pubg-bgmi', label: 'PUBG / BGMI', emoji: '🔫' },
      { id: 'cod-warzone', label: 'COD / Warzone', emoji: '🪖' },
      { id: 'fortnite', label: 'Fortnite', emoji: '🏝️' },
      { id: 'apex-legends', label: 'Apex Legends', emoji: '⚡' },
      { id: 'cs2', label: 'CS2', emoji: '💣' },
      { id: 'league-of-legends', label: 'League of Legends', emoji: '🛡️' },
      { id: 'dota-2', label: 'Dota 2', emoji: '🧙' },
      { id: 'gta-v', label: 'GTA V', emoji: '🚗' },
      { id: 'minecraft', label: 'Minecraft', emoji: '🧱' },
      { id: 'fifa-ea-fc', label: 'FIFA / EA FC', emoji: '🏆' },
      { id: 'genshin-impact', label: 'Genshin Impact', emoji: '🌌' },
    ],
  },
  {
    id: 'opinions',
    label: 'Opinions',
    options: [
      { id: 'current-events', label: 'Current Events', emoji: '📰' },
      { id: 'tech-trends', label: 'Tech Trends', emoji: '📈' },
      { id: 'movies-pop-culture', label: 'Movies & Pop Culture', emoji: '🍿' },
      { id: 'debates', label: 'Debates', emoji: '🗣️' },
      { id: 'ai-replace-jobs', label: 'AI will replace jobs', emoji: '🤖' },
      { id: 'remote-vs-office', label: 'Remote work vs office', emoji: '🏢' },
      { id: 'hot-takes', label: 'Hot Takes', emoji: '🔥' },
      { id: 'unpopular-opinions', label: 'Unpopular Opinions', emoji: '💭' },
      { id: 'deep-conversations', label: 'Deep Conversations', emoji: '🧠' },
    ],
  },
  {
    id: 'taste',
    label: 'Taste',
    options: [
      { id: 'pop-music', label: 'Pop Music', emoji: '🎤' },
      { id: 'hip-hop', label: 'Hip-Hop', emoji: '🎧' },
      { id: 'indie-music', label: 'Indie Music', emoji: '🎸' },
      { id: 'edm', label: 'EDM', emoji: '🎛️' },
      { id: 'favorite-artists', label: 'Favorite Artists', emoji: '⭐' },
      { id: 'movies', label: 'Movies', emoji: '🎬' },
      { id: 'series', label: 'Series', emoji: '📺' },
      { id: 'anime', label: 'Anime', emoji: '🌸' },
      { id: 'podcasts', label: 'Podcasts', emoji: '🎙️' },
      { id: 'youtube-niches', label: 'YouTube Niches', emoji: '▶️' },
      { id: 'coffee-culture', label: 'Coffee Culture', emoji: '☕' },
      { id: 'street-food', label: 'Street Food', emoji: '🌮' },
      { id: 'fine-dining', label: 'Fine Dining', emoji: '🍽️' },
    ],
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    options: [
      { id: 'introvert', label: 'Introvert', emoji: '📚' },
      { id: 'extrovert', label: 'Extrovert', emoji: '🎉' },
      { id: 'ambivert', label: 'Ambivert', emoji: '⚖️' },
      { id: 'night-owl', label: 'Night Owl', emoji: '🌙' },
      { id: 'early-riser', label: 'Early Riser', emoji: '🌅' },
      { id: 'party-person', label: 'Party Person', emoji: '🥳' },
      { id: 'chill-vibes', label: 'Chill Vibes', emoji: '🛋️' },
      { id: 'luxury-travel', label: 'Luxury Travel', emoji: '🧳' },
      { id: 'backpacking', label: 'Backpacking', emoji: '🎒' },
      { id: 'small-groups', label: 'Small Groups', emoji: '👥' },
      { id: 'large-groups', label: 'Large Groups', emoji: '👨‍👩‍👧‍👦' },
    ],
  },
  {
    id: 'local',
    label: 'Local',
    options: [
      { id: 'football-buddies', label: 'Looking for football buddies', emoji: '📍' },
      { id: 'badminton-buddies', label: 'Looking for badminton buddies', emoji: '📍' },
      { id: 'cafe-hopping-weekend', label: 'Open to café hopping this weekend', emoji: '☕' },
      { id: 'live-music-events', label: 'Open to live music events', emoji: '🎶' },
      { id: 'attending-local-events', label: 'Attending local events', emoji: '🎟️' },
      { id: 'weekend-city-explorer', label: 'Weekend city explorer', emoji: '🗺️' },
      { id: 'coworking-buddy', label: 'Nearby co-working buddy', emoji: '💼' },
    ],
  },
];

// ─── Debounce hook ───────────────────────────────────────────────────────────

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

// ─── Tab Config ──────────────────────────────────────────────────────────────

const TABS: Array<{ id: EditorTab; label: string; Icon: React.ElementType }> = [
  { id: 'avatar',      label: 'Avatar',      Icon: User },
  { id: 'banner',      label: 'Background',      Icon: ImageIcon },
  { id: 'theme',       label: 'Theme',       Icon: Palette },
  { id: 'bio',         label: 'Bio',         Icon: FileText },
  { id: 'decorations', label: 'Decorations', Icon: Sparkles },
  { id: 'card',        label: 'Card Style',  Icon: Layers },
];

// ─── Shared Control Styles ───────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40';
const labelCls = 'text-xs font-semibold text-gray-500 mb-1.5 block';
const activeBtn = 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]';
const inactiveBtn = 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400';

// ─── Sub-panels ───────────────────────────────────────────────────────────────

function AvatarPanel({ token }: { token: string }) {
  const global = useProfileStore((s) => s.global);
  const updateGlobal = useProfileStore((s) => s.updateGlobal);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads/image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const d = await res.json() as { url: string };
        const isGif = file.type === 'image/gif';
        updateGlobal({ avatar: d.url, avatarType: isGif ? 'gif' : 'static' });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <span className={labelCls}>Avatar Image or GIF</span>
        <div className="flex items-center gap-3">
          <Avatar src={global.avatar} name="Preview" size={60} decorations={global.decorations} />
          <div className="flex flex-col gap-2 flex-1">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-xs hover:border-[var(--primary)] transition"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading…' : 'Upload image or GIF'}
            </button>
            <input
              value={global.avatar}
              onChange={(e) => updateGlobal({ avatar: e.target.value })}
              placeholder="Or paste URL"
              className={inputCls}
            />
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      <div>
        <span className={labelCls}>Status</span>
        <div className="grid grid-cols-4 gap-2">
          {(['online', 'idle', 'dnd', 'offline'] as const).map((s) => (
            <button
              key={s}
              onClick={() => updateGlobal({ status: s })}
              className={`py-2 rounded-xl border text-xs capitalize transition ${global.status === s ? activeBtn : inactiveBtn}`}
            >
              {s === 'dnd' ? 'Do Not Disturb' : s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BannerPanel({ token }: { token: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [bgMode, setBgMode] = useState<'theme' | 'gif' | 'image'>('theme');
  const [backgroundUrl, setBackgroundUrl] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch('/api/users/me/card-design', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((d) => {
        const cd = d?.cardDesign;
        if (!cd) return;
        if (cd.backgroundMode === 'gif' || cd.backgroundMode === 'theme' || cd.backgroundMode === 'image') setBgMode(cd.backgroundMode);
        if (typeof cd.gifUrl === 'string') setBackgroundUrl(cd.gifUrl);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const t = setTimeout(async () => {
      try {
        await fetch('/api/users/me/card-design', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ backgroundMode: bgMode, gifUrl: backgroundUrl }),
        });
        window.dispatchEvent(new Event('card-design-updated'));
      } catch {
        // ignore
      }
    }, 600);
    return () => clearTimeout(t);
  }, [token, bgMode, backgroundUrl]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads/image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const d = await res.json() as { url: string };
        const isGif = file.type === 'image/gif';
        setBackgroundUrl(d.url);
        setBgMode(isGif ? 'gif' : 'image');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <span className={labelCls}>Background Type</span>
        <div className="grid grid-cols-3 gap-2">
          {(['theme', 'image', 'gif'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setBgMode(t)}
              className={`py-2 rounded-xl border text-xs capitalize transition ${bgMode === t ? activeBtn : inactiveBtn}`}
            >
              {t === 'theme' ? 'Gradient' : t === 'gif' ? 'Animated GIF' : 'Image'}
            </button>
          ))}
        </div>
      </div>

      {bgMode !== 'theme' && (
        <div>
          <span className={labelCls}>Background Image / GIF</span>
          <div className="space-y-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-xs w-full hover:border-[var(--primary)] transition"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading…' : 'Upload background'}
            </button>
            <input
              value={backgroundUrl}
              onChange={(e) => setBackgroundUrl(e.target.value)}
              placeholder="Or paste image / GIF URL"
              className={inputCls}
            />
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      )}
    </div>
  );
}

function ThemePanel() {
  const global = useProfileStore((s) => s.global);
  const updateGlobal = useProfileStore((s) => s.updateGlobal);
  const setTheme = useThemeStore((s) => s.setTheme);

  const applyPalette = (primary: string, accent: string) => {
    updateGlobal({ theme: { primary, accent } });
    setTheme({ primary, accent });
  };

  return (
    <div className="space-y-5">
      <div>
        <span className={labelCls}>Preset Palettes</span>
        <div className="grid grid-cols-4 gap-2">
          {THEME_PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPalette(p.primary, p.accent)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-400 transition group"
            >
              <span
                className="w-8 h-8 rounded-full shadow-inner group-hover:scale-110 transition-transform"
                style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.accent})` }}
              />
              <span className="text-[10px] text-gray-500">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className={labelCls}>Primary colour</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={global.theme.primary}
              onChange={(e) => applyPalette(e.target.value, global.theme.accent)}
              className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5 bg-white dark:bg-zinc-900"
            />
            <input
              value={global.theme.primary}
              onChange={(e) => applyPalette(e.target.value, global.theme.accent)}
              placeholder="#ef4444"
              className={`${inputCls} flex-1`}
            />
          </div>
        </div>
        <div>
          <span className={labelCls}>Accent colour</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={global.theme.accent}
              onChange={(e) => applyPalette(global.theme.primary, e.target.value)}
              className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5 bg-white dark:bg-zinc-900"
            />
            <input
              value={global.theme.accent}
              onChange={(e) => applyPalette(global.theme.primary, e.target.value)}
              placeholder="#f97316"
              className={`${inputCls} flex-1`}
            />
          </div>
        </div>
      </div>

      <div>
        <span className={labelCls}>Preview</span>
        <div
          className="h-14 rounded-2xl flex items-center justify-center gap-3"
          style={{ background: `linear-gradient(135deg, ${global.theme.primary}, ${global.theme.accent})` }}
        >
          <span className="text-white font-bold text-sm">Button</span>
          <span
            className="w-4 h-4 rounded-full border-2 border-white"
            style={{ background: global.theme.accent }}
          />
        </div>
      </div>
    </div>
  );
}

function BioPanel() {
  const global = useProfileStore((s) => s.global);
  const updateGlobal = useProfileStore((s) => s.updateGlobal);

  return (
    <div className="space-y-3">
      <div>
        <span className={labelCls}>Bio (shown on your profile card)</span>
        <textarea
          value={global.bio}
          onChange={(e) => updateGlobal({ bio: e.target.value.slice(0, 500) })}
          placeholder="Write something about yourself…"
          rows={5}
          className={`${inputCls} resize-none`}
        />
        <p className="text-[11px] text-gray-400 mt-1 text-right">{global.bio.length}/500</p>
      </div>
    </div>
  );
}

function DecorationsPanel() {
  const global = useProfileStore((s) => s.global);
  const updateGlobal = useProfileStore((s) => s.updateGlobal);
  const animatedFrames = new Set(['rainbow-spin', 'aurora', 'pulse-neon', 'cyber']);

  const toggleDecoration = (id: string) => {
    // Avatar frame should be single-select (badges are managed separately).
    // Clicking the active frame resets to "none".
    const currentFrame = global.decorations.find((d) => DECORATION_FRAMES.some((f) => f.id === d)) ?? 'none';
    const nextFrame = currentFrame === id ? 'none' : id;
    updateGlobal({ decorations: [nextFrame] });
  };

  const toggleBadge = (emoji: string) => {
    const has = global.badges.includes(emoji);
    const next = has ? global.badges.filter((b) => b !== emoji) : [...global.badges, emoji];
    updateGlobal({ badges: next.slice(0, 8) });
  };

  return (
    <div className="space-y-5">
      <div>
        <span className={labelCls}>Avatar Frame (including animated)</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DECORATION_FRAMES.map((frame) => {
            const active = global.decorations.includes(frame.id);
            return (
              <button
                key={frame.id}
                onClick={() => toggleDecoration(frame.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition ${active ? activeBtn : inactiveBtn}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {frame.label}
                  {animatedFrames.has(frame.id) && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-400/25">
                      Animated
                    </span>
                  )}
                </span>
                {active && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span className={labelCls}>Badges &amp; Overlays</span>
        <div className="grid grid-cols-4 gap-2">
          {BADGE_PRESETS.map((badge) => {
            const active = global.badges.includes(badge.emoji);
            return (
              <button
                key={badge.id}
                onClick={() => toggleBadge(badge.emoji)}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs transition ${active ? activeBtn : inactiveBtn}`}
              >
                <span className="text-xl">{badge.emoji}</span>
                <span className="text-[10px] text-gray-500">{badge.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CardStylePanel() {
  const [themeId, setThemeId] = useState('rose');
  const [border, setBorder] = useState<typeof BORDER_STYLES[number]>('glass');
  const [font, setFont] = useState<typeof FONT_STYLES[number]>('modern');
  const [myInterests, setMyInterests] = useState<string[]>([]);
  const [activeInterestSection, setActiveInterestSection] = useState<string>(INTEREST_SECTIONS[0]?.id ?? 'identity');
  const [interestInput, setInterestInput] = useState('');
  const [interestNotice, setInterestNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [autoSaveReady, setAutoSaveReady] = useState(false);
  const MAX_INTERESTS = 30;

  // Load existing card design
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    fetch('/api/users/me/card-design', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const cd = d?.cardDesign;
        if (!cd) return;
        if (CARD_THEMES.some((t) => t.id === cd.themeId)) setThemeId(cd.themeId);
        if (BORDER_STYLES.includes(cd.borderStyle)) setBorder(cd.borderStyle);
        if (FONT_STYLES.includes(cd.fontStyle)) setFont(cd.fontStyle);
        if (Array.isArray(cd.stickers)) setMyInterests(cd.stickers.slice(0, MAX_INTERESTS));
      })
      .catch(() => {})
      .finally(() => setAutoSaveReady(true));
  }, [MAX_INTERESTS]);

  const saveCardDesign = async (silent = false) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch('/api/users/me/card-design', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCustomized: true, themeId, stickers: myInterests, borderStyle: border, fontStyle: font }),
      });
      if (!res.ok) throw new Error('Failed to save card style');
      window.dispatchEvent(new Event('card-design-updated'));
      if (!silent) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!autoSaveReady) return;
    const t = setTimeout(() => {
      saveCardDesign(true).catch(() => {});
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId, border, font, myInterests, autoSaveReady]);

  const activeSection = INTEREST_SECTIONS.find((section) => section.id === activeInterestSection) ?? INTEREST_SECTIONS[0];
  const interestEmojiMap = INTEREST_SECTIONS
    .flatMap((section) => section.options)
    .reduce<Record<string, string>>((acc, option) => {
      acc[option.label] = option.emoji;
      return acc;
    }, {});

  const addInterest = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    const has = myInterests.some((i) => i.toLowerCase() === value.toLowerCase());
    if (has) {
      setInterestNotice('Already selected');
      return;
    }
    if (myInterests.length >= MAX_INTERESTS) {
      setInterestNotice(`Maximum ${MAX_INTERESTS} interests reached`);
      return;
    }
    setInterestNotice('');
    setMyInterests((prev) => [...prev, value]);
  };

  const toggleInterest = (value: string) => {
    const exists = myInterests.includes(value);
    if (exists) {
      setMyInterests((prev) => prev.filter((i) => i !== value));
      setInterestNotice('');
      return;
    }
    addInterest(value);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Controls the appearance of your profile card.</p>

      <div>
        <span className={labelCls}>Card Theme</span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CARD_THEMES.map((t) => (
            <button key={t.id} onClick={() => setThemeId(t.id)}
              className={`py-2 px-3 rounded-xl border text-xs transition text-left ${themeId === t.id ? activeBtn : inactiveBtn}`}>
              <span className="block w-full h-1.5 rounded-full mb-1.5" style={{ background: t.gradient }} />
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className={labelCls}>Border</span>
          <div className="space-y-1.5">
            {BORDER_STYLES.map((s) => (
              <button key={s} onClick={() => setBorder(s)}
                className={`w-full py-2 px-3 rounded-xl border text-xs capitalize transition ${border === s ? activeBtn : inactiveBtn}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className={labelCls}>Font</span>
          <div className="space-y-1.5">
            {FONT_STYLES.map((f) => (
              <button key={f} onClick={() => setFont(f)}
                className={`w-full py-2 px-3 rounded-xl border text-xs capitalize transition ${font === f ? activeBtn : inactiveBtn}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <span className={labelCls}>Interests</span>
        <p className="text-[11px] text-gray-500 mb-2">
          Pick interests dating-app style. Selected: <span className="font-semibold">{myInterests.length}/{MAX_INTERESTS}</span>
        </p>

        <div className="mb-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 w-max pr-1">
            {INTEREST_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveInterestSection(section.id)}
                className={`px-2.5 py-1.5 rounded-full border text-xs whitespace-nowrap ${activeInterestSection === section.id ? activeBtn : inactiveBtn}`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">{activeSection?.label}</p>
          <div className="flex flex-wrap gap-2">
            {activeSection?.options.map((option) => {
              const active = myInterests.includes(option.label);
              return (
                <button
                  key={`${activeSection.id}-${option.id}`}
                  type="button"
                  onClick={() => toggleInterest(option.label)}
                  className={`px-3 py-2 rounded-2xl border text-xs transition inline-flex items-center gap-1.5 ${active ? activeBtn : inactiveBtn}`}
                >
                  <span>{option.emoji}</span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <input value={interestInput} onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              addInterest(interestInput);
              if (interestInput.trim()) setInterestInput('');
            }}
            placeholder="Add custom interest" className={`${inputCls} flex-1`} />
          <button onClick={() => {
            addInterest(interestInput);
            if (interestInput.trim()) setInterestInput('');
          }}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background: 'var(--primary)' }}>
            Add
          </button>
        </div>

        {myInterests.length > 0 && (
          <div className="mt-2 rounded-xl border border-gray-200 dark:border-gray-700 p-2">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-semibold text-gray-500">Selected interests</p>
              <button
                type="button"
                onClick={() => { setMyInterests([]); setInterestNotice(''); }}
                className="text-[11px] text-red-500 hover:text-red-600"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {myInterests.map((s, i) => (
                <button key={`${s}-${i}`} onClick={() => setMyInterests((p) => p.filter((_, j) => j !== i))}
                  className="px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-xs flex items-center gap-1">
                  <span>{interestEmojiMap[s] ?? '✨'}</span>
                  <span>{s}</span>
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {interestNotice && <p className="mt-1 text-[11px] text-amber-500">{interestNotice}</p>}
      </div>

      <button onClick={() => saveCardDesign()} disabled={saving}
        className="w-full py-3 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: `linear-gradient(135deg, var(--primary), var(--accent))` }}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Card Style'}
      </button>
    </div>
  );
}

// ─── Live Mini-Preview ────────────────────────────────────────────────────────

function LivePreview({ name }: { name: string }) {
  const global = useProfileStore((s) => s.global);
  const [cardDesign, setCardDesign] = useState<{
    themeId?: string;
    borderStyle?: 'glass' | 'neon' | 'minimal';
    fontStyle?: 'modern' | 'mono' | 'playful';
    backgroundMode?: 'theme' | 'gif' | 'image';
    gifUrl?: string;
    stickers?: string[];
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      try {
        const res = await fetch('/api/users/me/card-design', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (!res.ok) return;
        const d = await res.json() as {
          cardDesign?: {
            themeId?: string;
            borderStyle?: 'glass' | 'neon' | 'minimal';
            fontStyle?: 'modern' | 'mono' | 'playful';
            backgroundMode?: 'theme' | 'gif' | 'image';
            gifUrl?: string;
            stickers?: string[];
          };
        };
        if (d?.cardDesign) setCardDesign(d.cardDesign);
      } catch {
        // ignore
      }
    };

    load();
    const onUpdated = () => { load(); };
    window.addEventListener('card-design-updated', onUpdated);
    return () => window.removeEventListener('card-design-updated', onUpdated);
  }, []);

  const handle = name.toLowerCase().replace(/\s+/g, '') || 'you';
  const statusLabel =
    global.status === 'dnd' ? 'Do Not Disturb' :
    global.status === 'idle' ? 'Away' :
    global.status === 'offline' ? 'Offline' : 'Online';
  const selectedAvatarFrame = [...(global.decorations ?? [])]
    .reverse()
    .find((d) => [
      'none',
      'neon-pink',
      'gold',
      'ice',
      'emerald',
      'fire',
      'rainbow',
      'sapphire',
      'amethyst',
      'ruby',
      'obsidian',
      'pearl',
      'rainbow-spin',
      'aurora',
      'pulse-neon',
      'cyber',
    ].includes(d)) ?? 'none';

  return (
    <div style={{ width: '100%' }}>
      {/* Scaled-down tilt card */}
      <div
        style={{
          height: 310,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            transform: 'scale(0.56)',
            transformOrigin: 'top center',
            pointerEvents: 'none',
          }}
        >
          <ProfileCard
            name={name || 'You'}
            handle={handle}
            title={global.bio ? global.bio.slice(0, 40) : ''}
            status={statusLabel}
            avatarUrl={global.avatar}
            avatarFrame={selectedAvatarFrame as
              | 'none'
              | 'neon-pink'
              | 'gold'
              | 'ice'
              | 'emerald'
              | 'fire'
              | 'rainbow'
              | 'sapphire'
              | 'amethyst'
              | 'ruby'
              | 'obsidian'
              | 'pearl'
              | 'rainbow-spin'
              | 'aurora'
              | 'pulse-neon'
              | 'cyber'}
            themeId={cardDesign?.themeId ?? 'rose'}
            borderStyle={cardDesign?.borderStyle ?? 'glass'}
            fontStyle={cardDesign?.fontStyle ?? 'modern'}
            backgroundMode={cardDesign?.backgroundMode === 'gif' || cardDesign?.backgroundMode === 'image' ? cardDesign.backgroundMode : 'theme'}
            gifUrl={cardDesign?.gifUrl}
            bannerUrl=""
            interests={Array.isArray(cardDesign?.stickers) && cardDesign.stickers.length
              ? cardDesign.stickers
              : global.badges.slice(0, 10)}
            enableTilt={false}
            showUserInfo
            contactText="Message"
          />
        </div>
      </div>
      {/* Theme bar */}
      <div
        className="mt-2 h-1.5 rounded-full w-full"
        style={{ background: `linear-gradient(90deg, ${global.theme.primary}, ${global.theme.accent})` }}
      />
    </div>
  );
}

// ─── ProfileEditor ────────────────────────────────────────────────────────────

export interface ProfileEditorProps {
  name: string;
  token: string;
  onSave: (patch: { global: Partial<import('@/store/profile').GlobalProfile> }) => Promise<void>;
}

export const ProfileEditor = React.memo(function ProfileEditor({
  name,
  token,
  onSave,
}: ProfileEditorProps) {
  const { editorOpen, editorTab, setEditorTab, closeEditor } = useUIStore();
  const global = useProfileStore((s) => s.global);
  const isSaving = useProfileStore((s) => s.isSaving);
  const setIsSaving = useProfileStore((s) => s.setIsSaving);

  // Debounce global state so we don't spam the API on every keystroke
  const debouncedGlobal = useDebounce(global, 1200);

  // Auto-save debounced changes
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    onSave({ global: debouncedGlobal }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedGlobal]);

  const handleManualSave = async () => {
    setIsSaving(true);
    try { await onSave({ global }); } finally { setIsSaving(false); }
  };

  return (
    <AnimatePresence>
      {editorOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeEditor} />

          {/* Panel */}
          <motion.div
            className="relative ml-auto w-full max-w-2xl h-full bg-white dark:bg-zinc-950 flex flex-col shadow-2xl overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-black dark:text-white">Edit Profile</h2>
                <p className="text-xs text-gray-500">Changes save automatically</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, var(--primary), var(--accent))` }}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save
                </button>
                <button onClick={closeEditor} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Tab Bar */}
            <div className="flex gap-1 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 overflow-x-auto flex-shrink-0 scrollbar-hide">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setEditorTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    editorTab === id
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  style={editorTab === id ? { background: `linear-gradient(135deg, var(--primary), var(--accent))` } : undefined}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Body: Controls + Live Preview */}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
              {/* Controls */}
              <div className="flex-1 overflow-y-auto p-5 min-h-0">
                {editorTab === 'avatar'      && <AvatarPanel token={token} />}
                {editorTab === 'banner'      && <BannerPanel token={token} />}
                {editorTab === 'theme'       && <ThemePanel />}
                {editorTab === 'bio'         && <BioPanel />}
                {editorTab === 'decorations' && <DecorationsPanel />}
                {editorTab === 'card'        && <CardStylePanel />}
              </div>

              {/* Live Preview (hidden on small screens) */}
              <div className="hidden lg:flex flex-col w-72 border-l border-gray-100 dark:border-gray-800 p-4 gap-3 flex-shrink-0">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Live Preview</p>
                <LivePreview name={name} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
