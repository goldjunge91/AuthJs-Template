'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import type {
  BookingData,
  Package as PackageType,
  AdditionalOption as AdditionalOptionType,
} from '@/types';
import packageData from '@/data.json';

const typedData: BookingData = packageData as unknown as BookingData;

interface PackageCardsProps {
  // eslint-disable-next-line no-unused-vars
  onPackageSelectAction: (pkg: PackageType) => void;
}

export default function PackageCards({
  onPackageSelectAction,
}: PackageCardsProps) {
  // Helper function to get first 2 additional options for card preview
  const getPreviewOptionsForPackage = (packageId: string) => {
    return typedData.additionalOptions
      .filter((option) => option['package.id'].includes(packageId))
      .slice(0, 2);
  };

  return (
    <div className='mx-auto flex max-w-4xl flex-col gap-16'>
      {[...typedData.packages]
        .sort((a, b) => {
          const order = [
            'innenaufbereitung',
            'aussenaufbereitung',
            'komplettaufbereitung',
          ];
          return order.indexOf(a.id) - order.indexOf(b.id);
        })
        .map((pkg, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className='relative transform overflow-hidden rounded-xl border border-blue-500/10 bg-white/80 backdrop-blur-lg transition-all duration-500 hover:-translate-y-3 hover:border-blue-500/30 hover:bg-white/90 hover:shadow-2xl hover:shadow-blue-500/20 dark:bg-white/5 dark:hover:bg-white/10'
            initial={{ opacity: 0, y: 50 }}
            key={pkg.id}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <div className='flex h-full flex-col sm:flex-row'>
              {/* Image Section */}
              <div className='relative h-56 w-full sm:h-auto sm:w-2/5'>
                <Image
                  alt={pkg.title}
                  blurDataURL='data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='
                  className='object-cover'
                  fill
                  placeholder='blur'
                  sizes='(max-width: 768px) 100vw, 40vw'
                  src={pkg.cardImage}
                />
                <div className='absolute inset-0 bg-gradient-to-r from-black/60 to-transparent' />
              </div>

              {/* Content Section */}
              <div className='relative flex flex-1 flex-col justify-between p-8'>
                <div>
                  <h3 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
                    {pkg.title}
                  </h3>
                  <p className='mb-4 line-clamp-2 text-gray-600 dark:text-gray-300'>
                    {pkg.description}
                  </p>
                </div>

                {/* Preview Options */}
                <div className='mt-4'>
                  <h4 className='mb-2 text-sm font-medium text-gray-600 dark:text-gray-400'>
                    Zusätzlich buchbare Optionen:
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {getPreviewOptionsForPackage(pkg.id).map(
                      (option: AdditionalOptionType) => (
                        <span
                          className='rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                          key={option.id}
                        >
                          {option.title} (ab
                          {option.price.kleinwagen})
                        </span>
                      ),
                    )}
                    {typedData.additionalOptions.filter(
                      (option: AdditionalOptionType) =>
                        option['package.id'].includes(pkg.id),
                    ).length > 2 && (
                      <span className='text-xs text-blue-500'>
                        + weitere Optionen
                      </span>
                    )}
                  </div>
                </div>

                {/* Price and Actions */}
                <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-semibold text-blue-500'>ab</p>
                    <p className='bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl'>
                      {pkg.price.kleinwagen}
                    </p>
                  </div>

                  <div className='flex gap-3'>
                    <Button
                      className='group relative flex-1 overflow-hidden sm:flex-none'
                      onClick={() => onPackageSelectAction(pkg)}
                      variant='outline'
                    >
                      Details
                      <div className='absolute inset-0 -z-10 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-10' />
                    </Button>

                    <Button className='group relative flex-1 overflow-hidden bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 hover:scale-105 sm:flex-none'>
                      Jetzt Buchen
                      <ArrowRight className='ml-2 h-5 w-5' />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
    </div>
  );
}
