'use client';

import { Car, Clock, Package2, Plus } from 'lucide-react';
import { useBookingStore } from '../_lib/_store/state-store';
import { vehicles, packages, additionalOptions } from '../_data';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function BookingSummary() {
  const {
    vehicleClass,
    selectedPackage,
    additionalOptions: selectedOptions,
    dateTime,
    calculatedPrice,
  } = useBookingStore();

  const selectedVehicle = vehicles.find((v) => v.type === vehicleClass);
  const selectedServicePackage = packages.find((p) => p.id === selectedPackage);
  const selectedAdditionalOptions = additionalOptions.filter((option) =>
    selectedOptions?.includes(option.id),
  );

  return (
    <div className='sticky top-24'>
      <Card className='p-6'>
        <h3 className='mb-6 text-xl font-semibold'>Buchungsübersicht</h3>

        <div className='space-y-6'>
          {selectedVehicle && (
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Car className='h-4 w-4' />
                <span>Fahrzeug</span>
              </div>
              <div className='font-medium'>{selectedVehicle.title}</div>
            </div>
          )}

          {selectedServicePackage && (
            <>
              <Separator />
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                  <Package2 className='h-4 w-4' />
                  <span>Service-Paket</span>
                </div>
                <div className='font-medium'>
                  {selectedServicePackage.title}
                </div>
                {vehicleClass && (
                  <div className='text-sm font-medium text-primary'>
                    {selectedServicePackage.price[vehicleClass]}
                  </div>
                )}
              </div>
            </>
          )}

          {selectedAdditionalOptions.length > 0 && (
            <>
              <Separator />
              <div className='space-y-3'>
                <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                  <Plus className='h-4 w-4' />
                  <span>Zusatzoptionen</span>
                </div>
                {selectedAdditionalOptions.map((option) => (
                  <div key={option.id} className='space-y-1'>
                    <div className='font-medium'>{option.title}</div>
                    {vehicleClass && (
                      <div className='text-sm font-medium text-primary'>
                        {option.price[vehicleClass]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {dateTime && (
            <>
              <Separator />
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                  <Clock className='h-4 w-4' />
                  <span>Termin</span>
                </div>
                <div className='font-medium'>
                  {new Date(dateTime).toLocaleString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </>
          )}

          {calculatedPrice.totalPrice > 0 && (
            <>
              <Separator />
              <div className='space-y-2'>
                <div className='flex justify-between text-sm font-medium'>
                  <span className='text-muted-foreground'>Service-Paket</span>
                  <span>{calculatedPrice.packagePrice}€</span>
                </div>
                {calculatedPrice.additionalOptionsPrice > 0 && (
                  <div className='flex justify-between text-sm font-medium'>
                    <span className='text-muted-foreground'>
                      Zusatzoptionen
                    </span>
                    <span>{calculatedPrice.additionalOptionsPrice}€</span>
                  </div>
                )}
                <Separator className='my-2' />
                <div className='flex justify-between'>
                  <span className='font-medium'>Gesamtpreis</span>
                  <span className='text-lg font-semibold text-primary'>
                    {calculatedPrice.totalPrice}€
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
