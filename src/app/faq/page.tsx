'use client';

import type { LucideIcon } from 'lucide-react';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Car as CarIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  Disc as DiscIcon,
  Droplet as DropletIcon,
  Layers as LayersIcon,
  Shield as ShieldIcon,
  Sofa as SofaIcon,
  Sparkles as SparklesIcon,
} from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { cn } from '@/lib/utils';

import content from './content.json';

function BackgroundDecoration() {
  return (
    <div className='absolute inset-0 -z-10 overflow-hidden'>
      <div className='absolute left-1/2 top-0 h-[500px] w-full -translate-x-1/2'>
        <div className='absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent' />
        <svg
          className='absolute bottom-0 text-primary/10'
          viewBox='0 0 1440 320'
        >
          <path
            fill='currentColor'
            d='M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'
          />
        </svg>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <div className='relative mb-16'>
      <div className='absolute inset-0 overflow-hidden'>
        <Image
          src='/images/car-cleaning-hero.jpg'
          alt='Professional car cleaning'
          fill
          className='object-cover opacity-20'
          priority
        />
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background' />
      </div>
      <div className='relative pb-12 pt-20 text-center'>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-5xl font-bold text-transparent'
        >
          {content.pageTitle}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='mx-auto max-w-2xl text-xl text-muted-foreground'
        >
          {content.pageDescription}
        </motion.p>
      </div>
    </div>
  );
}

// Create an icon mapping object with proper typing
const iconMap: Record<string, LucideIcon> = {
  droplet: DropletIcon,
  sparkles: SparklesIcon,
  car: CarIcon,
  disc: DiscIcon,
  shield: ShieldIcon,
  calendar: CalendarIcon,
  sofa: SofaIcon,
  layers: LayersIcon,
};

// Update the FaqItem interface to use the icon map keys
interface FaqItem {
  id: string;
  question: string;
  answer: string;
  icon: keyof typeof iconMap;
}

// Update the FaqCard component
const FaqCard: React.FC<{
  item: FaqItem;
  isOpen: boolean;
  onClick: () => void;
}> = ({ item, isOpen, onClick }) => {
  const IconComponent = iconMap[item.icon] || (() => null);

  return (
    <motion.div
      initial={false}
      whileHover={{ scale: 1.01 }}
      className={cn(
        'overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700',
        'shadow-sm transition-all duration-200 hover:shadow-md',
        'bg-white/50 backdrop-blur-sm dark:bg-gray-800/50',
      )}
    >
      <button
        onClick={onClick}
        className={cn(
          'flex w-full items-center gap-4 px-6 py-4',
          'hover:bg-gray-50 dark:hover:bg-gray-700',
          'transition-colors duration-200',
        )}
      >
        <div
          className={cn(
            'rounded-full p-2',
            isOpen
              ? 'bg-primary/10 text-primary'
              : 'bg-gray-100 dark:bg-gray-700',
          )}
        >
          <IconComponent className='h-5 w-5' />
        </div>
        <span className='flex-1 text-left text-lg font-medium text-gray-900 dark:text-white'>
          {item.question}
        </span>
        {isOpen ? (
          <ChevronUpIcon className='h-5 w-5 text-gray-500' />
        ) : (
          <ChevronDownIcon className='h-5 w-5 text-gray-500' />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className='bg-gray-50/50 px-6 py-4 dark:bg-gray-900/50'>
              <p className='leading-relaxed text-gray-600 dark:text-gray-300'>
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
function Footer() {
  return (
    <div className='mt-16 pb-8 text-center text-gray-500'>
      <p>Haben Sie weitere Fragen? Kontaktieren Sie uns!</p>
      <div className='mt-4 flex justify-center space-x-4'>
        <a
          href='/kontakt'
          className='text-primary transition-colors hover:text-primary/80'
        >
          Kontakt
        </a>
        <span>•</span>
        <a
          href='/services'
          className='text-primary transition-colors hover:text-primary/80'
        >
          Unsere Services
        </a>
      </div>
    </div>
  );
}

const FaqPage: React.FC = () => {
  const [openItem, setOpenItem] = React.useState<string | null>(null);
  const [searchQuery] = React.useState('');

  const filteredItems = content.faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className='relative min-h-screen'>
      <BackgroundDecoration />
      <div className='relative z-10'>
        <HeroSection />
        <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
          <motion.div className='space-y-4' layout>
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaqCard
                    item={{
                      ...item,

                      icon: item.icon,
                    }}
                    isOpen={openItem === item.id}
                    onClick={() =>
                      setOpenItem(openItem === item.id ? null : item.id)
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
