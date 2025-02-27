import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion,
});

// API-Key für Tests mit Curl/Postman
const API_KEY = process.env.API_TEST_KEY;
// Hilfsfunktion zur Validierung des API-Keys
async function validateApiKey(): Promise<boolean> {
  const headersList = await headers();
  const apiKey = headersList.get('x-api-key');

  // Im Entwicklungsmodus oder mit gültigem API-Key fortfahren
  return process.env.NODE_ENV === 'development' || apiKey === API_KEY;
}

export async function GET(request: Request) {
  // API-Key-Validierung - Fixed missing await
  if (!(await validateApiKey())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get('session_id');

  if (!session_id) {
    return NextResponse.json({ error: 'Session ID fehlt' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items'],
    });

    if (!session.metadata) {
      throw new Error('Keine Metadaten in der Session gefunden');
    }

    // Added safer JSON parsing with error handling
    const bookingData = {
      dateTime: session.metadata.dateTime,
      totalDuration: Number.parseInt(session.metadata.totalDuration || '0'),
      vehicleClass: session.metadata.vehicleClass,
      contactDetails: session.metadata.contactDetails
        ? JSON.parse(session.metadata.contactDetails)
        : {},
      packages: session.metadata.packages
        ? JSON.parse(session.metadata.packages)
        : [],
    };

    return NextResponse.json(bookingData);
  } catch (error) {
    console.error('Fehler beim Abrufen der Buchungsdaten:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Buchungsdaten' },
      { status: 500 },
    );
  }
}
