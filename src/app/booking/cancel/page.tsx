import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import CancelPageClient from './cancel-page-client';

// Server component as the main page
export default function CancelPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-[60vh] flex-col items-center justify-center p-4'>
          <Loader2 className='h-16 w-16 animate-spin text-primary' />
          <p className='mt-4 text-muted-foreground'>Weiterleitung...</p>
        </div>
      }
    >
      <CancelPageClient />
    </Suspense>
  );
}
