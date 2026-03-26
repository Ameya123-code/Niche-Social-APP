import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// POST /api/uploads/image
// Stores image bytes in Postgres via Prisma and returns a URL for retrieval.
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded = await prisma.uploadedImage.create({
      data: {
        fileName: file.name || 'upload',
        mimeType: file.type,
        sizeBytes: file.size,
        data: buffer,
      },
      select: { id: true },
    });

    const url = `/api/uploads/image/${uploaded.id}`;

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
