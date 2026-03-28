import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { hashPassword } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/users/[id]/password
// Body: { newPassword: string }
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const guard = requireAdmin(request);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const body = await request.json();
    const newPassword = String(body?.newPassword ?? '');

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const hashed = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id },
      data: { password: hashed },
      select: { id: true },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('POST /api/admin/users/[id]/password error:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
