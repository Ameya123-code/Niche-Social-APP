import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'Meta login removed' }, { status: 404 });
}
