'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  fallbackMode?: boolean;
}

export function VideoPlayer({ fallbackMode = false }: VideoPlayerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Diese Funktion prüft, ob die Videodatei existiert
  const checkVideoExists = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Fehler beim Prüfen der Videodatei:', error);
      return false;
    }
  };

  useEffect(() => {
    setIsMounted(true);

    // Prüfe, ob die Videodatei verfügbar ist
    checkVideoExists('/videos/car-detailing.mp4').then((exists) => {
      if (!exists) {
        console.warn(
          'Videodatei nicht gefunden. Bitte stelle sicher, dass die Datei existiert.',
        );
      }

      // Starte das Video automatisch, wenn die Komponente geladen ist
      if (videoRef.current) {
        videoRef.current.muted = true; // Immer stumm starten - wichtig für Autoplay
        setIsMuted(true);

        videoRef.current.play().catch((error) => {
          console.log('Autoplay wurde verhindert:', error);
          // Weitere Versuche sind optional, da wir bereits muted gesetzt haben
        });
      }
    });

    // Cleanup-Funktion
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        videoRef.current.src = '';
      }
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Importiere die Fallback-Komponente für den Video-Player
  const { FallbackVideoPlayer } = require('./fallback-video-player');

  // Wenn noch nicht geladen oder im Fallback-Modus
  if (!isMounted || fallbackMode) {
    return fallbackMode ? <FallbackVideoPlayer /> : null;
  }

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
          <div
            className={`relative overflow-hidden rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'} shadow-xl`}
          >
            {/* Video Element */}
            <video
              ref={videoRef}
              className='h-auto w-full'
              poster='/images/video-thumbnail.jpg' // Platzhalter-Bild
              autoPlay
              loop
              muted
              playsInline
              controlsList='nodownload'
              onEnded={() => setIsPlaying(false)}
              onError={(e) => console.error('Video-Fehler:', e)}
            >
              {/* Mehrere Quellen für bessere Kompatibilität */}
              <source src='/videos/car-detailing.mp4' type='video/mp4' />
              <source src='/videos/car-detailing.webm' type='video/webm' />
              <p className='p-4 text-center'>
                Ihr Browser unterstützt keine Videos.{' '}
                <a
                  href='/videos/car-detailing.mp4'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-500 hover:underline'
                >
                  Video herunterladen
                </a>
              </p>
            </video>

            {/* Video Controls */}
            <div className='absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-4'>
              <button
                onClick={togglePlay}
                className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700'
                aria-label={isPlaying ? 'Pausieren' : 'Abspielen'}
              >
                {isPlaying ? (
                  <Pause size={20} />
                ) : (
                  <Play size={20} className='ml-1' />
                )}
              </button>

              <button
                onClick={toggleMute}
                className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/80 text-white transition hover:bg-gray-700'
                aria-label={isMuted ? 'Ton einschalten' : 'Ton ausschalten'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
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
