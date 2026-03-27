'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// ─── Gradient Fallbacks ──────────────────────────────────────────────────────

const GRADIENT_FALLBACKS = [
  'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
];

function pickGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  return GRADIENT_FALLBACKS[Math.abs(hash) % GRADIENT_FALLBACKS.length];
}

// ─── Banner Component ─────────────────────────────────────────────────────────

export interface BannerProps {
  src?: string;
  type?: 'static' | 'gif' | 'gradient';
  /** Seed string used to pick a deterministic gradient when type is 'gradient' */
  seed?: string;
  /** 0–100: how opaque the overlay gradient is (for readability) */
  overlayOpacity?: number;
  /** Enable GSAP parallax scroll effect */
  parallax?: boolean;
  height?: number;
  className?: string;
  children?: React.ReactNode;
}

export const Banner = React.memo(function Banner({
  src = '',
  type = 'gradient',
  seed = 'default',
  overlayOpacity = 40,
  parallax = false,
  height = 160,
  className = '',
  children,
}: BannerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // GSAP parallax: image moves at a slower rate than scroll
  useEffect(() => {
    if (!parallax || !imgRef.current || type === 'gradient' || !src) return;
    // Register here (client-only) so the module-level call is avoided on SSR
    gsap.registerPlugin(ScrollTrigger);
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    // Ensure the wrapper has non-static positioning so GSAP can calculate offsets
    wrapper.style.position = 'relative';
    const ctx = gsap.context(() => {
      gsap.to(imgRef.current, {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top 80%',
          end: 'bottom top',
          scrub: 0.8,
        },
      });
    }, wrapper);
    return () => ctx.revert();
  }, [parallax, src, type]);

  const showImage = (type === 'static' || type === 'gif') && src;
  const gradient = pickGradient(seed);
  const overlayAlpha = Math.round((overlayOpacity / 100) * 255)
    .toString(16)
    .padStart(2, '0');

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        height,
        background: showImage ? undefined : gradient,
      }}
    >
      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt="Profile banner"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: parallax ? 'transform' : undefined }}
        />
      )}

      {/* Overlay gradient for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent 30%, #000000${overlayAlpha} 100%)`,
        }}
      />

      {/* Slot for child content (e.g. overlapping avatar) */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
});
