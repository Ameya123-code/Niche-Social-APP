import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/cards', '/chat', '/map', '/search', '/profile', '/settings', '/events'];

export async function proxy(request: NextRequest) {
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

  // Always validate verification status from the database via session API.
  if (token && (isProtected || isAuthPage || isVerifyPage)) {
    try {
      const sessionUrl = new URL('/api/auth/session', request.url);
      const sessionRes = await fetch(sessionUrl, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (sessionRes.status === 200) {
        if (isAuthPage || isVerifyPage) {
          return NextResponse.redirect(new URL('/cards', request.url));
        }
        return NextResponse.next();
      }

      if (sessionRes.status === 403) {
        if (!isVerifyPage) {
          return NextResponse.redirect(new URL('/auth/verify', request.url));
        }
        return NextResponse.next();
      }

      if (sessionRes.status === 401) {
        if (isAuthPage) {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/auth', request.url));
      }
    } catch {
      if (isProtected || isVerifyPage) {
        return NextResponse.redirect(new URL('/auth', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cards', '/map', '/search', '/profile', '/settings', '/events/:path*', '/auth/:path*'],
};
