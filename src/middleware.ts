import { NextResponse, NextRequest } from 'next/server';
import { auth } from './auth';
import {
  DEFAULT_LOGIN_REDIRECT,
  authRoutes,
  publicRoutes,
  apiAuthPrefix,
} from './routes';

export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

  // Check if the requested path starts with API auth prefix
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  if (isApiAuthRoute) {
    return;
  }

  const session = await auth();
  const isLoggedIn = !!session;

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('request-ip', ip);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl),
    );
  }

  return NextResponse.next();
}

/**
 * config Matcher für die Next.js Middleware
 * @typedef {Object} MiddlewareConfig
 * @property {string[]} matcher - Array von Pfad-Mustern, auf die die Middleware angewendet wird
 *
 * @example
 * Die Middleware wird angewendet auf:
 * - /dashboard
 * - /profile
 * - /settings
 */
export const config = {
  matcher: [
    '/((?!api/auth|api/stripe|_next/static|_next/image|videos|images|favicon.ico).*)',
  ],
};
