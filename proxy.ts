import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/cards', '/chat', '/map', '/search', '/profile', '/settings', '/events'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isVerifyPage = pathname === '/auth/verify';

  if (isProtected && !token) {
    const url = new URL('/auth', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isVerifyPage && !token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cards', '/map', '/search', '/profile', '/settings', '/events/:path*', '/auth/:path*'],
};
