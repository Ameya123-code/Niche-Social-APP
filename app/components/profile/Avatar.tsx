'use client';

import React, { useState } from 'react';

// ─── Decoration Frame Definitions ───────────────────────────────────────────

export const DECORATION_FRAMES: Array<{
  id: string;
  label: string;
  ring: string;
  glow: string;
}> = [
  { id: 'none',      label: 'None',       ring: '', glow: '' },
  { id: 'neon-pink', label: 'Neon Pink',  ring: 'border-2 border-fuchsia-400',                  glow: 'shadow-[0_0_14px_rgba(217,70,239,0.65)]' },
  { id: 'gold',      label: 'Gold',       ring: 'border-2 border-yellow-400',                   glow: 'shadow-[0_0_12px_rgba(250,204,21,0.55)]' },
  { id: 'ice',       label: 'Ice',        ring: 'border-2 border-cyan-300',                     glow: 'shadow-[0_0_12px_rgba(103,232,249,0.55)]' },
  { id: 'emerald',   label: 'Emerald',    ring: 'border-2 border-emerald-400',                  glow: 'shadow-[0_0_12px_rgba(52,211,153,0.5)]' },
  { id: 'fire',      label: 'Fire',       ring: 'border-2 border-orange-400',                   glow: 'shadow-[0_0_14px_rgba(251,146,60,0.65)]' },
  { id: 'rainbow',   label: 'Rainbow',    ring: 'ring-0',                                   glow: '' },
];

// ─── Status Indicator ───────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  online: 'bg-emerald-400',
  idle: 'bg-amber-400',
  dnd: 'bg-rose-500',
  offline: 'bg-gray-400',
};

function StatusIndicator({ status, size }: { status: string; size: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'w-4 h-4 border-2' : size === 'md' ? 'w-3 h-3 border-2' : 'w-2.5 h-2.5 border-[1.5px]';
  const color = STATUS_COLORS[status] ?? 'bg-gray-400';
  return (
    <span
      className={`absolute bottom-0.5 right-0.5 rounded-full border-white dark:border-black ${dim} ${color}`}
      aria-label={`Status: ${status}`}
    />
  );
}

// ─── Rainbow Wrapper ─────────────────────────────────────────────────────────

function RainbowRing({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded-full p-[2.5px]"
      style={{ background: 'linear-gradient(135deg,#f43f5e,#f97316,#facc15,#4ade80,#38bdf8,#818cf8,#f43f5e)' }}
    >
      {children}
    </span>
  );
}

// ─── Base Image ─────────────────────────────────────────────────────────────

function BaseImage({ src, name, size }: { src: string; name: string; size: number }) {
  const [error, setError] = useState(false);
  const initial = name.trim()[0]?.toUpperCase() ?? '?';

  if (!src || error) {
    return (
      <span
        className="flex items-center justify-center rounded-full w-full h-full bg-gradient-to-br from-rose-300 to-fuchsia-400 text-white font-bold select-none"
        style={{ fontSize: size * 0.38 }}
      >
        {initial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setError(true)}
      className="w-full h-full object-cover rounded-full"
    />
  );
}

// ─── DecorationOverlay ───────────────────────────────────────────────────────

// ─── Avatar Component ────────────────────────────────────────────────────────

export interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
  decorations?: string[];
  status?: string;
  showStatus?: boolean;
  className?: string;
}

export const Avatar = React.memo(function Avatar({
  src = '',
  name,
  size = 64,
  decorations = [],
  status = 'online',
  showStatus = false,
  className = '',
}: AvatarProps) {
  const sizeClass = size >= 80 ? 'lg' : size >= 56 ? 'md' : 'sm';
  const frameId = [...decorations].reverse().find((d) => DECORATION_FRAMES.some((f) => f.id === d)) ?? 'none';
  const frame = DECORATION_FRAMES.find((f) => f.id === frameId) ?? DECORATION_FRAMES[0];
  const isRainbow = frame.id === 'rainbow';

  const inner = (
    <span
      className={`relative block rounded-full overflow-hidden group transition-transform duration-200 hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <BaseImage src={src} name={name} size={size} />
      {showStatus && <StatusIndicator status={status} size={sizeClass} />}
    </span>
  );

  if (isRainbow) return <RainbowRing>{inner}</RainbowRing>;
  if (frame.id === 'none') return inner;

  return <span className={`inline-flex rounded-full ${frame.ring} ${frame.glow}`}>{inner}</span>;
});
