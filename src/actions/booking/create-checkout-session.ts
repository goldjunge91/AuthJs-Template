import { VehicleClass, BookingData } from '@/types/index';

interface BookingState {
  vehicleClass: VehicleClass;
  selectedPackages: string[];
  selectedOptions: string[];
  dateTime: Date;
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

export async function createCheckoutSession(
  state: BookingState,
  data: BookingData,
  totalPrice: number,
) {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vehicleClass: state.vehicleClass,
        packages: state.selectedPackages.map((id: string) => {
          const pkg = data.packages.find((pkg) => pkg.id === id);
          return {
            id,
            title: pkg?.title,
            price:
              pkg?.price[
                state.vehicleClass.toLowerCase() as keyof typeof pkg.price
              ],
          };
        }),
        options: state.selectedOptions.map((id: string) => {
          const option = data.additionalOptions.find(
            (optionals) => optionals.id === id,
          );
          return {
            id,
            title: option?.title,
            price:
              option?.price[
                state.vehicleClass.toLowerCase() as keyof typeof option.price
              ],
          };
        }),
        dateTime: state.dateTime.toISOString(),
        contactDetails: state.contactDetails,
        totalPrice,
      }),
    });

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Fehler beim Erstellen der Checkout Session:', error);
    throw error;
  }
}
