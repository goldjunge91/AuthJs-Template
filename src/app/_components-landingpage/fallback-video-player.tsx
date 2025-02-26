'use client';

import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Play, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Diese Komponente wird angezeigt, wenn der Videoplayer nicht funktioniert
export function FallbackVideoPlayer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Status, ob das alternative Video angezeigt werden soll
  const [showAlt, setShowAlt] = useState(false);

  return (
    <section className='py-16 md:py-24'>
      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-5xl text-center'>
          <h2
            className={`mb-6 text-2xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            } sm:text-3xl lg:text-4xl`}
          >
            Sehen Sie unsere{' '}
            <span className='bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent'>
              Professionelle Arbeit
            </span>{' '}
            in Aktion
          </h2>
          <p
            className={`mb-8 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} sm:text-xl`}
          >
            Wir bringen Ihren Wagen auf Hochglanz - Qualität, die man sehen kann
          </p>
        </div>

        <div className='mx-auto max-w-4xl'>
          {!showAlt ? (
            // Statisches Bild mit Play-Button
            <div
              className={`relative aspect-video cursor-pointer overflow-hidden rounded-xl ${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              } shadow-xl`}
              onClick={() => setShowAlt(true)}
            >
              <div
                className='h-full w-full bg-cover bg-center'
                style={{
                  backgroundImage: "url('/images/video-thumbnail.jpg')",
                }}
              />
              <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                <div className='flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700'>
                  <Play size={40} className='ml-2' />
                </div>
              </div>
            </div>
          ) : (
            // YouTube-Embed (falls eigenes Video nicht funktioniert)
            <div className='aspect-video overflow-hidden rounded-xl shadow-xl'>
              <iframe
                className='h-full w-full'
                src='https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'
                title='Video'
                frameBorder='0'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
              />
            </div>
          )}

          <div className='mt-8 flex flex-col items-center'>
            <Link href='/pakete' className='min-w-[250px] sm:w-auto'>
              <Button
                className={`group relative w-full overflow-hidden px-6 py-3 hover:scale-105 ${
                  isDark
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition-colors`}
                size='lg'
              >
                <span className='relative z-10 flex items-center justify-center'>
                  Unsere Leistungen entdecken
                  <ArrowRight className='ml-2' />
                </span>
              </Button>
            </Link>
          </div>

          <div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <div
              className={`rounded-lg p-4 text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              <p
                className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Professionelle Technik
              </p>
              <p
                className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Modernste Werkzeuge und Produkte für optimale Ergebnisse
              </p>
            </div>
            <div
              className={`rounded-lg p-4 text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              <p
                className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Erfahrene Experten
              </p>
              <p
                className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Unser Team mit jahrelanger Erfahrung in der Fahrzeugpflege
              </p>
            </div>
            <div
              className={`rounded-lg p-4 text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              <p
                className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Garantierte Qualität
              </p>
              <p
                className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Zufriedenheitsgarantie für alle unsere Dienstleistungen
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
