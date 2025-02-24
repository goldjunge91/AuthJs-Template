import type { BookingData, VehicleClass } from '../../types/index';

export function calculateTotalPrice(
  data: BookingData,
  selectedPackages: string[],
  selectedOptions: string[],
  vehicleClass: VehicleClass,
): number {
  // Überprüfe, dass nur ein Paket ausgewählt wurde
  if (selectedPackages.length !== 1) {
    throw new Error('Es muss genau ein Paket ausgewählt werden');
  }

  const vehicleType =
    vehicleClass.toLowerCase() as keyof (typeof data.packages)[0]['price'];

  // Berechne Paketpreise
  const packagesTotal = selectedPackages.reduce((total, packageId) => {
    const pkg = data.packages.find((p) => p.id === packageId);
    if (!pkg) return total;
    return total + Number.parseFloat(pkg.price[vehicleType].replace('€', ''));
  }, 0);

  // Berechne Optionspreise
  const optionsTotal = selectedOptions.reduce((total, optionId) => {
    const option = data.additionalOptions.find((o) => o.id === optionId);
    if (!option) return total;
    return (
      total + Number.parseFloat(option.price[vehicleType].replace('€', ''))
    );
  }, 0);

  return packagesTotal + optionsTotal;
}

export function formatPrice(price: number): string {
  return `${price.toFixed(2)}€`;
}
