import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// POST /api/ratings/organizer
export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { organizerId, rating, review } = body;

    if (!organizerId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'organizerId and rating (1-5) are required' }, { status: 400 });
    }

    const result = await prisma.organizerRating.upsert({
      where: { organizerId_userId: { organizerId, userId: authUser.userId } },
      create: { organizerId, userId: authUser.userId, rating: Number(rating), review: review ?? null },
      update: { rating: Number(rating), review: review ?? null },
    });

    return NextResponse.json({ rating: result }, { status: 200 });
  } catch (error) {
    console.error('POST /api/ratings/organizer error:', error);
    return NextResponse.json({ error: 'Failed to submit organizer rating' }, { status: 500 });
  }
}
