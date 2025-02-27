/**
 * These routes are public and don't need authentication
 * @type {string[]}
 * */
export const publicRoutes = [
  '/',
  '/new-verification',
  '/onboarding',
  '/settings',
  '/login',
  '/register',
  '/reset-password',
  '/new-password',
  '/loginerror',
  // '/sign-in',
  // '/sign-up',
  '/sign-out',
  '/login/magic-link',
  '/admin-example',
  '/admin',
  '/settings',
  '/client',
  '/server',
  '/admin',
  '/client',
  '/pakete',
  '/preise',
  '/kontakt',
  '/impressum',
  '/datenschutz',
  '/faq',
  '/booking',
  '/booking/success',
  '/api',
  '/api/stripe',
  '/api/stripe/checkout',
  '/api/stripe/success',
  '/terms',
  '/privacy',
  '/api/setup/anonymous-user',
  '/api/stripe/webhook',
  '/api/stripe/get-booking',
  '/api/stripe/cancel-booking',
  '/api/setup/anonymous-user',
  '/api/stripe/checkout',
  '/api/stripe/success',
  '/api/stripe/webhook',
  '/api/stripe/get-booking',
  '/api/stripe/cancel-booking',
  '/api/calendar/create-event',
  '/api/calendar/check-availability',
  '/api/calendar/check-availability-batch',
  '/api/calendar/(.*)',
  '/api/calendar/:path*',
  '/public/(.*)',
  '/public/assets/packages/(.*',
  '/api/stripe/:path*',
  '/booking/success', //booking/success/[session_id] (for dynamic session pages)
  '/booking/cancel', //booking/cancel/[session_id] (similar pattern for cancel)
  '/booking/success/[session_id]',
  '/booking/cancel/[session_id]',
  '/booking/success/(.*)',
  '/booking/cancel/(.*)',
  '/booking/success/[...session_id]',
  '/booking/cancel/[...session_id]',
  '/booking/success', // Main route
  '/booking/success/(.*)', // All routes under /booking/success
  '/booking/cancel',
  '/booking/cancel/(.*)',
  '/api/calendar/(.*)',
  '/api/stripe/:path*',
  '/api/stripe/checkout',
  '/api/stripe/success',
  '/api/stripe/webhook',
  '/api/stripe/get-booking',
  '/api/stripe/cancel-booking',
  '/api/calendar/create-event',
  '/api/calendar/check-availability',
  '/api/calendar/optimized-availability',
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
  '/sign-up',
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
// export const DEFAULT_LOGIN_REDIRECT = '/settings';
export const DEFAULT_LOGIN_REDIRECT = '/dashboard';

/**
 * Default Allowed Redirects from callbackUrl searchParams
 * @type {string}
 * */
export const ALLOWED_REDIRECTS = ['/server', '/admin', '/client', '/settings'];

// Add specific OAuth callback routes
export const oauthCallbackRoutes = [
  '/api/auth/callback/google',
  '/api/auth/callback/github',
];
