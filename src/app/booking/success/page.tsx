'use client';

import React, { Suspense } from 'react';
import { SuccessBookingClient } from './client';

export default function SuccessBookingPage() {
  return (
    <div className='container mx-auto p-4'>
      <h1 className='mb-6 text-3xl font-bold'>Buchung erfolgreich</h1>
      <Suspense fallback={<div>Lade Buchungsdetails...</div>}>
        <SuccessBookingClient />
      </Suspense>
    </div>
  );
}
