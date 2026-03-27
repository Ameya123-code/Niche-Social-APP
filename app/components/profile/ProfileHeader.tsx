'use client';

import React from 'react';
import { Avatar, type AvatarProps } from './Avatar';
import { Banner, type BannerProps } from './Banner';
import { DecorationLayer } from './DecorationLayer';

// ─── ProfileHeader ───────────────────────────────────────────────────────────
//
// Discord-style layout: full-width banner behind, avatar overlapping the
// bottom edge of the banner. Children (e.g. name/bio) appear below.

export interface ProfileHeaderProps {
  // Avatar
  avatarSrc?: string;
  name: string;
  status?: string;
  avatarSize?: number;
  decorations?: AvatarProps['decorations'];
  badges?: string[];
  // Banner
  bannerSrc?: string;
  bannerType?: BannerProps['type'];
  bannerHeight?: number;
  parallax?: boolean;
  // Layout
  className?: string;
  children?: React.ReactNode;
}

export const ProfileHeader = React.memo(function ProfileHeader({
  avatarSrc = '',
  name,
  status = 'online',
  avatarSize = 80,
  decorations = [],
  badges = [],
  bannerSrc = '',
  bannerType = 'gradient',
  bannerHeight = 140,
  parallax = false,
  className = '',
  children,
}: ProfileHeaderProps) {
  const avatarOffset = Math.round(avatarSize / 2);
  const chromeBg = 'linear-gradient(180deg, rgba(56,61,78,0.96) 0%, rgba(46,51,66,0.99) 100%)';

  return (
    <div className={`relative ${className}`}>
      {/* Banner */}
      <Banner
        src={bannerSrc}
        type={bannerType}
        seed={name}
        parallax={parallax}
        height={bannerHeight}
        overlayOpacity={22}
        className="rounded-t-2xl"
      />

      {/* Header chrome under banner (keeps top colours cohesive) */}
      <div className="relative" style={{ marginTop: -avatarOffset }}>
        <div className="px-5 pt-2 pb-2" style={{ background: chromeBg }}>
          <div className="relative inline-block">
            <Avatar
              src={avatarSrc}
              name={name}
              size={avatarSize}
              decorations={decorations}
              status={status}
              showStatus
              className="border-4 border-[#202534]"
            />
            {badges.length > 0 && (
              <DecorationLayer badges={badges} layout="stack" size="sm" />
            )}
          </div>
        </div>

        {/* Slot for name, bio, stats, etc. */}
        {children && <div className="px-5 pt-2 pb-2" style={{ background: chromeBg }}>{children}</div>}
      </div>
    </div>
  );
});
