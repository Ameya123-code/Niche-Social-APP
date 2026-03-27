import { create } from 'zustand';

// ─── Types ──────────────────────────────────────────────────────────────────

type ThemeState = {
  primary: string;
  accent: string;
};

type ThemeActions = {
  setTheme: (patch: Partial<ThemeState>) => void;
  /** Inject CSS custom properties into the document root (or a custom element) */
  injectCssVars: (scope?: HTMLElement | null) => void;
};

// ─── Preset Palettes ────────────────────────────────────────────────────────

export const THEME_PALETTES: Array<{ id: string; name: string; primary: string; accent: string }> = [
  { id: 'rose',     name: 'Rose',     primary: '#ef4444', accent: '#f97316' },
  { id: 'violet',   name: 'Violet',   primary: '#8b5cf6', accent: '#ec4899' },
  { id: 'cyan',     name: 'Ocean',    primary: '#06b6d4', accent: '#3b82f6' },
  { id: 'emerald',  name: 'Mint',     primary: '#10b981', accent: '#06b6d4' },
  { id: 'amber',    name: 'Amber',    primary: '#f59e0b', accent: '#ef4444' },
  { id: 'indigo',   name: 'Indigo',   primary: '#6366f1', accent: '#8b5cf6' },
  { id: 'pink',     name: 'Blossom',  primary: '#ec4899', accent: '#f43f5e' },
  { id: 'midnight', name: 'Midnight', primary: '#334155', accent: '#475569' },
];

// ─── Store ──────────────────────────────────────────────────────────────────

export const useThemeStore = create<ThemeState & ThemeActions>()((set, get) => ({
  primary: '#ef4444',
  accent: '#f97316',

  setTheme: (patch) => {
    set((s) => ({ ...s, ...patch }));
    get().injectCssVars();
  },

  injectCssVars: (scope) => {
    if (typeof document === 'undefined') return;
    const { primary, accent } = get();
    const target = scope ?? document.documentElement;
    target.style.setProperty('--primary', primary);
    target.style.setProperty('--accent', accent);
  },
}));
