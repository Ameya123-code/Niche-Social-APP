import prisma from './prisma';

export type UserCardDesign = {
  isCustomized: boolean;
  themeId: string;
  stickers: string[];
  borderStyle: 'glass' | 'neon' | 'minimal';
  fontStyle: 'modern' | 'mono' | 'playful';
  backgroundMode: 'theme' | 'gif';
  gifUrl?: string;
  updatedAt: string;
};

const DEFAULT_DESIGN: UserCardDesign = {
  isCustomized: false,
  themeId: 'rose',
  stickers: [],
  borderStyle: 'glass',
  fontStyle: 'modern',
  backgroundMode: 'theme',
  gifUrl: undefined,
  updatedAt: new Date(0).toISOString(),
};

const normalizeStickers = (stickers: unknown): string[] => {
  if (!Array.isArray(stickers)) return [];
  return stickers
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean)
    .slice(0, 10);
};

export const normalizeThemeId = (themeId?: string) => {
  const allowed = new Set(['rose', 'midnight', 'sunset']);
  return allowed.has(themeId ?? '') ? (themeId as string) : 'rose';
};

const normalizeBorderStyle = (style?: string): UserCardDesign['borderStyle'] => {
  return style === 'neon' || style === 'minimal' || style === 'glass' ? style : 'glass';
};

const normalizeFontStyle = (style?: string): UserCardDesign['fontStyle'] => {
  return style === 'mono' || style === 'playful' || style === 'modern' ? style : 'modern';
};

const normalizeBackgroundMode = (mode?: string): UserCardDesign['backgroundMode'] => {
  return mode === 'gif' || mode === 'theme' ? mode : 'theme';
};

const normalizeGifUrl = (url?: unknown): string | undefined => {
  if (typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 500);
};

const rowToDesign = (row: {
  isCustomized: boolean;
  themeId: string;
  stickers: string;
  borderStyle: string;
  fontStyle: string;
  backgroundMode: string;
  gifUrl: string | null;
  updatedAt: Date;
}): UserCardDesign => {
  return {
    isCustomized: Boolean(row.isCustomized),
    themeId: normalizeThemeId(row.themeId),
    stickers: normalizeStickers((() => {
      try { return JSON.parse(row.stickers) as unknown; } catch { return []; }
    })()),
    borderStyle: normalizeBorderStyle(row.borderStyle),
    fontStyle: normalizeFontStyle(row.fontStyle),
    backgroundMode: normalizeBackgroundMode(row.backgroundMode),
    gifUrl: normalizeGifUrl(row.gifUrl ?? undefined),
    updatedAt: row.updatedAt.toISOString(),
  };
};

export async function getUserCardDesign(userId: string): Promise<UserCardDesign> {
  const row = await prisma.userCardDesign.findUnique({ where: { userId } });
  if (!row) return DEFAULT_DESIGN;
  return rowToDesign(row);
}

export async function getManyCardDesigns(userIds: string[]): Promise<Record<string, UserCardDesign>> {
  const rows = await prisma.userCardDesign.findMany({
    where: { userId: { in: userIds } },
    select: {
      userId: true,
      isCustomized: true,
      themeId: true,
      stickers: true,
      borderStyle: true,
      fontStyle: true,
      backgroundMode: true,
      gifUrl: true,
      updatedAt: true,
    },
  });

  const rowMap = new Map(rows.map((r) => [r.userId, r]));
  const out: Record<string, UserCardDesign> = {};
  for (const userId of userIds) {
    const row = rowMap.get(userId);
    out[userId] = row ? rowToDesign(row) : DEFAULT_DESIGN;
  }
  return out;
}

export async function setUserCardDesign(
  userId: string,
  input: {
    isCustomized?: boolean;
    themeId?: string;
    stickers?: string[];
    borderStyle?: string;
    fontStyle?: string;
    backgroundMode?: string;
    gifUrl?: string;
  },
) {
  const current = await getUserCardDesign(userId);

  const updated: UserCardDesign = {
    isCustomized: input.isCustomized ?? true,
    themeId: normalizeThemeId(input.themeId ?? current.themeId),
    stickers: normalizeStickers(input.stickers ?? current.stickers),
    borderStyle: normalizeBorderStyle(input.borderStyle ?? current.borderStyle),
    fontStyle: normalizeFontStyle(input.fontStyle ?? current.fontStyle),
    backgroundMode: normalizeBackgroundMode(input.backgroundMode ?? current.backgroundMode),
    gifUrl: normalizeGifUrl(input.gifUrl ?? current.gifUrl),
    updatedAt: new Date().toISOString(),
  };

  if (updated.backgroundMode !== 'gif') {
    updated.gifUrl = undefined;
  }

  const row = await prisma.userCardDesign.upsert({
    where: { userId },
    create: {
      userId,
      isCustomized: updated.isCustomized,
      themeId: updated.themeId,
      stickers: JSON.stringify(updated.stickers),
      borderStyle: updated.borderStyle,
      fontStyle: updated.fontStyle,
      backgroundMode: updated.backgroundMode,
      gifUrl: updated.gifUrl ?? null,
    },
    update: {
      isCustomized: updated.isCustomized,
      themeId: updated.themeId,
      stickers: JSON.stringify(updated.stickers),
      borderStyle: updated.borderStyle,
      fontStyle: updated.fontStyle,
      backgroundMode: updated.backgroundMode,
      gifUrl: updated.gifUrl ?? null,
    },
  });

  return rowToDesign(row);
}
