'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CancelPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const session_id = searchParams.get('session_id');

  useEffect(() => {
    if (session_id) {
      // Weiterleitung zur dynamischen Route
      router.replace(`/booking/cancel/${session_id}`);
    } else {
      // Wenn keine session_id vorhanden ist, zurück zur Buchungsseite
      router.replace('/booking/vehicle-class');
    }
  }, [session_id, router]);

  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center p-4'>
      <Loader2 className='h-16 w-16 animate-spin text-primary' />
      <p className='mt-4 text-muted-foreground'>Weiterleitung...</p>
    </div>
  );
}
