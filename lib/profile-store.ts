import prisma from './prisma';

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

export type GlobalProfileData = {
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

export type UserProfileStore = {
  userId: string;
  global: GlobalProfileData;
  contexts: Record<string, ProfileContextData>;
  updatedAt: string;
};

// ─── Defaults ───────────────────────────────────────────────────────────────

export const DEFAULT_GLOBAL: GlobalProfileData = {
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseJsonArray(s: string): string[] {
  try {
    const p = JSON.parse(s);
    return Array.isArray(p) ? (p as unknown[]).filter((x): x is string => typeof x === 'string') : [];
  } catch { return []; }
}

function parseContexts(s: string): Record<string, ProfileContextData> {
  try {
    const p = JSON.parse(s);
    return p && typeof p === 'object' && !Array.isArray(p) ? (p as Record<string, ProfileContextData>) : {};
  } catch { return {}; }
}

function normalizeStatus(s: string): GlobalProfileData['status'] {
  return s === 'online' || s === 'idle' || s === 'dnd' || s === 'offline' ? s : 'online';
}
function normalizeAvatarType(s: string): GlobalProfileData['avatarType'] {
  return s === 'gif' ? 'gif' : 'static';
}
function normalizeBannerType(s: string): GlobalProfileData['bannerType'] {
  return s === 'gif' ? 'gif' : s === 'gradient' ? 'gradient' : 'static';
}

type DbRow = {
  userId: string; avatar: string; banner: string; avatarType: string; bannerType: string;
  themePrimary: string; themeAccent: string; bio: string; decorations: string;
  badges: string; status: string; contexts: string; updatedAt: Date;
};

function dbRowToStore(row: DbRow): UserProfileStore {
  return {
    userId: row.userId,
    global: {
      avatar:      row.avatar,
      banner:      row.banner,
      avatarType:  normalizeAvatarType(row.avatarType),
      bannerType:  normalizeBannerType(row.bannerType),
      theme:       { primary: row.themePrimary, accent: row.themeAccent },
      bio:         row.bio,
      decorations: parseJsonArray(row.decorations),
      badges:      parseJsonArray(row.badges),
      status:      normalizeStatus(row.status),
    },
    contexts:  parseContexts(row.contexts),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<UserProfileStore> {
  const row = await prisma.userProfile.findUnique({ where: { userId } });
  if (!row) {
    return {
      userId,
      global: { ...DEFAULT_GLOBAL, theme: { ...DEFAULT_GLOBAL.theme } },
      contexts: {},
      updatedAt: new Date(0).toISOString(),
    };
  }
  return dbRowToStore(row);
}

export async function setUserProfile(
  userId: string,
  patch: { global?: Partial<GlobalProfileData>; contexts?: Record<string, ProfileContextData> }
): Promise<UserProfileStore> {
  const existing = await getUserProfile(userId);
  const g = patch.global;

  const newGlobal: GlobalProfileData = g
    ? {
        avatar:      typeof g.avatar === 'string'  ? g.avatar.slice(0, 500)  : existing.global.avatar,
        banner:      typeof g.banner === 'string'  ? g.banner.slice(0, 500)  : existing.global.banner,
        avatarType:  normalizeAvatarType(g.avatarType ?? existing.global.avatarType),
        bannerType:  normalizeBannerType(g.bannerType ?? existing.global.bannerType),
        theme: {
          primary: typeof g.theme?.primary === 'string' ? g.theme.primary.slice(0, 20) : existing.global.theme.primary,
          accent:  typeof g.theme?.accent  === 'string' ? g.theme.accent.slice(0, 20)  : existing.global.theme.accent,
        },
        bio:         typeof g.bio === 'string' ? g.bio.slice(0, 500) : existing.global.bio,
        decorations: Array.isArray(g.decorations)
          ? g.decorations.filter((d): d is string => typeof d === 'string').slice(0, 10)
          : existing.global.decorations,
        badges: Array.isArray(g.badges)
          ? g.badges.filter((b): b is string => typeof b === 'string').slice(0, 8)
          : existing.global.badges,
        status: normalizeStatus(g.status ?? existing.global.status),
      }
    : existing.global;

  const mergedContexts = patch.contexts
    ? { ...existing.contexts, ...patch.contexts }
    : existing.contexts;

  const data = {
    avatar:       newGlobal.avatar,
    banner:       newGlobal.banner,
    avatarType:   newGlobal.avatarType,
    bannerType:   newGlobal.bannerType,
    themePrimary: newGlobal.theme.primary,
    themeAccent:  newGlobal.theme.accent,
    bio:          newGlobal.bio,
    decorations:  JSON.stringify(newGlobal.decorations),
    badges:       JSON.stringify(newGlobal.badges),
    status:       newGlobal.status,
    contexts:     JSON.stringify(mergedContexts),
  };

  const row = await prisma.userProfile.upsert({
    where:  { userId },
    create: { userId, ...data },
    update: data,
  });

  return dbRowToStore(row);
}
