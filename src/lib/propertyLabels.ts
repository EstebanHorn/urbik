export type ViewMode = "list" | "grid";

export type SearchProperty = {
  id: string;
  title: string;
  salePrice: number | null;
  saleCurrency: string | null;
  rentPrice: number | null;
  rentCurrency: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string;
  province: string;
  operationType: string;
  type: string;
  images: string[];
  address: string;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  displayAddress?: string | null;
  hasWater: boolean;
  hasElectricity: boolean;
  hasGas: boolean;
  hasInternet: boolean;
  hasParking: boolean;
  hasPool: boolean;
  hasBalcony: boolean;
  hasGrill: boolean;
  hasGarden: boolean;
  hasLaundry: boolean;
  hasAirConditioning: boolean;
  hasMortgageCredit: boolean;
  agencyLogo?: string | null;
};

export function getOperationLabel(type: string) {
  switch (type) {
    case "SALE":
      return "Venta";
    case "RENT":
      return "Alquiler";
    case "TEMP_RENT":
      return "Temporal";
    case "SALE_RENT":
      return "Venta y alquiler";
    default:
      return type;
  }
}

export function getTypeLabel(type: string) {
  switch (type) {
    case "HOUSE":
      return "Casa";
    case "APARTMENT":
      return "Departamento";
    case "PH":
      return "PH";
    case "COUNTRY":
      return "Country";
    case "LAND":
      return "Terreno";
    case "FIELD":
      return "Campo";
    case "BUSINESS_BACKGROUND":
      return "Fondo de comercio";
    case "GARAGE":
      return "Cochera";
    case "WAREHOUSE":
      return "Galpón";
    case "DEVELOPMENT":
      return "Desarrollo";
    case "COMMERCIAL_PROPERTY":
      return "Local";
    case "OFFICE":
      return "Oficina";
    default:
      return type;
  }
}

export const glassCard =
  "relative overflow-hidden md:rounded-[30px] rounded-3xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[30px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";
