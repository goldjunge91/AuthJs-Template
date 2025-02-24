import { toLocalTime } from '@/actions/booking/time-utils';
import { isWithinInterval, parseISO } from 'date-fns';

export async function hasOverlap(
  start: Date,
  end: Date,
  eventStart: string,
  eventEnd: string,
): Promise<boolean> {
  const eventStartDate = parseISO(eventStart);
  const eventEndDate = parseISO(eventEnd);

  return (
    isWithinInterval(start, { start: eventStartDate, end: eventEndDate }) ||
    isWithinInterval(end, { start: eventStartDate, end: eventEndDate }) ||
    isWithinInterval(eventStartDate, { start, end }) ||
    isWithinInterval(eventEndDate, { start, end })
  );
}

/**
 * Checks if a specific time slot overlaps with an existing event
 * @param requestedStart - Start time to check
 * @param requestedEnd - End time to check
 * @param eventStart - Event start time (ISO string)
 * @param eventEnd - Event end time (ISO string)
 * @returns Boolean indicating if there is an overlap
 */
export function hasOverlapV2(
  requestedStart: Date,
  requestedEnd: Date,
  eventStart: string,
  eventEnd: string,
): boolean {
  // Convert event times to local timezone
  const eventStartDate = toLocalTime(parseISO(eventStart));
  const eventEndDate = toLocalTime(parseISO(eventEnd));

  const localStart = toLocalTime(requestedStart);
  const localEnd = toLocalTime(requestedEnd);

  // Check all possible overlap scenarios
  return (
    isWithinInterval(localStart, {
      start: eventStartDate,
      end: eventEndDate,
    }) ||
    isWithinInterval(localEnd, { start: eventStartDate, end: eventEndDate }) ||
    isWithinInterval(eventStartDate, { start: localStart, end: localEnd }) ||
    isWithinInterval(eventEndDate, { start: localStart, end: localEnd })
  );
}
