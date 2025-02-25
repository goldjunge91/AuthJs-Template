// Diese Datei enthält die Logik zur Prüfung von Terminüberschneidungen
import { toLocalTime } from '@/actions/booking/time-utils';
import {
  isWithinInterval,
  parseISO,
  areIntervalsOverlapping,
  format,
} from 'date-fns';

/**
 * Hilfsfunktion für einheitliches Logging
 * @param message - Die Nachricht, die geloggt werden soll
 * @param data - Optionale Daten, die mit geloggt werden sollen
 */
function debugLog(message: string, data?: any, debug: boolean = false) {
  if (!debug) return;

  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [has-overlap] ${message}`);
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

/**
 * Prüft, ob zwei Zeitintervalle sich überlappen
 * @param requestedStart - Startzeit des angefragten Zeitslots
 * @param requestedEnd - Endzeit des angefragten Zeitslots
 * @param eventStart - Startzeit des Events (ISO-String)
 * @param eventEnd - Endzeit des Events (ISO-String)
 * @param options - Optionale Konfiguration
 * @returns Boolean, der angibt, ob eine Überlappung vorliegt
 */
export function hasOverlap(
  requestedStart: Date,
  requestedEnd: Date,
  eventStart: string,
  eventEnd: string,
  options?: {
    debug?: boolean;
    inclusive?: boolean;
  },
): boolean {
  const debug = options?.debug ?? false;
  const inclusive = options?.inclusive ?? true;

  const debugData: any = debug
    ? {
        requestedStart: requestedStart.toISOString(),
        requestedEnd: requestedEnd.toISOString(),
        eventStart,
        eventEnd,
        inclusive,
        checks: [],
      }
    : undefined;

  try {
    // Konvertiere Event-Zeiten zu lokaler Zeitzone
    const eventStartDate = toLocalTime(parseISO(eventStart));
    const eventEndDate = toLocalTime(parseISO(eventEnd));

    // Konvertiere angeforderte Zeiten zu lokaler Zeitzone
    const localStart = toLocalTime(new Date(requestedStart));
    const localEnd = toLocalTime(new Date(requestedEnd));

    // Debug-Informationen
    debugLog(
      'Prüfe Überlappung zwischen:',
      {
        requestedSlot: {
          start: formatDateForDebug(localStart),
          end: formatDateForDebug(localEnd),
        },
        eventSlot: {
          start: formatDateForDebug(eventStartDate),
          end: formatDateForDebug(eventEndDate),
        },
      },
      debug,
    );

    if (debug && debugData) {
      debugData.localStart = formatDateForDebug(localStart);
      debugData.localEnd = formatDateForDebug(localEnd);
      debugData.localEventStart = formatDateForDebug(eventStartDate);
      debugData.localEventEnd = formatDateForDebug(eventEndDate);
    }

    // Prüfe auf ungültige Intervalle
    if (localStart >= localEnd) {
      debugLog(
        'Ungültiges Anfrage-Intervall: Start ist nach oder gleich Ende',
        undefined,
        debug,
      );
      if (debug && debugData) {
        debugData.error =
          'Ungültiges Anfrage-Intervall: Start ist nach oder gleich Ende';
        debugData.result = true; // Sicherheitshalber als überlappend markieren
      }
      return true;
    }

    if (eventStartDate >= eventEndDate) {
      debugLog(
        'Ungültiges Event-Intervall: Start ist nach oder gleich Ende',
        undefined,
        debug,
      );
      if (debug && debugData) {
        debugData.error =
          'Ungültiges Event-Intervall: Start ist nach oder gleich Ende';
        debugData.result = true; // Sicherheitshalber als überlappend markieren
      }
      return true;
    }

    // Verwende die date-fns Funktion areIntervalsOverlapping für eine präzisere Prüfung
    const hasOverlap = areIntervalsOverlapping(
      { start: localStart, end: localEnd },
      { start: eventStartDate, end: eventEndDate },
      { inclusive },
    );

    if (debug && debugData) {
      debugData.checks.push({
        method: 'areIntervalsOverlapping',
        result: hasOverlap,
        inclusive,
      });
    }

    // Fallback zur manuellen Prüfung, wenn nötig
    if (!hasOverlap) {
      // Prüfe alle möglichen Überlappungsszenarien manuell
      const checks = [
        // Der angefragte Start liegt innerhalb des Events
        {
          description: 'Anfrage-Start liegt innerhalb des Events',
          result: isWithinInterval(localStart, {
            start: eventStartDate,
            end: eventEndDate,
          }),
        },
        // Das angefragte Ende liegt innerhalb des Events
        {
          description: 'Anfrage-Ende liegt innerhalb des Events',
          result: isWithinInterval(localEnd, {
            start: eventStartDate,
            end: eventEndDate,
          }),
        },
        // Der Event-Start liegt innerhalb des angefragten Zeitraums
        {
          description: 'Event-Start liegt innerhalb des angefragten Zeitraums',
          result: isWithinInterval(eventStartDate, {
            start: localStart,
            end: localEnd,
          }),
        },
        // Der Event-Ende liegt innerhalb des angefragten Zeitraums
        {
          description: 'Event-Ende liegt innerhalb des angefragten Zeitraums',
          result: isWithinInterval(eventEndDate, {
            start: localStart,
            end: localEnd,
          }),
        },
      ];

      if (debug && debugData) {
        debugData.checks.push(...checks);
      }

      const manualCheck = checks.some((check) => check.result);

      if (manualCheck && debug) {
        const conflictingCheck = checks.find((check) => check.result);
        debugLog(
          'areIntervalsOverlapping und manuelle Prüfung liefern unterschiedliche Ergebnisse!',
          {
            conflictReason: conflictingCheck?.description,
            areIntervalsOverlapping: hasOverlap,
            manualCheck,
          },
          debug,
        );

        if (debug && debugData) {
          debugData.conflict = {
            areIntervalsOverlapping: hasOverlap,
            manualCheck,
            reason: conflictingCheck?.description,
          };
        }
      }

      if (debug && debugData) {
        debugData.result = manualCheck;
      }

      debugLog(
        `Überlappungsprüfung abgeschlossen: ${manualCheck ? 'Überlappung gefunden' : 'Keine Überlappung'}`,
        undefined,
        debug,
      );
      return manualCheck;
    }

    if (debug && debugData) {
      debugData.result = hasOverlap;
    }

    debugLog(
      `Überlappungsprüfung abgeschlossen: ${hasOverlap ? 'Überlappung gefunden' : 'Keine Überlappung'}`,
      undefined,
      debug,
    );
    return hasOverlap;
  } catch (error: unknown) {
    console.error('Fehler bei der Überlappungsprüfung:', error);
    if (debug && debugData) {
      debugData.error =
        error instanceof Error ? error.message : 'Unbekannter Fehler';
      debugData.result = true; // Sicherheitshalber als überlappend markieren
    }
    return true; // Im Fehlerfall sicherheitshalber als überlappend markieren
  } finally {
    if (debug && debugData) {
      console.log('Überlappungsprüfung Details:', debugData);
    }
  }
}

/**
 * Überprüft, ob zwei Zeitbereiche überlappen (verbesserte Version mit Zeitzonenunterstützung)
 */
export function hasOverlapV2(
  startA: string | Date,
  endA: string | Date,
  startB: string | Date,
  endB: string | Date,
): boolean {
  const startTimeA = new Date(startA).getTime();
  const endTimeA = new Date(endA).getTime();
  const startTimeB = new Date(startB).getTime();
  const endTimeB = new Date(endB).getTime();

  return startTimeA < endTimeB && endTimeA > startTimeB;
}

/**
 * Prüft, ob ein Zeitslot mit einem der angegebenen Events überlappt
 * @param slotStart - Startzeit des zu prüfenden Zeitslots
 * @param slotEnd - Endzeit des zu prüfenden Zeitslots
 * @param events - Array von Events mit Start- und Endzeiten
 * @param options - Optionale Konfiguration
 * @returns Boolean, der angibt, ob eine Überlappung vorliegt
 */
export function hasEventOverlap(
  slotStart: Date,
  slotEnd: Date,
  events: { start: string; end: string }[],
  options?: {
    debug?: boolean;
    inclusive?: boolean;
  },
): boolean {
  const debug = options?.debug ?? false;

  debugLog(
    `Prüfe Überlappung für Zeitslot ${slotStart.toISOString()} - ${slotEnd.toISOString()} mit ${events.length} Events`,
    undefined,
    debug,
  );

  return events.some((event) => {
    const overlap = hasOverlap(
      slotStart,
      slotEnd,
      event.start,
      event.end,
      options,
    );

    if (overlap && debug) {
      debugLog(
        `Überlappung gefunden mit Event: ${event.start} - ${event.end}`,
        undefined,
        debug,
      );
    }

    return overlap;
  });
}
