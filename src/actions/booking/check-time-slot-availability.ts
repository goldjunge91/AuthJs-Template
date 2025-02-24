import { cache } from '../../utils/redis/redis-cache-component';
import { getGoogleCalendar } from '../../utils/google/get-google-calendar';
import { hasOverlap } from './has-overlap';
import { addDays } from 'date-fns';
import { toUTC, toLocalTime } from './time-utils';
import {
  getAvailableTimeSlots,
  TimeSlot,
  CalendarEvent,
  groupSlotsByDate,
} from './availability-utils';

export async function checkTimeSlotAvailability(
  startTime: Date,
  endTime: Date,
) {
  console.log('Prüfe Verfügbarkeit für:', { startTime, endTime });
  const cacheKey = `calendar:availability:${startTime.toISOString()}`;

  return await cache(
    cacheKey,
    async () => {
      try {
        const calendar = await getGoogleCalendar();

        const dayStart = new Date(startTime);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(startTime);
        dayEnd.setHours(23, 59, 59, 999);

        console.log('Hole Termine für:', { dayStart, dayEnd });
        const response = await calendar.events.list({
          calendarId: process.env.AUTH_CALENDAR_ID,
          timeMin: dayStart.toISOString(),
          timeMax: dayEnd.toISOString(),
          singleEvents: true,
        });

        const events = response.data.items || [];
        console.log('Gefundene Events:', events.length);

        const hasConflict = events.some((event) => {
          if (!event.start?.dateTime || !event.end?.dateTime) return false;
          return hasOverlap(
            startTime,
            endTime,
            event.start.dateTime,
            event.end.dateTime,
          );
        });

        return !hasConflict;
      } catch (error) {
        console.error('Fehler bei der Verfügbarkeitsprüfung:', error);
        throw error;
      }
    },
    60,
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

/**
 * Checks availability for time slots over the next 14 days
 * @param startDate - Optional start date, defaults to current date
 * @returns Promise resolving to availability information
 * @throws Error if calendar is not configured or check fails
 */
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
          .filter((event) => event.start?.dateTime && event.end?.dateTime)
          .map((event) => ({
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
