import { hasOverlap } from './has-overlap';
import { cache } from '@/utils/redis/cache';
import { getGoogleCalendar } from '@/utils/google/google-calendar';

export async function checkTimeSlotAvailability(
  startTime: Date,
  endTime: Date,
) {
  console.log('🔍 checkTimeSlotAvailability: Prüfe Verfügbarkeit für:', {
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  });
  const cacheKey = `calendar:availability:${startTime.toISOString()}`;

  return cache(
    cacheKey,
    async () => {
      try {
        console.log('🔄 Initialisiere Google Calendar Client...');
        const calendar = await getGoogleCalendar();
        console.log('✅ Google Calendar Client erfolgreich initialisiert');

        const dayStart = new Date(startTime);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(startTime);
        dayEnd.setHours(23, 59, 59, 999);

        console.log('📅 Hole Termine für:', {
          dayStart: dayStart.toISOString(),
          dayEnd: dayEnd.toISOString(),
          calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        });

        const response = await calendar.events.list({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          timeMin: dayStart.toISOString(),
          timeMax: dayEnd.toISOString(),
          singleEvents: true,
        });

        const events = response.data.items || [];
        console.log(`✅ Gefundene Events: ${events.length}`);

        if (events.length > 0) {
          console.log('📋 Erste 3 Events (oder weniger):');
          events.slice(0, 3).forEach((event, index) => {
            console.log(`  Event ${index + 1}:`, {
              summary: event.summary,
              start: event.start?.dateTime || event.start?.date,
              end: event.end?.dateTime || event.end?.date,
            });
          });
        }

        console.log('🔄 Prüfe auf Terminüberschneidungen...');
        const hasConflict = events.some((event) => {
          if (!event.start?.dateTime || !event.end?.dateTime) {
            console.log(`⚠️ Event ohne Start/End-Zeit übersprungen:`, {
              summary: event.summary,
              start: event.start,
              end: event.end,
            });
            return false;
          }

          const conflict = hasOverlap(
            startTime,
            endTime,
            event.start.dateTime,
            event.end.dateTime,
          );

          if (conflict) {
            console.log(`⚠️ Konflikt gefunden mit Event:`, {
              summary: event.summary,
              start: event.start.dateTime,
              end: event.end.dateTime,
            });
          }

          return conflict;
        });

        console.log(
          `✅ Verfügbarkeitsprüfung abgeschlossen: ${!hasConflict ? 'Verfügbar' : 'Nicht verfügbar'}`,
        );
        return !hasConflict;
      } catch (error: unknown) {
        console.error('❌ Fehler bei der Verfügbarkeitsprüfung:', error);
        if (
          error &&
          typeof error === 'object' &&
          'response' in error &&
          error.response &&
          typeof error.response === 'object' &&
          'data' in error.response
        ) {
          console.error('❌ API-Fehlerantwort:', error.response.data);
        }
        throw error;
      }
    },
    60,
  );
}
