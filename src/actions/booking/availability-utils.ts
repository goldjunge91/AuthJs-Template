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
  isEqual,
  startOfDay,
  getDay,
} from 'date-fns';
import { toLocalTime } from './time-utils';

/**
 * Hilfsfunktion für einheitliches Logging
 * @param message - Die Nachricht, die geloggt werden soll
 * @param data - Optionale Daten, die mit geloggt werden sollen
 * @param debug - Flag, ob geloggt werden soll
 */
function debugLog(message: string, data?: any, debug: boolean = false) {
  if (!debug) return;

  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [availability-utils] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

/**
 * Formatiert ein Datum für die Anzeige
 * @param date - Das zu formatierende Datum
 * @returns Formatierter String
 */
function formatDateForDebug(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS");
}

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
  /** Days of the week that are available (0 = Sunday, 1 = Monday, ...) */
  AVAILABLE_DAYS: [1, 2, 3, 4, 5], // Montag bis Freitag
} as const;

/** Time slot interface representing an appointment slot */
export interface TimeSlot {
  /** Start time of the slot */
  start: Date;
  /** End time of the slot */
  end: Date;
  /** Formatted string representation of start time */
  formattedStart: string;
  /** Whether the slot is available */
  isAvailable?: boolean;
}

/** Event interface representing a calendar event */
export interface CalendarEvent {
  /** Start time of the event in ISO string format */
  start: string;
  /** End time of the event in ISO string format */
  end: string;
  /** Optional summary of the event */
  summary?: string;
}

/**
 * Gets the business hours for a given date
 * @param date - The date to get business hours for
 * @param startHour - Optional custom start hour
 * @param endHour - Optional custom end hour
 * @param debug - Optional debug flag
 * @returns Object containing start and end times for business hours
 */
export function getBusinessHours(
  date: Date,
  startHour: number = CONFIG.BUSINESS_START_HOUR,
  endHour: number = CONFIG.BUSINESS_END_HOUR,
  debug: boolean = false,
): { start: Date; end: Date } {
  const localDate = toLocalTime(date);
  const businessStart = setHours(setMinutes(localDate, 0), startHour);
  const businessEnd = setHours(setMinutes(localDate, 0), endHour);

  debugLog(
    `Geschäftszeiten für ${formatDateForDebug(date)}:`,
    {
      startHour,
      endHour,
      businessStart: formatDateForDebug(businessStart),
      businessEnd: formatDateForDebug(businessEnd),
    },
    debug,
  );

  return {
    start: businessStart,
    end: businessEnd,
  };
}

/**
 * Checks if a date is a business day
 * @param date - The date to check
 * @param debug - Optional debug flag
 * @returns True if the date is a business day, false otherwise
 */
export function isBusinessDay(date: Date, debug: boolean = false): boolean {
  const dayOfWeek = getDay(date);
  const isBusinessDay = CONFIG.AVAILABLE_DAYS.includes(
    dayOfWeek as 1 | 2 | 3 | 4 | 5,
  );

  debugLog(
    `Prüfe, ob ${formatDateForDebug(date)} ein Geschäftstag ist:`,
    {
      dayOfWeek,
      availableDays: CONFIG.AVAILABLE_DAYS,
      isBusinessDay,
    },
    debug,
  );

  return isBusinessDay;
}

/**
 * Gets all available time slots for the next X days
 * @param startDate - The date to start checking from
 * @param existingEvents - Array of existing calendar events
 * @param options - Optional configuration options
 * @returns Array of available time slots
 */
export function getAvailableTimeSlots(
  startDate: Date,
  existingEvents: CalendarEvent[],
  options?: {
    daysToCheck?: number;
    startHour?: number;
    endHour?: number;
    appointmentDuration?: number;
    bufferTime?: number;
    availableDays?: number[];
    debug?: boolean;
  },
): TimeSlot[] {
  const daysToCheck = options?.daysToCheck ?? CONFIG.DAYS_TO_CHECK;
  const startHour = options?.startHour ?? CONFIG.BUSINESS_START_HOUR;
  const endHour = options?.endHour ?? CONFIG.BUSINESS_END_HOUR;
  const appointmentDuration =
    options?.appointmentDuration ?? CONFIG.APPOINTMENT_DURATION;
  const bufferTime = options?.bufferTime ?? CONFIG.BUFFER_TIME;
  const availableDays = options?.availableDays ?? CONFIG.AVAILABLE_DAYS;
  const debug = options?.debug ?? false;

  debugLog(
    `Suche verfügbare Zeitslots ab ${formatDateForDebug(startDate)}:`,
    {
      daysToCheck,
      startHour,
      endHour,
      appointmentDuration,
      bufferTime,
      availableDays,
      existingEventsCount: existingEvents.length,
    },
    debug,
  );

  const availableSlots: TimeSlot[] = [];
  const today = new Date();
  const todayStart = startOfDay(today);

  // Konvertiere existierende Events in ein Format, das einfacher zu verarbeiten ist
  const parsedEvents = existingEvents.map((event) => ({
    start: toLocalTime(parseISO(event.start)),
    end: toLocalTime(parseISO(event.end)),
    summary: event.summary,
  }));

  debugLog(
    `Verarbeite ${parsedEvents.length} Events:`,
    {
      parsedEvents: parsedEvents.map((e) => ({
        start: formatDateForDebug(e.start),
        end: formatDateForDebug(e.end),
        summary: e.summary,
      })),
    },
    debug,
  );

  for (let i = 0; i < daysToCheck; i++) {
    const currentDate = addDays(startDate, i);
    const currentDateStart = startOfDay(currentDate);

    debugLog(
      `Prüfe Tag ${i + 1}/${daysToCheck}: ${formatDateForDebug(currentDate)}`,
      undefined,
      debug,
    );

    // Überspringe Tage in der Vergangenheit
    if (isBefore(currentDateStart, todayStart)) {
      debugLog(
        `Überspringe Tag in der Vergangenheit: ${formatDateForDebug(currentDate)}`,
        undefined,
        debug,
      );
      continue;
    }

    // Überspringe Wochenenden oder nicht-verfügbare Tage
    const dayOfWeek = getDay(currentDate);
    if (!availableDays.includes(dayOfWeek as 1 | 2 | 3 | 4 | 5)) {
      debugLog(
        `Überspringe nicht-verfügbaren Tag (Wochentag ${dayOfWeek}): ${formatDateForDebug(currentDate)}`,
        undefined,
        debug,
      );
      continue;
    }

    const { start: businessStart, end: businessEnd } = getBusinessHours(
      currentDate,
      startHour,
      endHour,
      debug,
    );

    // Generiere stündliche Slots innerhalb der Geschäftszeiten
    const hours = eachHourOfInterval({
      start: businessStart,
      end: businessEnd,
    });

    debugLog(
      `Generiere ${hours.length} stündliche Slots für ${formatDateForDebug(currentDate)}`,
      undefined,
      debug,
    );

    for (const hour of hours) {
      // Überspringe den letzten Slot, wenn er zu nahe am Ende der Geschäftszeit liegt
      if (hour.getHours() >= endHour) {
        debugLog(
          `Überspringe Slot am Ende der Geschäftszeit: ${formatDateForDebug(hour)}`,
          undefined,
          debug,
        );
        continue;
      }

      const slotStart = hour;
      const slotEnd = addMinutes(hour, appointmentDuration);

      debugLog(
        `Prüfe Slot ${formatDateForDebug(slotStart)} - ${formatDateForDebug(slotEnd)}`,
        undefined,
        debug,
      );

      // Überspringe Slots in der Vergangenheit
      if (isBefore(slotStart, today)) {
        debugLog(
          `Überspringe Slot in der Vergangenheit: ${formatDateForDebug(slotStart)}`,
          undefined,
          debug,
        );
        continue;
      }

      // Überspringe Slots, die zu nahe an der aktuellen Zeit liegen (für heute)
      if (
        isEqual(startOfDay(slotStart), todayStart) &&
        isBefore(slotStart, addMinutes(today, bufferTime))
      ) {
        debugLog(
          `Überspringe Slot zu nahe an aktueller Zeit: ${formatDateForDebug(slotStart)}`,
          {
            currentTime: formatDateForDebug(today),
            minimumTime: formatDateForDebug(addMinutes(today, bufferTime)),
          },
          debug,
        );
        continue;
      }

      const isAvailable = isTimeSlotAvailable(
        slotStart,
        slotEnd,
        parsedEvents,
        { bufferTime, debug },
      );

      debugLog(
        `Slot ${formatDateForDebug(slotStart)} - ${formatDateForDebug(slotEnd)} ist ${isAvailable ? 'verfügbar' : 'nicht verfügbar'}`,
        undefined,
        debug,
      );

      availableSlots.push({
        start: slotStart,
        end: slotEnd,
        formattedStart: format(slotStart, "dd.MM.yyyy 'um' HH:mm 'Uhr'"),
        isAvailable,
      });
    }
  }

  debugLog(
    `Insgesamt ${availableSlots.length} Slots gefunden, davon ${availableSlots.filter((s) => s.isAvailable).length} verfügbar`,
    undefined,
    debug,
  );

  return availableSlots;
}

/**
 * Checks if a time slot is available
 * @param requestedStart - Start time of the requested slot
 * @param requestedEnd - End time of the requested slot
 * @param existingEvents - Array of existing calendar events
 * @param options - Optional configuration options
 * @returns True if the time slot is available, false otherwise
 */
export function isTimeSlotAvailable(
  requestedStart: Date,
  requestedEnd: Date,
  existingEvents: { start: Date; end: Date; summary?: string }[],
  options?: {
    bufferTime?: number;
    debug?: boolean;
  },
): boolean {
  const bufferTime = options?.bufferTime ?? CONFIG.BUFFER_TIME;
  const debug = options?.debug ?? false;
  const localStart = toLocalTime(requestedStart);
  const localEnd = toLocalTime(requestedEnd);

  debugLog(
    `Prüfe Verfügbarkeit für Slot ${formatDateForDebug(localStart)} - ${formatDateForDebug(localEnd)}`,
    {
      bufferTime,
      existingEventsCount: existingEvents.length,
    },
    debug,
  );

  // Prüfe Geschäftszeiten
  const { start: businessStart, end: businessEnd } = getBusinessHours(
    requestedStart,
    undefined,
    undefined,
    debug,
  );
  if (isBefore(localStart, businessStart) || isAfter(localEnd, businessEnd)) {
    debugLog(
      `Slot liegt außerhalb der Geschäftszeiten:`,
      {
        slotStart: formatDateForDebug(localStart),
        slotEnd: formatDateForDebug(localEnd),
        businessStart: formatDateForDebug(businessStart),
        businessEnd: formatDateForDebug(businessEnd),
      },
      debug,
    );
    return false;
  }

  // Prüfe, ob der Tag ein Wochenende ist
  if (!isBusinessDay(localStart, debug)) {
    debugLog(
      `Slot liegt an einem nicht-verfügbaren Tag: ${formatDateForDebug(localStart)}`,
      undefined,
      debug,
    );
    return false;
  }

  // Füge Pufferzeiten hinzu
  const startWithBuffer = addMinutes(localStart, -bufferTime);
  const endWithBuffer = addMinutes(localEnd, bufferTime);

  debugLog(
    `Prüfe Slot mit Pufferzeit ${formatDateForDebug(startWithBuffer)} - ${formatDateForDebug(endWithBuffer)}`,
    undefined,
    debug,
  );

  // Prüfe Konflikte mit bestehenden Events
  for (const event of existingEvents) {
    const hasConflict =
      isWithinInterval(startWithBuffer, {
        start: event.start,
        end: event.end,
      }) ||
      isWithinInterval(endWithBuffer, { start: event.start, end: event.end }) ||
      isWithinInterval(event.start, {
        start: startWithBuffer,
        end: endWithBuffer,
      }) ||
      isWithinInterval(event.end, {
        start: startWithBuffer,
        end: endWithBuffer,
      });

    if (hasConflict) {
      debugLog(
        `Konflikt gefunden mit Event:`,
        {
          eventStart: formatDateForDebug(event.start),
          eventEnd: formatDateForDebug(event.end),
          eventSummary: event.summary,
        },
        debug,
      );
      return false;
    }
  }

  debugLog(`Keine Konflikte gefunden, Slot ist verfügbar`, undefined, debug);
  return true;
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

  // Filtere nur verfügbare Slots
  const onlyAvailableSlots = availableSlots.filter(
    (slot) => slot.isAvailable !== false,
  );

  return (
    onlyAvailableSlots.find((slot) => isAfter(slot.start, localAfter)) || null
  );
}

/**
 * Gets available dates for the next X days
 * @param startDate - The date to start checking from
 * @param daysToCheck - Number of days to check
 * @returns Array of dates that are available for booking
 */
export function getAvailableDates(
  startDate: Date = new Date(),
  daysToCheck: number = CONFIG.DAYS_TO_CHECK,
): Date[] {
  const availableDates: Date[] = [];
  const today = startOfDay(new Date());

  for (let i = 0; i < daysToCheck; i++) {
    const currentDate = addDays(startDate, i);
    const currentDateStart = startOfDay(currentDate);

    // Überspringe Tage in der Vergangenheit
    if (isBefore(currentDateStart, today)) {
      continue;
    }

    // Überspringe Wochenenden oder nicht-verfügbare Tage
    if (isBusinessDay(currentDate)) {
      availableDates.push(currentDate);
    }
  }

  return availableDates;
}

/**
 * Formats a time slot for display
 * @param slot - The time slot to format
 * @param format - The format string to use
 * @returns Formatted string representation of the time slot
 */
export function formatTimeSlot(
  slot: TimeSlot,
  formatString: string = "dd.MM.yyyy 'um' HH:mm 'Uhr'",
): string {
  return format(slot.start, formatString);
}
