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
    const search = searchParams.get('search') ?? searchParams.get('q') ?? '';

    const events = await prisma.event.findMany({
      where: {
        ...(category && category !== 'all' && { category }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { address: { contains: search } },
            { city: { contains: search } },
          ],
        }),
      },
      orderBy: { startDate: 'asc' },
      take: 50,
      select: {
        id: true,
        title: true,
        description: true,
        address: true,
        city: true,
        startDate: true,
        endDate: true,
        category: true,
        maxAttendees: true,
        coverImageUrl: true,
        hashtags: true,
        createdAt: true,
        creator: { select: { id: true, name: true, profileImageUrl: true } },
        _count: { select: { attendees: true, ratings: true } },
      },
    });

    return NextResponse.json(
      {
        events: events.map((event: (typeof events)[number]) => ({
          ...event,
          // Backward-compatible aliases for older client code
          location: event.address,
          date: event.startDate,
          imageUrl: event.coverImageUrl,
        })),
      },
      { status: 200 }
    );
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
    const {
      title,
      description,
      location,
      address,
      city,
      date,
      startDate,
      endDate,
      category,
      maxAttendees,
      hashtags,
      isPersonal,
      discountPercent,
      imageUrl,
      coverImageUrl,
      latitude,
      longitude,
    } = body;

    const normalizedAddress = String(address || location || '').trim();
    const normalizedCity = String(city || normalizedAddress.split(',').pop() || '').trim();
    const normalizedStartDate = new Date(startDate || date);
    const normalizedEndDate = endDate
      ? new Date(endDate)
      : new Date(normalizedStartDate.getTime() + 2 * 60 * 60 * 1000);
    const normalizedCategory = String(category || '').toLowerCase().trim();

    let parsedHashtags: string[] = [];
    if (Array.isArray(hashtags)) {
      parsedHashtags = hashtags.filter((t): t is string => typeof t === 'string');
    } else if (typeof hashtags === 'string') {
      parsedHashtags = hashtags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    const normalizedHashtags = [...new Set(parsedHashtags.map((t) => t.replace(/^#/, '').toLowerCase()))].slice(0, 20);

    const normalizedDiscount = Math.max(0, Math.min(90, Number(discountPercent ?? 0) || 0));
    const normalizedIsPersonal = Boolean(isPersonal);

    if (!title || !normalizedAddress || Number.isNaN(normalizedStartDate.getTime()) || !normalizedCategory) {
      return NextResponse.json({ error: 'Title, location/date, and category are required' }, { status: 400 });
    }

    if (normalizedEndDate.getTime() <= normalizedStartDate.getTime()) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description ?? '',
        latitude: typeof latitude === 'number' ? latitude : 0,
        longitude: typeof longitude === 'number' ? longitude : 0,
        address: normalizedAddress,
        city: normalizedCity || 'Unknown',
        startDate: normalizedStartDate,
        endDate: normalizedEndDate,
        category: normalizedCategory,
        hashtags: JSON.stringify(normalizedHashtags),
        maxAttendees: maxAttendees ? Number(maxAttendees) : null,
        isPersonal: normalizedIsPersonal,
        discountPercent: normalizedDiscount,
        coverImageUrl: coverImageUrl ?? imageUrl ?? null,
        creatorId: authUser.userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        address: true,
        city: true,
        startDate: true,
        endDate: true,
        category: true,
        maxAttendees: true,
        coverImageUrl: true,
        hashtags: true,
        createdAt: true,
        creator: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        event: {
          ...event,
          location: event.address,
          date: event.startDate,
          imageUrl: event.coverImageUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/events error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
