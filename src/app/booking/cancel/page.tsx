'use client';

import React, { Suspense } from 'react';
import { CancelBookingClient } from './client';

export default function CancelBookingPage() {
  return (
    <div className='container mx-auto p-4'>
      <h1 className='mb-6 text-3xl font-bold'>Buchung stornieren</h1>
      <Suspense fallback={<div>Lade...</div>}>
        <CancelBookingClient />
      </Suspense>
    </div>
  );
}
