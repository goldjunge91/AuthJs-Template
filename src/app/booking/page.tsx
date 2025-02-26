'use client';

import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { VehicleSelection } from './components/vehicle';
import { PackageSelection, AdditionalOptions } from './components/service';
import { CustomerForm } from './components/customer';
import { DateTimeSelection } from './components/dateTime';
import { BookingOverview } from './components/overview';
import { BookingSummary } from './components/summary';
import { Navigation } from './components/navigation';
import { useBookingStore } from './_lib/_store/state-store';
import { bookingSteps } from './_data';

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const { reset } = useBookingStore();

  const nextAction = async () => {
    if (currentStep < bookingSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const backAction = async () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const resetAction = async () => {
    reset();
    setCurrentStep(0);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <VehicleSelection />;
      case 1:
        return <PackageSelection />;
      case 2:
        return <AdditionalOptions />;
      case 3:
        return <CustomerForm />;
      case 4:
        return <DateTimeSelection />;
      case 5:
        return <BookingOverview />;
      default:
        return null;
    }
  };

  return (
    <main className='min-h-screen bg-background pt-24 dark:bg-background'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {currentStep !== bookingSteps.length - 1 && (
          <div className='mb-12'>
            <div className='mb-6 flex items-center justify-between'>
              <div className='space-y-1'>
                <h1 className='text-2xl font-semibold'>Buchungsprozess</h1>
                <p className='text-sm text-muted-foreground'>
                  {bookingSteps[currentStep]}
                </p>
              </div>
              <span className='text-lg font-medium text-primary'>
                Schritt {currentStep + 1} von {bookingSteps.length}
              </span>
            </div>
            <Progress
              value={((currentStep + 1) / bookingSteps.length) * 100}
              className='h-2 bg-secondary'
            />
          </div>
        )}

        <div
          className={
            currentStep === bookingSteps.length - 1
              ? 'mx-auto max-w-3xl'
              : 'grid gap-8 md:grid-cols-[1fr_350px]'
          }
        >
          <div className='space-y-6'>
            {renderStep()}
            <Navigation
              currentStep={currentStep}
              totalSteps={bookingSteps.length}
              nextAction={nextAction}
              backAction={backAction}
              resetAction={resetAction}
            />
          </div>
          {currentStep !== bookingSteps.length - 1 && (
            <div className='hidden md:block'>
              <BookingSummary />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
