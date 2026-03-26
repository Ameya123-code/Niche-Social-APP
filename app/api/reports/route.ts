import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// POST /api/reports
export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { targetId, targetType, reason, description, severity } = body;

    if (!targetId || !targetType || !reason) {
      return NextResponse.json({ error: 'targetId, targetType, and reason are required' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: authUser.userId,
        targetId,
        targetType: targetType.toUpperCase(),
        reason,
        description: description ?? null,
        severity: severity ?? 'medium',
      },
    });

    // High severity reports get flagged immediately (future: notify moderation webhook)
    if (severity === 'high') {
      console.warn(`[HIGH SEVERITY REPORT] id=${report.id} target=${targetId} type=${targetType} reason=${reason}`);
    }

    return NextResponse.json({ message: 'Report submitted successfully', reportId: report.id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reports error:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
