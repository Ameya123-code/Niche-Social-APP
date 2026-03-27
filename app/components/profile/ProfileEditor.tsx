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
import { ProfileCard } from './ProfileCard';
import { DECORATION_FRAMES } from './Avatar';
import { BADGE_PRESETS } from './DecorationLayer';

// ─── Card Design constants (mirror from cards page) ─────────────────────────

const CARD_THEMES = [
  { id: 'rose',     name: 'Rose Pulse',    shell: 'from-rose-500/90 via-pink-500/85 to-fuchsia-600/90' },
  { id: 'midnight', name: 'Midnight Glass', shell: 'from-slate-900 via-indigo-900 to-violet-900' },
  { id: 'sunset',   name: 'Sunset Pop',    shell: 'from-orange-500 via-rose-500 to-pink-600' },
];
const BORDER_STYLES = ['glass', 'neon', 'minimal'] as const;
const FONT_STYLES   = ['modern', 'mono', 'playful'] as const;
const STICKER_PACKS: Record<string, string[]> = {
  vibes:  ['✨', '💫', '🔥', '💎'],
  chill:  ['☕', '🌙', '🎧', '🫶'],
  social: ['💬', '🤝', '🎉', '😎'],
  nerd:   ['🧠', '📚', '💻', '🎮'],
};

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
  { id: 'banner',      label: 'Banner',      Icon: ImageIcon },
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
        updateGlobal({ banner: d.url, bannerType: isGif ? 'gif' : 'static' });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <span className={labelCls}>Banner Type</span>
        <div className="grid grid-cols-3 gap-2">
          {(['gradient', 'static', 'gif'] as const).map((t) => (
            <button
              key={t}
              onClick={() => updateGlobal({ bannerType: t })}
              className={`py-2 rounded-xl border text-xs capitalize transition ${global.bannerType === t ? activeBtn : inactiveBtn}`}
            >
              {t === 'gradient' ? 'Gradient' : t === 'gif' ? 'Animated GIF' : 'Image'}
            </button>
          ))}
        </div>
      </div>

      {global.bannerType !== 'gradient' && (
        <div>
          <span className={labelCls}>Banner Image / GIF</span>
          <div className="space-y-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-xs w-full hover:border-[var(--primary)] transition"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading…' : 'Upload banner'}
            </button>
            <input
              value={global.banner}
              onChange={(e) => updateGlobal({ banner: e.target.value })}
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
        <span className={labelCls}>Avatar Frame</span>
        <div className="grid grid-cols-3 gap-2">
          {DECORATION_FRAMES.map((frame) => {
            const active = global.decorations.includes(frame.id);
            return (
              <button
                key={frame.id}
                onClick={() => toggleDecoration(frame.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition ${active ? activeBtn : inactiveBtn}`}
              >
                {frame.label}
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
  const [bgMode, setBgMode] = useState<'theme' | 'gif'>('theme');
  const [gifUrl, setGifUrl] = useState('');
  const [myStickers, setMyStickers] = useState<string[]>([]);
  const [stickerInput, setStickerInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
        if (cd.backgroundMode) setBgMode(cd.backgroundMode);
        if (typeof cd.gifUrl === 'string') setGifUrl(cd.gifUrl);
        if (Array.isArray(cd.stickers)) setMyStickers(cd.stickers.slice(0, 10));
      })
      .catch(() => {});
  }, []);

  const saveCardDesign = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch('/api/users/me/card-design', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCustomized: true, themeId, stickers: myStickers, borderStyle: border, fontStyle: font, backgroundMode: bgMode, gifUrl }),
      });
      if (!res.ok) throw new Error('Failed to save card style');
      window.dispatchEvent(new Event('card-design-updated'));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Controls the appearance of your card in the Discover feed.</p>

      <div>
        <span className={labelCls}>Card Theme</span>
        <div className="grid grid-cols-3 gap-2">
          {CARD_THEMES.map((t) => (
            <button key={t.id} onClick={() => setThemeId(t.id)}
              className={`py-2 px-3 rounded-xl border text-xs transition ${themeId === t.id ? activeBtn : inactiveBtn}`}>
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
        <span className={labelCls}>Background</span>
        <div className="flex gap-2 mb-2">
          {(['theme', 'gif'] as const).map((m) => (
            <button key={m} onClick={() => setBgMode(m)}
              className={`px-3 py-2 rounded-xl border text-xs transition ${bgMode === m ? activeBtn : inactiveBtn}`}>
              {m === 'gif' ? 'GIF URL' : 'Gradient'}
            </button>
          ))}
        </div>
        {bgMode === 'gif' && (
          <input value={gifUrl} onChange={(e) => setGifUrl(e.target.value)}
            placeholder="Paste GIF URL" className={inputCls} />
        )}
      </div>

      <div>
        <span className={labelCls}>Stickers</span>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {Object.entries(STICKER_PACKS).map(([name, pack]) => (
            <button key={name} onClick={() => setMyStickers((p) => [...new Set([...p, ...pack])].slice(0, 10))}
              className={`px-3 py-1.5 rounded-full border text-xs ${inactiveBtn}`}>
              + {name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={stickerInput} onChange={(e) => setStickerInput(e.target.value)}
            placeholder="Custom emoji" className={`${inputCls} flex-1`} />
          <button onClick={() => { if (stickerInput.trim()) { setMyStickers((p) => [...new Set([...p, stickerInput.trim()])].slice(0, 10)); setStickerInput(''); } }}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background: 'var(--primary)' }}>
            Add
          </button>
        </div>
        {myStickers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {myStickers.map((s, i) => (
              <button key={i} onClick={() => setMyStickers((p) => p.filter((_, j) => j !== i))}
                className="px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-xs flex items-center gap-1">
                {s} <X className="w-3 h-3 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={saveCardDesign} disabled={saving}
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
  const handle = name.toLowerCase().replace(/\s+/g, '') || 'you';
  const statusLabel =
    global.status === 'dnd' ? 'Do Not Disturb' :
    global.status === 'idle' ? 'Away' :
    global.status === 'offline' ? 'Offline' : 'Online';

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
            enableTilt={false}
            showUserInfo
            contactText="Message"
            behindGlowEnabled={false}
            innerGradient={`linear-gradient(145deg, ${global.theme.primary}55 0%, ${global.theme.accent}33 100%)`}
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
