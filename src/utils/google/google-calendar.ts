'use server';
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';
// import { getValidAccessToken } from './get-auth-tokens';

// Konfigurationsvariablen
const CONFIG = {
  // Kalender-ID
  CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID || process.env.AUTH_CALENDAR_ID,

  // JWT Authentifizierung (für Service Account)
  JWT: {
    PRIVATE_KEY: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
    SCOPES: ['https://www.googleapis.com/auth/calendar'],
  },

  // API Key Authentifizierung (nur für Lesezugriff)
  API_KEY: process.env.GOOGLE_API_KEY || process.env.API_KEY,
};

// Variable, um OpenSSL-Fehler zu verfolgen und Fallbacks zu aktivieren
let useApiKeyFallback = false;

/**
 * Initialisiert und gibt einen Google Calendar-Client zurück
 * Versucht verschiedene Authentifizierungsmethoden in dieser Reihenfolge:
 * 1. JWT (Service Account) - voller Zugriff
 * 2. API Key - nur Lesezugriff
 */
export async function getGoogleCalendar() {
  console.log('Initialisiere Google Calendar Client...');

  if (!CONFIG.CALENDAR_ID) {
    throw new Error('Calendar ID nicht konfiguriert');
  }

  // Versuche JWT (Service Account) Authentifizierung
  if (!useApiKeyFallback && CONFIG.JWT.PRIVATE_KEY && CONFIG.JWT.CLIENT_EMAIL) {
    try {
      console.log('Versuche JWT-Authentifizierung (Service Account)...');
      const calendar = await getGoogleCalendarWithJWT();
      return calendar;
    } catch (error: unknown) {
      console.warn(
        'JWT-Authentifizierung fehlgeschlagen:',
        error instanceof Error ? error.message : 'Unbekannter Fehler',
      );

      // Prüfe auf OpenSSL-Fehler
      if (isOpenSSLError(error)) {
        console.warn('OpenSSL-Fehler erkannt, aktiviere Fallback');
        useApiKeyFallback = true;
      }
    }
  }

  // Fallback auf API Key (nur Lesezugriff)
  if (CONFIG.API_KEY) {
    console.log('Verwende API-Key Authentifizierung (nur Lesezugriff)...');
    return getGoogleCalendarWithApiKey();
  }

  throw new Error(
    'Keine Authentifizierungsmethode für Google Calendar verfügbar',
  );
}

/**
 * Initialisiert einen Google Calendar-Client mit JWT (Service Account)
 */
async function getGoogleCalendarWithJWT() {
  console.log('Calendar ID:', CONFIG.CALENDAR_ID);
  console.log('Client Email:', CONFIG.JWT.CLIENT_EMAIL);

  const auth = new JWT({
    email: CONFIG.JWT.CLIENT_EMAIL,
    key: CONFIG.JWT.PRIVATE_KEY,
    scopes: CONFIG.JWT.SCOPES,
  });

  // JWT-Authentifizierung testen
  const tokens = await auth.authorize();
  console.log(
    'Google Auth erfolgreich:',
    tokens ? 'Token erhalten' : 'Keine Tokens',
  );

  const calendar = google.calendar({ version: 'v3', auth });

  // Teste Kalenderzugriff
  await testCalendarAccess(calendar, CONFIG.CALENDAR_ID || '');

  console.log('Google Calendar Client mit JWT erfolgreich initialisiert');
  return calendar;
}

/**
 * Initialisiert einen Google Calendar-Client mit API-Key (nur Lesezugriff)
 */
function getGoogleCalendarWithApiKey() {
  if (!CONFIG.API_KEY) {
    throw new Error('Kein API-Schlüssel für Google Calendar konfiguriert');
  }

  console.log('Calendar ID (API Key):', CONFIG.CALENDAR_ID);

  const calendar = google.calendar({
    version: 'v3',
    auth: CONFIG.API_KEY,
  });

  console.log(
    'Google Calendar Client mit API-Schlüssel initialisiert (nur Lesezugriff)',
  );
  return calendar;
}

/**
 * Testet den Zugriff auf einen Kalender
 */
async function testCalendarAccess(calendar: any, calendarId: string) {
  try {
    console.log(`Teste Zugriff auf Kalender: ${calendarId}`);

    // Teste den Zugriff durch Abrufen eines einzelnen Ereignisses
    await calendar.events.list({
      calendarId: calendarId,
      maxResults: 1,
      timeMin: new Date().toISOString(),
    });

    console.log('Kalender-Zugriff erfolgreich: Abruf von Ereignissen möglich');
    return true;
  } catch (error: unknown) {
    console.warn(
      `Kalender-Zugriffsfehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
    );

    // Bei 404-Fehler: Kalender nicht gefunden
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'status' in error.response &&
      error.response.status === 404
    ) {
      throw new Error(
        `Kalender mit ID '${calendarId}' nicht gefunden oder keine Berechtigung`,
      );
    }

    // Bei anderen Fehlern, werfen wir den Fehler weiter
    throw error;
  }
}

/**
 * Prüft, ob ein Fehler ein OpenSSL-Fehler ist
 */
function isOpenSSLError(error: unknown): boolean {
  if (
    !error ||
    typeof error !== 'object' ||
    !('message' in error) ||
    typeof error.message !== 'string'
  )
    return false;

  return (
    error.message.includes('ERR_OSSL_') ||
    error.message.includes('DECODER routines') ||
    error.message.includes('unsupported')
  );
}
