import { NextResponse } from 'next/server';
// import { JWT } from 'google-auth-library';
import { BookingState } from '../../../booking/_lib/_store/state-store';
import { getAvailableTimeSlots } from '../../../../actions/booking/availability-utils';
import { toUTC } from '@/actions/booking/time-utils';
import { getGoogleCalendar } from '../../../../utils/google/get-google-calendar';

const CALENDAR_ID = process.env.AUTH_CALENDAR_ID;
const PRIVATE_KEY = process.env.AUTH_PRIVATE_KEY?.replace(/\\n/g, '\n');
const CLIENT_EMAIL = process.env.AUTH_CLIENT_EMAIL;
// const SCOPES = ['https://www.googleapis.com/auth/calendar'];

if (!CALENDAR_ID || !PRIVATE_KEY || !CLIENT_EMAIL) {
  throw new Error(
    'Google Calendar Konfiguration fehlt in den Umgebungsvariablen',
  );
}
export async function POST(request: Request) {
  try {
    // Parse the JSON body from the incoming request.
    // bookingData contains all the necessary booking information (customer details, vehicle information, etc.).
    const bookingData: BookingState = await request.json();

    // Get an authenticated Google Calendar client.
    const calendar = await getGoogleCalendar();

    // Create the event object with all necessary details.
    // The summary shows the vehicle class.
    // The description concatenates customer details, address, vehicle info, and selected packages.
    // The location is derived from the customer's address.
    // The start time is converted to UTC and formatted as an ISO string.
    // The end time is calculated by adding the duration (in minutes) to the booking date/time.
    const event = {
      summary: `Fahrzeugaufbereitung - ${bookingData.vehicleClass}`,
      description: `
Kunde: ${bookingData.contactDetails.firstName} ${bookingData.contactDetails.lastName}
Email: ${bookingData.contactDetails.email}
Telefon: ${bookingData.contactDetails.phone}

Adresse:
		${bookingData.contactDetails.street} ${bookingData.contactDetails.number}
		${bookingData.contactDetails.postalCode} ${bookingData.contactDetails.city}

Fahrzeug: ${bookingData.vehicleClass}
Pakete: ${bookingData.selectedPackages.join(', ')}
			`.trim(),
      location: `${bookingData.contactDetails.street} ${bookingData.contactDetails.number}, ${bookingData.contactDetails.postalCode} ${bookingData.contactDetails.city}`,
      start: {
        // Convert the provided booking date/time to a Date, then to UTC and format it as ISO.
        dateTime: toUTC(new Date(bookingData.dateTime!)).toISOString(),
        // Specify the calendar's time zone.
        timeZone: 'Europe/Berlin',
      },
      end: {
        // Calculate the end time by adding the duration (converted from minutes to milliseconds) to the start time.
        dateTime: new Date(
          new Date(bookingData.dateTime!).getTime() +
            bookingData.duration * 60000,
        ).toISOString(),
        timeZone: 'Europe/Berlin',
      },
    };

    // Insert the event into Google Calendar using the specific calendar ID.
    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: event,
    });

    // Return a successful JSON response including the data from the calendar event creation.
    return NextResponse.json(
      {
        success: true,
        data: response.data,
        message: 'Termin erfolgreich erstellt',
      },
      { status: 201 },
    );
  } catch (error: any) {
    // Log the error for debugging purposes.
    console.error('Fehler beim Erstellen des Termins:', error);
    // Return a JSON error response with status 500.
    return NextResponse.json(
      {
        error: {
          status: 500,
          title: 'Serverfehler',
          detail: error.message || 'Fehler bei der Terminerstellung',
          type: 'https://httpstatuses.com/500',
        },
      },
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
