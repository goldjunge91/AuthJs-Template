import { NextRequest, NextResponse } from 'next/server';

export function apiKeyMiddleware(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  const validApiKey = process.env.API_TEST_KEY;

  if (process.env.NODE_ENV !== 'development' && apiKey !== validApiKey) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return NextResponse.next();
}
