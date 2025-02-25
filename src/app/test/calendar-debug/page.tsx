'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { format } from 'date-fns';
import {
  CalendarIcon,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Einfache DatePicker-Komponente als Ersatz
interface DatePickerProps {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

function DatePicker({ date, setDate }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className='w-full justify-start text-left font-normal'
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? format(date, 'PPP') : <span>Datum wählen</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default function CalendarDebugPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<any | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'auth' | 'events'>('auth');

  // Authentic ändern beim Laden unterschiedlicher Operationen
  const updateActiveTab = (tab: 'auth' | 'events') => {
    setActiveTab(tab);
  };

  // Authentifizierungsstatus prüfen
  const checkAuthStatus = useCallback(async () => {
    updateActiveTab('auth');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calendar/test-auth');
      const data = await response.json();

      setAuthStatus(data);

      if (!data.testResult?.success) {
        setError(data.testResult?.error || 'Authentifizierung fehlgeschlagen');
      }
    } catch (err) {
      console.error('Fehler beim Abrufen des Authentifizierungsstatus:', err);
      setError('Fehler beim Abrufen des Authentifizierungsstatus');
    } finally {
      setLoading(false);
    }
  }, []);

  // Kalendertermine abrufen
  const fetchCalendarEvents = async () => {
    if (!startDate) {
      setError('Bitte wählen Sie ein Startdatum');
      return;
    }

    updateActiveTab('events');
    setLoading(true);
    setError(null);

    try {
      const formattedDate = format(startDate, 'yyyy-MM-dd');
      const url = `/api/calendar/list-events?startDate=${formattedDate}&days=${days}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setCalendarEvents(data);
      } else {
        setError(data.error || 'Fehler beim Abrufen der Kalendertermine');
      }
    } catch (err) {
      console.error('Fehler beim Abrufen der Kalendertermine:', err);
      setError('Fehler beim Abrufen der Kalendertermine');
    } finally {
      setLoading(false);
    }
  };

  // Beim ersten Laden Authentifizierungsstatus prüfen
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Ereignisse für einen Tag formatieren
  const formatEventsForDay = (date: string, events: any[] = []) => {
    return (
      <div key={date} className='mb-4'>
        <h3 className='mb-2 border-b pb-2 text-lg font-medium'>{date}</h3>
        {events.length === 0 ? (
          <p className='italic text-gray-500'>Keine Termine für diesen Tag</p>
        ) : (
          <ul className='space-y-2'>
            {events.map((event, index) => (
              <li key={index} className='border-l-2 border-blue-500 py-1 pl-3'>
                <div className='font-medium'>{event.summary}</div>
                <div className='text-sm text-gray-600'>
                  {event.isFullDay
                    ? 'Ganztägig'
                    : `${event.start?.substring(11, 16)} - ${event.end?.substring(11, 16)}`}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className='container py-8'>
      <h1 className='mb-6 text-3xl font-bold'>Google Calendar Debug</h1>

      <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Authentifizierungsstatus</CardTitle>
            <CardDescription>
              Überprüfen Sie die Konfiguration und Zugänglichkeit des
              Google-Kalenders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={checkAuthStatus}
              disabled={loading}
              variant='outline'
              className='mb-4'
            >
              {loading && activeTab === 'auth' ? (
                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <RefreshCw className='mr-2 h-4 w-4' />
              )}
              Status aktualisieren
            </Button>

            {authStatus ? (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-2'>
                  <div className='font-medium'>API-Schlüssel:</div>
                  <div className='flex items-center'>
                    {authStatus.config.apiKeyConfigured ? (
                      <>
                        <CheckCircle className='mr-1 h-4 w-4 text-green-500' />
                        <span>{authStatus.config.apiKeyPrefix}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className='mr-1 h-4 w-4 text-red-500' />
                        <span>Nicht konfiguriert</span>
                      </>
                    )}
                  </div>

                  <div className='font-medium'>Kalender-ID:</div>
                  <div>
                    <span className='rounded bg-gray-100 p-1 font-mono text-sm'>
                      {authStatus.config.calendarId}
                    </span>
                  </div>

                  <div className='font-medium'>Zugriff möglich:</div>
                  <div className='flex items-center'>
                    {authStatus.testResult?.calendarAccessible ? (
                      <>
                        <CheckCircle className='mr-1 h-4 w-4 text-green-500' />
                        <span>Ja</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className='mr-1 h-4 w-4 text-red-500' />
                        <span>Nein</span>
                      </>
                    )}
                  </div>
                </div>

                {authStatus.testResult?.details && (
                  <div className='mt-4'>
                    <h4 className='mb-2 font-medium'>Fehlerdetails:</h4>
                    <pre className='overflow-auto rounded bg-gray-100 p-3 text-xs'>
                      {JSON.stringify(authStatus.testResult.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : error ? (
              <div className='flex items-center text-red-500'>
                <AlertCircle className='mr-2 h-5 w-5' />
                {error}
              </div>
            ) : (
              <p className='text-gray-500'>
                Klicken Sie auf &quot;Status aktualisieren&quot;
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kalendertermine abrufen</CardTitle>
            <CardDescription>
              Zeigen Sie alle Termine für einen Zeitraum an
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='mb-1 block text-sm font-medium'>
                    Startdatum
                  </label>
                  <DatePicker date={startDate} setDate={setStartDate} />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium'>
                    Anzahl Tage
                  </label>
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className='w-full rounded border p-2'
                  >
                    {[1, 3, 7, 14, 30, 60, 90].map((value) => (
                      <option key={value} value={value}>
                        {value} {value === 1 ? 'Tag' : 'Tage'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={fetchCalendarEvents}
                disabled={loading || !startDate}
                className='w-full'
              >
                {loading && activeTab === 'events' ? (
                  <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <CalendarIcon className='mr-2 h-4 w-4' />
                )}
                Termine abrufen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kalendertermine anzeigen */}
      {calendarEvents && (
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>
              Kalendertermine {calendarEvents.startDate} bis{' '}
              {calendarEvents.endDate}
            </CardTitle>
            <CardDescription>
              Insgesamt {calendarEvents.totalEvents} Termine gefunden
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calendarEvents.totalEvents === 0 ? (
              <p className='italic text-gray-500'>
                Keine Termine im ausgewählten Zeitraum gefunden
              </p>
            ) : (
              <div className='max-h-[60vh] overflow-y-auto pr-4'>
                {/* Nach Tagen sortieren */}
                {Object.entries(calendarEvents.eventsByDay).map(
                  ([day, events]) => formatEventsForDay(day, events as any[]),
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className='flex justify-end'>
            <Button variant='outline' size='sm' onClick={fetchCalendarEvents}>
              <RefreshCw className='mr-2 h-4 w-4' />
              Aktualisieren
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Fehleranzeige */}
      {error && (
        <div className='mb-8 rounded-md border border-red-200 bg-red-50 p-4'>
          <div className='flex'>
            <AlertCircle className='mr-2 h-5 w-5 text-red-500' />
            <div>
              <h3 className='font-medium text-red-800'>Fehler</h3>
              <p className='text-red-700'>{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
