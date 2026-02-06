/*
Repositorio central de tipos e interfaces de TypeScript. Define la estructura 
de los datos para usuarios, inmobiliarias, propiedades y los estados de los 
formularios, asegurando la integridad de los datos en toda la aplicación.
*/

// --- TYPES DE UTILIDAD ---
// FIX: Definimos un tipo para evitar el uso de 'any' en objetos JSON (GeoJSON)
export type JsonValue =
  | string
  | number
  | boolean
  | { [key: string]: JsonValue }
  | JsonValue[]
  | null;

// --- ENUMS (Sincronizados con Prisma) ---
export type Role = "USER" | "REALESTATE" | "ADMIN" | "AGENT";
export type PropertyType =
  | "HOUSE"
  | "APARTMENT"
  | "LAND"
  | "COMMERCIAL_PROPERTY"
  | "OFFICE";
export type OperationType = "RENT" | "SALE" | "SALE_RENT";
export type PropertyStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "SOLD"
  | "RENTED"
  | "PAUSED";
export type Currency = "USD" | "ARS";

// --- INTERFACES DE USUARIO ---

export interface RealEstateFormFields {
  agencyName: string;
  address: string;
  street?: string;
  phone: string; // Es obligatorio en Inmobiliarias
  website: string;
  instagram: string;
  bio: string;
  license: string;
  province: string;
  city: string;
  logoUrl?: string;
  bannerUrl?: string;
  isActive: boolean;
}

export interface UserFormFields {
  firstName: string;
  lastName: string;
  // FIX: Cambiado de 'string | undefined' a 'string'.
  // En el estado del formulario, si no hay teléfono, usamos "" (string vacío).
  phone: string;
  isActive: boolean;
}

// Ahora la herencia es válida porque 'phone' es string en ambos padres
export interface FormState extends UserFormFields, RealEstateFormFields {
  auth_provider: string;
}

// --- INTERFACES DE PROPIEDAD ---

export interface Property {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  province: string;
  country: string;

  // Enums
  type: PropertyType;
  operationType: OperationType;
  status: PropertyStatus;

  // Precios y Monedas
  salePrice?: number | null;
  saleCurrency?: Currency | null;
  rentPrice?: number | null;
  rentCurrency?: Currency | null;

  // Detalles
  area?: number | null;
  rooms?: number | null;
  bathrooms?: number | null;

  // Amenities (Booleanos)
  hasWater: boolean;
  hasElectricity: boolean;
  hasGas: boolean;
  hasInternet: boolean;
  hasParking: boolean;
  hasPool: boolean;

  // Geo / Parcelas
  latitude?: number | null;
  longitude?: number | null;
  parcelCCA?: string | null;
  parcelPDA?: string | null;
  // FIX: Usamos JsonValue en lugar de any para satisfacer al linter
  parcelGeom?: JsonValue | null;

  images: string[];
  realEstateId: number;

  createdAt: Date;
  updatedAt: Date;
}

// --- ESTADOS DE FORMULARIOS DE PROPIEDAD ---

export interface PropertyFormDataType {
  title: string;
  description: string;
  address: string;
  city: string;
  province: string;

  type: PropertyType;
  operationType: OperationType;
  status: PropertyStatus;

  salePrice: number;
  saleCurrency: Currency;
  rentPrice: number;
  rentCurrency: Currency;

  area: number;
  rooms: number;
  bathrooms: number;

  // Amenities
  hasWater: boolean;
  hasElectricity: boolean;
  hasGas: boolean;
  hasInternet: boolean;
  hasParking: boolean;
  hasPool: boolean;

  images: string[];
}

export const initialPropertyFormState: PropertyFormDataType = {
  title: "",
  description: "",
  address: "",
  city: "",
  province: "",

  type: "HOUSE",
  operationType: "SALE",
  status: "AVAILABLE",

  salePrice: 0,
  saleCurrency: "USD",
  rentPrice: 0,
  rentCurrency: "ARS",

  area: 0,
  rooms: 0,
  bathrooms: 0,

  hasWater: false,
  hasElectricity: false,
  hasGas: false,
  hasInternet: false,
  hasParking: false,
  hasPool: false,

  images: [],
};

// --- PROPS GENÉRICOS ---

export interface FormProps<T> {
  form: T & { auth_provider?: string };
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  setForm?: React.Dispatch<React.SetStateAction<T>>;
}
