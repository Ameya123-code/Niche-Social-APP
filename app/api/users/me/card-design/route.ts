import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getUserCardDesign, setUserCardDesign } from '@/lib/card-design';

export const dynamic = 'force-dynamic';

// GET /api/users/me/card-design
export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cardDesign = await getUserCardDesign(authUser.userId);
    return NextResponse.json(
      { cardDesign },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('GET card-design error:', error);
    return NextResponse.json({ error: 'Failed to fetch card design' }, { status: 500 });
  }
}

// PUT /api/users/me/card-design
export async function PUT(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const cardDesign = await setUserCardDesign(authUser.userId, {
      isCustomized: body?.isCustomized === false ? false : true,
      themeId: typeof body?.themeId === 'string' ? body.themeId : undefined,
      stickers: Array.isArray(body?.stickers) ? body.stickers : undefined,
      borderStyle: typeof body?.borderStyle === 'string' ? body.borderStyle : undefined,
      fontStyle: typeof body?.fontStyle === 'string' ? body.fontStyle : undefined,
      backgroundMode: typeof body?.backgroundMode === 'string' ? body.backgroundMode : undefined,
      gifUrl: typeof body?.gifUrl === 'string' ? body.gifUrl : undefined,
    });

    return NextResponse.json(
      { cardDesign },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('PUT card-design error:', error);
    return NextResponse.json({ error: 'Failed to update card design' }, { status: 500 });
  }
}
