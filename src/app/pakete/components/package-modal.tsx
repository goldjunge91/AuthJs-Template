'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type {
  BookingData,
  Package as PackageType,
  AdditionalOption as AdditionalOptionType,
} from '@/types';
import packageData from '@/data.json';

const typedData: BookingData = packageData as unknown as BookingData;

interface PackageModalProps {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onOpenChangeAction: (isOpen: boolean) => void;
  selectedPackage: PackageType | null;
}

export default function PackageModal({
  isOpen,
  onOpenChangeAction,
  selectedPackage,
}: PackageModalProps) {
  const [imgLoading, setImgLoading] = useState(true);

  const getAllOptionsForPackage = (packageId: string) => {
    return typedData.additionalOptions.filter((option) =>
      option['package.id'].includes(packageId),
    );
  };

  if (!selectedPackage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChangeAction}>
      <DialogContent className='flex max-h-[90vh] w-full flex-col overflow-hidden border-gray-200 bg-white/95 dark:border-white/10 dark:bg-black/95 sm:max-w-2xl [&>button]:hidden'>
        <div className='relative h-56 w-full flex-shrink-0 sm:h-72 md:h-80'>
          {imgLoading && (
            <div className='absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700' />
          )}
          <Image
            fill
            priority
            alt={selectedPackage.title}
            className={`rounded-t-lg object-cover transition-opacity duration-500 ${
              imgLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoadingComplete={() => setImgLoading(false)}
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            src={selectedPackage.detailImage}
          />
        </div>
        <div className='flex-shrink-0 p-4 sm:p-6'>
          <DialogHeader>
            <DialogTitle className='text-2xl text-gray-900 dark:text-white'>
              {selectedPackage.title}
            </DialogTitle>
          </DialogHeader>
          <p className='mt-4 text-gray-600 dark:text-gray-300'>
            {selectedPackage.description}
          </p>
        </div>
        <div className='flex-1 overflow-y-auto p-4 pt-0 sm:p-6 sm:pt-0'>
          <div className='grid grid-cols-1 gap-4'>
            {selectedPackage.bullets?.map((bullet: string, index: number) => (
              <div
                className='rounded-lg border border-blue-500/10 bg-white/80 p-4 transition-all duration-300 hover:border-blue-500/30 dark:bg-white/5'
                key={index}
              >
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600 dark:text-gray-300'>
                    {bullet}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className='h-4 w-4 text-gray-400' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className='text-sm'>
                          Detaillierte Informationen zum Service...
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </div>
          <div className='mt-8'>
            <h4 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
              Zusätzliche Optionen
            </h4>
            <div className='grid grid-cols-1 gap-4'>
              {getAllOptionsForPackage(selectedPackage.id).map(
                (option: AdditionalOptionType) => (
                  <div
                    className='rounded-lg border border-blue-500/10 bg-white/80 p-4 transition-all duration-300 hover:border-blue-500/30 dark:bg-white/5'
                    key={option.id}
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <h5 className='font-medium'>{option.title}</h5>
                        <p className='text-sm text-gray-500'>
                          Ab {option.price.kleinwagen}
                        </p>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className='h-4 w-4 text-gray-400' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className='text-sm'>
                              Detaillierte Informationen zur Option...
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
          <div className='mt-8'>
            <h4 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
              Zusätzliche Informationen
            </h4>
            <div className='mb-20 rounded-lg bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-200 sm:mb-40'>
              <p className='flex items-center gap-2 text-sm'>
                <span>*</span>
                Bei zu starker Verschmutzung wird eine zusätzliche Gebühr
                erhoben.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
