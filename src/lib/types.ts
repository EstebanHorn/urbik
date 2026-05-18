export type JsonValue =
  | string
  | number
  | boolean
  | { [key: string]: JsonValue }
  | JsonValue[]
  | null;

export type Role = "USER" | "REALESTATE" | "ADMIN" | "AGENT";
export type PropertyType =
  | "HOUSE"
  | "APARTMENT"
  | "PH"
  | "COUNTRY"
  | "LAND"
  | "FIELD"
  | "BUSINESS_BACKGROUND"
  | "GARAGE"
  | "WAREHOUSE"
  | "DEVELOPMENT"
  | "COMMERCIAL_PROPERTY"
  | "OFFICE";
export type OperationType = "RENT" | "SALE" | "TEMP_RENT" | "SALE_RENT";
export type PropertyStatus =
  | "AVAILABLE"
  | "ACTIVE"
  | "RESERVED"
  | "SUSPENDED"
  | "HISTORIC"
  | "APPRAISAL"
  | "SOLD"
  | "RENTED"
  | "PAUSED";
export type Currency = "USD" | "ARS";


export interface RealEstateFormFields {
  agencyName: string;
  address: string;
  street?: string;
  phone: string; 
  website: string;
  instagram: string;
  bio: string;
  license: string;
  licenses?: Array<{
    id?: number;
    licenseNumber: string;
    province: string;
    jurisdiction?: string;
    responsibleName: string;
    isPrimary?: boolean;
  }>;
  offices?: Array<{
    id?: number;
    name: string;
    province: string;
    city: string;
    street: string;
    number: string;
    phone?: string;
  }>;
  province: string;
  city: string;
  logoUrl?: string;
  bannerUrl?: string;
  isActive: boolean;
}

export interface UserFormFields {
  firstName: string;
  lastName: string;

  phone: string;
  isActive: boolean;
}

export interface FormState extends UserFormFields, RealEstateFormFields {
  auth_provider: string;
}


export interface Property {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  province: string;
  country: string;

  type: PropertyType;
  operationType: OperationType;
  status: PropertyStatus;

  salePrice?: number | null;
  saleCurrency?: Currency | null;
  rentPrice?: number | null;
  rentCurrency?: Currency | null;

  area?: number | null;
  rooms?: number | null;
  bathrooms?: number | null;

  hasWater: boolean;
  hasElectricity: boolean;
  hasGas: boolean;
  hasInternet: boolean;
  hasParking: boolean;
  hasPool: boolean;
  propertySubtype?: string | null;
  youtubeUrl?: string | null;
  tour360Url?: string | null;
  isPriceHidden?: boolean;
  featureGroups?: JsonValue | null;

  latitude?: number | null;
  longitude?: number | null;
  parcelCCA?: string | null;
  parcelPDA?: string | null;
  parcelGeom?: JsonValue | null;

  images: string[];
  realEstateId: number;

  createdAt: Date;
  updatedAt: Date;
}

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
