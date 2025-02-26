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
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CancelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      router.push('/booking/vehicle-class');
      return;
    }

    // Optional: Automatisch die Buchung stornieren
    const cancelBooking = async () => {
      if (cancelled || cancelling) return;

      setCancelling(true);
      try {
        const response = await fetch(
          `/api/stripe/cancel-booking?session_id=${sessionId}`,
          {
            method: 'POST',
          },
        );

        if (!response.ok) {
          throw new Error('Fehler beim Stornieren der Buchung');
        }

        setCancelled(true);
      } catch (err) {
        console.error('Fehler:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Ein unbekannter Fehler ist aufgetreten',
        );
      } finally {
        setCancelling(false);
      }
    };

    cancelBooking();
  }, [sessionId, router, cancelled, cancelling]);

  return (
    <div className='container mx-auto max-w-3xl py-8'>
      <Card>
        <CardHeader>
          <div className='flex items-center space-x-2'>
            <AlertCircle className='h-6 w-6 text-amber-600' />
            <CardTitle>Buchung abgebrochen</CardTitle>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p>
            Sie haben den Zahlungsvorgang abgebrochen. Ihre Buchung wurde nicht
            abgeschlossen und es wurden keine Kosten berechnet.
          </p>

          {error && (
            <div className='rounded-md bg-red-50 p-3 text-red-600'>{error}</div>
          )}

          {cancelled && (
            <div className='rounded-md bg-green-50 p-3 text-green-600'>
              Die Buchung wurde erfolgreich storniert.
            </div>
          )}

          <p>
            Möchten Sie den Buchungsvorgang erneut starten oder haben Sie
            Fragen? Kontaktieren Sie uns gerne unter support@example.com.
          </p>
        </CardContent>
        <CardFooter className='flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0'>
          <Button asChild variant='outline'>
            <Link href='/'>Zurück zur Startseite</Link>
          </Button>
          <Button asChild>
            <Link href='/booking/vehicle-class'>Neue Buchung starten</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
