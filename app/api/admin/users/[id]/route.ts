import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/users/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const guard = requireAdmin(request);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: String(body.name) } : {}),
        ...(body.email !== undefined ? { email: String(body.email).toLowerCase().trim() } : {}),
        ...(body.phone !== undefined ? { phone: String(body.phone).trim() } : {}),
        ...(body.age !== undefined ? { age: Number(body.age) } : {}),
        ...(body.isEmailVerified !== undefined ? { isEmailVerified: Boolean(body.isEmailVerified) } : {}),
        ...(body.isPhoneVerified !== undefined ? { isPhoneVerified: Boolean(body.isPhoneVerified) } : {}),
        ...(body.isAgeVerified !== undefined ? { isAgeVerified: Boolean(body.isAgeVerified) } : {}),
        ...(body.selfDescription !== undefined ? { selfDescription: String(body.selfDescription) } : {}),
        ...(body.city !== undefined ? { city: body.city ? String(body.city) : null } : {}),
        ...(body.country !== undefined ? { country: body.country ? String(body.country) : null } : {}),
        ...(body.ageMin !== undefined ? { ageMin: body.ageMin === null ? null : Number(body.ageMin) } : {}),
        ...(body.ageMax !== undefined ? { ageMax: body.ageMax === null ? null : Number(body.ageMax) } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        age: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isAgeVerified: true,
        selfDescription: true,
        city: true,
        country: true,
        ageMin: true,
        ageMax: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updated }, { status: 200 });
  } catch (error) {
    console.error('PATCH /api/admin/users/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
