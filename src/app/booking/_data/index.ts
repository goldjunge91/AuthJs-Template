import { Car, CarFront, Truck } from 'lucide-react';
import type { Vehicle, VehicleClass } from '../_lib/_types/index';

// Typen für JSON Daten
interface JsonPackage {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  price: Record<VehicleClass, string>;
  duration: Record<VehicleClass, number>;
  cardImage: string;
  detailImage: string;
}

interface JsonAdditionalOption {
  id: string;
  title: string;
  description?: string;
  price: Record<VehicleClass, string>;
  duration: Record<VehicleClass, number>;
  'package.id': string[];
}

// Interface Definitionen für die Anwendung
export interface ServicePackage {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  price: Record<VehicleClass, string>;
  duration: Record<VehicleClass, number>;
}

export interface AdditionalOption {
  id: string;
  title: string;
  description: string;
  price: Record<VehicleClass, string>;
  duration: Record<VehicleClass, number>;
  packageId: string[];
}

// Import der JSON Daten mit korrektem Typing
import jsonData from '../../../../data.json';
const data = jsonData as {
  packages: JsonPackage[];
  additionalOptions: JsonAdditionalOption[];
};

export const vehicles: Vehicle[] = [
  {
    type: 'kleinwagen',
    title: 'Kleinwagen',
    description: 'Kompakte Fahrzeuge bis 4m Länge',
    Icon: Car,
  },
  {
    type: 'mittelklasse',
    title: 'Mittelklasse',
    description: 'Limousinen und Kombis bis 4,5m',
    Icon: Car,
  },
  {
    type: 'suv',
    title: 'SUV / Van',
    description: 'Große Fahrzeuge und Vans',
    Icon: CarFront,
  },
  {
    type: 'transporter',
    title: 'Transporter',
    description: 'Lieferwagen und Kleintransporter',
    Icon: Truck,
  },
];

// Mapping der Packages mit korrekter Typisierung
export const packages: ServicePackage[] = data.packages.map((pkg) => ({
  id: pkg.id,
  title: pkg.title,
  description: pkg.description,
  bullets: pkg.bullets,
  price: pkg.price,
  duration: pkg.duration,
}));

// Mapping der Additional Options mit korrekter Typisierung
export const additionalOptions: AdditionalOption[] = data.additionalOptions.map(
  (option) => ({
    id: option.id,
    title: option.title,
    description: option.description || option.title,
    price: option.price,
    duration: option.duration,
    packageId: option['package.id'],
  }),
);

export const bookingSteps = [
  'Fahrzeug',
  'Service',
  'Extras',
  'Termin',
  'Kontakt',
  'Übersicht',
] as const;

export type BookingStep = (typeof bookingSteps)[number];
