'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

function resolveTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export default function ThemeToggle() {
  // Always start with 'light' to match server render — avoids hydration mismatch.
  // The real theme is read from localStorage/media in the first useEffect.
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Hydrate theme from localStorage / media preference after mount
  useEffect(() => {
    const initial = resolveTheme();
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  // Sync theme changes to DOM + localStorage
  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  // Follow OS-level dark-mode changes when no explicit preference is saved
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onMediaChange = () => {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return;
      setTheme(media.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onMediaChange);
    return () => media.removeEventListener('change', onMediaChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-black shadow-sm backdrop-blur transition hover:scale-105 dark:border-white/10 dark:bg-white/10 dark:text-white"
      // Suppress the one-frame icon flicker on mount (light→resolved)
      suppressHydrationWarning
    >
      {/* Render Moon on server; swap to correct icon once mounted */}
      {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
