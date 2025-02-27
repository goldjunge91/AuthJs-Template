'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

const steps = [
  { id: 1, name: 'Fahrzeugklasse', href: '/booking/vehicle-class' },
  { id: 2, name: 'Pakete', href: '/booking/packages' },
  { id: 3, name: 'Optionen', href: '/booking/options' },
  { id: 4, name: 'Persönliche Daten', href: '/booking/personal-details' },
  { id: 5, name: 'Termin', href: '/booking/date-time' },
  { id: 6, name: 'Übersicht & Zahlung', href: '/booking/checkout' },
];

export function BookingSteps() {
  const pathname = usePathname();

  // Finde den aktuellen Schritt basierend auf dem Pfad
  const currentStepIndex = steps.findIndex((step) =>
    pathname.includes(step.href),
  );
  const currentStep = currentStepIndex !== -1 ? steps[currentStepIndex] : null;

  return (
    <nav aria-label='Progress' className='mb-8'>
      <ol
        role='list'
        className='divide-y divide-gray-200 rounded-md border border-gray-200 md:flex md:divide-y-0'
      >
        {steps.map((step, stepIdx) => {
          const isCurrentStep = step.id === currentStep?.id;
          const isCompleted = step.id < (currentStep?.id || 0);

          return (
            <li key={step.name} className='relative md:flex md:flex-1'>
              {isCompleted ? (
                <Link
                  href={step.href}
                  className='group flex w-full items-center'
                >
                  <span className='flex items-center px-6 py-4 text-sm font-medium'>
                    <span className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary'>
                      <CheckCircle
                        className='h-6 w-6 text-white'
                        aria-hidden='true'
                      />
                    </span>
                    <span className='ml-4 text-sm font-medium'>
                      {step.name}
                    </span>
                  </span>
                </Link>
              ) : isCurrentStep ? (
                <span
                  className='flex items-center px-6 py-4 text-sm font-medium'
                  aria-current='step'
                >
                  <span className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary'>
                    <span className='text-primary'>{step.id}</span>
                  </span>
                  <span className='ml-4 text-sm font-medium text-primary'>
                    {step.name}
                  </span>
                </span>
              ) : (
                <span className='group flex items-center px-6 py-4 text-sm font-medium'>
                  <span className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300'>
                    <span className='text-gray-500'>{step.id}</span>
                  </span>
                  <span className='ml-4 text-sm font-medium text-gray-500'>
                    {step.name}
                  </span>
                </span>
              )}

              {stepIdx !== steps.length - 1 ? (
                <div
                  className='absolute right-0 top-0 hidden h-full w-5 md:block'
                  aria-hidden='true'
                >
                  <svg
                    className='h-full w-full text-gray-300'
                    viewBox='0 0 22 80'
                    fill='none'
                    preserveAspectRatio='none'
                  >
                    <path
                      d='M0 -2L20 40L0 82'
                      vectorEffect='non-scaling-stroke'
                      stroke='currentcolor'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
