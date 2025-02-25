import { NextResponse } from 'next/server';
import { checkTimeSlotAvailability } from '@/actions/booking/check-time-slot-availability';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    if (!startParam || !endParam) {
      return NextResponse.json(
        { error: 'Start- und Endzeit müssen angegeben werden' },
        { status: 400 },
      );
    }

    const startTime = new Date(startParam);
    const endTime = new Date(endParam);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { error: 'Ungültiges Datumsformat' },
        { status: 400 },
      );
    }

    console.log('API Route: Prüfe Verfügbarkeit für:', {
      start: startTime.toISOString(),
      end: endTime.toISOString(),
    });

    try {
      const isAvailable = await checkTimeSlotAvailability(startTime, endTime);
      console.log('API Route: Verfügbarkeitsresultat:', isAvailable);
      return NextResponse.json({ isAvailable });
    } catch (calendarError) {
      console.error(
        'API Route: Fehler bei der Verfügbarkeitsprüfung:',
        calendarError,
      );
      // Im Fehlerfall ist der Slot nicht verfügbar
      return NextResponse.json({ isAvailable: false });
    }
  } catch (error) {
    console.error('Genereller Fehler bei der Zeitslot-Prüfung:', error);
    return NextResponse.json(
      {
        error: 'Fehler bei der Verfügbarkeitsprüfung',
        isAvailable: false,
      },
      { status: 500 },
    );
  }
}
