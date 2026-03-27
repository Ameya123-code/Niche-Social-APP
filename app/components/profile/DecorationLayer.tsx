'use client';

import React from 'react';

// ─── Badge Presets ───────────────────────────────────────────────────────────

export const BADGE_PRESETS: Array<{ id: string; label: string; emoji: string; color: string }> = [
  { id: 'crown',    label: 'Crown',    emoji: '👑', color: '#facc15' },
  { id: 'star',     label: 'Star',     emoji: '⭐', color: '#fbbf24' },
  { id: 'gem',      label: 'Diamond',  emoji: '💎', color: '#38bdf8' },
  { id: 'fire',     label: 'Hot',      emoji: '🔥', color: '#f97316' },
  { id: 'verified', label: 'Verified', emoji: '✅', color: '#10b981' },
  { id: 'rocket',   label: 'Rocket',   emoji: '🚀', color: '#8b5cf6' },
  { id: 'ghost',    label: 'Ghost',    emoji: '👻', color: '#94a3b8' },
  { id: 'heart',    label: 'Lover',    emoji: '💖', color: '#ec4899' },
];

// ─── DecorationLayer ──────────────────────────────────────────────────────────
//
// Renders badge overlays as floating emoji chips. Can be positioned
// relative to a parent (e.g. above the avatar or along the profile card).
//
// `badges` — array of badge emoji strings (e.g. ['👑', '⭐'])
// `layout` — 'row' renders inline chips, 'stack' renders stacked bubbles

export interface DecorationLayerProps {
  badges?: string[];
  layout?: 'row' | 'stack';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DecorationLayer = React.memo(function DecorationLayer({
  badges = [],
  layout = 'row',
  size = 'md',
  className = '',
}: DecorationLayerProps) {
  if (!badges.length) return null;

  const sizeClasses =
    size === 'lg'
      ? 'text-2xl p-1.5'
      : size === 'sm'
        ? 'text-sm p-0.5'
        : 'text-lg p-1';

  if (layout === 'stack') {
    return (
      <div className={`absolute top-1 right-1 flex flex-col gap-1 z-20 ${className}`}>
        {badges.slice(0, 4).map((badge, i) => (
          <span
            key={`${badge}-${i}`}
            className={`flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/20 leading-none ${sizeClasses}`}
            title={BADGE_PRESETS.find((b) => b.emoji === badge)?.label ?? badge}
          >
            {badge}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {badges.slice(0, 6).map((badge, i) => (
        <span
          key={`${badge}-${i}`}
          className={`flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/15 leading-none ${sizeClasses}`}
          title={BADGE_PRESETS.find((b) => b.emoji === badge)?.label ?? badge}
        >
          {badge}
        </span>
      ))}
    </div>
  );
});
