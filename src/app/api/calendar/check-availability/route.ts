import { NextResponse } from 'next/server';

import { checkTimeSlotAvailability } from '@/actions/booking/check-time-slot-availability';

import { cache } from '../../../../utils/redis/redis-cache-component';

const CACHETIME: number = 3000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return NextResponse.json(
        {
          error: {
            status: 400,
            title: 'Ungültige Anfrage',
            detail: 'Start- und Endzeit müssen angegeben werden.',
            type: 'https://httpstatuses.com/400',
          },
        },
        { status: 400 },
      );
    }

    const cacheKey = `availability:${start}:${end}`;
    const isAvailable = await cache(
      cacheKey,
      () => checkTimeSlotAvailability(new Date(start), new Date(end)),
      CACHETIME,
    );

    return NextResponse.json(isAvailable);
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = error instanceof TypeError ? 400 : 500;
      const title =
        statusCode === 400 ? 'Ungültige Anfrage' : 'Interner Serverfehler';

      return NextResponse.json(
        {
          error: {
            status: statusCode,
            title,
            detail: error.message || 'Ein unerwarteter Fehler ist aufgetreten.',
            type: `https://httpstatuses.com/${statusCode}`,
          },
        },
        { status: statusCode },
      );
    }

    return NextResponse.json(
      {
        error: {
          status: 500,
          title: 'Interner Serverfehler',
          detail: 'Fehler bei der Verfügbarkeitsprüfung.',
          type: 'https://httpstatuses.com/500',
        },
      },
      { status: 500 },
    );
  }
}
