import { checkTimeSlotAvailability } from '@/actions/booking/check-time-slot-availability';
import { NextResponse } from 'next/server';
import { getAvailableTimeSlotsForDay } from '@/actions/booking/calendar-actions';
import { parseISO } from 'date-fns';

export async function GET(request: Request) {
  console.log('🔍 API: /api/calendar/check-availability wurde aufgerufen');
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  console.log('📅 Parameter:', { dateParam, start, end });

  // Wenn date Parameter vorhanden ist, verwende die Server Action für verfügbare Zeitslots
  if (dateParam) {
    try {
      console.log(`🔄 Verarbeite Anfrage für Datum: ${dateParam}`);
      const date = parseISO(dateParam);
      console.log(`📆 Geparste Datum: ${date.toISOString()}`);

      console.log('🔍 Rufe getAvailableTimeSlotsForDay auf...');
      const availableTimeSlots = await getAvailableTimeSlotsForDay(date);
      console.log(
        `✅ Verfügbare Zeitslots erhalten: ${JSON.stringify(availableTimeSlots)}`,
      );

      // Formatiere die Zeitslots für die Antwort
      const formattedSlots = availableTimeSlots.map((timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const slotDate = new Date(date);
        slotDate.setHours(hours, minutes, 0, 0);

        return {
          time: timeStr,
          dateTime: slotDate.toISOString(),
          isAvailable: true,
        };
      });

      console.log(`🔢 Formatierte Slots: ${formattedSlots.length}`);
      console.log(
        `📤 Sende Antwort mit ${formattedSlots.length} verfügbaren Slots`,
      );

      return NextResponse.json({
        success: true,
        availableSlots: formattedSlots,
      });
    } catch (error) {
      console.error('❌ Fehler bei der Verfügbarkeitsprüfung:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Fehler bei der Verfügbarkeitsprüfung',
        },
        { status: 500 },
      );
    }
  }

  // Fallback zur direkten Verfügbarkeitsprüfung mit Start- und Endzeit
  if (!start || !end) {
    console.error(
      '❌ Fehlende Parameter: start und end müssen angegeben werden',
    );
    return NextResponse.json(
      {
        success: false,
        error: 'Start- und Endzeit müssen angegeben werden',
      },
      { status: 400 },
    );
  }

  try {
    console.log(`🔄 Prüfe Verfügbarkeit für Zeitraum: ${start} bis ${end}`);
    const isAvailable = await checkTimeSlotAvailability(
      new Date(start),
      new Date(end),
    );

    console.log(
      `✅ Verfügbarkeitsprüfung abgeschlossen: ${isAvailable ? 'Verfügbar' : 'Nicht verfügbar'}`,
    );

    return NextResponse.json({
      success: true,
      isAvailable,
    });
  } catch (error) {
    console.error('❌ Fehler bei der Verfügbarkeitsprüfung:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler bei der Verfügbarkeitsprüfung',
      },
      { status: 500 },
    );
  }
}
