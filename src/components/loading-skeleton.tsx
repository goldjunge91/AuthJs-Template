import React from 'react';

interface SkeletonLoaderProps {
  /** Optional zusätzliche Tailwind-Klassen */
  className?: string;
  /** Breite des Platzhalters, z.B. '100%' oder '200px' */
  width?: string;
  /** Höhe des Platzhalters, z.B. '100%' oder '150px' */
  height?: string;
}

export default function SkeletonLoader({
  className = '',
  width = '100%',
  height = '100%',
}: SkeletonLoaderProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}
      style={{ width, height }}
    />
  );
}
