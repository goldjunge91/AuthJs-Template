import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID fehlt' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    if (!session.metadata) {
      throw new Error('Keine Metadaten in der Session gefunden');
    }

    const bookingData = {
      dateTime: session.metadata.dateTime,
      totalDuration: Number.parseInt(session.metadata.totalDuration),
      vehicleClass: session.metadata.vehicleClass,
      contactDetails: JSON.parse(session.metadata.contactDetails),
      packages: JSON.parse(session.metadata.packages),
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
