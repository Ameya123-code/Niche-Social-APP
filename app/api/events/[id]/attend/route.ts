import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// POST /api/events/[id]/attend — toggle attendance
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: eventId } = await params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, maxAttendees: true, _count: { select: { attendees: true } } },
    });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const existing = await prisma.eventAttendee.findUnique({
      where: { eventId_userId: { eventId, userId: authUser.userId } },
    });

    if (existing) {
      // Toggle off — remove attendance
      await prisma.eventAttendee.delete({ where: { eventId_userId: { eventId, userId: authUser.userId } } });
      return NextResponse.json({ attending: false }, { status: 200 });
    }

    // Check capacity
    if (event.maxAttendees && event._count.attendees >= event.maxAttendees) {
      return NextResponse.json({ error: 'Event is at full capacity' }, { status: 409 });
    }

    await prisma.eventAttendee.create({ data: { eventId, userId: authUser.userId } });
    return NextResponse.json({ attending: true }, { status: 200 });
  } catch (error) {
    console.error('POST /api/events/[id]/attend error:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}
