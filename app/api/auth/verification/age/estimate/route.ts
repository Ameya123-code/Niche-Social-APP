import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { estimateAgeFromFaceImage } from '@/lib/face-age';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function parseUploadedImageIdFromUrl(url: string): string | null {
  const match = url.match(/\/api\/uploads\/image\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

async function readImageBytesFromRequest(request: NextRequest): Promise<{ bytes: Uint8Array; mimeType: string } | null> {
  const contentType = request.headers.get('content-type') ?? '';

  // multipart/form-data path
  if (contentType.includes('multipart/form-data')) {
    const fd = await request.formData();
    const file = fd.get('file');

    if (!(file instanceof File)) return null;
    if (!ALLOWED_TYPES.has(file.type)) return null;
    if (file.size > MAX_SIZE_BYTES) return null;

    const bytes = new Uint8Array(await file.arrayBuffer());
    return { bytes, mimeType: file.type };
  }

  // JSON path: { imageUrl: '/api/uploads/image/<id>' }
  const body = (await request.json().catch(() => null)) as { imageUrl?: string } | null;
  const imageUrl = body?.imageUrl?.trim();
  if (!imageUrl) return null;

  const imageId = parseUploadedImageIdFromUrl(imageUrl);
  if (!imageId) return null;

  const row = await prisma.uploadedImage.findUnique({
    where: { id: imageId },
    select: { data: true, mimeType: true, sizeBytes: true },
  });

  if (!row) return null;
  if (!ALLOWED_TYPES.has(row.mimeType)) return null;
  if (row.sizeBytes > MAX_SIZE_BYTES) return null;

  return { bytes: row.data, mimeType: row.mimeType };
}

// POST /api/auth/verification/age/estimate
// Prototype-only age estimate using face-age model API (with deterministic fallback).
export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const image = await readImageBytesFromRequest(request);
    if (!image) {
      return NextResponse.json(
        {
          error:
            'Invalid input. Send multipart/form-data with file, or JSON { imageUrl: "/api/uploads/image/<id>" } (jpeg/png/webp, max 5MB).',
        },
        { status: 400 },
      );
    }

    const estimate = await estimateAgeFromFaceImage(image.bytes, image.mimeType);

    // Prototype rule: only mark as verified when model confidence is moderate.
    const markVerified = estimate.isLikelyAdult && estimate.confidence >= 0.55;

    await prisma.user.update({
      where: { id: authUser.userId },
      data: { isAgeVerified: markVerified },
    });

    return NextResponse.json(
      {
        verification: {
          status: markVerified ? 'verified' : 'not_verified',
          isAgeVerified: markVerified,
        },
        estimate,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Age estimate error:', error);
    return NextResponse.json({ error: 'Failed to estimate age' }, { status: 500 });
  }
}
