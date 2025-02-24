'use client';

import { Check } from 'lucide-react';
import { vehicles } from '../_data/index';
import { cn } from '@/lib/utils';
import { useBookingStore } from '../_lib/_store/state-store';
import React from 'react';

interface VehicleCardProps {
  isSelected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  Icon: React.ElementType;
}

function VehicleCard({
  isSelected,
  onClick,
  title,
  description,
  Icon,
}: VehicleCardProps) {
  return (
    <div
      className={cn(
        'relative cursor-pointer rounded-lg border-2 transition-all hover:border-primary/50 hover:shadow-md',
        isSelected ? 'border-primary bg-primary/5' : 'border-border',
      )}
      onClick={onClick}
    >
      <div className='p-6'>
        {isSelected && (
          <div className='absolute right-4 top-4'>
            <div className='rounded-full bg-primary p-1'>
              <Check className='h-4 w-4 text-primary-foreground' />
            </div>
          </div>
        )}
        <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10'>
          <Icon className='h-6 w-6 text-primary' />
        </div>
        <h3 className='mb-2 font-medium text-foreground'>{title}</h3>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
    </div>
  );
}

export function VehicleSelection() {
  const { vehicleClass, setVehicleClass } = useBookingStore();

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-2xl font-semibold tracking-tight'>
          Wählen Sie Ihr Fahrzeug
        </h2>
        <p className='text-muted-foreground'>
          Wählen Sie die Fahrzeugklasse, die am besten zu Ihrem Fahrzeug passt.
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.type}
            isSelected={vehicle.type === vehicleClass}
            onClick={() => setVehicleClass(vehicle.type)}
            title={vehicle.title}
            description={vehicle.description}
            Icon={vehicle.Icon}
          />
        ))}
      </div>
    </div>
  );
}
