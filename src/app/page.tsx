import { Suspense } from 'react';
import { AnimatedCity } from './_components-landingpage/animated-city';
import { HeroSection } from './_components-landingpage/hero-section';
import { VideoPlayer } from './_components-landingpage/video-player';
import { FallbackVideoPlayer } from './_components-landingpage/fallback-video-player';
import { ErrorBoundary } from './_components/error-boundary';
import { ClipLoader } from 'react-spinners';

export default function Page() {
  return (
    <main className='relative'>
      <Suspense
        fallback={
          <div className='flex items-center justify-center'>
            {' '}
            <ClipLoader color='#2563eb' size={80} />
          </div>
        }
      >
        <AnimatedCity />
      </Suspense>
      <div className='relative'>
        <Suspense
          fallback={
            <div className='flex items-center justify-center'>
              {' '}
              <ClipLoader color='#2563eb' size={50} />
            </div>
          }
        >
          <HeroSection />
        </Suspense>
      </div>
      <div className='relative'>
        <Suspense
          fallback={
            <div className='flex items-center justify-center'>
              {' '}
              <ClipLoader color='#2563eb' size={200} />
            </div>
          }
        >
          <ErrorBoundary fallback={<FallbackVideoPlayer />}>
            <VideoPlayer />
          </ErrorBoundary>
        </Suspense>
      </div>
    </main>
  );
}
