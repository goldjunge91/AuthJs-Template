import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  /** Optionale zusätzliche Tailwind-Klassen */
  className?: string;
}

export default function LoadingIndicator({
  className = '',
}: LoadingIndicatorProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
    </div>
  );
}
