import { NextRequest, NextResponse } from 'next/server';
import { getAvailableTimeSlotsForDay } from '@/actions/booking/calendar-actions';
import { parseISO } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    // URL-Parameter abrufen
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');

    // Prüfen, ob das Datum angegeben wurde
    if (!dateParam) {
      return NextResponse.json(
        { success: false, error: 'Datum muss angegeben werden' },
        { status: 400 },
      );
    }

    // Datum parsen
    const date = parseISO(dateParam);

    // Verfügbare Zeitslots abrufen
    const availableTimeSlots = await getAvailableTimeSlotsForDay(date);

    // Zeitslots in das erwartete Format umwandeln
    const formattedSlots = availableTimeSlots.map((timeString) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      const slotDate = new Date(date);
      slotDate.setHours(hours, minutes, 0, 0);

      return {
        time: timeString,
        dateTime: slotDate.toISOString(),
        isAvailable: true,
      };
    });

    // Erfolgreiche Antwort zurückgeben
    return NextResponse.json({
      success: true,
      availableSlots: formattedSlots,
    });
  } catch (error) {
    console.error('Fehler bei der Kalenderabfrage:', error);

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
