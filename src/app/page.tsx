import { Suspense } from 'react';
import { AnimatedCity } from './_components-landingpage/animated-city';
import { HeroSection } from './_components-landingpage/hero-section';
import { ClipLoader } from 'react-spinners';

export default function Page() {
  return (
    <main className='relative'>
      <Suspense
        fallback={
          <div className='flex min-h-[200px] items-center justify-center'>
            {' '}
            <ClipLoader color='#2563eb' size={50} />
          </div>
        }
      >
        <AnimatedCity />
      </Suspense>

      <div className='relative'>
        <Suspense
          fallback={
            <div className='flex min-h-[200px] items-center justify-center'>
              {' '}
              <ClipLoader color='#2563eb' size={50} />
            </div>
          }
        >
          <HeroSection />
        </Suspense>
      </div>
    </main>
  );
}
