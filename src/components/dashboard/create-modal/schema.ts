export interface PropertyUploadFormData {
  type?: string; unitType?: string; propertySubtype?: string; operationType?: string; status?: string;
  salePrice?: number | string; saleCurrency?: "USD" | "ARS"; rentPrice?: number | string; rentCurrency?: "USD" | "ARS";
  isPriceHidden?: boolean; expenses?: number | string; country?: string; province?: string; city?: string;
  district?: string; locality?: string; neighborhood?: string; street?: string; number?: string; displayAddress?: string; floor?: string;
  unitNumber?: string; title?: string; description?: string; areaM2?: number | string; coveredArea?: number | string;
  semiCoveredArea?: number | string; uncoveredArea?: number | string; frontLength?: number | string; backLength?: number | string;
  rooms?: number | string; bedrooms?: number | string; bathrooms?: number | string; toilets?: number | string; garages?: number | string;
  plants?: number | string; laundryType?: string; condition?: string; orientation?: string; disposition?: string;
  constructionYear?: number | string; renovationYear?: number | string; amenities?: Record<string, boolean>;
  featureGroups?: Record<string, Record<string, boolean>>; buildingCondition?: string; buildingFloors?: number | string;
  unitsPerFloor?: number | string; commercialActivity?: string; hasDisplay?: boolean; hasLoadingDock?: boolean;
  hectares?: number | string; soilType?: string; hasIrrigation?: boolean; hasElectricity?: boolean; hasFencing?: boolean;
  hasWater?: boolean; landUse?: string; buildabilityIndex?: number | string; occupancyIndex?: number | string;
  hasConstruction?: boolean; images?: string[]; youtubeUrl?: string; tour360Url?: string; contactName?: string;
  contactPhone?: string; contactEmail?: string; contactWhatsapp?: string; showAgencyContact?: boolean;
  id?: number | string; parcelCCA?: string; parcelPDA?: string; parcelGeom?: Record<string, unknown>;
  latitude?: number; longitude?: number; extraData?: Record<string, unknown>;
  garageType?: string; balconyType?: string; viewType?: string; floorType?: string | string[];
  roofType?: string; slope?: string; coastType?: string;
}

export type ModuleStatus = "empty" | "partial" | "complete";

export interface ModuleDefinition {
  id: number;
  label: string;
  visibleFor: string[];
  getStatus: (form: PropertyUploadFormData) => ModuleStatus;
}

const ALL: string[] = [];
const SURFACES_TYPES = ["HOUSE", "APARTMENT", "PH", "COUNTRY", "COMMERCIAL_PROPERTY", "OFFICE", "WAREHOUSE", "LAND", "FIELD", "DEVELOPMENT"];
const CHARACTERISTICS_TYPES = ["HOUSE", "APARTMENT", "PH", "COMMERCIAL_PROPERTY", "OFFICE"];

function hasValue(v: unknown): boolean {
  if (v === undefined || v === null || v === "") return false;
  if (typeof v === "number") return !isNaN(v);
  return true;
}

function partial(filled: number, total: number): ModuleStatus {
  if (filled === 0) return "empty";
  if (filled >= total) return "complete";
  return "partial";
}

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    id: 1, label: "Datos de la Propiedad", visibleFor: ALL,
    getStatus(form) {
      const required = [form.type, form.operationType, form.status];
      const priceOk = Boolean(form.isPriceHidden) || hasValue(form.salePrice) || hasValue(form.rentPrice);
      const requiredFilled = required.filter(hasValue).length;
      if (requiredFilled === 3 && priceOk) return "complete";
      if (requiredFilled > 0) return "partial";
      return "empty";
    },
  },
  {
    id: 2, label: "Ubicación", visibleFor: ALL,
    getStatus(form) { return partial([form.province, form.city, form.street, form.number].filter(hasValue).length, 4); },
  },
  {
    id: 3, label: "Contenido", visibleFor: ALL,
    getStatus(form) {
      const t = hasValue(form.title); const d = hasValue(form.description);
      if (t && d) return "complete"; if (t || d) return "partial"; return "empty";
    },
  },
  { 
    id: 4, label: "Superficies y Ambientes", visibleFor: SURFACES_TYPES, 
    getStatus(form) { 
      return hasValue(form.areaM2) ? "complete" : "empty"; 
    } 
  },
  { 
    id: 5, label: "Características Básicas", visibleFor: CHARACTERISTICS_TYPES, 
    getStatus(form) { return partial([form.condition, form.orientation, form.constructionYear].filter(hasValue).length, 3); } 
  },
  {
    id: 6, label: "Tags y Servicios", visibleFor: ALL,
    getStatus(form) {
      const c = Object.values(form.amenities || {}).filter(Boolean).length;
      if (c >= 3) return "complete"; if (c > 0) return "partial"; return "empty";
    },
  },
  {
    id: 10, label: "Multimedia", visibleFor: ALL,
    getStatus(form) {
      const ic = (form.images || []).length; const hv = hasValue(form.youtubeUrl) || hasValue(form.tour360Url);
      if (ic >= 5) return "complete"; if (ic > 0 || hv) return "partial"; return "empty";
    },
  },
  { 
    id: 11, label: "Información de Contacto", visibleFor: ALL, 
    getStatus(form) { return partial([form.contactName, form.contactPhone, form.contactEmail].filter(hasValue).length, 3); } 
  },
];

export function getVisibleModules(propertyType: string | undefined): ModuleDefinition[] {
  if (!propertyType) return MODULE_DEFINITIONS.filter((m) => m.visibleFor.length === 0);
  return MODULE_DEFINITIONS.filter((m) => m.visibleFor.length === 0 || m.visibleFor.includes(propertyType));
}