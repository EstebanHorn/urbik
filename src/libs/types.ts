/*
Repositorio central de tipos e interfaces de TypeScript. Define la estructura 
de los datos para usuarios, inmobiliarias, propiedades y los estados de los 
formularios, asegurando la integridad de los datos en toda la aplicación.
*/

export type UserRole = "USER" | "REALESTATE" | null;

export interface RealEstateFormFields {
  name: string;
  address: string;
  phone: string;
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
  phone: string;
  isActive: boolean;
}

export interface FormState extends UserFormFields, RealEstateFormFields {
  auth_provider: string;
}

export interface Property {
  id: number;
  title: string;
  address: string;
  isAvailable: boolean;
  description?: string;
  price?: number;
  rooms?: number;
  images?: string[];
}

export interface PropertyFormDataType {
  title: string;
  description: string;
  address: string;
  price: number;
  rooms: number;
  isAvailable: boolean;
  images: string;
}

export const initialPropertyFormState: PropertyFormDataType = {
  title: "",
  description: "",
  address: "",
  price: 0,
  rooms: 0,
  isAvailable: true,
  images: "",
};

export interface FormProps<T> {
  form: T & { auth_provider: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
}
