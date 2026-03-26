import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/users/me/preferences
export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const prefs = await prisma.userPreferences.findUnique({ where: { userId: authUser.userId } });
    return NextResponse.json({ preferences: prefs }, { status: 200 });
  } catch (error) {
    console.error('GET preferences error:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

// PUT /api/users/me/preferences
export async function PUT(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { music, hobbies, movies, books, popCulture, education, career } = body;

    const toJson = (val: unknown) => {
      if (!val) return undefined;
      if (typeof val === 'string') return val; // already serialized
      return JSON.stringify(val);
    };

    const updated = await prisma.userPreferences.upsert({
      where: { userId: authUser.userId },
      create: {
        userId: authUser.userId,
        music: toJson(music) ?? '[]',
        hobbies: toJson(hobbies) ?? '[]',
        movies: toJson(movies) ?? '[]',
        books: toJson(books) ?? '[]',
        popCulture: toJson(popCulture) ?? '[]',
        education: toJson(education) ?? '[]',
        career: toJson(career) ?? '[]',
      },
      update: {
        ...(music !== undefined && { music: toJson(music) }),
        ...(hobbies !== undefined && { hobbies: toJson(hobbies) }),
        ...(movies !== undefined && { movies: toJson(movies) }),
        ...(books !== undefined && { books: toJson(books) }),
        ...(popCulture !== undefined && { popCulture: toJson(popCulture) }),
        ...(education !== undefined && { education: toJson(education) }),
        ...(career !== undefined && { career: toJson(career) }),
      },
    });

    return NextResponse.json({ preferences: updated }, { status: 200 });
  } catch (error) {
    console.error('PUT preferences error:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
