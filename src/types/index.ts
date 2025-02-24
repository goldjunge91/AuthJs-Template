import { StaticImport } from 'next/dist/shared/lib/get-img-props';

export interface Package {
  [x: string]:
    | string
    | StaticImport
    | number
    | string[]
    | Record<string, string>
    | undefined;
  cardImage: string;
  detailImage: string;
  id: string;
  title: string;
  description: string;
  duration: number;
  bullets?: string[];
  price: {
    kleinwagen: string;
    mittelklasse: string;
    suv: string;
    transporter: string;
  };
  vehicleTypes?: {
    kleinwagen: string;
    mittelklasse: string;
    suv: string;
    transporter: string;
  };
}

export interface AdditionalOption {
  id: string;
  title: string;
  duration: number;
  price: {
    kleinwagen: string;
    mittelklasse: string;
    suv: string;
    transporter: string;
  };
  'package.id': string[];
}

export interface BookingData {
  packages: Package[];
  additionalOptions: AdditionalOption[];
}

export type VehicleClass =
  | 'kleinwagen'
  | 'mittelklasse'
  | 'suv'
  | 'transporter';

export interface Vehicle {
  type: VehicleClass;
  title: string;
  description: string;
  Icon: string;
}

export interface ServicePackage {
  id: string;
  title: string;
  description: string;
  price: Record<VehicleClass, string>;
  bullets: string[];
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

export type BookingFormSchema = CustomerDetails;

export type BookingStep =
  | 'vehicle'
  | 'package'
  | 'options'
  | 'customer'
  | 'summary';

export interface TypographyConfig {
  h1: string;
  h2: string;
  h3: string;
  body: string;
  small: string;
  tiny: string;
  price: string;
  label: string;
}

export interface SpacingConfig {
  section: string;
  element: string;
  item: string;
}

export interface LayoutConfig {
  container: string;
  card: string;
  grid: {
    base: string;
    cols2: string;
    cols3: string;
    cols4: string;
  };
}

export interface ComponentsConfig {
  progressBar: {
    height: string;
    text: string;
  };
  buttons: {
    primary: string;
    secondary: string;
  };
  cards: {
    header: string;
    content: string;
    highlight: string;
  };
}

export interface UIConfig {
  typography: TypographyConfig;
  spacing: SpacingConfig;
  layout: LayoutConfig;
  components: ComponentsConfig;
}
