import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db } from '@/db';
import { bookings } from '@/db/schemas/bookings';
import { eq } from 'drizzle-orm';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion,
});

// This is your Stripe webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') as string;

  // Überprüfe, ob die Signatur vorhanden ist
  if (!signature) {
    console.error('❌ Webhook Error: Keine Stripe-Signatur gefunden');
    return NextResponse.json(
      { error: 'Keine Stripe-Signatur gefunden' },
      { status: 400 },
    );
  }

  // Überprüfe, ob das Webhook-Secret konfiguriert ist
  if (!webhookSecret) {
    console.error('❌ Webhook Error: Webhook-Secret nicht konfiguriert');
    return NextResponse.json(
      { error: 'Webhook-Secret nicht konfiguriert' },
      { status: 500 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret as string,
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`❌ Webhook Error: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Update booking status in database
        await db
          .update(bookings)
          .set({
            status: 'confirmed',
            // updatedAt: Date.now(),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(bookings.stripeSessionId, session.id));

        // Create calendar event
        if (session.metadata) {
          const contactDetails = JSON.parse(
            session.metadata.contactDetails || '{}',
          );
          const additionalOptions = session.metadata.additionalOptions
            ? JSON.parse(session.metadata.additionalOptions)
            : [];

          const calendarResponse = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/create-event`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                dateTime: session.metadata.dateTime,
                duration: parseInt(session.metadata.totalDuration || '60'),
                vehicleClass: session.metadata.vehicleClass,
                contactDetails,
                selectedPackages: [
                  session.metadata.packageType,
                  ...additionalOptions,
                ],
              }),
            },
          );

          const calendarData = await calendarResponse.json();

          if (calendarData.success) {
            if (calendarData.data?.id) {
              await db
                .update(bookings)
                .set({
                  calendarEventId: calendarData.data.id,
                  // updatedAt: Date.now(),
                  updatedAt: new Date().toISOString(),
                })
                .where(eq(bookings.stripeSessionId, session.id));
            }
          } else {
            console.error('Fehler beim Erstellen des Kalendereintrags');
          }
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Update booking status in database
        await db
          .update(bookings)
          .set({
            status: 'expired',
            // updatedAt: Date.now(),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(bookings.stripeSessionId, session.id));
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 },
    );
  }
}

// Disable body parsing, we need the raw body for webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};
