'use client';

import { Check } from 'lucide-react';
import { useBookingStore } from '../_lib/_store/state-store';
import { packages, additionalOptions } from '../_data/index';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function PackageSelection() {
  const { vehicleClass, selectedPackage, setSelectedPackage, setDuration } =
    useBookingStore();
  // Frühe Rückgabe wenn kein Fahrzeug ausgewählt
  //   if (!vehicleClass) {
  //     return (
  //       <div className='p-8 text-center'>
  //         <p className='text-muted-foreground'>
  //           Bitte wählen Sie zuerst ein Fahrzeug aus.
  //         </p>
  //       </div>
  //     );

  // Frühe Rückgabe wenn kein Fahrzeug ausgewählt
  if (!vehicleClass) {
    return (
      <div className='p-8 text-center'>
        <p className='text-muted-foreground'>
          Bitte wählen Sie zuerst ein Fahrzeug aus.
        </p>
      </div>
    );
  }

  // Verfügbare Pakete filtern und Dauer setzen
  const handlePackageSelect = (packageId: string) => {
    const selectedPkg = packages.find((pkg) => pkg.id === packageId);
    if (selectedPkg) {
      setSelectedPackage(packageId);
      // Setze die Basis-Dauer des Pakets
      setDuration(selectedPkg.duration[vehicleClass]);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-3'>
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            onClick={() => handlePackageSelect(pkg.id)}
            className={cn(
              'relative cursor-pointer transition-all',
              selectedPackage === pkg.id && 'border-primary bg-primary/5',
            )}
          >
            <CardHeader>
              <CardTitle>{pkg.title}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-primary'>
                {pkg.price[vehicleClass]}
              </div>
              <div className='text-sm text-muted-foreground'>
                Dauer: {pkg.duration[vehicleClass]} Minuten
              </div>
              <ul className='mt-4 space-y-2'>
                {pkg.bullets.map((bullet) => (
                  <li key={bullet} className='flex items-start gap-2'>
                    <Check className='h-5 w-5 shrink-0 text-primary' />
                    <span className='text-sm'>{bullet}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdditionalOptions() {
  const {
    vehicleClass,
    selectedPackage,
    additionalOptions: selectedOptions,
    setAdditionalOptions,
    setDuration,
  } = useBookingStore();

  if (!vehicleClass || !selectedPackage) return null;

  // Nur Zusatzoptionen anzeigen, die zum gewählten Paket passen
  const availableOptions = additionalOptions.filter((option) =>
    option.packageId?.includes(selectedPackage),
  );

  const handleOptionToggle = (optionId: string) => {
    const option = availableOptions.find((opt) => opt.id === optionId);
    const newOptions = selectedOptions.includes(optionId)
      ? selectedOptions.filter((id) => id !== optionId)
      : [...selectedOptions, optionId];

    setAdditionalOptions(newOptions);

    // Aktualisiere die Gesamtdauer
    if (option) {
      const baseDuration =
        packages.find((pkg) => pkg.id === selectedPackage)?.duration[
          vehicleClass
        ] || 0;
      const additionalDuration = newOptions.reduce((total, id) => {
        const opt = additionalOptions.find((o) => o.id === id);
        return total + (opt?.duration[vehicleClass] || 0);
      }, 0);
      setDuration(baseDuration + additionalDuration);
    }
  };

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {availableOptions.map((option) => (
        <Card
          key={option.id}
          onClick={() => handleOptionToggle(option.id)}
          className={cn(
            'relative cursor-pointer',
            selectedOptions.includes(option.id) && 'border-primary',
          )}
        >
          <CardContent>
            <h3 className='font-medium'>{option.title}</h3>
            <p className='text-sm text-muted-foreground'>
              {option.description}
            </p>
            <div className='mt-2'>
              <span className='text-xl font-bold text-primary'>
                {option.price[vehicleClass]}
              </span>
              <span className='text-sm text-muted-foreground'>
                (+{option.duration[vehicleClass]} Min.)
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
