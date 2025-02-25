import { calendar_v3, google } from 'googleapis';

// Funktion zum Abrufen eines authentifizierten Google Calendar-Clients
export async function getGoogleCalendar(): Promise<calendar_v3.Calendar> {
  try {
    // OAuth2-Client erstellen
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    // Calendar-API mit Auth-Client initialisieren
    const calendar = google.calendar({ version: 'v3', auth });

    return calendar;
  } catch (error) {
    console.error(
      'Fehler beim Initialisieren des Google Calendar-Clients:',
      error,
    );
    throw error;
  }
}
