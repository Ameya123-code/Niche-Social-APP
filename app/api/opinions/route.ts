import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// POST /api/opinions — create a new opinion post
export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    if (content.trim().length > 500) {
      return NextResponse.json({ error: 'Content must be 500 characters or less' }, { status: 400 });
    }

    // Extract hashtags from content
    const hashtags = (content.match(/#[\w]+/g) ?? []).map((h: string) => h.toLowerCase());

    const opinion = await prisma.userOpinion.create({
      data: {
        userId: authUser.userId,
        content: content.trim(),
        hashtags: JSON.stringify(hashtags),
      },
      select: { id: true, content: true, hashtags: true, createdAt: true },
    });

    return NextResponse.json({ opinion }, { status: 201 });
  } catch (error) {
    console.error('POST /api/opinions error:', error);
    return NextResponse.json({ error: 'Failed to create opinion' }, { status: 500 });
  }
}
