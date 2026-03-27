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
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
      return 'dark';
    }

    return resolveTheme();
  });

  useEffect(() => {
    applyTheme(theme);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

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
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-black shadow-sm backdrop-blur transition hover:scale-105 dark:border-white/10 dark:bg-white/10 dark:text-white"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
