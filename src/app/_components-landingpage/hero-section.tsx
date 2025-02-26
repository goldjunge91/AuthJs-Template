'use client';

import { ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
// import { motion } from 'framer-motion';

export function HeroSection() {
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <section className='mt-[0px]'>
      <div className='flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl'>
          <div>
            <h1
              className={`mb-6 text-3xl font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-gray-900'
              } sm:text-5xl lg:text-6xl`}
            >
              Professionelle{' '}
              <span className='bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent'>
                Autoaufbereitung
              </span>{' '}
              <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                auf höchstem Niveau
              </span>
            </h1>
          </div>

          <p
            className={`mb-8 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} sm:mb-12 sm:text-xl lg:text-2xl`}
          >
            Ihr Fahrzeug verdient das Beste - Wir bringen den Glanz zurück
          </p>

          <div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
            <Link href='/pakete' className='min-w-[200px] sm:w-auto'>
              <Button
                className={`group relative w-full overflow-hidden px-6 py-2 hover:scale-105 sm:px-8 sm:py-3 ${
                  isDark
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } transition-colors hover:text-emerald-500`}
                variant='outline'
                size='lg'
              >
                <span className='relative z-10'>Preise Ansehen</span>
                <div className='absolute inset-0 -z-10 bg-gradient-to-r from-emerald-600 to-emerald-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
              </Button>
            </Link>
            <Link href='/booking' className='min-w-[200px] sm:w-auto'>
              <Button
                className='group relative w-full overflow-hidden bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-2 text-white transition-colors hover:scale-105 hover:text-emerald-500 sm:px-8 sm:py-3'
                size='lg'
              >
                <span className='relative z-10 flex items-center justify-center'>
                  Termin buchen
                  <ArrowRight className='ml-2 group-hover:text-emerald-500' />
                </span>
                <div className='absolute inset-0 -z-10 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
              </Button>
            </Link>
          </div>

          <div className='mt-8 flex flex-wrap justify-center gap-4 sm:mt-16 sm:gap-6'>
            <div
              className={`rounded-lg px-4 py-2 backdrop-blur-sm sm:px-6 sm:py-3 ${isDark ? 'bg-white/10' : 'bg-gray-900/10'}`}
            >
              <p
                className={`text-xs font-medium sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Kleinwagen
              </p>
              <p
                className={`text-xl font-bold sm:text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                ab 90€
              </p>
            </div>
            <div
              className={`rounded-lg px-4 py-2 backdrop-blur-sm sm:px-6 sm:py-3 ${isDark ? 'bg-white/10' : 'bg-gray-900/10'}`}
            >
              <p
                className={`text-xs font-medium sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
              >
                SUV
              </p>
              <p
                className={`text-xl font-bold sm:text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                ab 130€
              </p>
            </div>
            <div
              className={`rounded-lg px-4 py-2 backdrop-blur-sm sm:px-6 sm:py-3 ${isDark ? 'bg-white/10' : 'bg-gray-900/10'}`}
            >
              <p
                className={`text-xs font-medium sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Transporter
              </p>
              <p
                className={`text-xl font-bold sm:text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                ab 160€
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
