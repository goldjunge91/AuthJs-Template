'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

import type { Package as PackageType } from '@/types';
import BottomCta from './components/bottom-cta';
import Features from './components/features';
import Hero from './components/hero';
import PackageCards from './components/package-cards';
import PackageModal from './components/package-modal';
import TrustMetrics from './components/trust-metrics';

export default function PricingPackages() {
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const circles = [
    { x: 10, y: 1000, delay: 0 },
    { x: 50, y: 20, delay: 2 },
    { x: 80, y: 40, delay: 1.5 },
    { x: 100, y: 60, delay: 2.5 },
    { x: 0, y: 10, delay: 1 },
  ];

  return (
    <div className='relative min-h-screen w-full overflow-y-hidden bg-transparent dark:bg-transparent/95'>
      {/* Animated Background */}
      <div className='absolute inset-0 overflow-x-auto overflow-y-hidden'>
        {/* Grid pattern */}
        <div
          className='absolute inset-0 opacity-[0.15]'
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--tw-prose-pre-bg, #ddd) 1px, transparent 1px),
              linear-gradient(to bottom, var(--tw-prose-pre-bg, #ddd) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Animated circles */}
        <div className='absolute inset-0 overflow-hidden overflow-y-hidden'>
          {circles.map((circle, i) => (
            <motion.div
              key={i}
              animate={{
                x: [circle.x, circle.x + 20, circle.x],
                y: [circle.y, circle.y + 20, circle.y],
                scale: [0.8, 1.2, 0.8],
              }}
              // className='absolute rounded-full bg-emerald-400 opacity-100 blur-[0px] dark:bg-emerald-500'
              // className='absolute rounded-full bg-emerald-400 opacity-80 ring-2 ring-red-500 ring-offset-4 blur-[50px]'
              className='absolute rounded-full bg-emerald-400 opacity-80 ring-2 ring-red-500 ring-offset-4 blur-[50px]'
              initial={{ x: circle.x, y: circle.y, scale: 0.8 }}
              style={{
                width: '300px', // Fixed pixel width
                height: '300px', // Same as width to ensure circle
                aspectRatio: '1/1', // Backup to ensure circle
                left: `calc(${i * 30}% - 150px)`,
                top: `calc(${i * 20}% - 150px)`,
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                repeatType: 'reverse',
                duration: 15,
                delay: circle.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Gradient Overlay */}
        <div className='absolute inset-0 bg-gradient-to-b from-white/80 via-white/70 to-white/80 dark:from-black dark:via-black/95 dark:to-black/90' />
        {/* <div className='absolute rounded-full bg-emerald-400 opacity-80 ring-2 ring-red-500 ring-offset-4 blur-[50px]' /> */}
      </div>

      {/* Content */}
      <section className='container relative mx-auto px-4 py-24'>
        <Hero />
        <TrustMetrics />
        <Features />
        <PackageCards
          onPackageSelectAction={(pkg) => {
            setSelectedPackage(pkg);
            setIsModalOpen(true);
          }}
        />
        <PackageModal
          isOpen={isModalOpen}
          onOpenChangeAction={setIsModalOpen}
          selectedPackage={selectedPackage}
        />
        <BottomCta />
      </section>
    </div>
  );
}
