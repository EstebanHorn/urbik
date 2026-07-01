// Tipos y constantes de contactos compartidos entre ClientsPanel.tsx (listado),
// ClientModal.tsx (alta/edición) y la página de perfil /contacts/[id].

export type ClientRole = "BUYER" | "OWNER" | "RENTER";
export type GeoraStatus = "NONE" | "PENDING" | "CONNECTED";

export interface SearchParams {
  operationType?: string;
  propertyType?: string;
  province?: string;
  department?: string;
  locality?: string;
  city?: string;
  radius?: string;
  minPrice?: string;
  maxPrice?: string;
  currency?: string;
  minArea?: string;
  maxArea?: string;
  areaUnit?: string;
  minBedrooms?: string;
  minBathrooms?: string;
}

export interface ClientData {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  role: ClientRole;
  georaStatus: GeoraStatus;
  linkedUserId?: string | null;
  linkedPropertyId?: string;
  linkedPropertyTitle?: string;
  linkedPropertyCity?: string;
  hasActiveSearch?: boolean;
  searchParams?: SearchParams | null;
}

export const ROLE_LABELS: Record<ClientRole, string> = {
  BUYER: "Comprador",
  OWNER: "Propietario",
  RENTER: "Arrendador",
};

// Punto de color por rol, usado en los tabs de filtro y la fila de la tabla.
export const ROLE_DOT_COLORS: Record<ClientRole, string> = {
  BUYER: "bg-geora-cyan",
  OWNER: "bg-geora-emerald",
  RENTER: "bg-amber-500",
};

export const ROLE_BADGE_VARIANTS: Record<ClientRole, "cyan" | "emerald" | "amber"> = {
  BUYER: "cyan",
  OWNER: "emerald",
  RENTER: "amber",
};

export const OPERATION_OPTIONS = [
  { value: "SALE", label: "Compra" },
  { value: "RENT", label: "Alquiler" },
  { value: "TEMP_RENT", label: "Temporal" },
];

export const PROPERTY_TYPE_OPTIONS = [
  { value: "FIELD", label: "Campo" },
  { value: "HOUSE", label: "Casa" },
  { value: "APARTMENT", label: "Departamento" },
  { value: "COMMERCIAL_PROPERTY", label: "Local" },
  { value: "LAND", label: "Terreno" },
  { value: "WAREHOUSE", label: "Galpón" },
  { value: "OFFICE", label: "Oficina" },
];

export const PROPERTY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  PROPERTY_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

export const OPERATION_LABELS: Record<string, string> = Object.fromEntries(
  OPERATION_OPTIONS.map((o) => [o.value, o.label])
);

export const RADIUS_OPTIONS = [
  { value: "", label: "Indistinto" },
  { value: "10", label: "Hasta 10 km" },
  { value: "25", label: "Hasta 25 km" },
  { value: "50", label: "Hasta 50 km" },
  { value: "100", label: "Más de 50 km" },
];

export const EMPTY_SEARCH: SearchParams = {
  operationType: "SALE",
  propertyType: "HOUSE",
  province: "",
  department: "",
  locality: "",
  city: "",
  radius: "",
  minPrice: "",
  maxPrice: "",
  currency: "USD",
  minArea: "",
  maxArea: "",
  areaUnit: "M2",
  minBedrooms: "",
  minBathrooms: "",
};

export function propMatchPrice(p: any) {
  const isRent = p.operation_type === "RENT" || p.operation_type === "TEMP_RENT";
  const price = isRent ? p.rent_price : p.sale_price;
  const cur = (isRent ? p.rent_currency : p.sale_currency) || "USD";
  if (price == null) return "Consultar";
  return `${cur === "USD" ? "USD" : "$"} ${Number(price).toLocaleString("es-AR")}`;
}

export const hasSearchParams = (sp?: SearchParams | null) =>
  !!sp && !!(sp.operationType || sp.propertyType || sp.province || sp.city);
