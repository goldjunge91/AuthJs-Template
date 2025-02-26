/**
 * These routes are public and don't need authentication
 * @type {string[]}
 * */
export const publicRoutes = [
  '/',
  '/:path*',
  '/(.*)',
  '/pakete',
  '/booking',
  '/new-verification',
  '/onboarding',
  '/register',
  '/reset-password',
  '/new-password',
  '/loginerror',
  '/login/magic-link',
  '/settings',
  '/client',
  '/faq',
  '/kontakt',
  '/impressum',
  '/datenschutz',
  '/server',
  '/admin',
  '/client',
  '/settings',
  '/api/stripe/checkout',
  '/api/stripe/success',
  '/api/stripe/webhook',
  '/api/stripe/get-booking',
  '/api/calendar/create-event',
  '/api/calendar/check-availability',
  '/api/calendar/(.*)',
  '/api/calendar/:path*',
  '/public/(.*)',
  '/public/assets/packages/(.*',
  '/api/stripe/:path*',
];

/**
 * These routes are used for authentication,
 * redirect logged-in users to /settings
 * @type {string[]}
 * */
export const authRoutes = [
  '/onboarding',
  '/register',
  '/sign-in',
  '/sign-out',
  '/loginerror',
  '/reset-password',
  '/new-password',
  '/login/magic-link',
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for api
 * authentication purposes
 * @type {string}
 * */
export const apiAuthPrefix = '/api/auth';

/**
 * Default redirect path for logged-in users
 * @type {string}
 * */
export const DEFAULT_LOGIN_REDIRECT = '/settings';

/**
 * Default Allowed Redirects from callbackUrl searchParams
 * @type {string}
 * */
export const ALLOWED_REDIRECTS = ['/server', '/admin', '/client', '/settings'];
