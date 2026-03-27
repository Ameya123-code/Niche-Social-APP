import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getUserProfile, setUserProfile } from '@/lib/profile-store';
import type { GlobalProfileData, ProfileContextData } from '@/lib/profile-store';

export const dynamic = 'force-dynamic';

// GET /api/users/me/profile
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await getUserProfile(user.userId);
    return NextResponse.json(
      { profile },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('Profile GET error:', err);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

// PUT /api/users/me/profile
export async function PUT(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { global?: Partial<GlobalProfileData>; contexts?: Record<string, ProfileContextData> };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const updated = await setUserProfile(user.userId, {
      global: body.global,
      contexts: body.contexts,
    });
    return NextResponse.json(
      { profile: updated },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('Profile PUT error:', err);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
