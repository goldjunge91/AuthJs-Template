'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function CancelBookingClient() {
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const session_id =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('session_id')
      : null;

  useEffect(() => {
    if (!session_id) {
      setError('Keine Buchungs-ID gefunden');
      setLoading(false);
      return;
    }

    async function updateBookingStatus() {
      try {
        const response = await fetch(
          `/api/bookings/cancel?session_id=${session_id}`,
          {
            method: 'POST',
          },
        );

        if (!response.ok) {
          console.error('Fehler beim Aktualisieren des Buchungsstatus');
          setError('Buchung konnte nicht storniert werden');
        }
      } catch (err) {
        setError('Ein Fehler ist aufgetreten');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    updateBookingStatus();
  }, [session_id, router]);

  const handleCancelBooking = async () => {
    setLoading(true);
    try {
      // Implementierung der Stornierungslogik hier
      router.push('/booking/cancelled');
    } catch (err) {
      setError('Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className='my-4 border-l-4 border-red-500 bg-red-100 p-4'>
        <p className='text-red-700'>{error}</p>
      </div>
    );
  }

  return (
    <div className='rounded-lg bg-white p-6 shadow-md'>
      {isLoading ? (
        <p>Verarbeite Stornierung...</p>
      ) : (
        <>
          <p className='mb-4'>Möchten Sie diese Buchung wirklich stornieren?</p>
          <p className='mb-4 text-sm text-gray-500'>
            Dieser Vorgang kann nicht rückgängig gemacht werden.
          </p>
        </>
      )}

      <div className='flex gap-4'>
        <Button
          variant='destructive'
          onClick={handleCancelBooking}
          disabled={isLoading}
        >
          Buchung stornieren
        </Button>
        <Button
          variant='outline'
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Zurück
        </Button>
      </div>
    </div>
  );
}
