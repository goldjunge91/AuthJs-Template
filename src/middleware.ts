import { NextResponse, NextRequest } from 'next/server';
import { auth } from './auth';
import {
  DEFAULT_LOGIN_REDIRECT,
  authRoutes,
  publicRoutes,
  apiAuthPrefix,
  oauthCallbackRoutes,
} from './routes';

export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

  // Check if the requested path starts with API auth prefix
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  // Check for OAuth callback routes first - explicitly bypass middleware
  if (oauthCallbackRoutes.some((route) => nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if the requested path starts with API auth prefix
  if (nextUrl.pathname.startsWith(apiAuthPrefix)) {
    return NextResponse.next();
  }

  // Allow API auth routes to pass through without authentication checks
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Add additional OAuth callback paths to check
  const isOAuthCallback = nextUrl.pathname.startsWith('/api/auth/callback');
  if (isOAuthCallback) {
    return NextResponse.next();
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
    // Get the full requested URL path and query
    const fullPath = nextUrl.pathname + nextUrl.search;
    // Create a redirect URL to the sign-in page
    const signInUrl = new URL('/sign-in', request.url);
    // Add the original path as a callbackUrl parameter
    signInUrl.searchParams.set('callbackUrl', fullPath);
    // Redirect to the sign-in page
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

/**
 * config Matcher für die Next.js Middleware
 * @typedef {Object} MiddlewareConfig
 * @property {string[]} matcher - Array von Pfad-Mustern, auf die die Middleware angewendet wird
 */
export const config = {
  matcher: [
    // '/((?!api/auth|api/stripe|api/setup|_next/static|_next/image|videos|images|favicon.ico).*)',
    // '/((?!api/auth|api/stripe|_next/static|_next/image|videos|images|favicon.ico).*)',
    '/((?!api/auth/callback|api/auth|api/stripe|_next/static|_next/image|videos|images|favicon.ico).*)',
    //     '/((?!api/auth|api/stripe|api/setup|_next/static|_next/image|videos|images|favicon.ico).*)',
  ],
};

// import { NextResponse, NextRequest } from 'next/server';
// import { auth } from './auth';
// import {
//   DEFAULT_LOGIN_REDIRECT,
//   authRoutes,
//   publicRoutes,
//   apiAuthPrefix,
// } from './routes';

// export default async function middleware(request: NextRequest) {
//   const { nextUrl } = request;
//   const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

//   // Check if the requested path starts with API auth prefix
//   const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

//   if (isApiAuthRoute) {
//     return;
//   }

//   const session = await auth();
//   const isLoggedIn = !!session;

//   const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
//   const isAuthRoute = authRoutes.includes(nextUrl.pathname);

//   if (isAuthRoute) {
//     if (isLoggedIn) {
//       return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
//     }
//     const requestHeaders = new Headers(request.headers);
//     requestHeaders.set('request-ip', ip);
//     return NextResponse.next({
//       request: {
//         headers: requestHeaders,
//       },
//     });
//   }

//   // if (!isLoggedIn && !isPublicRoute) {
//   //   // Get the full requested URL path and query
//   //   const fullPath = nextUrl.pathname + nextUrl.search;

//   //   // Create a redirect URL to the sign-in page
//   //   const signInUrl = new URL('/sign-in', request.url);

//   //   // Add the original path as a callbackUrl parameter
//   //   signInUrl.searchParams.set('callbackUrl', fullPath);

//   //   // Redirect to the sign-in page
//   //   return NextResponse.redirect(signInUrl);
//   // }

//   return NextResponse.next();
// }

// /**
//  * config Matcher für die Next.js Middleware
//  * @typedef {Object} MiddlewareConfig
//  * @property {string[]} matcher - Array von Pfad-Mustern, auf die die Middleware angewendet wird
//  *
//  * @example
//  * Die Middleware wird angewendet auf:
//  * - /dashboard
//  * - /profile
//  * - /settings
//  */
// export const config = {
//   matcher: [
//     // '/((?!api/auth|api/stripe|_next/static|_next/image|videos|images|favicon.ico).*)',
//     '/((?!api/auth|api/stripe|api/setup|_next/static|_next/image|videos|images|favicon.ico).*)',
//   ],
// };
