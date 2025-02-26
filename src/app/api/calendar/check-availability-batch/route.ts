import { NextRequest, NextResponse } from 'next/server';
import { getBusyTimeSlots } from '@/actions/booking/calendar-actions';
import { format, parseISO, addDays, startOfDay, endOfDay } from 'date-fns';

// Interface für einen Zeitslot mit Verfügbarkeitsinformation
interface TimeSlotWithAvailability {
  time: string;
  dateTime: string;
  isAvailable: boolean;
}

// Zeitintervall in Minuten
const TIME_SLOT_INTERVAL = 15;

// Geschäftszeiten
const BUSINESS_HOURS = {
  start: 9, // 9:00
  end: 17, // 17:00
};

// Mindestvorlaufzeit für Buchungen in Stunden
const MIN_BOOKING_HOURS_IN_ADVANCE = 12;

export async function GET(request: NextRequest) {
  try {
    // URL-Parameter abrufen
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const daysParam = searchParams.get('days') || '7'; // Standard: 7 Tage

    // Prüfen, ob das Startdatum angegeben wurde
    if (!startDateParam) {
      return NextResponse.json(
        { success: false, error: 'Startdatum muss angegeben werden' },
        { status: 400 },
      );
    }

    // Parameter parsen
    const startDate = parseISO(startDateParam);
    const days = parseInt(daysParam, 10);

    if (isNaN(days) || days <= 0 || days > 14) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ungültige Anzahl von Tagen. Muss zwischen 1 und 14 liegen.',
        },
        { status: 400 },
      );
    }

    // Enddate berechnen
    const endDate = addDays(startDate, days);

    // Besetzte Slots für den gesamten Zeitraum abrufen
    const busySlots = await getBusyTimeSlots(
      startOfDay(startDate),
      endOfDay(endDate),
    );

    // Früheste Buchungszeit berechnen
    const earliestBookingTime = new Date();
    earliestBookingTime.setHours(
      earliestBookingTime.getHours() + MIN_BOOKING_HOURS_IN_ADVANCE,
    );

    // Ergebnis nach Tagen gruppieren
    const result: Record<string, TimeSlotWithAvailability[]> = {};

    // Für jeden Tag im Zeitraum
    for (let i = 0; i < days; i++) {
      const currentDate = addDays(startDate, i);
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      result[dateKey] = [];

      // Für jede Stunde innerhalb der Geschäftszeiten
      for (
        let hour = BUSINESS_HOURS.start;
        hour <= BUSINESS_HOURS.end;
        hour++
      ) {
        // Für jedes Intervall innerhalb der Stunde
        for (let minute = 0; minute < 60; minute += TIME_SLOT_INTERVAL) {
          const slotDate = new Date(currentDate);
          slotDate.setHours(hour, minute, 0, 0);

          // Nur Termine berücksichtigen, die mindestens MIN_BOOKING_HOURS_IN_ADVANCE Stunden in der Zukunft liegen
          if (slotDate >= earliestBookingTime) {
            const slotKey = format(slotDate, "yyyy-MM-dd'T'HH:mm");
            const isAvailable = !busySlots.includes(slotKey);

            result[dateKey].push({
              time: format(slotDate, 'HH:mm'),
              dateTime: slotDate.toISOString(),
              isAvailable,
            });
          }
        }
      }
    }

    // Erfolgreiche Antwort zurückgeben
    return NextResponse.json({
      success: true,
      availabilityByDate: result,
      periodStart: startDate.toISOString(),
      periodEnd: endDate.toISOString(),
    });
  } catch (error) {
    console.error('Fehler bei der Batch-Kalenderabfrage:', error);

    // Fehlermeldung zurückgeben
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unbekannter Fehler bei der Kalenderabfrage',
      },
      { status: 500 },
    );
  }
}
