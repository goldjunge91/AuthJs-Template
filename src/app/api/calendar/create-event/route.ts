import { NextResponse } from 'next/server';
// import { JWT } from 'google-auth-library';
import { getAvailableTimeSlots } from '../../../../actions/booking/availability-utils';
import { getGoogleCalendar } from '@/utils/google/google-calendar';
import { headers } from 'next/headers';

const CALENDAR_ID = process.env.AUTH_CALENDAR_ID;
const PRIVATE_KEY = process.env.AUTH_PRIVATE_KEY?.replace(/\\n/g, '\n');
const CLIENT_EMAIL = process.env.AUTH_CLIENT_EMAIL;
// const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// API-Key für Tests mit Curl/Postman
const API_KEY = process.env.API_TEST_KEY;

if (!CALENDAR_ID || !PRIVATE_KEY || !CLIENT_EMAIL) {
  throw new Error(
    'Google Calendar Konfiguration fehlt in den Umgebungsvariablen',
  );
}

// Hilfsfunktion zur Validierung des API-Keys
async function validateApiKey(): Promise<boolean> {
  const headersList = headers();
  const apiKey = (await headersList).get('x-api-key');

  // Im Entwicklungsmodus oder mit gültigem API-Key fortfahren
  return process.env.NODE_ENV === 'development' || apiKey === API_KEY;
}

export async function POST(request: Request) {
  // API-Key-Validierung
  if (!(await validateApiKey())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      dateTime,
      duration,
      vehicleClass,
      contactDetails,
      selectedPackages,
    } = body;

    if (!dateTime || !duration || !vehicleClass || !contactDetails) {
      return NextResponse.json(
        { error: 'Fehlende Daten für Kalendereintrag' },
        { status: 400 },
      );
    }

    // Formatiere die Beschreibung
    const description = `
Fahrzeugklasse: ${vehicleClass}
Pakete: ${selectedPackages.join(', ')}
Dauer: ${duration} Minuten
Kontakt: ${contactDetails.email} | ${contactDetails.phone}
Name: ${contactDetails.firstName} ${contactDetails.lastName}
    `.trim();

    // Berechne die Endzeit
    const startTime = new Date(dateTime);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // Erstelle den Kalendereintrag
    const calendar = await getGoogleCalendar();
    const event = await calendar.events.insert({
      calendarId: process.env.AUTH_CALENDAR_ID || 'primary',
      requestBody: {
        summary: `Fahrzeugpflege: ${vehicleClass}`,
        description,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'Europe/Berlin',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Europe/Berlin',
        },
        attendees: [{ email: contactDetails.email }],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 60 },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: event.data,
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Kalendereintrags:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Kalendereintrags' },
      { status: 500 },
    );
  }
}

/**
 * Holt die verfügbaren Zeitslots für einen bestimmten Tag.
 *
 * Diese Funktion wird verwendet, um die verfügbaren Zeitslots für einen bestimmten Tag abzurufen.
 * Sie überprüft zunächst, ob ein Datum in den Suchabfrageparametern übergeben wurde.
 * Wenn nicht, wird ein Fehler mit dem Status 400 (Ungültige Anfrage) zurückgegeben.
 *
 * Anschließend wird eine Authentifizierung mit Google Calendar erstellt und die Funktion
 * `getAvailableTimeSlots` aufgerufen, um die verfügbaren Zeitslots für den angegebenen Tag abzurufen.
 * Das Ergebnis wird dann als JSON-Antwort zurückgegeben.
 *
 * Falls ein Fehler auftritt, wird eine Fehlerantwort mit dem Status 500 (Serverfehler) zurückgegeben.
 *
 * @param {Request} request - Das eingehende HTTP-Anfrageobjekt
 * @returns {Promise<NextResponse>} - Eine Promise, die eine JSON-Antwort mit den verfügbaren Zeitslots oder einem Fehler zurückgibt
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        {
          error: {
            status: 400,
            title: 'Ungültige Anfrage',
            detail: 'Datum muss angegeben werden',
            type: 'https://httpstatuses.com/400',
          },
        },
        { status: 400 },
      );
    }
    // const auth = new JWT({
    //   email: CLIENT_EMAIL,
    //   key: PRIVATE_KEY,
    //   scopes: SCOPES,
    // });

    // Verfügbare Zeitslots abrufen
    const availableSlots = await getAvailableTimeSlots(new Date(date), []);

    return NextResponse.json({
      success: true,
      data: availableSlots,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          status: 500,
          title: 'Serverfehler',
          detail: error.message || 'Fehler bei der Verfügbarkeitsprüfung',
          type: 'https://httpstatuses.com/500',
        },
      },
      { status: 500 },
    );
  }
}
