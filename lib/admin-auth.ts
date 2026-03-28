import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, type AuthTokenPayload } from '@/lib/auth';

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export type AdminGuardResult =
  | { ok: true; authUser: AuthTokenPayload }
  | { ok: false; response: NextResponse };

export function requireAdmin(request: NextRequest): AdminGuardResult {
  const authUser = getUserFromRequest(request);
  if (!authUser) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const allowlist = getAdminEmails();
  if (!allowlist.length) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Admin access is not configured. Set ADMIN_EMAILS in env.' },
        { status: 503 }
      ),
    };
  }

  if (!allowlist.includes(authUser.email.toLowerCase())) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { ok: true, authUser };
}
