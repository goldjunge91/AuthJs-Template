import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  const headersList = await headers();
  const apiKey = headersList.get('x-api-key');

  // Booking ID aus der URL oder den Query-Parametern holen
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get('bookingId');

  // API-Schlüssel validieren
  if (apiKey !== process.env.API_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!bookingId) {
    return NextResponse.json(
      { error: 'Booking ID is required' },
      { status: 400 },
    );
  }

  try {
    // Buchungsinformationen von Stripe abrufen
    const session = await stripe.checkout.sessions.retrieve(bookingId);
    return NextResponse.json({ success: true, session }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error retrieving booking' },
      { status: 500 },
    );
  }
}
