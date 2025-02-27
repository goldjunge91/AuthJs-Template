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
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CancelBookingPage() {
  // Using useParams hook instead of receiving params as props
  const params = useParams();
  const session_id = params.session_id as string;
  const router = useRouter();

  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session_id) {
      router.push('/booking/vehicle-class');
      return;
    }

    // Automatisch die Buchung stornieren
    const cancelBooking = async () => {
      if (cancelled || cancelling) return;

      setCancelling(true);
      try {
        const response = await fetch(
          `/api/stripe/cancel-booking?session_id=${session_id}`,
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
  }, [session_id, cancelled, cancelling, router]);

  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mb-4 flex justify-center'>
            <AlertCircle className='h-16 w-16 text-amber-500' />
          </div>
          <CardTitle>Buchung abgebrochen</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          {cancelling ? (
            <p>Ihre Buchung wird storniert...</p>
          ) : error ? (
            <>
              <p className='mb-4 text-destructive'>{error}</p>
              <p>
                Bitte kontaktieren Sie uns, wenn das Problem weiterhin besteht.
              </p>
            </>
          ) : (
            <>
              <p>
                Ihre Buchung wurde abgebrochen. Es wurden keine Kosten
                berechnet.
              </p>
              <p className='mt-4 text-sm text-muted-foreground'>
                Sie können jederzeit einen neuen Buchungsvorgang starten.
              </p>
            </>
          )}
        </CardContent>
        <CardFooter className='flex justify-center gap-4'>
          <Button asChild variant='outline'>
            <Link href='/'>Zurück zur Startseite</Link>
          </Button>
          <Button asChild>
            <Link href='/booking/vehicle-class'>Neue Buchung</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
