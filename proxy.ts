import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/cards', '/map', '/search', '/profile', '/settings', '/events'];

function decodeJwtPayload(token: string): { isEmailVerified?: boolean } | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isAuthPage = pathname === '/auth';
  const isVerifyPage = pathname === '/auth/verify';

  if (isProtected && !token) {
    const url = new URL('/auth', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isVerifyPage && !token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (token) {
    const payload = decodeJwtPayload(token);
    const hasEmailVerifiedClaim = typeof payload?.isEmailVerified === 'boolean';
    const isEmailVerified = payload?.isEmailVerified === true;

    // Enforce only when claim is explicitly present to avoid locking legacy sessions.
    if (hasEmailVerifiedClaim && (isProtected || isAuthPage) && !isEmailVerified) {
      if (!isVerifyPage) {
        return NextResponse.redirect(new URL('/auth/verify', request.url));
      }
    }

    if (hasEmailVerifiedClaim && (isAuthPage || isVerifyPage) && isEmailVerified) {
      return NextResponse.redirect(new URL('/cards', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cards', '/map', '/search', '/profile', '/settings', '/events/:path*', '/auth/:path*'],
};
