'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getBusyTimeSlots } from '@/actions/booking/calendar-actions';

// Interface für einen Zeitslot
interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

// Interface für einen Tag mit Zeitslots
interface DayWithSlots {
  date: Date;
  slots: TimeSlot[];
  formattedDate: string;
}

// Verfügbare Zeitslots
const TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
];

export function CalendarAvailabilityView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'calendar' | 'day'>('calendar');
  const [selectedDay, setSelectedDay] = useState<DayWithSlots | null>(null);
  const [nextDays, setNextDays] = useState<DayWithSlots[]>([]);

  // Datumsbereich für die Kalenderwahl
  const today = startOfToday();
  const maxDate = addDays(today, 14);

  // Laden der besetzten Zeitslots für die nächsten 14 Tage
  useEffect(() => {
    async function loadBusySlots() {
      setLoading(true);
      try {
        const startDate = new Date();
        const endDate = addDays(startDate, 14);
        const result = await getBusyTimeSlots(startDate, endDate);
        setBusySlots(result);

        // Nächste 7 Tage mit Verfügbarkeiten vorbereiten
        const days: DayWithSlots[] = [];
        for (let i = 0; i < 7; i++) {
          const date = addDays(today, i);
          // Wochenenden überspringen
          const dayOfWeek = date.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) continue;

          const slots = TIME_SLOTS.map((time) => {
            const [hours, minutes] = time.split(':').map(Number);
            const slotDate = new Date(date);
            slotDate.setHours(hours, minutes, 0, 0);

            const slotKey = format(slotDate, "yyyy-MM-dd'T'HH:mm");
            const isAvailable = !busySlots.includes(slotKey);

            return { time, isAvailable };
          });

          days.push({
            date,
            slots,
            formattedDate: format(date, 'EEEE, dd. MMMM yyyy', { locale: de }),
          });
        }
        setNextDays(days);
      } catch (error) {
        console.error('Fehler beim Laden der Termine:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBusySlots();
  }, [busySlots, today]);

  // Behandlung der Datumsauswahl
  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setLoading(true);

    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const result = await getBusyTimeSlots(startOfDay, endOfDay);
      setBusySlots(result);

      // Zeitslots für diesen Tag erstellen
      const slots = TIME_SLOTS.map((time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const slotDate = new Date(date);
        slotDate.setHours(hours, minutes, 0, 0);

        const slotKey = format(slotDate, "yyyy-MM-dd'T'HH:mm");
        const isAvailable = !result.includes(slotKey);

        return { time, isAvailable };
      });

      setSelectedDay({
        date,
        slots,
        formattedDate: format(date, 'EEEE, dd. MMMM yyyy', { locale: de }),
      });
      setView('day');
    } catch (error) {
      console.error('Fehler beim Laden der Termine:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      {loading && (
        <div className='flex items-center justify-center p-8'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      )}

      {view === 'calendar' && (
        <div className='space-y-6'>
          <Calendar
            mode='single'
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={{ before: today, after: maxDate }}
            locale={de}
            className='mx-auto rounded-md border'
          />

          <div className='mt-6 space-y-6'>
            <h3 className='text-lg font-medium'>
              Verfügbarkeit in den nächsten Tagen:
            </h3>
            {nextDays.map((day, i) => (
              <div key={i} className='space-y-3 rounded-lg border p-4'>
                <h4 className='font-medium'>{day.formattedDate}</h4>
                <div className='grid grid-cols-3 gap-2'>
                  {day.slots.map((slot, j) => (
                    <Button
                      key={j}
                      variant={slot.isAvailable ? 'outline' : 'ghost'}
                      className={`${slot.isAvailable ? 'border-green-500 hover:bg-green-50' : 'opacity-50'}`}
                      disabled={!slot.isAvailable}
                      onClick={() => {
                        setSelectedDate(day.date);
                        handleDateSelect(day.date);
                      }}
                    >
                      {slot.time}
                      {slot.isAvailable ? ' ✓' : ' ✗'}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'day' && selectedDay && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium'>{selectedDay.formattedDate}</h3>
            <Button variant='outline' onClick={() => setView('calendar')}>
              Zurück zum Kalender
            </Button>
          </div>

          <div className='grid grid-cols-3 gap-3'>
            {selectedDay.slots.map((slot, i) => (
              <Button
                key={i}
                variant={slot.isAvailable ? 'outline' : 'ghost'}
                className={`${slot.isAvailable ? 'border-green-500 hover:bg-green-50' : 'cursor-not-allowed opacity-50'}`}
                disabled={!slot.isAvailable}
              >
                {slot.time}
                {slot.isAvailable ? ' ✓' : ' ✗'}
              </Button>
            ))}
          </div>

          {selectedDay.slots.every((slot) => !slot.isAvailable) && (
            <div className='rounded-md bg-red-50 p-4 text-center'>
              <p className='text-red-600'>
                Keine Termine an diesem Tag verfügbar.
              </p>
              <p className='text-sm text-red-500'>
                Bitte wählen Sie einen anderen Tag.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
