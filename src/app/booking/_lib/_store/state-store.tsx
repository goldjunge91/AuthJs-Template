/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import type { VehicleClass, CustomerDetails } from '../_types';
import { packages, additionalOptions } from '@/app/booking/_data';

interface CalculatedPrice {
  packagePrice: number;
  additionalOptionsPrice: number;
  totalPrice: number;
}
export interface BookingState {
  [x: string]: any;
  vehicleClass?: VehicleClass;
  selectedPackage?: string;
  additionalOptions: string[];
  dateTime?: string;
  customerDetails?: CustomerDetails;
  calculatedPrice: CalculatedPrice;
  duration: number; // Neue Property für die Gesamtdauer
  isValid: boolean;
  validationErrors: string[];
}

interface BookingActions {
  setVehicleClass: (state: VehicleClass) => void;
  setSelectedPackage: (state: string) => void;
  setAdditionalOptions: (state: string[]) => void;
  setDateTime: (state: string) => void;
  setCustomerDetails: (state: CustomerDetails) => void;
  setDuration: (minutes: number) => void;

  calculateTotalDuration: () => void;

  validateBooking: () => boolean;
  reset: () => void;
}

const initialState: BookingState = {
  additionalOptions: [], // liste der zusätzlichen optionen
  calculatedPrice: {
    packagePrice: 0, // preis des ausgewählten pakets
    additionalOptionsPrice: 0, // preis der zusätzlichen optionen
    totalPrice: 0, // gesamtpreis
  },
  duration: 0, // gesamtdauer in minuten
  isValid: false, // gültigkeit der buchung
  validationErrors: [], // liste der validierungsfehler
};
type BookingStore = BookingState & BookingActions;

export const useBookingStore = create<BookingStore>()((set, get) => ({
  ...initialState,
  setVehicleClass: (vehicleClass: VehicleClass) => {
    set(() => ({ vehicleClass }));
    get().calculateTotalDuration();
  },
  setSelectedPackage: (packageId: string) => {
    set(() => ({ selectedPackage: packageId }));
    get().calculateTotalDuration();
  },
  setAdditionalOptions: (options: string[]) => {
    set(() => ({ additionalOptions: options }));
    // Berechne die Gesamtdauer nach Aktualisierung der zusätzlichen Optionen
    get().calculateTotalDuration();
  },
  setDateTime: (dateTime: string) => set(() => ({ dateTime })),
  setCustomerDetails: (details: CustomerDetails) =>
    set(() => ({ customerDetails: details })),
  setDuration: (minutes: number) => set(() => ({ duration: minutes })),
  calculateTotalDuration: () => {
    const state = get();
    if (!state.vehicleClass || !state.selectedPackage) return;

    const basePackage = packages.find(
      (pkg) => pkg.id === state.selectedPackage,
    );
    let totalDuration = basePackage?.duration[state.vehicleClass] || 0;

    state.additionalOptions.forEach((optionId) => {
      const option = additionalOptions.find((opt) => opt.id === optionId);
      if (option) {
        totalDuration += option.duration[state.vehicleClass!];
      }
    });

    set(() => ({ duration: totalDuration }));
  },

  validateBooking: () => {
    set(() => ({ isValid: true, validationErrors: [] }));
    return true;
  },

  reset: () => set(initialState),
}));
