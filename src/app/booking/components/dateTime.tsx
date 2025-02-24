'use client';

import {
  addDays,
  addMinutes,
  setHours,
  setMinutes,
  startOfToday,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { useCallback, useState } from 'react';
import { useBookingStore } from '../_lib/_store/state-store';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
] as const;

type TimeSlot = (typeof TIME_SLOTS)[number];

interface SlotAvailability {
  isAvailable: boolean;
  isLoading: boolean;
}

export function DateTimeSelection() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableSlots, setAvailableSlots] = useState<
    Record<TimeSlot, SlotAvailability>
  >({} as Record<TimeSlot, SlotAvailability>);
  const { setDateTime } = useBookingStore();

  const today = startOfToday();
  const maxDate = addDays(today, 14);

  const checkTimeSlot = useCallback(async (date: Date, time: TimeSlot) => {
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = setMinutes(setHours(date, hours), minutes);
    const endTime = addMinutes(startTime, 60);

    try {
      const response = await fetch(
        `/api/calendar/check-availability?start=${startTime.toISOString()}&end=${endTime.toISOString()}`,
      );

      if (!response.ok) throw new Error('Verfügbarkeitsprüfung fehlgeschlagen');

      return await response.json();
    } catch (error) {
      console.error('Fehler bei Verfügbarkeitsprüfung:', error);
      return false;
    }
  }, []);

  const handleDateSelection = useCallback(
    async (date: Date | undefined) => {
      setSelectedDate(date);
      if (!date) return;

      const initialSlots: Record<TimeSlot, SlotAvailability> = {} as Record<
        TimeSlot,
        SlotAvailability
      >;
      TIME_SLOTS.forEach((time) => {
        initialSlots[time] = { isAvailable: false, isLoading: true };
      });
      setAvailableSlots(initialSlots);

      // Prüfe Verfügbarkeit für jeden Zeitslot
      const checks = TIME_SLOTS.map(async (time) => {
        const isAvailable = await checkTimeSlot(date, time);
        return { time, isAvailable };
      });

      const results = await Promise.all(checks);
      const newSlots = { ...initialSlots };
      results.forEach(({ time, isAvailable }) => {
        newSlots[time] = { isAvailable, isLoading: false };
      });
      setAvailableSlots(newSlots);
    },
    [checkTimeSlot],
  );

  const handleTimeSelection = useCallback(
    (time: TimeSlot) => {
      if (!selectedDate || !availableSlots[time]?.isAvailable) return;

      const [hours, minutes] = time.split(':').map(Number);
      const dateTime = setMinutes(setHours(selectedDate, hours), minutes);
      setDateTime(dateTime.toISOString());
    },
    [selectedDate, availableSlots, setDateTime],
  );

  return (
    <div className='grid gap-6 md:grid-cols-2'>
      <Card className='p-6'>
        <Calendar
          mode='single'
          selected={selectedDate}
          onSelect={handleDateSelection}
          disabled={{ before: today, after: maxDate }}
          locale={de}
          className='rounded-md border'
        />
      </Card>

      {selectedDate && (
        <Card className='p-6'>
          <div className='grid grid-cols-3 gap-2'>
            {TIME_SLOTS.map((time) => {
              const slot = availableSlots[time] || {
                isAvailable: false,
                isLoading: true,
              };
              return (
                <button
                  key={time}
                  onClick={() => handleTimeSelection(time)}
                  disabled={!slot.isAvailable || slot.isLoading}
                  className={cn(
                    'rounded-md border p-2 text-sm transition-colors',
                    slot.isAvailable
                      ? 'cursor-pointer hover:border-primary hover:bg-primary/5'
                      : 'cursor-not-allowed opacity-50',
                  )}
                >
                  {slot.isLoading ? '...' : time}
                </button>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
