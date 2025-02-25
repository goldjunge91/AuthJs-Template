import { cache } from '../../utils/redis/cache';
import { getGoogleCalendar } from '../../utils/google/google-calendar';
import { hasOverlapV2 } from './has-overlap';
import {
  CalendarEvent,
  getAvailableTimeSlots,
  groupSlotsByDate,
  TimeSlot,
} from './availability-utils';
import { toLocalTime, toUTC } from './time-utils';
import { addDays } from 'date-fns/addDays';
import { calendar_v3 } from 'googleapis';

// Typ importieren und verwenden statt einer eigenen Definition
type Schema$Event = calendar_v3.Schema$Event;

/**
 * Prüft die Verfügbarkeit eines Zeitslots
 * @param startTime - Startzeit des zu prüfenden Slots
 * @param endTime - Endzeit des zu prüfenden Slots
 * @returns True wenn der Zeitslot verfügbar ist, sonst false
 */
export async function checkTimeSlotAvailability(
  startTime: Date,
  endTime: Date,
): Promise<boolean> {
  console.log('Prüfe Verfügbarkeit für:', {
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  });

  // Füge eine Pufferzeit von 15 Minuten hinzu
  const bufferTime = 15; // Minuten
  const startWithBuffer = new Date(
    startTime.getTime() - bufferTime * 60 * 1000,
  );
  const endWithBuffer = new Date(endTime.getTime() + bufferTime * 60 * 1000);

  const cacheKey = `calendar:availability:${startTime.toISOString()}`;
  const cacheTTL = 60; // 1 Minute Cache

  return await cache(
    cacheKey,
    async () => {
      try {
        const calendar = await getGoogleCalendar();

        // Hole Termine für den ganzen Tag plus Pufferzeit
        const queryStart = new Date(startWithBuffer);
        queryStart.setHours(0, 0, 0, 0);

        const queryEnd = new Date(endWithBuffer);
        queryEnd.setHours(23, 59, 59, 999);

        console.log('Hole Termine für Zeitraum:', {
          queryStart: queryStart.toISOString(),
          queryEnd: queryEnd.toISOString(),
        });

        try {
          const response = await calendar.events.list({
            calendarId: process.env.AUTH_CALENDAR_ID || 'primary',
            timeMin: queryStart.toISOString(),
            timeMax: queryEnd.toISOString(),
            singleEvents: true,
          });

          const events = response.data.items || [];
          console.log('Gefundene Events:', events.length);

          if (events.length > 0 && events[0].summary) {
            console.log('Event-Details (erstes Event):', events[0].summary);
          }

          // Prüfe, ob der Zeitslot mit einem bestehenden Termin überlappt
          const hasConflict = events.some((event: Schema$Event) => {
            if (!event.start?.dateTime || !event.end?.dateTime) {
              return false;
            }

            const overlap = hasOverlapV2(
              startTime,
              endTime,
              event.start.dateTime,
              event.end.dateTime,
            );

            if (overlap) {
              console.log('Überlappung gefunden mit:', {
                event: event.summary || 'Unbenannter Termin',
                eventStart: event.start.dateTime,
                eventEnd: event.end.dateTime,
              });
            }

            return overlap;
          });

          return !hasConflict;
        } catch (error) {
          console.error('Fehler bei der Kalenderabfrage:', error);
          // Bei Fehler zur Sicherheit als nicht verfügbar markieren
          return false;
        }
      } catch (error) {
        console.error('Fehler bei der Verfügbarkeitsprüfung:', error);
        // Bei Fehler zur Sicherheit als nicht verfügbar markieren
        return false;
      }
    },
    cacheTTL,
  );
}

/**
 * Service module for checking calendar availability
 * @module check-time-slot-availability
 */

/** Calendar configuration */
const CONFIG = {
  /** Calendar ID from environment variables */
  CALENDAR_ID: process.env.AUTH_CALENDAR_ID,
  /** Cache duration in seconds */
  CACHE_TTL: 5 * 60,
  /** Number of days to look ahead */
  DAYS_AHEAD: 14,
} as const;

/** Response interface for availability check */
interface AvailabilityResponse {
  /** Array of available time slots */
  availableSlots: TimeSlot[];
  /** Available slots grouped by date */
  slotsByDate: Record<string, TimeSlot[]>;
  /** Start of the checked period */
  periodStart: Date;
  /** End of the checked period */
  periodEnd: Date;
}

export async function getAvailabilityForNext14Days(
  startDate: Date = new Date(),
): Promise<AvailabilityResponse> {
  if (!CONFIG.CALENDAR_ID) {
    throw new Error('Calendar ID not configured');
  }

  const cacheKey = `calendar:availability:14days:${startDate.toISOString()}`;

  return await cache(
    cacheKey,
    async () => {
      try {
        const calendar = await getGoogleCalendar();
        const localStart = toLocalTime(startDate);
        const periodEnd = addDays(localStart, CONFIG.DAYS_AHEAD);

        // Fetch events from calendar
        const response = await calendar.events.list({
          calendarId: CONFIG.CALENDAR_ID,
          timeMin: toUTC(localStart).toISOString(),
          timeMax: toUTC(periodEnd).toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        });

        // Transform events to internal format
        const events: CalendarEvent[] = (response.data.items || [])
          .filter(
            (event: Schema$Event) =>
              event.start?.dateTime && event.end?.dateTime,
          )
          .map((event: Schema$Event) => ({
            start: event.start!.dateTime!,
            end: event.end!.dateTime!,
          }));

        // Get available slots
        const availableSlots = getAvailableTimeSlots(startDate, events);

        return {
          availableSlots,
          slotsByDate: groupSlotsByDate(availableSlots),
          periodStart: startDate,
          periodEnd,
        };
      } catch (error) {
        console.error('14-day availability check failed:', error);
        throw new Error('Failed to check availability');
      }
    },
    CONFIG.CACHE_TTL,
  );
}
