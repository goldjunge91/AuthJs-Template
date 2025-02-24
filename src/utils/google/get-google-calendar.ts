'use server';
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';

const CALENDAR_ID = process.env.AUTH_CALENDAR_ID;
const PRIVATE_KEY = process.env.AUTH_PRIVATE_KEY?.replace(/\\n/g, '\n');
const CLIENT_EMAIL = process.env.AUTH_CLIENT_EMAIL;
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

if (!CALENDAR_ID || !PRIVATE_KEY || !CLIENT_EMAIL) {
  throw new Error(
    'Google Calendar Konfiguration fehlt in den Umgebungsvariablen',
  );
}

export async function getGoogleCalendar() {
  console.log('Initialisiere Google Calendar Client...');

  console.log('Calendar ID:', CALENDAR_ID);

  console.log('Client Email:', CLIENT_EMAIL);
  try {
    const auth = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: SCOPES,
    });

    // Test auth
    const tokens = await auth.authorize();

    console.log('Google Auth erfolgreich:', tokens);
    const calendar = google.calendar({ version: 'v3', auth });
    try {
      // Erst liste alle verfügbaren Kalender
      const calendars = await calendar.calendarList.list();

      console.log(
        'Verfügbare Kalender:',
        calendars.data.items?.map((cal) => ({
          id: cal.id,
          summary: cal.summary,
        })),
      );
      // Dann versuche den spezifischen Kalender zu erreichen
      const calendarInfo = await calendar.calendars.get({
        calendarId: CALENDAR_ID,
      });
      console.log('Calendar Info:', calendarInfo.data);
      console.log('Calendar Zugriff erfolgreich getestet');
    } catch (error: any) {
      console.error('Calendar Zugriff fehlgeschlagen:', error);
      if (error.response) {
        console.error('Error Response:', error.response.data);
      }
      throw error;
    }

    console.log('Google Calendar Client erfolgreich initialisiert');
    return calendar;
  } catch (error: any) {
    console.error(
      'Fehler beim Initialisieren des Google Calendar Clients:',
      error,
    );
    if (error.response) {
      console.error('Error Response:', error.response.data);
    }
    throw error;
  }
}
