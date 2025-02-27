// src/lib/api-auth-wrapper.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// API-Key for tests
const API_KEY = process.env.API_TEST_KEY;

export function withApiAuth(
  // eslint-disable-next-line no-unused-vars
  handler: (req: NextRequest) => Promise<NextResponse>,
) {
  return async function (req: NextRequest) {
    // Check for API key authentication
    const headersList = await headers();
    const apiKey = headersList.get('x-api-key');

    // Allow requests in development or with valid API key
    const isAuthorized =
      process.env.NODE_ENV === 'development' || apiKey === API_KEY;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Proceed with the handler if authenticated
    return handler(req);
  };
}
