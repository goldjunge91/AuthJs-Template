'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

export default function BottomCTA() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const content = (
    <div className='mb-32 mt-24 text-center'>
      <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white'>
        Bereit für den perfekten Glanz?
      </h2>
      <p className='mx-auto mb-8 max-w-lg text-gray-600 dark:text-gray-400'>
        Vereinbaren Sie noch heute einen Termin und erleben Sie den Unterschied
        professioneller Fahrzeugpflege.
      </p>
      <Button className='group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-400 px-8 py-6 transition-all duration-300 hover:scale-105'>
        <span className='relative z-10 flex items-center text-lg'>
          Jetzt Termin vereinbaren
          <motion.div
            animate={{ x: [0, 5, 0] }}
            className='ml-2'
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
          >
            <ArrowRight className='h-6 w-6' />
          </motion.div>
        </span>
        <div className='absolute inset-0 mb-32 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      </Button>
    </div>
  );

  if (!isMounted) {
    return content;
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay: 0.5 }}
    >
      {content}
    </motion.div>
  );
}
