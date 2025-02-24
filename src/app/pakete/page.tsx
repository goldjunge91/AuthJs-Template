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
    { x: 20, y: 30, delay: 0 },
    { x: 50, y: 20, delay: 5 },
    { x: 80, y: 40, delay: 10 },
  ];

  return (
    <div className='relative min-h-screen w-full bg-gray-50 dark:bg-black/95'>
      {/* Animated Background */}
      <div className='absolute inset-0 overflow-hidden'>
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
        <div className='absolute inset-0'>
          {circles.map((circle, i) => (
            <motion.div
              key={i}
              animate={{
                x: [circle.x, circle.x + 20, circle.x],
                y: [circle.y, circle.y + 20, circle.y],
                scale: [0.8, 1.2, 0.8],
              }}
              className='absolute rounded-full bg-emerald-400 opacity-80 blur-[50px] dark:bg-emerald-500'
              initial={{ x: circle.x, y: circle.y, scale: 0.8 }}
              style={{
                width: '40%',
                height: '40%',
                left: `${i * 30}%`,
                top: `${i * 20}%`,
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
