'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '../_lib/_store/state-store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatAmountForDisplay } from '@/utils/stripe/stripe-helpers';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useSession } from 'next-auth/react';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const {
    vehicleClass,
    selectedPackage,
    additionalOptions,
    dateTime,
    customerDetails,
    calculatedPrice,
    duration,
  } = useBookingStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Überprüfen, ob alle notwendigen Daten vorhanden sind
  useEffect(() => {
    if (!vehicleClass || !selectedPackage || !dateTime || !customerDetails) {
      router.push('/booking/vehicle-class');
    }
  }, [vehicleClass, selectedPackage, dateTime, customerDetails, router]);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleClass,
          selectedPackage,
          additionalOptions,
          dateTime,
          customerDetails,
          calculatedPrice,
          duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Fehler beim Erstellen der Checkout-Session',
        );
      }

      // Weiterleitung zur Stripe Checkout-Seite
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout-Fehler:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Ein unbekannter Fehler ist aufgetreten',
      );
      setIsLoading(false);
    }
  };

  if (!vehicleClass || !selectedPackage || !dateTime || !customerDetails) {
    return (
      <div className='flex h-[60vh] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='container mx-auto max-w-3xl py-8'>
      <h1 className='mb-6 text-3xl font-bold'>Bestellübersicht</h1>

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Fahrzeugdetails</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-lg font-medium'>Fahrzeugklasse: {vehicleClass}</p>
        </CardContent>
      </Card>

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Gewählte Leistungen</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <h3 className='font-medium'>Hauptpaket:</h3>
            <p>{selectedPackage}</p>
          </div>

          {additionalOptions && additionalOptions.length > 0 && (
            <div>
              <h3 className='font-medium'>Zusätzliche Optionen:</h3>
              <ul className='list-inside list-disc'>
                {additionalOptions.map((option, index) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Termindetails</CardTitle>
        </CardHeader>
        <CardContent>
          {dateTime && (
            <p>
              {format(new Date(dateTime), 'EEEE, d. MMMM yyyy', { locale: de })}{' '}
              um {format(new Date(dateTime), 'HH:mm', { locale: de })} Uhr
            </p>
          )}
          <p>Geschätzte Dauer: {duration} Minuten</p>
        </CardContent>
      </Card>

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Persönliche Daten</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <p>
            {customerDetails.firstName} {customerDetails.lastName}
          </p>
          <p>{customerDetails.email}</p>
          <p>{customerDetails.phone}</p>
        </CardContent>
      </Card>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Preisübersicht</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='flex justify-between'>
            <span>Grundpreis:</span>
            <span>
              {formatAmountForDisplay(calculatedPrice.basePrice, 'EUR')}
            </span>
          </div>
          {calculatedPrice.additionalOptionsPrice > 0 && (
            <div className='flex justify-between'>
              <span>Zusätzliche Optionen:</span>
              <span>
                {formatAmountForDisplay(
                  calculatedPrice.additionalOptionsPrice,
                  'EUR',
                )}
              </span>
            </div>
          )}
          <Separator className='my-2' />
          <div className='flex justify-between font-bold'>
            <span>Gesamtpreis:</span>
            <span>
              {formatAmountForDisplay(calculatedPrice.totalPrice, 'EUR')}
            </span>
          </div>
        </CardContent>
        <CardFooter className='flex flex-col space-y-4'>
          {error && (
            <div className='w-full rounded-md bg-red-50 p-3 text-red-600'>
              {error}
            </div>
          )}
          <Button
            onClick={handleCheckout}
            disabled={isLoading}
            className='w-full'
            size='lg'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Wird bearbeitet...
              </>
            ) : (
              'Jetzt bezahlen'
            )}
          </Button>
          <p className='text-center text-sm text-muted-foreground'>
            Durch Klicken auf &ldquo;Jetzt bezahlen&#34; werden Sie zu unserem
            Zahlungsanbieter weitergeleitet.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
