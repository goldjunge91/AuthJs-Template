'use client';

import { motion } from 'framer-motion';
import { Clock, Shield, Star } from 'lucide-react';

export default function TrustMetrics() {
  const trustMetrics = [
    { number: '500+', label: 'Zufriedene Kunden', icon: Star },
    { number: '4.9/5', label: 'Kundenbewertung', icon: Shield },
    { number: '24/7', label: 'Support', icon: Clock },
  ];

  return (
    <div className='mb-16 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-12'>
      {trustMetrics.map((metric, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className='py-4 text-center sm:py-0'
          initial={{ opacity: 0, y: 20 }}
          key={index}
          transition={{ delay: 0.2 * index }}
        >
          <metric.icon className='mx-auto mb-2 h-8 w-8 text-blue-500 dark:text-blue-400' />
          <div className='mb-1 text-2xl font-bold text-gray-900 dark:text-white'>
            {metric.number}
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-400'>
            {metric.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
