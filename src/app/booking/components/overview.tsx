'use client';

import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Calendar,
  Car,
  CheckCircle,
  CreditCard,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '../_lib/_store/state-store';
import { vehicles, packages, additionalOptions } from '../_data/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export function BookingOverview() {
  const [isLoading, setIsLoading] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const router = useRouter();

  const {
    vehicleClass,
    selectedPackage,
    additionalOptions: selectedOptions,
    dateTime,
    customerDetails,
    calculatedPrice,
    duration,
    reset,
  } = useBookingStore();

  const selectedVehicle = vehicles.find((v) => v.type === vehicleClass);
  const selectedServicePackage = packages.find((p) => p.id === selectedPackage);
  const selectedAdditionalOptions = additionalOptions.filter((option) =>
    selectedOptions?.includes(option.id),
  );

  const handleBooking = async () => {
    if (!legalAccepted) {
      toast.error('Bitte akzeptieren Sie die rechtlichen Bedingungen');
      return;
    }

    if (
      !vehicleClass ||
      !selectedPackage ||
      !dateTime ||
      !customerDetails ||
      !calculatedPrice
    ) {
      toast.error('Bitte füllen Sie alle erforderlichen Felder aus');
      return;
    }

    try {
      setIsLoading(true);

      // Sende Buchungsdaten an die API
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleClass,
          selectedPackage,
          additionalOptions: selectedOptions,
          dateTime,
          customerDetails,
          calculatedPrice,
          duration,
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler bei der Erstellung der Checkout-Session');
      }

      const { url } = await response.json();

      // Weiterleitung zur Stripe Checkout Seite
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Keine Checkout-URL erhalten');
      }
    } catch (error) {
      console.error('Buchungsfehler:', error);
      toast.error('Ein Fehler ist aufgetreten');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    router.push('/booking');
  };

  if (!vehicleClass || !selectedPackage || !dateTime || !customerDetails) {
    return null;
  }

  return (
    <div className='mx-auto max-w-4xl'>
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold tracking-tight'>Ihre Buchung</h1>
        <p className='text-muted-foreground'>
          Überprüfen Sie Ihre Buchungsdetails und schließen Sie die Buchung ab.
        </p>
      </div>

      <div className='grid gap-6'>
        {/* Fahrzeug & Service */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between border-b bg-muted/50 py-4'>
            <CardTitle className='flex items-center gap-2 text-lg font-medium'>
              <Car className='h-5 w-5 text-primary' />
              Fahrzeug & Service
            </CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='grid gap-6 sm:grid-cols-2'>
              <div>
                <h3 className='mb-2 text-sm font-medium text-muted-foreground'>
                  Ausgewähltes Fahrzeug
                </h3>
                <div className='rounded-lg border bg-muted/30 p-4'>
                  <p className='text-lg font-semibold'>
                    {selectedVehicle?.title}
                  </p>
                </div>
              </div>
              <div>
                <h3 className='mb-2 text-sm font-medium text-muted-foreground'>
                  Gewähltes Paket
                </h3>
                <div className='rounded-lg border bg-muted/30 p-4'>
                  <p className='text-lg font-semibold'>
                    {selectedServicePackage?.title}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {selectedServicePackage?.description}
                  </p>
                </div>
              </div>
            </div>

            {selectedAdditionalOptions.length > 0 && (
              <div className='mt-6'>
                <h3 className='mb-2 text-sm font-medium text-muted-foreground'>
                  Zusatzoptionen
                </h3>
                <div className='space-y-2'>
                  {selectedAdditionalOptions.map((option) => (
                    <div
                      key={option.id}
                      className='rounded-lg border bg-muted/30 p-3'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <CheckCircle className='h-4 w-4 text-primary' />
                          <span className='font-medium'>{option.title}</span>
                        </div>
                        <span className='font-semibold'>
                          {option.price[vehicleClass]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Termin & Kontakt */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between border-b bg-muted/50 py-4'>
            <CardTitle className='flex items-center gap-2 text-lg font-medium'>
              <Calendar className='h-5 w-5 text-primary' />
              Termin & Kontakt
            </CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='grid gap-6 sm:grid-cols-2'>
              <div>
                <h3 className='mb-2 text-sm font-medium text-muted-foreground'>
                  Gewählter Termin
                </h3>
                <div className='rounded-lg border bg-muted/30 p-4'>
                  <p className='text-lg font-semibold'>
                    {format(new Date(dateTime), 'PPP', { locale: de })}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {format(new Date(dateTime), 'p', { locale: de })} Uhr
                  </p>
                </div>
              </div>
              <div>
                <h3 className='mb-2 text-sm font-medium text-muted-foreground'>
                  Ihre Kontaktdaten
                </h3>
                <div className='rounded-lg border bg-muted/30 p-4'>
                  <p className='text-lg font-semibold'>
                    {customerDetails.firstName} {customerDetails.lastName}
                  </p>
                  <div className='mt-2 space-y-1 text-sm text-muted-foreground'>
                    <p className='flex items-center gap-2'>
                      <Mail className='h-4 w-4' />
                      {customerDetails.email}
                    </p>
                    <p className='flex items-center gap-2'>
                      <Phone className='h-4 w-4' />
                      {customerDetails.phone}
                    </p>
                    <p className='flex items-center gap-2'>
                      <MapPin className='h-4 w-4' />
                      {customerDetails.street} {customerDetails.number}
                      <br />
                      {customerDetails.postalCode} {customerDetails.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rechtliche Hinweise */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-start space-x-3'>
              <Checkbox
                id='terms'
                checked={legalAccepted}
                onCheckedChange={(checked) => setLegalAccepted(!!checked)}
              />
              <div className='space-y-1'>
                <Label
                  htmlFor='terms'
                  className='text-sm font-medium leading-none'
                >
                  Ich akzeptiere die rechtlichen Bedingungen
                </Label>
                <p className='text-xs text-muted-foreground'>
                  Mit dem Absenden der Buchung akzeptiere ich die{' '}
                  <a href='/agb' className='text-primary hover:underline'>
                    AGB
                  </a>
                  ,{' '}
                  <a
                    href='/datenschutz'
                    className='text-primary hover:underline'
                  >
                    Datenschutzerklärung
                  </a>{' '}
                  und{' '}
                  <a href='/widerruf' className='text-primary hover:underline'>
                    Widerrufsbelehrung
                  </a>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zahlungsübersicht */}
        <Card className='bg-primary/5'>
          <CardContent className='p-6'>
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <CreditCard className='h-5 w-5 text-primary' />
                  <h3 className='text-lg font-semibold'>Gesamtbetrag</h3>
                </div>
                <div className='text-right'>
                  <p className='text-2xl font-bold'>
                    {calculatedPrice.totalPrice.toFixed(2).replace('.', ',')} €
                  </p>
                  <p className='text-sm text-muted-foreground'>inkl. MwSt.</p>
                </div>
              </div>

              <Separator />

              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Servicepaket</span>
                  <span className='font-medium'>
                    {calculatedPrice.packagePrice.toFixed(2).replace('.', ',')}{' '}
                    €
                  </span>
                </div>
                {calculatedPrice.additionalOptionsPrice > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Zusatzoptionen
                    </span>
                    <span className='font-medium'>
                      {calculatedPrice.additionalOptionsPrice
                        .toFixed(2)
                        .replace('.', ',')}{' '}
                      €
                    </span>
                  </div>
                )}
              </div>

              <div className='flex flex-col gap-4'>
                <Button
                  size='lg'
                  onClick={handleBooking}
                  disabled={isLoading || !legalAccepted}
                  className='w-full'
                >
                  {isLoading
                    ? 'Wird bearbeitet...'
                    : 'Jetzt kostenpflichtig buchen'}
                </Button>
                <Button
                  variant='outline'
                  size='lg'
                  onClick={handleCancel}
                  disabled={isLoading}
                  className='w-full'
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
