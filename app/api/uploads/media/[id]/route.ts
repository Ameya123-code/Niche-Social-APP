import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/uploads/media/[id]
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const media = await prisma.uploadedImage.findUnique({
      where: { id },
      select: {
        data: true,
        mimeType: true,
        fileName: true,
      },
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    return new NextResponse(media.data, {
      status: 200,
      headers: {
        'Content-Type': media.mimeType,
        'Content-Disposition': `inline; filename="${media.fileName}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Media fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}
