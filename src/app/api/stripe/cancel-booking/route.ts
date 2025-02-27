import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/db';
import { bookings } from '@/db/schemas/bookings';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion,
});

// API-Key für Tests mit Curl/Postman
const API_KEY = process.env.API_TEST_KEY;

// Hilfsfunktion zur Validierung des API-Keys - Entfernung des export
async function validateApiKey(): Promise<boolean> {
  const headersList = await headers();
  const apiKey = headersList.get('x-api-key'); // Await notwendig

  // return apiKey === process.env.EXPECTED_API_KEY;
  return process.env.NODE_ENV === 'development' || apiKey === API_KEY;
}

export async function POST(request: Request) {
  // API-Key-Validierung
  if (!(await validateApiKey())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get('session_id');

  if (!session_id) {
    return NextResponse.json({ error: 'Session ID fehlt' }, { status: 400 });
  }

  try {
    // Update booking status in database
    await db
      .update(bookings)
      .set({
        status: 'cancelled',
        // updatedAt: Date.now(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(bookings.stripeSessionId, session_id));

    // Optional: Cancel the Stripe session if it's still active
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.status === 'open') {
        // For Stripe, we can't actually cancel a session, but we can expire it
        await stripe.checkout.sessions.expire(session_id);
      }
    } catch (stripeError) {
      console.error('Fehler beim Stornieren der Stripe-Session:', stripeError);
      // Continue with the cancellation even if Stripe operation fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Stornieren der Buchung:', error);
    return NextResponse.json(
      { error: 'Fehler beim Stornieren der Buchung' },
      { status: 500 },
    );
  }
}
