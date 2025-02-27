'use client';

import type { PropsWithChildren } from 'react';

export default function BookingLayout({ children }: PropsWithChildren) {
  return (
    <div className='min-h-screen bg-background dark:bg-background'>
      <div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
        {children}
      </div>
    </div>
  );
}
