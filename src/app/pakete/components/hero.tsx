'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className='mb-16 pt-24 text-center'
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.8 }}
    >
      <motion.span
        animate={{
          scale: [1, 1.05, 1],
          x: [0, 2, 0],
        }}
        className='mb-2 inline-block text-lg font-semibold text-blue-500'
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 2,
          ease: 'easeInOut',
        }}
      >
        <span aria-label='sparkles' role='img'>
          ✨
        </span>{' '}
        Premium Fahrzeugpflege
      </motion.span>

      <h1 className='mb-6 text-6xl font-bold tracking-tight text-gray-900 dark:text-white sm:mb-6 sm:text-3xl md:text-5xl lg:text-6xl'>
        <span className='bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent'>
          Unsere Pakete
        </span>
      </h1>

      <p className='mx-auto max-w-2xl text-xl leading-relaxed text-gray-600 dark:text-gray-400'>
        Verwöhnen Sie Ihr Fahrzeug mit unserer{' '}
        <span className='font-semibold text-emerald-500'>
          professionellen Pflege
        </span>{' '}
        - vom Express-Service bis zur Premium-Behandlung
      </p>
    </motion.div>
  );
}
