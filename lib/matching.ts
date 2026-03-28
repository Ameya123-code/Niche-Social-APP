/**
 * Matching Algorithm
 *
 * Compatibility score is a weighted sum (0–100) of:
 *   45%  — Shared interest similarity (Jaccard across all preference categories)
 *   20%  — Age compatibility (both within each other's preferred range + proximity bonus)
 *   20%  — Location proximity (Haversine distance, best within ~5 km)
 *   15%  — Profile completeness of the candidate
 */

import prisma from './prisma';

// ─── Types ────────────────────────────────────────────────────────────────────

type UserPrefsRow = {
  music: string;
  hobbies: string;
  movies: string;
  books: string;
  popCulture: string;
  education: string;
  career: string;
} | null;

type ScoredUser = {
  id: string;
  name: string;
  age: number;
  selfDescription: string | null;
  profileImageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
  ageMin: number | null;
  ageMax: number | null;
  preferences: UserPrefsRow;
  compatibilityScore: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Haversine great-circle distance in kilometres */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Jaccard similarity between two string arrays (case-insensitive) */
function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0.5;
  const setA = new Set(a.map((s) => s.toLowerCase().trim()));
  const setB = new Set(b.map((s) => s.toLowerCase().trim()));
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function parseArr(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// ─── Scoring functions ────────────────────────────────────────────────────────

const CATEGORY_WEIGHTS: Record<keyof NonNullable<UserPrefsRow>, number> = {
  hobbies: 0.30,
  music: 0.20,
  movies: 0.15,
  books: 0.15,
  popCulture: 0.10,
  career: 0.05,
  education: 0.05,
};

function interestScore(prefsA: UserPrefsRow, prefsB: UserPrefsRow): number {
  if (!prefsA || !prefsB) return 25; // neutral when no prefs set
  let score = 0;
  for (const [cat, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    const arrA = parseArr(prefsA[cat as keyof NonNullable<UserPrefsRow>]);
    const arrB = parseArr(prefsB[cat as keyof NonNullable<UserPrefsRow>]);
    score += jaccard(arrA, arrB) * weight;
  }
  return Math.round(score * 100); // 0–100
}

function ageScore(
  myAge: number,
  theirAge: number,
  myMin: number | null,
  myMax: number | null,
  theirMin: number | null,
  theirMax: number | null
): number {
  const min = myMin ?? 18;
  const max = myMax ?? 99;
  const tMin = theirMin ?? 18;
  const tMax = theirMax ?? 99;

  // Must be mutually within preferred ranges
  if (theirAge < min || theirAge > max || myAge < tMin || myAge > tMax) return 0;

  // Closer in age → higher score
  const diff = Math.abs(myAge - theirAge);
  if (diff <= 2) return 100;
  if (diff <= 4) return 85;
  if (diff <= 7) return 65;
  if (diff <= 10) return 45;
  return 25;
}

function locationScore(
  aLat: number | null,
  aLon: number | null,
  bLat: number | null,
  bLon: number | null
): number {
  if (!aLat || !aLon || !bLat || !bLon) return 50; // neutral when location not set
  const km = haversineKm(aLat, aLon, bLat, bLon);
  if (km <= 5) return 100;
  if (km <= 15) return 90;
  if (km <= 30) return 75;
  if (km <= 60) return 55;
  if (km <= 100) return 40;
  if (km <= 200) return 25;
  return 10;
}

function completenessScore(u: {
  preferences: UserPrefsRow;
  latitude: number | null;
  profileImageUrl: string | null;
  selfDescription: string | null;
}): number {
  let s = 0;
  if (u.preferences) s += 40;
  if (u.latitude) s += 20;
  if (u.profileImageUrl) s += 20;
  if (u.selfDescription) s += 20;
  return s; // 0–100
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function calculateCompatibilityScore(
  me: {
    age: number;
    ageMin: number | null;
    ageMax: number | null;
    latitude: number | null;
    longitude: number | null;
    preferences: UserPrefsRow;
  },
  them: {
    age: number;
    ageMin: number | null;
    ageMax: number | null;
    latitude: number | null;
    longitude: number | null;
    preferences: UserPrefsRow;
    selfDescription: string | null;
    profileImageUrl: string | null;
  }
): number {
  const iScore = interestScore(me.preferences, them.preferences);
  const aScore = ageScore(me.age, them.age, me.ageMin, me.ageMax, them.ageMin, them.ageMax);
  const lScore = locationScore(me.latitude, me.longitude, them.latitude, them.longitude);
  const cScore = completenessScore(them);

  return Math.min(
    100,
    Math.round(iScore * 0.45 + aScore * 0.20 + lScore * 0.20 + cScore * 0.15)
  );
}

/**
 * Returns a scored & ranked list of users the given user hasn't swiped on yet.
 * Excludes users they've already been matched/conversed with.
 */
export async function getPotentialMatches(userId: string, limit = 20): Promise<ScoredUser[]> {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    include: { preferences: true },
  });
  if (!me) return [];

  // IDs to exclude: self + already-swiped + existing conversation partners
  const [swipedRows, conversations] = await Promise.all([
    prisma.userLike.findMany({ where: { userId }, select: { likedUserId: true } }),
    prisma.conversation.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      select: { userAId: true, userBId: true },
    }),
  ]);

  const excludeIds = new Set<string>([userId]);
  swipedRows.forEach((r) => excludeIds.add(r.likedUserId));
  conversations.forEach((c) => {
    excludeIds.add(c.userAId === userId ? c.userBId : c.userAId);
  });

  // Fetch candidate pool (take extra so we can sort and slice)
  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: [...excludeIds] },
      isAgeVerified: true,
    },
    include: { preferences: true },
    take: 200,
  });

  return candidates
    .map((c) => ({
      id: c.id,
      name: c.name,
      age: c.age,
      selfDescription: c.selfDescription,
      profileImageUrl: c.profileImageUrl,
      latitude: c.latitude,
      longitude: c.longitude,
      city: c.city,
      country: c.country,
      ageMin: c.ageMin,
      ageMax: c.ageMax,
      preferences: c.preferences,
      compatibilityScore: calculateCompatibilityScore(me, c),
    }))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, limit);
}
