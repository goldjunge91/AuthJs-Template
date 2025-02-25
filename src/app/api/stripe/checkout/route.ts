import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db } from '@/db';
import { bookings } from '@/db/schemas/bookings';
import { formatAmountForStripe } from '@/utils/stripe/stripe-helpers';

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
  return process.env.NODE_ENV === 'development' || apiKey === API_KEY;
}

// Im Entwicklungsmodus oder mit gültigem API-Key fortfahren
// }

export async function POST(request: Request) {
  try {
    // API-Key-Validierung
    if (!(await validateApiKey())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      vehicleClass,
      selectedPackage,
      additionalOptions,
      dateTime,
      customerDetails,
      calculatedPrice,
      duration,
    } = body;

    // Validate required data
    if (!vehicleClass || !selectedPackage || !dateTime || !customerDetails) {
      return NextResponse.json(
        { error: 'Fehlende Buchungsdaten' },
        { status: 400 },
      );
    }

    // Extract date and time from dateTime string
    const [date, timeSlot] = dateTime.split('T');

    // Format metadata for Stripe
    const metadata = {
      vehicleClass,
      dateTime,
      totalDuration: duration.toString(),
      contactDetails: JSON.stringify(customerDetails),
      packages: JSON.stringify({
        selectedPackage,
        additionalOptions,
      }),
    };

    // Get origin for success/cancel URLs
    const headersList = await headers();
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Fahrzeugpflege ${vehicleClass}`,
              description: `Buchung für ${new Date(dateTime).toLocaleString('de-DE')}`,
            },
            unit_amount: formatAmountForStripe(
              calculatedPrice.totalPrice,
              'eur',
            ),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/booking/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata,
      customer_email: customerDetails.email,
    });

    // Save booking to database with pending status
    await db.insert(bookings).values({
      stripeSessionId: session.id,
      date,
      timeSlot,
      status: 'pending',
      customerEmail: customerDetails.email,
      customerName: `${customerDetails.firstName} ${customerDetails.lastName}`,
      packageType: selectedPackage,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Fehler bei der Erstellung der Checkout-Session:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Erstellung der Checkout-Session' },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  // API-Key-Validierung
  if (!validateApiKey()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID fehlt' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    return NextResponse.json({
      status: session.status,
      customer_email: session.customer_details?.email,
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Session:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Session' },
      { status: 500 },
    );
  }
}
