import { create } from 'zustand';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ThemeConfig = {
  primary: string;
  accent: string;
};

export type ProfileContextData = {
  avatar?: string;
  banner?: string;
  bio?: string;
  theme?: Partial<ThemeConfig>;
};

export type GlobalProfile = {
  avatar: string;
  banner: string;
  avatarType: 'static' | 'gif';
  bannerType: 'static' | 'gif' | 'gradient';
  theme: ThemeConfig;
  bio: string;
  decorations: string[];
  badges: string[];
  status: 'online' | 'idle' | 'dnd' | 'offline';
};

export type EffectiveProfile = GlobalProfile & Partial<ProfileContextData>;

// ─── Defaults ───────────────────────────────────────────────────────────────

export const defaultGlobal: GlobalProfile = {
  avatar: '',
  banner: '',
  avatarType: 'static',
  bannerType: 'gradient',
  theme: { primary: '#ef4444', accent: '#f97316' },
  bio: '',
  decorations: [],
  badges: [],
  status: 'online',
};

// ─── Store ──────────────────────────────────────────────────────────────────

type ProfileState = {
  userId: string | null;
  global: GlobalProfile;
  contexts: Record<string, ProfileContextData>;
  activeContextId: string | null;
  isLoaded: boolean;
  isSaving: boolean;
  effectiveProfile: EffectiveProfile;
};

type ProfileActions = {
  loadProfile: (data: { userId: string; global: GlobalProfile; contexts: Record<string, ProfileContextData> }) => void;
  updateGlobal: (patch: Partial<GlobalProfile>) => void;
  setContextId: (id: string | null) => void;
  upsertContext: (id: string, data: Partial<ProfileContextData>) => void;
  setIsSaving: (v: boolean) => void;
  reset: () => void;
};

function computeEffective(global: GlobalProfile, contexts: Record<string, ProfileContextData>, ctxId: string | null): EffectiveProfile {
  const ctx = ctxId ? (contexts[ctxId] ?? {}) : {};
  return {
    ...global,
    ...ctx,
    // Ensure theme is always fully resolved
    theme: ctx.theme
      ? { primary: ctx.theme.primary ?? global.theme.primary, accent: ctx.theme.accent ?? global.theme.accent }
      : global.theme,
  };
}

const initialState: ProfileState = {
  userId: null,
  global: { ...defaultGlobal, theme: { ...defaultGlobal.theme } },
  contexts: {},
  activeContextId: null,
  isLoaded: false,
  isSaving: false,
  effectiveProfile: { ...defaultGlobal, theme: { ...defaultGlobal.theme } },
};

export const useProfileStore = create<ProfileState & ProfileActions>()((set, get) => ({
  ...initialState,

  loadProfile: ({ userId, global, contexts }) => {
    set({
      userId,
      global,
      contexts,
      isLoaded: true,
      effectiveProfile: computeEffective(global, contexts, get().activeContextId),
    });
  },

  updateGlobal: (patch) => {
    const next = { ...get().global, ...patch };
    set({
      global: next,
      effectiveProfile: computeEffective(next, get().contexts, get().activeContextId),
    });
  },

  setContextId: (id) => {
    set({
      activeContextId: id,
      effectiveProfile: computeEffective(get().global, get().contexts, id),
    });
  },

  upsertContext: (id, data) => {
    const next = { ...get().contexts, [id]: { ...get().contexts[id], ...data } };
    set({
      contexts: next,
      effectiveProfile: computeEffective(get().global, next, get().activeContextId),
    });
  },

  setIsSaving: (v) => set({ isSaving: v }),

  reset: () => set(initialState),
}));
