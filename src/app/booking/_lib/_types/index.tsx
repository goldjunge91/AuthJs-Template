import { z } from 'zod';
import React from 'react';
/**
 * Core booking types used across the application
 */

// export type VehicleClass = 'KLEIN' | 'MITTEL' | 'GROSS' | 'SUV';

export type VehicleClass =
  | 'kleinwagen'
  | 'mittelklasse'
  | 'suv'
  | 'transporter';

export interface Vehicle {
  type: VehicleClass;
  title: string;
  description: string;
  Icon: React.ElementType;
}

export interface ServicePackage {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  price: Record<VehicleClass, string>;
}

export interface AdditionalOption {
  id: string;
  title: string;
  description: string;
  price: Record<VehicleClass, string>;
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  postalCode: string;
  city: string;
}

export interface CalculatedPrice {
  packagePrice: number;
  additionalOptionsPrice: number;
  totalPrice: number;
}

/**
 * Zod Schema Definitions
 */

// const priceSchema = z.record(
//   z.enum(['kleinwagen', 'mittelklasse', 'suv', 'transporter']),
//   z.string(),
// );

export const customerSchema = z.object({
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen lang sein'),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().regex(/^\+?[0-9\s-]{8,}$/, 'Ungültige Telefonnummer'),
  street: z.string().min(5, 'Straße muss mindestens 5 Zeichen lang sein'),
  number: z.string().min(1, 'Hausnummer muss mindestens 1 Zeichen lang sein'),
  postalCode: z.string().regex(/^\d{5}$/, 'Ungültige Postleitzahl'),
  city: z.string().min(2, 'Stadt muss mindestens 2 Zeichen lang sein'),
});

export const bookingSchema = z.object({
  vehicleClass: z.enum(['kleinwagen', 'mittelklasse', 'suv', 'transporter']),
  selectedPackage: z.string(),
  additionalOptions: z.array(z.string()).optional(),
  dateTime: z.string().datetime(),
  customerDetails: customerSchema,
  calculatedPrice: z.object({
    packagePrice: z.number(),
    additionalOptionsPrice: z.number(),
    totalPrice: z.number(),
  }),
});

export interface BookingState {
  vehicleClass: VehicleClass;
  selectedPackages: string[];
  selectedOptions: string[];
  dateTime: Date;
  duration: number;
  contactDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    number: string;
    postalCode: string;
    city: string;
  };
}
