import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// POST /api/ratings/user — behavior rating with auto-flag logic
export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { ratedUserId, rating, behavior } = body;

    if (!ratedUserId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'ratedUserId and rating (1-5) are required' }, { status: 400 });
    }

    if (ratedUserId === authUser.userId) {
      return NextResponse.json({ error: 'Cannot rate yourself' }, { status: 400 });
    }

    const result = await prisma.userBehaviorRating.upsert({
      where: { ratedUserId_raterUserId: { ratedUserId, raterUserId: authUser.userId } },
      create: {
        ratedUserId,
        raterUserId: authUser.userId,
        rating: Number(rating),
        behavior: behavior ?? 'General',
      },
      update: {
        rating: Number(rating),
        behavior: behavior ?? 'General',
      },
    });

    // Auto-flag logic: if avg behavior rating drops below 2.0, flag for review
    const allRatings = await prisma.userBehaviorRating.findMany({
      where: { ratedUserId },
      select: { rating: true },
    });
    const avg = allRatings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / allRatings.length;

    if (avg < 2.0 && allRatings.length >= 3) {
      await prisma.report.create({
        data: {
          reporterUserId: authUser.userId,
          reportedUserId: ratedUserId,
          reason: 'AUTO_FLAG: Low behavior rating',
          description: 'Automatically flagged due to low average behavior rating.',
          severity: 'medium',
        },
      });
    }

    return NextResponse.json({ rating: result, avgBehaviorRating: avg }, { status: 200 });
  } catch (error) {
    console.error('POST /api/ratings/user error:', error);
    return NextResponse.json({ error: 'Failed to submit user rating' }, { status: 500 });
  }
}
