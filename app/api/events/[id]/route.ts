import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/events/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        date: true,
        category: true,
        maxAttendees: true,
        imageUrl: true,
        createdAt: true,
        creator: { select: { id: true, name: true, profileImageUrl: true } },
        _count: { select: { attendees: true } },
        eventRatings: {
          select: { rating: true },
        },
      },
    });

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    // Calculate average rating
    const avgRating = event.eventRatings.length > 0
      ? event.eventRatings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / event.eventRatings.length
      : null;

    return NextResponse.json({ event: { ...event, avgRating } }, { status: 200 });
  } catch (error) {
    console.error('GET /api/events/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}
