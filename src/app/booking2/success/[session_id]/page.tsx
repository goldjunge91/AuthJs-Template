'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const router = useRouter();
  const params = useParams();
  const session_id = params.session_id as string;

  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session_id) {
      router.push('/booking/vehicle-class');
      return;
    }

    const fetchBookingData = async () => {
      try {
        const response = await fetch(
          `/api/stripe/get-booking?session_id=${session_id}`,
        );

        if (!response.ok) {
          throw new Error('Fehler beim Abrufen der Buchungsdaten');
        }

        const data = await response.json();
        setBookingData(data);
      } catch (err) {
        console.error('Fehler:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Ein unbekannter Fehler ist aufgetreten',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [session_id, router]);

  if (loading) {
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <CardTitle>Buchungsbestätigung wird geladen...</CardTitle>
          </CardHeader>
          <CardContent className='flex justify-center py-8'>
            <Loader2 className='h-16 w-16 animate-spin text-primary' />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <CardTitle>Fehler beim Laden der Buchungsbestätigung</CardTitle>
          </CardHeader>
          <CardContent className='py-6 text-center'>
            <p className='mb-4 text-destructive'>{error}</p>
            <p>
              Bitte kontaktieren Sie uns, wenn das Problem weiterhin besteht.
            </p>
          </CardContent>
          <CardFooter className='flex justify-center'>
            <Button asChild>
              <Link href='/booking/vehicle-class'>Zurück zur Buchung</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mb-4 flex justify-center'>
            <CheckCircle className='h-16 w-16 text-green-500' />
          </div>
          <CardTitle>Buchung erfolgreich!</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='mb-6 text-center'>
            Vielen Dank für Ihre Buchung. Wir haben Ihnen eine Bestätigung per
            E-Mail gesendet.
          </p>

          {bookingData && (
            <div className='space-y-2 text-sm'>
              <p>
                <strong>Datum:</strong>{' '}
                {new Date(bookingData.dateTime).toLocaleDateString('de-DE')}
              </p>
              <p>
                <strong>Uhrzeit:</strong>{' '}
                {new Date(bookingData.dateTime).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p>
                <strong>Dauer:</strong> {bookingData.totalDuration} Minuten
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Button asChild>
            <Link href='/'>Zurück zur Startseite</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
