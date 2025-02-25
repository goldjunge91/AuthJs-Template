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
const PRELOAD_DAYS = 5;

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

  const today = startOfToday();
  const maxDate = addDays(today, 14);

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

      setIsLoading(true);
      setCalendarError(null);
      const dateKey = getDateKey(date);

      try {
        // Prüfe, ob wir gültige Cache-Daten haben
        const cachedData = slotsCache[dateKey];
        const now = Date.now();

        if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
          console.log('Verwende gecachte Zeitslots für:', dateKey);
          setAvailableSlots(cachedData.slots);
          setIsLoading(false);
          return;
        }

        console.log('Rufe verfügbare Zeitslots ab für:', dateKey);

        // Setze verfügbare Slots zurück, während wir neue laden
        setAvailableSlots([]);

        // Timeout für die API-Anfrage (10 Sekunden)
        const timeoutPromise = new Promise<Response>((_, reject) =>
          setTimeout(
            () =>
              reject(new Error('Zeitüberschreitung bei der Kalenderabfrage')),
            10000,
          ),
        );

        try {
          // Eigentliche Anfrage
          const fetchPromise = fetch(
            `/api/calendar/check-availability?date=${date.toISOString()}`,
            {
              method: 'GET',
              headers: {
                Accept: 'application/json',
              },
            },
          );

          // Verwende das Ergebnis der schnelleren Promise (entweder Antwort oder Timeout)
          const response = (await Promise.race([
            fetchPromise,
            timeoutPromise,
          ])) as Response;

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              error: `HTTP Fehler ${response.status}`,
            }));
            console.error('API-Antwort nicht erfolgreich:', errorData);
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

          // Zeige alle Slots, auch die nicht verfügbaren, um dem Benutzer zu zeigen,
          // welche Zeitslots belegt sind
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
          console.error('Netzwerkfehler:', fetchError);

          // Detaillierte Fehlerdiagnose
          if (
            fetchError &&
            typeof fetchError === 'object' &&
            'name' in fetchError &&
            'message' in fetchError &&
            fetchError.name === 'TypeError' &&
            fetchError.message === 'Failed to fetch'
          ) {
            console.error(
              'Verbindungsproblem: Der Server ist möglicherweise nicht erreichbar',
            );
            setCalendarError(
              'Der Kalender-Server ist nicht erreichbar. Bitte überprüfen Sie Ihre Internetverbindung.',
            );
          } else {
            throw fetchError; // Weitergeben an den äußeren catch-Block
          }
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Zeitslots:', error);
        setCalendarError(
          error instanceof Error
            ? error.message
            : 'Unbekannter Fehler bei der Kalenderabfrage',
        );
        // Bei Fehler: Leeres Array setzen - keine Fallbacks!
        setAvailableSlots([]);
      } finally {
        setIsLoading(false);
      }
    },
    [slotsCache, getDateKey, ensureArray],
  );

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
        fetchAvailableSlots(date);
      } else {
        setAvailableSlots([]);
        setCalendarError(null);
      }
    },
    [fetchAvailableSlots],
  );

  // Automatisch das aktuelle Datum laden, wenn die Komponente geladen wird
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, fetchAvailableSlots]);

  // Proaktives Laden von Terminen für die nächsten Tage
  useEffect(() => {
    const preloadFutureDates = async () => {
      console.log(
        `🔄 Lade proaktiv Termine für die nächsten ${PRELOAD_DAYS} Tage...`,
      );

      // Starte mit dem heutigen Tag
      const startDate = startOfToday();

      // Lade die Termine für die nächsten PRELOAD_DAYS Tage
      for (let i = 0; i < PRELOAD_DAYS; i++) {
        const dateToLoad = addDays(startDate, i);
        const dateKey = getDateKey(dateToLoad);

        // Prüfe, ob die Daten bereits im Cache sind
        const cachedData = slotsCache[dateKey];
        const now = Date.now();

        if (!cachedData || now - cachedData.timestamp >= CACHE_TTL) {
          console.log(`🔄 Proaktives Laden für ${dateKey}...`);
          // Warte kurz zwischen den Anfragen, um den Server nicht zu überlasten
          await new Promise((resolve) => setTimeout(resolve, 500));
          fetchAvailableSlots(dateToLoad).catch((err) => {
            console.error(`Fehler beim proaktiven Laden für ${dateKey}:`, err);
          });
        } else {
          console.log(
            `✅ Daten für ${dateKey} bereits im Cache, überspringe...`,
          );
        }
      }
    };

    // Starte das proaktive Laden nach einer kurzen Verzögerung
    const timer = setTimeout(() => {
      preloadFutureDates();
    }, 1000);

    return () => clearTimeout(timer);
  }, [fetchAvailableSlots, getDateKey, slotsCache]);

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
              Termine können bis zu 14 Tage im Voraus gebucht werden.
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
