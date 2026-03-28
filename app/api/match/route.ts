import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getPotentialMatches } from '@/lib/matching';

/**
 * GET /api/match
 * Returns a ranked list of potential match candidates for the authenticated user.
 * Excludes users already swiped on or already in a conversation with.
 *
 * Query params:
 *   limit  — number of results (default 20, max 50)
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(request.url);
    const limit = Math.min(50, parseInt(url.searchParams.get('limit') ?? '20', 10));

    const matches = await getPotentialMatches(authUser.userId, limit);
    return NextResponse.json({ matches }, { status: 200 });
  } catch (error) {
    console.error('GET /api/match error:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
