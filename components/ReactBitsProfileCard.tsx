'use client';

import React from 'react';
import RawProfileCard from './ProfileCard.jsx';

export interface ReactBitsProfileCardProps {
  avatarUrl?: string;
  bannerUrl?: string;
  avatarFrame?:
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
    | 'cyber';
  innerGradient?: string;
  themeId?: string;
  borderStyle?: 'glass' | 'neon' | 'minimal';
  fontStyle?: 'modern' | 'mono' | 'playful';
  backgroundMode?: 'theme' | 'gif' | 'image' | 'gradient';
  gifUrl?: string;
  className?: string;
  enableTilt?: boolean;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  showUserInfo?: boolean;
  onContactClick?: () => void;
  opinionCount?: number;
  likeCount?: number;
  interests?: string[];
}

const ReactBitsProfileCard = RawProfileCard as React.ComponentType<ReactBitsProfileCardProps>;

export default ReactBitsProfileCard;
