import type { VehicleClass } from '../_types';
import { customerSchema, bookingSchema } from '../_types';
import { packages, additionalOptions } from '../../_data/index';

/**
 * Validates customer details against schema
 */
export function validateCustomerDetails(data: unknown) {
  return customerSchema.safeParse(data);
}

/**
 * Validates complete booking data
 */
export function validateBooking(data: unknown) {
  return bookingSchema.safeParse(data);
}

/**
 * Calculates prices for selected options
 */
export function calculateBookingPrices(
  vehicleClass: VehicleClass,
  selectedPackage: string,
  selectedOptions: string[] = [],
) {
  let packagePrice = 0;
  let additionalOptionsPrice = 0;

  // Calculate package price
  const pkg = packages.find((p: { id: string }) => p.id === selectedPackage);
  if (pkg?.price?.[vehicleClass]) {
    const priceStr = pkg.price[vehicleClass].replace('€', '');
    packagePrice = Number.parseInt(priceStr) || 0;
  }

  // Calculate additional options
  selectedOptions.forEach((optionId) => {
    const option = additionalOptions.find((o) => o.id === optionId);
    if (option?.price?.[vehicleClass]) {
      const optionPriceStr = option.price[vehicleClass].replace('€', '');
      additionalOptionsPrice += Number.parseInt(optionPriceStr) || 0;
    }
  });

  return {
    packagePrice,
    additionalOptionsPrice,
    totalPrice: packagePrice + additionalOptionsPrice,
  };
}
