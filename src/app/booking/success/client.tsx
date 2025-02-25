'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export function SuccessBookingClient() {
  const searchParams = useSearchParams();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('Keine Buchungs-ID gefunden');
      setLoading(false);
      return;
    }

    async function fetchBookingDetails() {
      try {
        const response = await fetch(
          `/api/bookings/details?sessionId=${sessionId}`,
        );

        if (!response.ok) {
          throw new Error('Buchungsdetails konnten nicht geladen werden');
        }

        const data = await response.json();
        setBookingDetails(data);
      } catch (err) {
        console.error(err);
        setError('Ein Fehler ist beim Laden der Buchungsdetails aufgetreten');
      } finally {
        setLoading(false);
      }
    }

    fetchBookingDetails();
  }, [sessionId]);

  if (isLoading) {
    return <div>Lade Buchungsdetails...</div>;
  }

  if (error) {
    return (
      <div className='my-4 border-l-4 border-red-500 bg-red-100 p-4'>
        <p className='text-red-700'>{error}</p>
        <Link
          href='/'
          className='mt-4 inline-block text-blue-500 hover:text-blue-700'
        >
          Zurück zur Startseite
        </Link>
      </div>
    );
  }

  return (
    <div className='rounded-lg bg-white p-6 shadow-md'>
      <div className='mb-6'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6 text-green-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>
        <h2 className='mt-4 text-xl font-semibold'>
          Vielen Dank für Ihre Buchung!
        </h2>
        <p className='mt-2 text-gray-600'>
          Eine Bestätigungsmail wurde an Ihre E-Mail-Adresse gesendet.
        </p>
      </div>

      {bookingDetails && (
        <div className='mb-6 rounded border border-gray-200 p-4'>
          <h3 className='mb-2 font-medium'>Buchungsdetails:</h3>
          <p>Buchungs-ID: {bookingDetails.id || sessionId}</p>
          {/* Weitere Buchungsdetails hier anzeigen */}
        </div>
      )}

      <div className='flex gap-4'>
        <Link href='/dashboard' passHref>
          <Button variant='default'>Zu meinen Buchungen</Button>
        </Link>
        <Link href='/' passHref>
          <Button variant='outline'>Zurück zur Startseite</Button>
        </Link>
      </div>
    </div>
  );
}
