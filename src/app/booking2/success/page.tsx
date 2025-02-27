// 'use client';

// import { useEffect } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { Loader2 } from 'lucide-react';

// export default function SuccessPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const session_id = searchParams.get('session_id');

//   useEffect(() => {
//     if (session_id) {
//       // Weiterleitung zur dynamischen Route
//       router.replace(`/booking/success/${session_id}`);
//     } else {
//       // Wenn keine session_id vorhanden ist, zurück zur Buchungsseite
//       router.replace('/booking/vehicle-class');
//     }
//   }, [session_id, router]);

//   return (
//     <div className='flex min-h-[60vh] flex-col items-center justify-center p-4'>
//       <Loader2 className='h-16 w-16 animate-spin text-primary' />
//       <p className='mt-4 text-muted-foreground'>Weiterleitung...</p>
//     </div>
//   );
// }
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import SuccessPageClient from './success-page-client';

// Server component as the main page
export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-[60vh] flex-col items-center justify-center p-4'>
          <Loader2 className='h-16 w-16 animate-spin text-primary' />
          <p className='mt-4 text-muted-foreground'>
            Buchungsdetails werden geladen...
          </p>
        </div>
      }
    >
      <SuccessPageClient />
    </Suspense>
  );
}
