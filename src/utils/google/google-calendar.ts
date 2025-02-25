'use server';
import { JWT, OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
// import { getValidAccessToken } from './get-auth-tokens';
import { cookies } from 'next/headers';

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

  // OAuth2 Authentifizierung (für Benutzerkonten)
  OAUTH2: {
    CLIENT_ID: process.env.AUTH_GOOGLE_ID,
    CLIENT_SECRET: process.env.AUTH_GOOGLE_SECRET,
  },

  // API Key Authentifizierung (nur für Lesezugriff)
  API_KEY: process.env.GOOGLE_API_KEY || process.env.API_KEY,
};

// Variable, um OpenSSL-Fehler zu verfolgen und Fallbacks zu aktivieren
let useApiKeyFallback = false;

// Konfiguration
const REDIRECT_URI =
  process.env.AUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

// Cookie-Namen
const ACCESS_TOKEN_COOKIE = 'google_access_token';
const REFRESH_TOKEN_COOKIE = 'google_refresh_token';
const TOKEN_EXPIRY_COOKIE = 'google_token_expiry';

/**
 * Initialisiert und gibt einen Google Calendar-Client zurück
 * Versucht verschiedene Authentifizierungsmethoden in dieser Reihenfolge:
 * 1. JWT (Service Account) - voller Zugriff
 * 2. OAuth2 (Benutzerkonto) - voller Zugriff
 * 3. API Key - nur Lesezugriff
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

  // Versuche OAuth2 (Benutzerkonto) Authentifizierung
  if (CONFIG.OAUTH2.CLIENT_ID && CONFIG.OAUTH2.CLIENT_SECRET) {
    try {
      console.log('Versuche OAuth2-Authentifizierung (Benutzerkonto)...');
      const calendar = await getGoogleCalendarWithOAuth2();
      return calendar;
    } catch (error: unknown) {
      console.warn(
        'OAuth2-Authentifizierung fehlgeschlagen:',
        error instanceof Error ? error.message : 'Unbekannter Fehler',
      );
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
 * Initialisiert einen Google Calendar-Client mit OAuth2 (Benutzerkonto)
 */
async function getGoogleCalendarWithOAuth2() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    throw new Error(
      'Nicht authentifiziert bei Google. Bitte zuerst authentifizieren.',
    );
  }

  const oauth2Client = new OAuth2Client({
    clientId: CONFIG.OAUTH2.CLIENT_ID,
    clientSecret: CONFIG.OAUTH2.CLIENT_SECRET,
  });

  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // Teste Kalenderzugriff
  await testCalendarAccess(calendar, CONFIG.CALENDAR_ID || '');

  console.log('Google Calendar Client mit OAuth2 erfolgreich initialisiert');
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

/**
 * Erstellt einen OAuth2-Client
 */
function getOAuth2Client() {
  if (!CONFIG.OAUTH2.CLIENT_ID || !CONFIG.OAUTH2.CLIENT_SECRET) {
    throw new Error(
      'Google OAuth Konfiguration fehlt (CLIENT_ID oder CLIENT_SECRET)',
    );
  }

  return new OAuth2Client({
    clientId: CONFIG.OAUTH2.CLIENT_ID,
    clientSecret: CONFIG.OAUTH2.CLIENT_SECRET,
    redirectUri: REDIRECT_URI,
  });
}

/**
 * Generiert eine Authentifizierungs-URL für Google OAuth
 */
export async function getAuthUrl() {
  const oauth2Client = getOAuth2Client();

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Immer nach Refresh-Token fragen
  });
}

/**
 * Tauscht den Auth-Code gegen Tokens aus
 */
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuth2Client();

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('Kein Access-Token erhalten');
    }

    // Tokens in Cookies speichern
    const cookieStore = await cookies();

    await cookieStore.set({
      name: ACCESS_TOKEN_COOKIE,
      value: tokens.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    if (tokens.refresh_token) {
      await cookieStore.set({
        name: REFRESH_TOKEN_COOKIE,
        value: tokens.refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        // Refresh-Token länger gültig halten
        maxAge: 60 * 60 * 24 * 30, // 30 Tage
      });
    }

    if (tokens.expiry_date) {
      await cookieStore.set({
        name: TOKEN_EXPIRY_COOKIE,
        value: tokens.expiry_date.toString(),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });
    }

    return tokens;
  } catch (error) {
    console.error('Fehler beim Token-Austausch:', error);
    throw error;
  }
}

/**
 * Prüft, ob ein gültiges Access-Token vorhanden ist und aktualisiert es bei Bedarf
 */
export async function getValidAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = await cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = await cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const tokenExpiry = await cookieStore.get(TOKEN_EXPIRY_COOKIE)?.value;

  // Wenn kein Access-Token vorhanden ist
  if (!accessToken) {
    console.log('Kein Access-Token gefunden');
    return null;
  }

  // Wenn das Token noch gültig ist
  if (tokenExpiry && Date.now() < parseInt(tokenExpiry) - 60000) {
    console.log('Access-Token ist noch gültig');
    return accessToken;
  }

  // Token ist abgelaufen, aber Refresh-Token vorhanden
  if (refreshToken) {
    try {
      console.log('Token abgelaufen, versuche Refresh');
      const oauth2Client = getOAuth2Client();
      oauth2Client.setCredentials({ refresh_token: refreshToken });

      const { credentials } = await oauth2Client.refreshAccessToken();

      if (credentials.access_token) {
        // Neues Access-Token speichern
        await cookieStore.set({
          name: ACCESS_TOKEN_COOKIE,
          value: credentials.access_token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
        });

        // Neue Ablaufzeit speichern
        if (credentials.expiry_date) {
          await cookieStore.set({
            name: TOKEN_EXPIRY_COOKIE,
            value: credentials.expiry_date.toString(),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
          });
        }

        console.log('Access-Token erfolgreich aktualisiert');
        return credentials.access_token;
      }
    } catch (error) {
      console.error('Fehler beim Token-Refresh:', error);
      // Cookies löschen bei Refresh-Fehler
      await cookieStore.delete(ACCESS_TOKEN_COOKIE);
      await cookieStore.delete(REFRESH_TOKEN_COOKIE);
      await cookieStore.delete(TOKEN_EXPIRY_COOKIE);
    }
  }

  console.log('Kein gültiges Token verfügbar');
  return null;
}

/**
 * Löscht alle Auth-Cookies
 */
export async function clearAuthTokens(): Promise<void> {
  const cookieStore = await cookies();
  await cookieStore.delete(ACCESS_TOKEN_COOKIE);
  await cookieStore.delete(REFRESH_TOKEN_COOKIE);
  await cookieStore.delete(TOKEN_EXPIRY_COOKIE);
}

/**
 * Prüft, ob der Benutzer authentifiziert ist
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const accessToken = await cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  return !!accessToken;
}
