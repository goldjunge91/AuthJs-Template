/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import type { VehicleClass, CustomerDetails } from '../_types';
import { packages, additionalOptions } from '@/app/booking/_data';

interface CalculatedPrice {
  basePrice: number;
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
// customerAddress: string;
// travelTimes: {
//   previous?: number;
//   next?: number;
// };

interface BookingActions {
  setVehicleClass: (state: VehicleClass) => void;
  setSelectedPackage: (state: string) => void;
  setAdditionalOptions: (state: string[]) => void;
  setDateTime: (state: string) => void;
  setCustomerDetails: (state: CustomerDetails) => void;
  setDuration: (minutes: number) => void;

  calculateTotalDuration: () => void;
  calculatePrice: () => void;

  validateBooking: () => boolean;
  reset: () => void;
}

const initialState: BookingState = {
  additionalOptions: [], // liste der zusätzlichen optionen
  calculatedPrice: {
    packagePrice: 0, // preis des ausgewählten pakets
    additionalOptionsPrice: 0, // preis der zusätzlichen optionen
    totalPrice: 0,
    basePrice: 0,
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
    get().calculatePrice();
  },
  setSelectedPackage: (packageId: string) => {
    set(() => ({ selectedPackage: packageId }));
    get().calculateTotalDuration();
    get().calculatePrice();
  },
  setAdditionalOptions: (options: string[]) => {
    set(() => ({ additionalOptions: options }));
    // Berechne die Gesamtdauer nach Aktualisierung der zusätzlichen Optionen
    get().calculateTotalDuration();
    get().calculatePrice();
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

  calculatePrice: () => {
    const state = get();
    if (!state.vehicleClass || !state.selectedPackage) return;

    // Find the selected package
    const selectedPkg = packages.find(
      (pkg) => pkg.id === state.selectedPackage,
    );

    // Parse the package price (remove currency symbol and convert to number)
    const packagePrice = selectedPkg
      ? parseFloat(
          selectedPkg.price[state.vehicleClass]
            .replace(/[^0-9,]/g, '')
            .replace(',', '.'),
        )
      : 0;

    // Calculate additional options price
    let additionalOptionsPrice = 0;
    state.additionalOptions.forEach((optionId) => {
      const option = additionalOptions.find((opt) => opt.id === optionId);
      if (option) {
        // Parse the option price (remove currency symbol and convert to number)
        const optionPrice = parseFloat(
          option.price[state.vehicleClass!]
            .replace(/[^0-9,]/g, '')
            .replace(',', '.'),
        );
        additionalOptionsPrice += optionPrice;
      }
    });

    // Calculate total price
    const totalPrice = packagePrice + additionalOptionsPrice;

    // Update state with calculated prices
    set(() => ({
      calculatedPrice: {
        packagePrice,
        additionalOptionsPrice,
        totalPrice,
      },
    }));
  },

  validateBooking: () => {
    const state = get();
    const errors: string[] = [];

    if (!state.vehicleClass) {
      errors.push('Bitte wählen Sie ein Fahrzeug aus.');
    }

    if (!state.selectedPackage) {
      errors.push('Bitte wählen Sie ein Servicepaket aus.');
    }

    if (!state.dateTime) {
      errors.push('Bitte wählen Sie einen Termin aus.');
    }

    if (!state.customerDetails) {
      errors.push('Bitte geben Sie Ihre Kontaktdaten ein.');
    } else {
      const { firstName, lastName, email, phone } = state.customerDetails;
      if (!firstName || !lastName || !email || !phone) {
        errors.push('Bitte füllen Sie alle Pflichtfelder aus.');
      }
    }

    const isValid = errors.length === 0;
    set(() => ({ isValid, validationErrors: errors }));
    return isValid;
  },

  reset: () => set(initialState),
}));
