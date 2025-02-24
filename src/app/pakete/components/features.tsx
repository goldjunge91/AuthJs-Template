'use client';

import { motion } from 'framer-motion';

export default function Features() {
  const features = [
    {
      icon: '✨',
      title: 'Premium Qualität',
      desc: 'Hochwertige Produkte & Techniken',
    },
    {
      icon: '🚀',
      title: 'Express Service',
      desc: 'Schnell & professionell',
    },
    {
      icon: '💎',
      title: '100% Zufriedenheit',
      desc: 'Garantierte Ergebnisse',
    },
  ];

  return (
    <div className='mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-3'>
      {features.map((feature, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className='transform rounded-xl border border-gray-200 bg-white/80 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/30 dark:border-white/10 dark:bg-white/5'
          initial={{ opacity: 0, y: 20 }}
          key={index}
          transition={{ delay: 0.1 * index }}
          whileHover={{ scale: 1.05 }}
        >
          <div className='mb-4 text-4xl'>{feature.icon}</div>
          <h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
            {feature.title}
          </h3>
          <p className='text-gray-600 dark:text-gray-400'>{feature.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
