import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

// POST /api/cards/[userId]/pass — no DB storage needed, just acknowledge
export async function POST(request: NextRequest) {
  const authUser = getUserFromRequest(request);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ success: true }, { status: 200 });
}
