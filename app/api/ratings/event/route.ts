import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// POST /api/ratings/event
export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { eventId, rating, review } = body;

    if (!eventId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'eventId and rating (1-5) are required' }, { status: 400 });
    }

    const result = await prisma.eventRating.upsert({
      where: { eventId_userId: { eventId, userId: authUser.userId } },
      create: { eventId, userId: authUser.userId, rating: Number(rating), review: review ?? null },
      update: { rating: Number(rating), review: review ?? null },
    });

    return NextResponse.json({ rating: result }, { status: 200 });
  } catch (error) {
    console.error('POST /api/ratings/event error:', error);
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }
}
