/**
 * Chat Leveling System
 *
 * Both users in a conversation contribute to a SHARED level pool.
 * The more they talk, the more features unlock — but spam is blocked.
 *
 * Feature Unlocks
 * ───────────────
 *  LVL  1  → text only
 *  LVL  5  → emoji + GIF (GIPHY)
 *  LVL 10  → images
 *  LVL 15  → videos
 *  LVL 20  → voice call
 *  LVL 25  → video call
 *  LVL 40  → event suggestion (uses profile location + age gate)
 *
 * Anti-Spam Rules (per user per conversation)
 * ────────────────────────────────────────────
 *  • Min 5 characters with at least 1 real word
 *  • 3-second cooldown between messages
 *  • Max 15 XP / hour, 50 XP / day
 *  • 0 XP for exact duplicate or >75% word overlap with last 5 messages
 *  • 0 XP for emoji/punctuation-only messages
 */

// ─── Level XP thresholds ─────────────────────────────────────────────────────

// XP required to REACH each level (cumulative)
export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 15,
  3: 35,
  4: 65,
  5: 100,   // Emoji + GIF
  6: 145,
  7: 200,
  8: 265,
  9: 340,
  10: 430,  // Images
  11: 530,
  12: 640,
  13: 760,
  14: 895,
  15: 1040, // Videos
  16: 1195,
  17: 1360,
  18: 1535,
  19: 1720,
  20: 1915, // Voice call
  21: 2120,
  22: 2335,
  23: 2560,
  24: 2795,
  25: 3040, // Video call
  26: 3295,
  27: 3560,
  28: 3835,
  29: 4120,
  30: 4415, // Video call (still)
  35: 6000,
  40: 8000, // Event suggestion
};

// Sorted ascending for getLevelFromXp
const SORTED_THRESHOLDS = Object.entries(LEVEL_THRESHOLDS)
  .map(([lvl, xp]) => ({ level: parseInt(lvl, 10), xp }))
  .sort((a, b) => a.xp - b.xp);

// ─── Feature unlock levels ────────────────────────────────────────────────────

export const FEATURE_UNLOCK_LEVELS = {
  text: 1,
  emoji: 5,
  gif: 5,
  image: 10,
  video: 15,
  voice_call: 20,
  video_call: 25,
  event_suggestion: 40,
} as const;

export type ChatFeature = keyof typeof FEATURE_UNLOCK_LEVELS;

// ─── Anti-spam constants ──────────────────────────────────────────────────────

const SPAM_COOLDOWN_MS = 3_000;       // 3 seconds between messages
const MAX_XP_PER_HOUR = 15;
const MAX_XP_PER_DAY = 50;
const MIN_CHAR_COUNT = 5;

// Event suggestion age gate: both users must be 18+, and the feature only
// shows events within their shared city (resolved from profile location).
export const EVENT_SUGGESTION_MIN_AGE = 18;

// ─── Public helpers ───────────────────────────────────────────────────────────

export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  for (const { level: lvl, xp } of SORTED_THRESHOLDS) {
    if (totalXp >= xp) level = lvl;
    else break;
  }
  return level;
}

export function getXpToNextLevel(totalXp: number): { nextLevel: number; xpNeeded: number } | null {
  const current = getLevelFromXp(totalXp);
  const nextEntry = SORTED_THRESHOLDS.find((e) => e.level > current);
  if (!nextEntry) return null;
  return { nextLevel: nextEntry.level, xpNeeded: nextEntry.xp - totalXp };
}

export function getUnlockedFeatures(level: number): ChatFeature[] {
  return (Object.entries(FEATURE_UNLOCK_LEVELS) as [ChatFeature, number][])
    .filter(([, minLevel]) => level >= minLevel)
    .map(([feature]) => feature);
}

export function isFeatureUnlocked(level: number, feature: ChatFeature): boolean {
  return level >= FEATURE_UNLOCK_LEVELS[feature];
}

// ─── XP calculation ───────────────────────────────────────────────────────────

/**
 * Checks if a message is "meaningful" for XP purposes.
 * Must have real word content, not just emojis/punctuation.
 */
function isMeaningful(content: string): boolean {
  const t = content.trim();
  if (t.length < MIN_CHAR_COUNT) return false;
  // At least 2 distinct letters
  const letters = t.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 2) return false;
  // At least one word (sequence of letters)
  return /[a-zA-Z]{2,}/.test(t);
}

/** Word overlap ratio between two strings (0–1) */
function wordOverlap(a: string, b: string): number {
  const words = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );
  const wa = words(a);
  const wb = words(b);
  if (wa.size === 0 || wb.size === 0) return 0;
  const shared = [...wa].filter((w) => wb.has(w)).length;
  return shared / Math.min(wa.size, wb.size);
}

function isSpam(content: string, recentMessages: string[]): boolean {
  if (recentMessages.includes(content)) return true; // exact duplicate
  for (const recent of recentMessages.slice(-3)) {
    if (wordOverlap(content, recent) > 0.75) return true;
  }
  return false;
}

export type XpRecord = {
  xpThisHour: number;
  xpToday: number;
  lastMessageAt: Date | null;
  lastResetHour: Date;
  lastResetDay: Date;
  recentMessages: string; // JSON array of last 5 message contents
};

export type XpResult = {
  xp: number;
  /** 'ok' | 'too_fast' | 'not_meaningful' | 'duplicate' | 'hourly_cap' | 'daily_cap' */
  reason: string;
  /** Updated XP record fields to persist */
  updates: {
    xpThisHour: number;
    xpToday: number;
    lastMessageAt: Date;
    lastResetHour: Date;
    lastResetDay: Date;
    recentMessages: string;
  };
};

/**
 * Calculates XP for a new message and returns updated counters to persist.
 *
 * @param content       The message text
 * @param senderId      Sender's user ID
 * @param xpRecord      Current UserConversationXp row for this sender
 * @param lastSenderId  userId who sent the most recent message in this conv (for reply bonus)
 */
export function calculateXp(
  content: string,
  senderId: string,
  xpRecord: XpRecord,
  lastSenderId: string | null
): XpResult {
  const now = new Date();

  // Apply time-based resets
  const hourElapsed = now.getTime() - new Date(xpRecord.lastResetHour).getTime() > 3_600_000;
  const dayElapsed = now.getTime() - new Date(xpRecord.lastResetDay).getTime() > 86_400_000;

  let hourXp = hourElapsed ? 0 : xpRecord.xpThisHour;
  let dayXp = dayElapsed ? 0 : xpRecord.xpToday;
  const newResetHour = hourElapsed ? now : xpRecord.lastResetHour;
  const newResetDay = dayElapsed ? now : xpRecord.lastResetDay;

  // Cooldown check
  if (xpRecord.lastMessageAt) {
    const elapsed = now.getTime() - new Date(xpRecord.lastMessageAt).getTime();
    if (elapsed < SPAM_COOLDOWN_MS) {
      return buildResult(0, 'too_fast', hourXp, dayXp, now, newResetHour, newResetDay, xpRecord.recentMessages, content);
    }
  }

  // Quality check
  if (!isMeaningful(content)) {
    return buildResult(0, 'not_meaningful', hourXp, dayXp, now, newResetHour, newResetDay, xpRecord.recentMessages, content);
  }

  // Spam check
  let recent: string[] = [];
  try { recent = JSON.parse(xpRecord.recentMessages); } catch { /* ignore */ }

  if (isSpam(content, recent)) {
    return buildResult(0, 'duplicate', hourXp, dayXp, now, newResetHour, newResetDay, xpRecord.recentMessages, content);
  }

  // Cap checks
  if (dayXp >= MAX_XP_PER_DAY) {
    return buildResult(0, 'daily_cap', hourXp, dayXp, now, newResetHour, newResetDay, xpRecord.recentMessages, content);
  }
  if (hourXp >= MAX_XP_PER_HOUR) {
    return buildResult(0, 'hourly_cap', hourXp, dayXp, now, newResetHour, newResetDay, xpRecord.recentMessages, content);
  }

  // Base XP by message length
  const len = content.trim().length;
  let base = 1;
  if (len >= 100) base = 3;
  else if (len >= 21) base = 2;

  // Reply bonus: +1 if the other person sent the last message (real conversation)
  if (lastSenderId && lastSenderId !== senderId) base += 1;

  // Clamp to remaining caps
  const remainingHour = MAX_XP_PER_HOUR - hourXp;
  const remainingDay = MAX_XP_PER_DAY - dayXp;
  const finalXp = Math.max(0, Math.min(base, remainingHour, remainingDay));

  // Update recent messages (keep last 5)
  const updatedRecent = JSON.stringify([...recent, content].slice(-5));

  return buildResult(finalXp, 'ok', hourXp + finalXp, dayXp + finalXp, now, newResetHour, newResetDay, updatedRecent, content);
}

function buildResult(
  xp: number,
  reason: string,
  hourXp: number,
  dayXp: number,
  lastMsg: Date,
  resetHour: Date,
  resetDay: Date,
  recentMessages: string,
  _content: string
): XpResult {
  return {
    xp,
    reason,
    updates: {
      xpThisHour: hourXp,
      xpToday: dayXp,
      lastMessageAt: lastMsg,
      lastResetHour: resetHour,
      lastResetDay: resetDay,
      recentMessages,
    },
  };
}

/**
 * Event suggestion eligibility check.
 * Both users must be 18+ and have location set.
 */
export function canSuggestEvents(
  myAge: number,
  theirAge: number,
  myLat: number | null,
  theirLat: number | null
): boolean {
  return (
    myAge >= EVENT_SUGGESTION_MIN_AGE &&
    theirAge >= EVENT_SUGGESTION_MIN_AGE &&
    myLat !== null &&
    theirLat !== null
  );
}
