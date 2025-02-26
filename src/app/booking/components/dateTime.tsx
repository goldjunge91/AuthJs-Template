'use client';

import { addDays, startOfToday, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { useBookingStore } from '../_lib/_store/state-store';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Loader2, Clock, Calendar as CalendarIcon, Info } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Interface für einen Zeitslot mit Verfügbarkeitsinformation
interface TimeSlotWithAvailability {
  time: string;
  dateTime: string;
  isAvailable: boolean;
}

// Typ für den Cache
interface SlotCache {
  [dateKey: string]: {
    slots: TimeSlotWithAvailability[];
    timestamp: number;
  };
}

// Cache-Gültigkeitsdauer in Millisekunden (30 Minuten)
const CACHE_TTL = 30 * 60 * 1000;

// Mindestvorlaufzeit für Buchungen in Stunden (muss mit calendar-actions.ts übereinstimmen)
const MIN_BOOKING_HOURS_IN_ADVANCE = 12;

// Anzahl der Tage, die im Voraus geladen werden sollen
const DAYS_TO_LOAD = 14;

export function DateTimeSelection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    startOfToday(),
  );
  const [availableSlots, setAvailableSlots] = useState<
    TimeSlotWithAvailability[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const { setDateTime } = useBookingStore();

  // Clientseitiger Cache für Zeitslots
  const [slotsCache, setSlotsCache] = useState<SlotCache>({});
  // Flag, ob die Batch-Daten bereits geladen wurden
  const [batchDataLoaded, setBatchDataLoaded] = useState(false);

  const today = startOfToday();
  const maxDate = addDays(today, DAYS_TO_LOAD);

  // Hilfsfunktion zum Formatieren des Datums als Schlüssel für den Cache
  const getDateKey = useCallback((date: Date) => {
    return format(date, 'yyyy-MM-dd');
  }, []);

  // Hilfsfunktion zur Sicherstellung, dass das Ergebnis ein Array ist
  const ensureArray = useCallback(
    (data: unknown): TimeSlotWithAvailability[] => {
      if (!data) return [];
      if (!Array.isArray(data)) {
        console.error('API hat keine Array-Daten zurückgegeben:', data);
        return [];
      }

      // Validierung der Array-Elemente
      return data.filter((item): item is TimeSlotWithAvailability => {
        return (
          item &&
          typeof item === 'object' &&
          'time' in item &&
          'dateTime' in item &&
          'isAvailable' in item
        );
      });
    },
    [],
  );

  // Funktion zum Abrufen der verfügbaren Zeitslots für ein bestimmtes Datum
  const fetchAvailableSlots = useCallback(
    async (date: Date) => {
      if (!date) return;

      const dateKey = getDateKey(date);

      // Prüfe, ob wir gültige Cache-Daten haben, ohne den Loading-Zustand zu ändern
      const cachedData = slotsCache[dateKey];
      const now = Date.now();

      if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
        console.log('Verwende gecachte Zeitslots für:', dateKey);
        setAvailableSlots(cachedData.slots);
        return;
      }

      // Nur wenn wir tatsächlich laden müssen, setzen wir den Loading-Zustand
      setIsLoading(true);
      setCalendarError(null);

      console.log('Rufe verfügbare Zeitslots ab für:', dateKey);

      // Setze verfügbare Slots zurück, während wir neue laden
      setAvailableSlots([]);

      try {
        // Timeout für die API-Anfrage (10 Sekunden)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          // Eigentliche Anfrage mit dem ISO-String des Datums
          const response = await fetch(
            `/api/calendar/check-availability?date=${date.toISOString()}`,
            {
              method: 'GET',
              headers: { Accept: 'application/json' },
              signal: controller.signal,
            },
          );

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              error: `HTTP Fehler ${response.status}`,
            }));
            throw new Error(
              errorData.error ||
                'Fehler beim Abrufen der verfügbaren Zeitslots',
            );
          }

          const data = await response.json();

          // Prüfen ob die Anfrage erfolgreich war
          if (data.success === false) {
            throw new Error(data.error || 'Kalenderabfrage fehlgeschlagen');
          }

          // Sicherstellen, dass availableSlots ein Array ist
          const validSlots = ensureArray(data.availableSlots);

          console.log(`${validSlots.length} gültige Slots vom Server erhalten`);

          // Zeige alle Slots, auch die nicht verfügbaren
          setAvailableSlots(validSlots);

          // Speichere Daten im Cache
          setSlotsCache((prevCache) => ({
            ...prevCache,
            [dateKey]: {
              slots: validSlots,
              timestamp: now,
            },
          }));
        } catch (fetchError: unknown) {
          clearTimeout(timeoutId);

          if (
            fetchError instanceof DOMException &&
            fetchError.name === 'AbortError'
          ) {
            throw new Error('Zeitüberschreitung bei der Kalenderabfrage');
          }

          throw fetchError;
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Zeitslots:', error);
        setCalendarError(
          error instanceof Error
            ? error.message
            : 'Unbekannter Fehler bei der Kalenderabfrage',
        );
        // Bei Fehler: Leeres Array setzen
        setAvailableSlots([]);
      } finally {
        setIsLoading(false);
      }
    },
    [slotsCache, getDateKey, ensureArray],
  );

  // Funktion zum Abrufen der verfügbaren Zeitslots für mehrere Tage auf einmal
  const fetchBatchAvailability = useCallback(async () => {
    setIsLoading(true);
    setCalendarError(null);

    try {
      console.log('Optimierte Batch-Abfrage für mehrere Tage...');

      // Wir laden nur die nächsten 5 Tage sofort, um die Antwortzeit zu verbessern
      const initialDaysToLoad = 5;
      const now = Date.now();
      const newCache: SlotCache = {};

      // Lade die ersten Tage parallel
      const initialDates = Array.from({ length: initialDaysToLoad }, (_, i) =>
        addDays(today, i),
      );

      // Erstelle ein Array von Promises für die ersten Tage
      const initialPromises = initialDates.map(async (date) => {
        try {
          const dateKey = getDateKey(date);
          const response = await fetch(
            `/api/calendar/check-availability?date=${date.toISOString()}`,
            {
              method: 'GET',
              headers: { Accept: 'application/json' },
            },
          );

          if (!response.ok) {
            console.error(
              `Fehler beim Laden von ${dateKey}: HTTP ${response.status}`,
            );
            return null;
          }

          const data = await response.json();
          if (data.success === false) {
            console.error(`API-Fehler für ${dateKey}: ${data.error}`);
            return null;
          }

          return { dateKey, slots: ensureArray(data.availableSlots) };
        } catch (error) {
          console.error(`Fehler beim Laden von ${getDateKey(date)}:`, error);
          return null;
        }
      });

      // Warte auf alle initialen Anfragen
      const results = await Promise.allSettled(initialPromises);

      // Verarbeite die Ergebnisse
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          const { dateKey, slots } = result.value;
          newCache[dateKey] = {
            slots,
            timestamp: now,
          };
        }
      });

      console.log(
        `Erste ${initialDaysToLoad} Tage geladen, aktualisiere Cache...`,
      );
      setSlotsCache((prevCache) => ({ ...prevCache, ...newCache }));
      setBatchDataLoaded(true);

      // Wenn ein Datum ausgewählt ist, zeige die Slots für dieses Datum an
      if (selectedDate) {
        const dateKey = getDateKey(selectedDate);
        if (newCache[dateKey]) {
          setAvailableSlots(newCache[dateKey].slots);
        }
      }

      // Lade die restlichen Tage im Hintergrund mit reduzierter Parallelität
      setTimeout(() => {
        const loadRemainingDays = async () => {
          const remainingDates = Array.from(
            { length: DAYS_TO_LOAD - initialDaysToLoad },
            (_, i) => addDays(today, i + initialDaysToLoad),
          );

          // Lade die restlichen Tage in Gruppen von 3, um die Serverlast zu reduzieren
          const chunkSize = 3;
          for (let i = 0; i < remainingDates.length; i += chunkSize) {
            const chunk = remainingDates.slice(i, i + chunkSize);

            // Erstelle Promises für die aktuelle Gruppe
            const chunkPromises = chunk.map(async (date) => {
              try {
                const dateKey = getDateKey(date);
                const response = await fetch(
                  `/api/calendar/check-availability?date=${date.toISOString()}`,
                  {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                  },
                );

                if (!response.ok) return null;

                const data = await response.json();
                if (data.success === false) return null;

                return { dateKey, slots: ensureArray(data.availableSlots) };
              } catch (error) {
                console.error(
                  `Fehler beim Laden von ${getDateKey(date)}:`,
                  error,
                );
                return null;
              }
            });

            // Warte auf die aktuelle Gruppe
            const chunkResults = await Promise.allSettled(chunkPromises);

            // Aktualisiere den Cache für diese Gruppe
            const newChunkCache: SlotCache = {};
            chunkResults.forEach((result) => {
              if (result.status === 'fulfilled' && result.value) {
                const { dateKey, slots } = result.value;
                newChunkCache[dateKey] = {
                  slots,
                  timestamp: Date.now(), // Aktueller Zeitstempel
                };
              }
            });

            // Aktualisiere den Cache
            if (Object.keys(newChunkCache).length > 0) {
              setSlotsCache((prevCache) => ({
                ...prevCache,
                ...newChunkCache,
              }));
            }

            // Kurze Pause zwischen den Gruppen
            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          console.log(`Alle ${DAYS_TO_LOAD} Tage wurden geladen`);
        };

        loadRemainingDays().catch((error) => {
          console.error('Fehler beim Laden der restlichen Tage:', error);
        });
      }, 1000);
    } catch (error) {
      console.error('Fehler beim Abrufen der Batch-Verfügbarkeit:', error);
      setCalendarError(
        error instanceof Error
          ? error.message
          : 'Unbekannter Fehler bei der Kalenderabfrage',
      );
    } finally {
      setIsLoading(false);
    }
  }, [today, selectedDate, getDateKey, ensureArray]);

  // Cache invalidieren, wenn er zu alt wird
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setSlotsCache((prevCache) => {
        const newCache = { ...prevCache };
        let hasChanges = false;

        // Entferne abgelaufene Cache-Einträge
        Object.keys(newCache).forEach((dateKey) => {
          if (now - newCache[dateKey].timestamp > CACHE_TTL) {
            delete newCache[dateKey];
            hasChanges = true;
          }
        });

        return hasChanges ? newCache : prevCache;
      });
    }, CACHE_TTL / 2); // Prüfe regelmäßig auf abgelaufene Einträge

    return () => clearInterval(interval);
  }, []);

  // Wenn sich das Datum ändert, rufe die verfügbaren Zeitslots ab
  const handleDateSelection = useCallback(
    (date: Date | undefined) => {
      setSelectedDate(date);
      if (date) {
        const dateKey = getDateKey(date);
        // Wenn wir bereits Daten im Cache haben, verwende diese
        if (slotsCache[dateKey]) {
          setAvailableSlots(slotsCache[dateKey].slots);
        } else {
          // Ansonsten lade die Daten
          fetchAvailableSlots(date);
        }
      } else {
        setAvailableSlots([]);
        setCalendarError(null);
      }
    },
    [fetchAvailableSlots, slotsCache, getDateKey],
  );

  // Lade Batch-Daten beim ersten Laden der Komponente
  useEffect(() => {
    if (!batchDataLoaded) {
      fetchBatchAvailability().catch(() => {
        console.log('Batch-Laden fehlgeschlagen, verwende Einzelabfragen');
        // Wenn das Batch-Laden fehlschlägt, lade trotzdem das aktuelle Datum
        if (selectedDate) {
          fetchAvailableSlots(selectedDate);
        }
      });
    }
  }, [
    batchDataLoaded,
    fetchBatchAvailability,
    selectedDate,
    fetchAvailableSlots,
  ]);

  // Automatisch das aktuelle Datum laden, wenn die Komponente geladen wird
  useEffect(() => {
    if (selectedDate && !isLoading) {
      const dateKey = getDateKey(selectedDate);
      if (slotsCache[dateKey]) {
        setAvailableSlots(slotsCache[dateKey].slots);
      } else if (batchDataLoaded) {
        // Wenn die Batch-Daten geladen wurden, aber das ausgewählte Datum nicht im Cache ist
        fetchAvailableSlots(selectedDate);
      }
    }
  }, [
    selectedDate,
    slotsCache,
    getDateKey,
    batchDataLoaded,
    fetchAvailableSlots,
    isLoading,
  ]);

  // Hilfsfunktion zum Gruppieren der Zeitslots nach Stunden
  const groupTimeSlotsByHour = useCallback(
    (slots: TimeSlotWithAvailability[]) => {
      const grouped: { [hour: string]: TimeSlotWithAvailability[] } = {};

      slots.forEach((slot) => {
        const hourKey = slot.time.substring(0, 2);
        if (!grouped[hourKey]) {
          grouped[hourKey] = [];
        }
        grouped[hourKey].push(slot);
      });

      return grouped;
    },
    [],
  );

  // Beim Klick auf einen Zeitslot diesen auswählen
  const handleTimeSelection = useCallback(
    (slot: TimeSlotWithAvailability) => {
      if (!slot.isAvailable) return;

      const dateTime = new Date(slot.dateTime);
      setDateTime(dateTime.toISOString());
    },
    [setDateTime],
  );

  // Gruppiere die Zeitslots nach Stunden für eine bessere Darstellung
  const groupedSlots = useMemo(() => {
    return groupTimeSlotsByHour(availableSlots);
  }, [availableSlots, groupTimeSlotsByHour]);

  return (
    <div className='space-y-6'>
      <Alert variant='default' className='mb-4 bg-blue-50'>
        <Info className='h-4 w-4' />
        <AlertTitle>Hinweis zur Terminbuchung</AlertTitle>
        <AlertDescription>
          Termine können frühestens {MIN_BOOKING_HOURS_IN_ADVANCE} Stunden im
          Voraus gebucht werden.
        </AlertDescription>
      </Alert>

      <div className='flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0'>
        <div className='w-full sm:w-1/2'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center'>
                <CalendarIcon className='mr-2 h-5 w-5' />
                Datum auswählen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode='single'
                selected={selectedDate}
                onSelect={handleDateSelection}
                disabled={(date) => {
                  // Deaktiviere Daten in der Vergangenheit und mehr als 14 Tage in der Zukunft
                  return date < today || date > maxDate;
                }}
                locale={de}
                className='mx-auto rounded-md border'
              />
            </CardContent>
            <CardFooter className='text-sm text-muted-foreground'>
              Termine können bis zu {DAYS_TO_LOAD} Tage im Voraus gebucht
              werden.
            </CardFooter>
          </Card>
        </div>

        <div className='w-full sm:w-1/2'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center'>
                <Clock className='mr-2 h-5 w-5' />
                Verfügbare Zeiten
              </CardTitle>
              <CardDescription>
                {selectedDate
                  ? format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de })
                  : 'Bitte wählen Sie ein Datum'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='flex h-40 items-center justify-center'>
                  <Loader2 className='h-8 w-8 animate-spin text-primary' />
                </div>
              ) : calendarError ? (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertTitle>Fehler</AlertTitle>
                  <AlertDescription>{calendarError}</AlertDescription>
                </Alert>
              ) : availableSlots.length === 0 ? (
                <div className='flex h-40 items-center justify-center text-center text-muted-foreground'>
                  Keine verfügbaren Termine für diesen Tag.
                </div>
              ) : (
                <div className='space-y-4'>
                  {Object.entries(groupedSlots).map(([hour, slots]) => (
                    <div key={hour} className='space-y-2'>
                      <h3 className='text-sm font-medium'>{hour}:00 Uhr</h3>
                      <div className='grid grid-cols-4 gap-2'>
                        {slots.map((slot, index) => (
                          <Button
                            key={index}
                            variant={slot.isAvailable ? 'outline' : 'ghost'}
                            className={
                              slot.isAvailable
                                ? 'hover:bg-primary hover:text-primary-foreground'
                                : 'cursor-not-allowed opacity-50'
                            }
                            disabled={!slot.isAvailable}
                            onClick={() => handleTimeSelection(slot)}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {!isLoading && availableSlots.length > 0 && (
              <CardFooter>
                <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                  <Badge variant='outline' className='bg-green-50'>
                    Verfügbar
                  </Badge>
                  <Badge variant='outline' className='opacity-50'>
                    Nicht verfügbar
                  </Badge>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
