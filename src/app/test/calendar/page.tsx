import { Suspense } from 'react';
import { DateTimeSelection } from '@/app/booking/components/dateTime';

export default function TestCalendarPage() {
  return (
    <div className='container mx-auto py-8'>
      <h1 className='mb-6 text-2xl font-bold'>Terminverfügbarkeitsprüfung</h1>

      <div className='mx-auto max-w-3xl'>
        <div className='rounded-lg bg-white p-6 shadow'>
          <h2 className='mb-4 text-xl font-semibold'>Verfügbare Zeitslots</h2>
          <p className='mb-6 text-muted-foreground'>
            Wählen Sie ein Datum aus, um verfügbare Zeitfenster anzuzeigen. Die
            Die Verfügbarkeit wird direkt von der Google Calendar API abgefragt.
          </p>

          <Suspense fallback={<div>Lade Kalender...</div>}>
            <DateTimeSelection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
