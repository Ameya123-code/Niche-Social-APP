import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

// GET /api/admin/users?search=&page=&limit=
export async function GET(request: NextRequest) {
  try {
    const guard = requireAdmin(request);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') ?? '').trim();
    const page = Math.max(1, Number(searchParams.get('page') ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)));

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
          profileImageUrl: true,
          city: true,
          country: true,
          ageMin: true,
          ageMax: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              opinions: true,
              likes: true,
              conversationsAsA: true,
              conversationsAsB: true,
            },
          },
          conversationsAsA: {
            take: 5,
            orderBy: { updatedAt: 'desc' },
            select: {
              id: true,
              userB: { select: { id: true, name: true, email: true } },
              level: { select: { level: true, totalXp: true } },
            },
          },
          conversationsAsB: {
            take: 5,
            orderBy: { updatedAt: 'desc' },
            select: {
              id: true,
              userA: { select: { id: true, name: true, email: true } },
              level: { select: { level: true, totalXp: true } },
            },
          },
        },
      }),
    ]);

    const mapped = users.map((u) => {
      const convA = u.conversationsAsA.map((c) => ({
        id: c.id,
        partner: c.userB,
        level: c.level?.level ?? 1,
        totalXp: c.level?.totalXp ?? 0,
      }));
      const convB = u.conversationsAsB.map((c) => ({
        id: c.id,
        partner: c.userA,
        level: c.level?.level ?? 1,
        totalXp: c.level?.totalXp ?? 0,
      }));
      return {
        ...u,
        conversations: [...convA, ...convB],
      };
    });

    return NextResponse.json({
      users: mapped,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
  }
}
