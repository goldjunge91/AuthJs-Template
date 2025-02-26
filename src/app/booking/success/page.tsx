'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      router.push('/booking/vehicle-class');
      return;
    }

    const fetchBookingData = async () => {
      try {
        const response = await fetch(
          `/api/stripe/get-booking?session_id=${sessionId}`,
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
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className='flex h-[60vh] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto max-w-3xl py-8'>
        <Card>
          <CardHeader>
            <CardTitle className='text-red-600'>Fehler</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href='/'>Zurück zur Startseite</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto max-w-3xl py-8'>
      <Card className='border-green-200 bg-green-50'>
        <CardHeader>
          <div className='flex items-center space-x-2'>
            <CheckCircle className='h-6 w-6 text-green-600' />
            <CardTitle>Buchung erfolgreich!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-lg'>
            Vielen Dank für Ihre Buchung. Wir haben Ihre Zahlung erhalten und
            Ihren Termin bestätigt.
          </p>

          {bookingData && (
            <div className='rounded-md bg-white p-4 shadow-sm'>
              <h3 className='mb-2 font-medium'>Buchungsdetails:</h3>
              <p>
                <strong>Fahrzeugklasse:</strong> {bookingData.vehicleClass}
              </p>
              <p>
                <strong>Termin:</strong>{' '}
                {new Date(bookingData.dateTime).toLocaleString('de-DE')}
              </p>
              <p>
                <strong>Dauer:</strong> {bookingData.totalDuration} Minuten
              </p>
              <p>
                <strong>Kontakt:</strong> {bookingData.contactDetails.email}
              </p>
            </div>
          )}

          <p>
            Eine Bestätigung wurde an Ihre E-Mail-Adresse gesendet. Bei Fragen
            kontaktieren Sie uns bitte unter support@example.com.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href='/'>Zurück zur Startseite</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
