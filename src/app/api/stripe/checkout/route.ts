import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db } from '@/db';
import { bookings } from '@/db/schemas/bookings';
import { formatAmountForStripe } from '@/utils/stripe/stripe-helpers';
import { auth } from '@/auth';
import { users } from '@/db/schemas/users';
import { eq } from 'drizzle-orm';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion,
});

// API-Key für Tests mit Curl/Postman
const API_KEY = process.env.API_TEST_KEY;

// Hilfsfunktion zur Validierung des API-Keys
async function validateApiKey(): Promise<boolean> {
  const headersList = await headers();
  const apiKey = headersList.get('x-api-key');
  return process.env.NODE_ENV === 'development' || apiKey === API_KEY;
}

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

    // Get user session
    const session = await auth();

    // Prüfe, ob der Benutzer existiert oder verwende einen gültigen Benutzer
    let userId = session?.user?.id;

    if (!userId) {
      // Prüfe, ob der anonyme Benutzer existiert
      const anonymousUser = await db
        .select()
        .from(users)
        .where(eq(users.id, 'anonymous-user'))
        .limit(1);

      if (anonymousUser.length > 0) {
        userId = 'anonymous-user';
      } else {
        // Erstelle den anonymen Benutzer, wenn er nicht existiert
        await db.insert(users).values({
          id: 'anonymous-user',
          name: 'Anonymer Benutzer',
          email: 'anonymous@example.com',
          emailVerified: new Date(),
        });
        userId = 'anonymous-user';
      }
    }

    // Format date and time for database
    const bookingDate = new Date(dateTime);
    const date = bookingDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeSlot = bookingDate.toTimeString().substring(0, 5); // HH:MM

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Fahrzeugpflege: ${vehicleClass} - ${selectedPackage}`,
              description: `Termin am ${new Date(dateTime).toLocaleString('de-DE')}`,
              images: [
                `${process.env.NEXT_PUBLIC_APP_URL}/images/vehicles/${vehicleClass.toLowerCase()}.jpg`,
              ],
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        vehicleClass,
        packageType: selectedPackage,
        additionalOptions: additionalOptions
          ? JSON.stringify(additionalOptions)
          : '',
        dateTime: dateTime,
        totalDuration: duration.toString(),
        contactDetails: JSON.stringify(customerDetails),
      },
    });

    // Save booking to database
    await db.insert(bookings).values({
      userId,
      stripeSessionId: stripeSession.id,
      date,
      timeSlot,
      status: 'pending',
      customerEmail: customerDetails.email,
      customerName: `${customerDetails.firstName} ${customerDetails.lastName}`,
      street: customerDetails.street || '',
      streetNumber: customerDetails.streetNumber || '',
      city: customerDetails.city || '',
      phone: customerDetails.phone || '',
      packageType: selectedPackage,
      additionalOptions: additionalOptions
        ? JSON.stringify(additionalOptions)
        : null,
      price: formatAmountForStripe(calculatedPrice.totalPrice, 'eur'),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return NextResponse.json({
      sessionId: stripeSession.id,
      url: stripeSession.url,
    });
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
  if (!(await validateApiKey())) {
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
