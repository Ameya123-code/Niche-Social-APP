import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/search?q=hashtag
export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') ?? '';

    if (!query.trim()) {
      return NextResponse.json({ error: 'Search query required' }, { status: 400 });
    }

    const tag = query.toLowerCase().startsWith('#') ? query.toLowerCase() : `#${query.toLowerCase()}`;

    const [opinions, events] = await Promise.all([
      prisma.userOpinion.findMany({
        where: {
          OR: [
            { hashtags: { contains: tag } },
            { content: { contains: query } },
          ],
        },
        take: 30,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          hashtags: true,
          createdAt: true,
          user: { select: { id: true, name: true, profileImageUrl: true } },
        },
      }),
      prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { category: { contains: query } },
            { address: { contains: query } },
            { city: { contains: query } },
          ],
        },
        take: 20,
        orderBy: { startDate: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          address: true,
          city: true,
          startDate: true,
          endDate: true,
          category: true,
          coverImageUrl: true,
          hashtags: true,
          creator: { select: { id: true, name: true } },
          _count: { select: { attendees: true } },
        },
      }),
    ]);

    return NextResponse.json(
      {
        hashtag: query,
        opinions,
        events: events.map((event) => ({
          ...event,
          // Backward-compatible aliases
          location: event.address,
          date: event.startDate,
          imageUrl: event.coverImageUrl,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
