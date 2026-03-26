import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'Google login removed' }, { status: 404 });
}
