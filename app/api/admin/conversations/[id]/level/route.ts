import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/conversations/[id]/level
// Body: { level?: number, totalXp?: number }
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const guard = requireAdmin(request);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const body = await request.json();

    const level = body?.level !== undefined ? Math.max(1, Number(body.level)) : undefined;
    const totalXp = body?.totalXp !== undefined ? Math.max(0, Number(body.totalXp)) : undefined;

    const updated = await prisma.chatLevel.upsert({
      where: { conversationId: id },
      create: {
        conversationId: id,
        level: level ?? 1,
        totalXp: totalXp ?? 0,
      },
      update: {
        ...(level !== undefined ? { level } : {}),
        ...(totalXp !== undefined ? { totalXp } : {}),
      },
    });

    return NextResponse.json({ level: updated }, { status: 200 });
  } catch (error) {
    console.error('PATCH /api/admin/conversations/[id]/level error:', error);
    return NextResponse.json({ error: 'Failed to update conversation level' }, { status: 500 });
  }
}
