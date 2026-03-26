import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/events — list events with optional category/search filters
export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search') ?? '';

    const events = await prisma.event.findMany({
      where: {
        ...(category && category !== 'all' && { category }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { location: { contains: search } },
          ],
        }),
      },
      orderBy: { date: 'asc' },
      take: 50,
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
      },
    });

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error('GET /api/events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST /api/events — create a new event
export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, description, location, date, category, maxAttendees, imageUrl } = body;

    if (!title || !location || !date || !category) {
      return NextResponse.json({ error: 'Title, location, date, and category are required' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description ?? '',
        location,
        date: new Date(date),
        category,
        maxAttendees: maxAttendees ? Number(maxAttendees) : null,
        imageUrl: imageUrl ?? null,
        creatorId: authUser.userId,
      },
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
        creator: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('POST /api/events error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
