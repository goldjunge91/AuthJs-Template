import {
  isWithinInterval,
  parseISO,
  addMinutes,
  setMinutes,
  setHours,
  eachHourOfInterval,
  addDays,
  format,
  isBefore,
  isAfter,
} from 'date-fns';
import { toLocalTime } from './time-utils';

/** Business hours configuration */
const CONFIG = {
  /** Start of business day (8:00) */
  BUSINESS_START_HOUR: 8,
  /** End of business day (18:00) */
  BUSINESS_END_HOUR: 18,
  /** Duration of each appointment in minutes */
  APPOINTMENT_DURATION: 60,
  /** Buffer time between appointments in minutes */
  BUFFER_TIME: 30,
  /** Number of days to look ahead for availability */
  DAYS_TO_CHECK: 14,
} as const;

/** Time slot interface representing an appointment slot */
export interface TimeSlot {
  /** Start time of the slot */
  start: Date;
  /** End time of the slot */
  end: Date;
  /** Formatted string representation of start time */
  formattedStart: string;
}

/** Event interface representing a calendar event */
export interface CalendarEvent {
  /** Start time of the event in ISO string format */
  start: string;
  /** End time of the event in ISO string format */
  end: string;
}

/**
 * Gets the business hours for a given date
 * @param date - The date to get business hours for
 * @returns Object containing start and end times for business hours
 */
export function getBusinessHours(date: Date): { start: Date; end: Date } {
  const localDate = toLocalTime(date);
  const businessStart = setHours(
    setMinutes(localDate, 0),
    CONFIG.BUSINESS_START_HOUR,
  );
  const businessEnd = setHours(
    setMinutes(localDate, 0),
    CONFIG.BUSINESS_END_HOUR,
  );

  return {
    start: businessStart,
    end: businessEnd,
  };
}

/**
 * Gets all available time slots for the next 14 days
 * @param startDate - The date to start checking from
 * @param existingEvents - Array of existing calendar events
 * @returns Array of available time slots
 */
export function getAvailableTimeSlots(
  startDate: Date,
  existingEvents: CalendarEvent[],
): TimeSlot[] {
  const availableSlots: TimeSlot[] = [];
  const today = new Date();

  for (let i = 0; i < CONFIG.DAYS_TO_CHECK; i++) {
    const currentDate = addDays(startDate, i);
    const { start: businessStart, end: businessEnd } =
      getBusinessHours(currentDate);

    // Skip weekends
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const hours = eachHourOfInterval({
      start: businessStart,
      end: businessEnd,
    });

    for (const hour of hours) {
      if (hour.getHours() < CONFIG.BUSINESS_END_HOUR) {
        const slotStart = hour;
        const slotEnd = addMinutes(hour, CONFIG.APPOINTMENT_DURATION);

        // Skip slots in the past
        if (isBefore(slotStart, today)) continue;

        if (isTimeSlotAvailable(slotStart, slotEnd, existingEvents)) {
          availableSlots.push({
            start: slotStart,
            end: slotEnd,
            formattedStart: format(slotStart, "dd.MM.yyyy 'um' HH:mm 'Uhr'"),
          });
        }
      }
    }
  }

  return availableSlots;
}

/**
 * Checks if a specific time slot is available
 * @param requestedStart - Start time of requested slot
 * @param requestedEnd - End time of requested slot
 * @param existingEvents - Array of existing calendar events
 * @returns Boolean indicating if the slot is available
 */
/**
 * Überprüft, ob ein gewünschter Zeitraum für eine Buchung verfügbar ist.
 *
 * @param requestedStart - Das gewünschte Startdatum und -uhrzeit der Buchung
 * @param requestedEnd - Das gewünschte Enddatum und -uhrzeit der Buchung
 * @param existingEvents - Ein Array von bestehenden Kalenderereignissen
 *
 * @returns {boolean} True, wenn der Zeitraum verfügbar ist, False wenn:
 *  - Der Zeitraum außerhalb der Geschäftszeiten liegt
 *  - Der Tag ein Wochenende ist
 *  - Es Überschneidungen mit bestehenden Terminen gibt (inkl. Pufferzeit)
 *
 * @remarks
 * Die Funktion berücksichtigt:
 *  - Geschäftszeiten
 *  - Wochenenden (Samstag und Sonntag)
 *  - Pufferzeiten vor und nach Terminen
 *  - Überschneidungen mit existierenden Terminen
 */
/**
 * Überprüft, ob der angefragte Zeit-Slot verfügbar ist.
 *
 * Diese Funktion führt eine Reihe von Prüfungen durch, um festzustellen, ob ein gewünschter
 * Buchungszeitraum (zwischen requestedStart und requestedEnd) gültig und konfliktfrei ist.
 *
 * Ablauf:
 * - Wandelt die übergebenen Zeitpunkte in lokale Zeit um.
 *   // Lokale Zeitkonvertierung für Start- und Endzeitpunkt
 * - Ermittelt die Geschäftszeiten für das angegebene Datum und stellt sicher,
 *   dass der Zeit-Slot innerhalb dieser Geschäftszeiten liegt.
 *   // Abruf und Validierung der Geschäftszeiten
 * - Prüft, ob der Tag ein Wochenende ist (Samstag oder Sonntag).
 *   // Wochenende: Verfügbarkeitsprüfung an Wochenenden
 * - Fügt einen Puffer (CONFIG.BUFFER_TIME) vor dem Start und nach dem Ende hinzu, um
 *   Überschneidungen detaillierter zu überprüfen.
 *   // Hinzufügen von Pufferzeiten vor und nach dem gewünschten Zeitraum
 * - Überprüft, ob der erweiterte Zeit-Slot mit einem bereits bestehenden Ereignis
 *   (existingEvents) kollidiert.
 *   // Konfliktprüfung: Abgleich mit existierenden Kalenderereignissen
 *
 * @param requestedStart - Der gewünschte Startzeitpunkt für den Buchungs-Slot.
 *   // Angefragte Startzeit als Date-Objekt
 * @param requestedEnd - Der gewünschte Endzeitpunkt für den Buchungs-Slot.
 *   // Angefragte Endzeit als Date-Objekt
 * @param existingEvents - Eine Liste von bestehenden Kalenderereignissen, die auf Konflikte
 *   überprüft werden sollen.
 *   // Array von CalendarEvent-Objekten zur Konfliktprüfung
 *
 * @returns true, wenn der Zeit-Slot innerhalb der Geschäftszeiten liegt, nicht an einem
 *   Wochenende ist und keine Konflikte (auch unter Einbeziehung der Pufferzeiten) mit
 *   bestehenden Ereignissen auftreten; andernfalls false.
 *   // Ergebnis: true bei Verfügbarkeit, false bei Konflikten oder ungültigen Bedingungen
 */
export function isTimeSlotAvailable(
  requestedStart: Date,
  requestedEnd: Date,
  existingEvents: CalendarEvent[],
): boolean {
  const localStart = toLocalTime(requestedStart);
  const localEnd = toLocalTime(requestedEnd);

  // Check business hours
  const { start: businessStart, end: businessEnd } =
    getBusinessHours(requestedStart);
  if (isBefore(localStart, businessStart) || isAfter(localEnd, businessEnd)) {
    return false;
  }

  // Check if day is weekend
  const dayOfWeek = localStart.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;

  // Add buffer times
  const startWithBuffer = addMinutes(localStart, -CONFIG.BUFFER_TIME);
  const endWithBuffer = addMinutes(localEnd, CONFIG.BUFFER_TIME);

  // Check conflicts with existing events
  return !existingEvents.some((event) => {
    const eventStart = toLocalTime(parseISO(event.start));
    const eventEnd = toLocalTime(parseISO(event.end));

    return (
      isWithinInterval(startWithBuffer, { start: eventStart, end: eventEnd }) ||
      isWithinInterval(endWithBuffer, { start: eventStart, end: eventEnd }) ||
      isWithinInterval(eventStart, {
        start: startWithBuffer,
        end: endWithBuffer,
      }) ||
      isWithinInterval(eventEnd, { start: startWithBuffer, end: endWithBuffer })
    );
  });
}

/**
 * Groups available time slots by date
 * @param slots - Array of time slots to group
 * @returns Object with dates as keys and arrays of time slots as values
 */
export function groupSlotsByDate(
  slots: TimeSlot[],
): Record<string, TimeSlot[]> {
  return slots.reduce(
    (groups, slot) => {
      const dateKey = format(slot.start, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(slot);
      return groups;
    },
    {} as Record<string, TimeSlot[]>,
  );
}

/**
 * Gets the next available slot after a specific time
 * @param after - Time to find next slot after
 * @param availableSlots - Array of available time slots
 * @returns The next available slot or null if none found
 */
export function getNextAvailableSlot(
  after: Date,
  availableSlots: TimeSlot[],
): TimeSlot | null {
  const localAfter = toLocalTime(after);

  return availableSlots.find((slot) => isAfter(slot.start, localAfter)) || null;
}
