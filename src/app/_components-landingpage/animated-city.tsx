'use client';

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

// Car SVG component
function CarSVG({ color = '#ffffff' }: { color?: string }) {
  return (
    <svg width='24' height='48' viewBox='0 0 24 48' fill={color}>
      {/* Car body */}
      <rect x='4' y='12' width='16' height='24' rx='2' />
      {/* Windows */}
      <rect x='6' y='15' width='12' height='8' fill='#333' />
      <rect x='6' y='25' width='12' height='8' fill='#333' />
      {/* Wheels */}
      <circle cx='6' cy='10' r='2' fill='#333' />
      <circle cx='18' cy='10' r='2' fill='#333' />
      <circle cx='6' cy='38' r='2' fill='#333' />
      <circle cx='18' cy='38' r='2' fill='#333' />
    </svg>
  );
}

// Building component for city blocks
function Building({ height, delay }: { height: number; delay: number }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.div
      className='relative h-full w-full'
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div
        className={`absolute inset-0 rounded-sm ${
          isDark
            ? 'bg-gradient-to-b from-gray-700 to-gray-800'
            : 'bg-gradient-to-b from-gray-200 to-gray-300'
        }`}
        style={{ height: `${height}%` }}
      >
        {/* Windows */}
        <div className='grid h-full grid-cols-3 gap-1 p-1'>
          {Array.from({ length: Math.floor((height / 100) * 12) }).map(
            (_, i) => (
              <div
                key={i}
                className={`rounded-sm ${
                  isDark ? 'bg-yellow-100/10' : 'bg-gray-800/10'
                }`}
                style={{
                  opacity: Math.random() > 0.3 ? 0.8 : 0,
                }}
              />
            ),
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Define multiple car paths for different routes
const carPaths = {
  route1: 'M-200,300 H3000',
  route2: 'M-200,600 H3000',
  route3: 'M-200,900 H3000',
  route4: 'M300,-200 V1600',
  route5: 'M900,-200 V1600',
  route6: 'M1500,-200 V1600',
};

// Define building blocks between streets
const buildingBlocks = [
  { top: 0, bottom: 240 }, // Above first street
  { top: 360, bottom: 540 }, // Between first and second street
  { top: 660, bottom: 840 }, // Between second and third street
  { top: 960, bottom: 1200 }, // Below third street
];

// Define building areas to avoid streets
const buildingAreas = [
  { start: 0, end: 260 }, // Before first vertical street
  { start: 340, end: 860 }, // Between first and second vertical street
  { start: 940, end: 1460 }, // Between second and third vertical street
  { start: 1540, end: 2000 }, // After third vertical street
];

export function AnimatedCity() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDark = mounted ? theme === 'dark' : false; // Default to light theme during SSR

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return a consistent skeleton during SSR and initial mount
  if (!mounted) {
    return (
      <div className='fixed inset-0 mt-[65px]'>
        <div className='absolute inset-0 bg-[#f0f0f0]'>
          <div className='absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90' />
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 mt-[65px]'>
      <div
        className={`absolute inset-0 ${
          isDark ? 'bg-[#0a0a0a]' : 'bg-[#f0f0f0]'
        }`}
      >
        {/* Grid pattern for streets */}
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `
              linear-gradient(to right, ${
                isDark ? '#222' : '#ddd'
              } 1px, transparent 1px),
              linear-gradient(to bottom, ${
                isDark ? '#222' : '#ddd'
              } 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Main roads with traffic lanes */}
        <div className='absolute inset-0'>
          <svg width='100%' height='100%' className='opacity-40'>
            {/* Horizontal roads */}
            <g>
              <path
                d='M-200,300 H3000'
                stroke={isDark ? '#444' : '#ccc'}
                strokeWidth='60'
              />
              <path
                d='M-200,600 H3000'
                stroke={isDark ? '#444' : '#ccc'}
                strokeWidth='60'
              />
              <path
                d='M-200,900 H3000'
                stroke={isDark ? '#444' : '#ccc'}
                strokeWidth='60'
              />
              {/* Lane markings */}
              <path
                d='M-200,300 H3000'
                stroke={isDark ? '#666' : '#999'}
                strokeWidth='2'
                strokeDasharray='20,20'
              />
              <path
                d='M-200,600 H3000'
                stroke={isDark ? '#666' : '#999'}
                strokeWidth='2'
                strokeDasharray='20,20'
              />
              <path
                d='M-200,900 H3000'
                stroke={isDark ? '#666' : '#999'}
                strokeWidth='2'
                strokeDasharray='20,20'
              />
            </g>
            {/* Vertical roads */}
            <g>
              <path
                d='M300,-200 V1600'
                stroke={isDark ? '#444' : '#ccc'}
                strokeWidth='60'
              />
              <path
                d='M900,-200 V1600'
                stroke={isDark ? '#444' : '#ccc'}
                strokeWidth='60'
              />
              <path
                d='M1500,-200 V1600'
                stroke={isDark ? '#444' : '#ccc'}
                strokeWidth='60'
              />
              {/* Lane markings */}
              <path
                d='M300,-200 V1600'
                stroke={isDark ? '#666' : '#999'}
                strokeWidth='2'
                strokeDasharray='20,20'
              />
              <path
                d='M900,-200 V1600'
                stroke={isDark ? '#666' : '#999'}
                strokeWidth='2'
                strokeDasharray='20,20'
              />
              <path
                d='M1500,-200 V1600'
                stroke={isDark ? '#666' : '#999'}
                strokeWidth='2'
                strokeDasharray='20,20'
              />
            </g>
          </svg>
        </div>

        {/* City Blocks */}
        {buildingBlocks.map((block, blockIndex) => (
          <div
            key={blockIndex}
            className='absolute left-0 right-0'
            style={{
              top: `${block.top}px`,
              height: `${block.bottom - block.top}px`,
            }}
          >
            {buildingAreas.map((area, areaIndex) => (
              <div
                key={`${blockIndex}-${areaIndex}`}
                className='absolute h-full'
                style={{
                  left: `${area.start}px`,
                  width: `${area.end - area.start}px`,
                }}
              >
                <div className='grid h-full grid-cols-4 gap-4 px-4'>
                  {Array.from({ length: 4 }).map((_, i) => {
                    const height = Math.floor(Math.random() * 60) + 40; // 40-100%
                    return (
                      <Building
                        key={`${blockIndex}-${areaIndex}-${i}`}
                        height={height}
                        delay={blockIndex * 0.1 + areaIndex * 0.05 + i * 0.03}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Animated Cars */}
        {Object.entries(carPaths).map(([key, path], index) => (
          <motion.div
            key={key}
            className='absolute'
            initial={{ offsetDistance: '0%' }}
            animate={{
              offsetDistance: '100%',
            }}
            transition={{
              duration: 20 + index * 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
              delay: index * 3,
            }}
            style={{
              offsetPath: `path("${path}")`,
              offsetRotate: 'auto 90deg',
            }}
          >
            <CarSVG
              color={
                isDark
                  ? [
                      '#ffffff',
                      '#ffeb3b',
                      '#90caf9',
                      '#81c784',
                      '#ff9800',
                      '#f06292',
                    ][index]
                  : [
                      '#333333',
                      '#f59e0b',
                      '#3b82f6',
                      '#22c55e',
                      '#ea580c',
                      '#db2777',
                    ][index]
              }
            />
          </motion.div>
        ))}
      </div>
      <div
        className={`absolute inset-0 bg-gradient-to-b ${
          isDark
            ? 'from-black/90 via-black/70 to-black/90'
            : 'from-white/90 via-white/70 to-white/90'
        }`}
      />
    </div>
  );
}
