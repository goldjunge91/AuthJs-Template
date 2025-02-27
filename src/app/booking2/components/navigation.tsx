'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useBookingStore } from '../_lib/_store/state-store';
import { useState } from 'react';

interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  nextAction: () => Promise<void>;
  backAction: () => Promise<void>;
  resetAction: () => Promise<void>;
}

export function Navigation({
  currentStep,
  totalSteps,
  nextAction,
  backAction,
  resetAction,
}: NavigationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { vehicleClass, selectedPackage, customerDetails, dateTime } =
    useBookingStore();

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!vehicleClass;
      case 1:
        return !!selectedPackage;
      case 2:
        return true; // Zusatzoptionen sind optional
      case 3:
        return !!(
          customerDetails?.firstName &&
          customerDetails?.lastName &&
          customerDetails?.email &&
          customerDetails?.phone &&
          customerDetails?.street &&
          customerDetails?.number &&
          customerDetails?.postalCode &&
          customerDetails?.city
        );
      case 4:
        return !!dateTime;
      default:
        return false;
    }
  };

  const handleAction = async (action: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === totalSteps - 1) return null;

  return (
    <div className='flex justify-between gap-4'>
      <div className='flex gap-4'>
        <Button
          className='h-11 px-6 text-base'
          disabled={currentStep === 0 || isLoading}
          onClick={() => handleAction(backAction)}
          variant='outline'
        >
          Zurück
        </Button>
        <Button
          className='h-11 px-6 text-base'
          onClick={() => handleAction(resetAction)}
          variant='destructive'
          disabled={isLoading}
        >
          Abbrechen
        </Button>
      </div>
      <Button
        className='h-11 px-8 text-base font-medium'
        disabled={!canProceed() || isLoading}
        onClick={() => handleAction(nextAction)}
      >
        {isLoading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Wird geladen...
          </>
        ) : (
          'Weiter'
        )}
      </Button>
    </div>
  );
}

// 'use client';

// import { Button } from '@/components/ui/button';
// import { Loader2 } from 'lucide-react';
// import { useBookingStore } from '../_lib/_store/state-store';

// interface NavigationProps {
//   currentStep: number;
//   totalSteps: number;
//   onNext: () => void;
//   onBack: () => void;
//   onReset: () => void;
// }

// export function Navigation({
//   currentStep,
//   totalSteps,
//   onNext,
//   onBack,
//   onReset,
// }: NavigationProps) {
//   const { vehicleClass, selectedPackage, customerDetails, dateTime } =
//     useBookingStore();

//   const canProceed = () => {
//     switch (currentStep) {
//       case 0:
//         return !!vehicleClass;
//       case 1:
//         return !!selectedPackage;
//       case 2:
//         return true; // Zusatzoptionen sind optional
//       case 3:
//         return !!(
//           customerDetails?.firstName &&
//           customerDetails?.lastName &&
//           customerDetails?.email &&
//           customerDetails?.phone &&
//           customerDetails?.street &&
//           customerDetails?.number &&
//           customerDetails?.postalCode &&
//           customerDetails?.city
//         );
//       case 4:
//         return !!dateTime;
//       default:
//         return false;
//     }
//   };

//   if (currentStep === totalSteps - 1) return null;

//   return (
//     <div className='flex justify-between gap-4'>
//       <div className='flex gap-4'>
//         <Button
//           className='h-11 px-6 text-base'
//           disabled={currentStep === 0}
//           onClick={onBack}
//           variant='outline'
//         >
//           Zurück
//         </Button>
//         <Button
//           className='h-11 px-6 text-base'
//           onClick={onReset}
//           variant='destructive'
//         >
//           Abbrechen
//         </Button>
//       </div>
//       <Button
//         className='h-11 px-8 text-base font-medium'
//         disabled={!canProceed()}
//         onClick={onNext}
//       >
//         {false ? ( // isLoading state könnte hier eingefügt werden
//           <>
//             <Loader2 className='mr-2 h-4 w-4 animate-spin' />
//             Wird geladen...
//           </>
//         ) : (
//           'Weiter'
//         )}
//       </Button>
//     </div>
//   );
// }
