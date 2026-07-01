// Labels, opciones y formatters compartidos entre la grilla de la Bolsa de
// Conexiones (`connections/page.tsx`) y la página de detalle (`connections/[id]/page.tsx`).

export const PROPERTY_LABELS: Record<string, string> = {
  HOUSE: "Casa",
  APARTMENT: "Departamento",
  PH: "PH",
  LAND: "Terreno",
  FIELD: "Campo",
  COMMERCIAL_PROPERTY: "Local Comercial",
  OFFICE: "Oficina",
  WAREHOUSE: "Galpón",
  COUNTRY: "Country",
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

// Tipos rurales → muestran radio de búsqueda y superficie por defecto en hectáreas
export const RURAL_TYPES = ["FIELD", "LAND"];

export const RADIUS_OPTIONS = [
  { value: "", label: "Indistinto" },
  { value: "10", label: "Hasta 10 km" },
  { value: "25", label: "Hasta 25 km" },
  { value: "50", label: "Hasta 50 km" },
  { value: "100", label: "Más de 50 km" },
];

export const OPERATION_LABELS: Record<string, string> = {
  SALE: "Compra",
  RENT: "Alquiler",
  TEMP_RENT: "Alquiler temporal",
};

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activa",
  PAUSED: "Pausada",
  CLOSED: "Cerrada",
};

export const propLabel = (t?: string) => (t ? PROPERTY_LABELS[t] || t : "");
export const opLabel = (t?: string) => (t ? OPERATION_LABELS[t] || t : "");

export function priceRange(s: {
  currency?: string | null;
  min_price?: number | null;
  max_price?: number | null;
}) {
  const cur = s.currency || "USD";
  const fmt = (n?: number | null) =>
    n != null ? Number(n).toLocaleString("es-AR") : null;
  const min = fmt(s.min_price);
  const max = fmt(s.max_price);
  if (!min && !max) return "Precio a consultar";
  if (min && max) return `${cur} ${min} - ${max}`;
  if (min) return `Desde ${cur} ${min}`;
  return `Hasta ${cur} ${max}`;
}

export function propPrice(p: {
  operation_type?: string | null;
  sale_price?: number | null;
  rent_price?: number | null;
  sale_currency?: string | null;
  rent_currency?: string | null;
}) {
  const isRent = p.operation_type === "RENT" || p.operation_type === "TEMP_RENT";
  const price = isRent ? p.rent_price : p.sale_price;
  const cur = (isRent ? p.rent_currency : p.sale_currency) || "USD";
  if (price == null) return "Consultar";
  return `${cur === "USD" ? "USD" : "$"} ${Number(price).toLocaleString("es-AR")}`;
}
