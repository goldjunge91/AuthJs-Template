'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { RefreshCw, Check, X } from 'lucide-react';

export default function CalendarTestPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<
    Array<{ time: string; isAvailable: boolean }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Zeitslots generieren (9:00 - 17:00 Uhr in 30-Minuten-Intervallen)
  const generateTimeSlots = useCallback((date: Date) => {
    const slots = [];
    let startTime = new Date(date);
    startTime.setHours(9, 0, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(17, 0, 0, 0);

    while (startTime < endTime) {
      slots.push({
        time: format(startTime, 'HH:mm'),
        start: new Date(startTime),
        end: new Date(
          new Date(startTime).setMinutes(startTime.getMinutes() + 30),
        ),
        isAvailable: false,
      });

      startTime = new Date(startTime.setMinutes(startTime.getMinutes() + 30));
    }

    return slots;
  }, []);

  // Verfügbarkeit der Zeitslots prüfen
  const checkAvailability = useCallback(async () => {
    if (!selectedDate) return;

    setLoading(true);
    setError(null);

    try {
      const slots = generateTimeSlots(selectedDate);
      setTimeSlots([]); // Zurücksetzen

      for (const slot of slots) {
        const startTime = slot.start.toISOString();
        const endTime = slot.end.toISOString();

        const response = await fetch(
          `/api/calendar/check-availability?start=${startTime}&end=${endTime}`,
        );
        const data = await response.json();

        setTimeSlots((prev) => [
          ...prev,
          {
            time: slot.time,
            isAvailable: data.available,
          },
        ]);
      }
    } catch (err) {
      console.error('Fehler bei der Verfügbarkeitsprüfung:', err);
      setError('Fehler bei der Abfrage der Verfügbarkeit.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, generateTimeSlots]);

  // Bei Datumsänderung Verfügbarkeit prüfen
  useEffect(() => {
    if (selectedDate) {
      checkAvailability();
    }
  }, [selectedDate, checkAvailability]);

  return (
    <div className='container py-8'>
      <h1 className='mb-6 text-3xl font-bold'>Google Calendar Test</h1>

      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Datum auswählen</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode='single'
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={de}
              className='mb-4'
            />

            <Button
              onClick={checkAvailability}
              disabled={loading}
              className='mt-4'
            >
              {loading ? (
                <>
                  <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                  Prüfe Verfügbarkeit...
                </>
              ) : (
                <>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Verfügbarkeit aktualisieren
                </>
              )}
            </Button>

            {error && (
              <div className='mt-4 rounded bg-red-100 p-3 text-red-700'>
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verfügbare Zeitslots</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && timeSlots.length === 0 ? (
              <div className='flex items-center justify-center p-8'>
                <RefreshCw className='h-6 w-6 animate-spin text-gray-400' />
              </div>
            ) : timeSlots.length > 0 ? (
              <div className='grid grid-cols-2 gap-2'>
                {timeSlots.map((slot) => (
                  <div
                    key={slot.time}
                    className={`flex items-center justify-between rounded-md p-3 ${slot.isAvailable ? 'bg-green-100' : 'bg-red-100'} `}
                  >
                    <span>{slot.time} Uhr</span>
                    {slot.isAvailable ? (
                      <Check className='h-4 w-4 text-green-600' />
                    ) : (
                      <X className='h-4 w-4 text-red-600' />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className='italic text-gray-500'>
                Wählen Sie ein Datum, um verfügbare Zeitslots zu sehen.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
