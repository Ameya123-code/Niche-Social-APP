import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getManyCardDesigns } from '@/lib/card-design';

type DemoCard = {
  id: string;
  name: string;
  age: number;
  selfDescription: string;
  profileImageUrl: null;
  preferences: {
    music: string;
    hobbies: string;
    movies: string;
    books: string;
    popCulture: string;
  };
  opinions: Array<{ id: string; content: string; hashtags: string; createdAt: string }>;
  compatibilityScore: number;
  cardDesign: {
    isCustomized: boolean;
    themeId: string;
    stickers: string[];
    borderStyle: 'glass' | 'neon' | 'minimal';
    fontStyle: 'modern' | 'mono' | 'playful';
    backgroundMode: 'theme' | 'gif' | 'image';
    gifUrl?: string;
    updatedAt: string;
  };
};

const DEMO_CARDS: DemoCard[] = [
  {
    id: 'demo_1',
    name: 'Aanya',
    age: 23,
    selfDescription: 'I care more about values than bios. I like people who can defend an opinion calmly.',
    profileImageUrl: null,
    preferences: {
      music: JSON.stringify(['indie', 'lofi']),
      hobbies: JSON.stringify(['journaling', 'running', 'coffee']),
      movies: JSON.stringify(['drama']),
      books: JSON.stringify(['psychology']),
      popCulture: JSON.stringify(['podcasts']),
    },
    opinions: [
      {
        id: 'demo_op_1',
        content: 'First dates should be walks + coffee, not expensive dinners.',
        hashtags: JSON.stringify(['dating', 'coffee', 'communication']),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'demo_op_2',
        content: 'Consistency is more attractive than intensity.',
        hashtags: JSON.stringify(['greenflags', 'maturity']),
        createdAt: new Date().toISOString(),
      },
    ],
    compatibilityScore: 86,
    cardDesign: {
      isCustomized: true,
      themeId: 'rose',
      stickers: ['☕', '🧠', '🎧'],
      borderStyle: 'glass',
      fontStyle: 'modern',
      backgroundMode: 'theme',
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'demo_2',
    name: 'Rohan',
    age: 25,
    selfDescription: 'Looking for people who are opinionated but kind.',
    profileImageUrl: null,
    preferences: {
      music: JSON.stringify(['hiphop', 'afrobeats']),
      hobbies: JSON.stringify(['basketball', 'gaming', 'memes']),
      movies: JSON.stringify(['sci-fi']),
      books: JSON.stringify(['business']),
      popCulture: JSON.stringify(['anime']),
    },
    opinions: [
      {
        id: 'demo_op_3',
        content: 'You can tell chemistry in 10 minutes if both people are actually present.',
        hashtags: JSON.stringify(['chemistry', 'mindfulness']),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'demo_op_4',
        content: 'Shared humor matters more than shared music taste.',
        hashtags: JSON.stringify(['humor', 'compatibility']),
        createdAt: new Date().toISOString(),
      },
    ],
    compatibilityScore: 79,
    cardDesign: {
      isCustomized: true,
      themeId: 'midnight',
      stickers: ['🎮', '🏀', '😂'],
      borderStyle: 'neon',
      fontStyle: 'mono',
      backgroundMode: 'gif',
      gifUrl: 'https://media.giphy.com/media/l0HlNaQ6gWfllcjDO/giphy.gif',
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'demo_3',
    name: 'Meera',
    age: 24,
    selfDescription: 'Debates, books, and random city walks are my thing.',
    profileImageUrl: null,
    preferences: {
      music: JSON.stringify(['jazz', 'classical']),
      hobbies: JSON.stringify(['reading', 'art galleries', 'travel']),
      movies: JSON.stringify(['arthouse']),
      books: JSON.stringify(['fiction', 'history']),
      popCulture: JSON.stringify(['design']),
    },
    opinions: [
      {
        id: 'demo_op_5',
        content: 'People should ask better questions than "what do you do?"',
        hashtags: JSON.stringify(['deep-talks', 'curiosity']),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'demo_op_6',
        content: 'Good manners are underrated and instantly attractive.',
        hashtags: JSON.stringify(['dating-etiquette']),
        createdAt: new Date().toISOString(),
      },
    ],
    compatibilityScore: 91,
    cardDesign: {
      isCustomized: true,
      themeId: 'sunset',
      stickers: ['📚', '🎨', '✨'],
      borderStyle: 'minimal',
      fontStyle: 'playful',
      backgroundMode: 'theme',
      updatedAt: new Date().toISOString(),
    },
  },
];

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

    const userDesigns = await getManyCardDesigns(users.map((u) => u.id));

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
      return {
        ...u,
        compatibilityScore: score,
        cardDesign: userDesigns[u.id],
      };
    });

    const demoCards = DEMO_CARDS.filter((d) => !excludeIds.includes(d.id));
    const combinedCards = cards.length >= 8 ? cards : [...cards, ...demoCards].slice(0, 20);

    return NextResponse.json({ cards: combinedCards }, { status: 200 });
  } catch (error) {
    console.error('Cards GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}
