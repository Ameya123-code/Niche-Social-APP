import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/cards — returns users to swipe (excludes already liked/passed and self)
export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const alreadyLiked = await prisma.userLike.findMany({
      where: { userId: authUser.userId },
      select: { likedUserId: true },
    });
    const excludeIds = [authUser.userId, ...alreadyLiked.map((l: { likedUserId: string }) => l.likedUserId)];

    const users = await prisma.user.findMany({
      where: { id: { notIn: excludeIds }, age: { gte: 18 } },
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        age: true,
        selfDescription: true,
        profileImageUrl: true,
        preferences: { select: { music: true, hobbies: true, movies: true, books: true, popCulture: true } },
        opinions: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: { id: true, content: true, hashtags: true, createdAt: true },
        },
      },
    });

    // Basic compatibility scoring against current user's preferences
    const currentPrefs = await prisma.userPreferences.findUnique({ where: { userId: authUser.userId } });

    const cards = users.map((u: (typeof users)[number]) => {
      let score = 0;
      if (currentPrefs && u.preferences) {
        const parse = (s: string) => { try { return JSON.parse(s) as string[]; } catch { return []; } };
        const fields = ['music', 'hobbies', 'movies', 'books', 'popCulture'] as const;
        let shared = 0, total = 0;
        for (const f of fields) {
          const mine = parse(currentPrefs[f]);
          const theirs = parse(u.preferences[f]);
          shared += mine.filter((x) => theirs.includes(x)).length;
          total += Math.max(mine.length, theirs.length);
        }
        score = total > 0 ? Math.round((shared / total) * 100) : 50;
      }
      return { ...u, compatibilityScore: score };
    });

    return NextResponse.json({ cards }, { status: 200 });
  } catch (error) {
    console.error('Cards GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}
