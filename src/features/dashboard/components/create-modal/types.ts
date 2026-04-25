/**
 * Canonical form-data shape for the 13-module property upload form.
 * All fields are optional so partial saves and progressive completion work
 * without TypeScript complaints.
 */

export interface PropertyUploadFormData {
  // --- Module 1: Property Data ---
  type?: string;
  unitType?: string;
  propertySubtype?: string;
  operationType?: string;
  status?: string;
  salePrice?: number | string;
  saleCurrency?: "USD" | "ARS";
  rentPrice?: number | string;
  rentCurrency?: "USD" | "ARS";
  isPriceHidden?: boolean;
  expenses?: number | string;

  // --- Module 2: Location ---
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  locality?: string;
  neighborhood?: string;
  street?: string;
  number?: string;
  floor?: string;
  unitNumber?: string;

  // --- Module 3: Content ---
  title?: string;
  description?: string;

  // --- Module 4: Surfaces ---
  areaM2?: number | string;
  coveredArea?: number | string;
  semiCoveredArea?: number | string;
  uncoveredArea?: number | string;
  frontLength?: number | string;
  backLength?: number | string;

  // --- Module 5: Environments ---
  rooms?: number | string;
  bathrooms?: number | string;
  toilets?: number | string;
  garages?: number | string;
  plants?: number | string;

  // --- Module 6: Basic Characteristics ---
  condition?: string;
  orientation?: string;
  disposition?: string;
  constructionYear?: number | string;
  renovationYear?: number | string;

  // --- Module 7: Tags / Features ---
  amenities?: Record<string, boolean>;
  featureGroups?: Record<string, Record<string, boolean>>;

  // --- Module 8: Building Information (APARTMENT / PH) ---
  buildingCondition?: string;
  buildingFloors?: number | string;
  unitsPerFloor?: number | string;

  // --- Module 9: Commercial Information (COMMERCIAL_PROPERTY / OFFICE) ---
  commercialActivity?: string;
  hasDisplay?: boolean;
  hasLoadingDock?: boolean;

  // --- Module 10: Field Information (FIELD) ---
  hectares?: number | string;
  soilType?: string;
  hasIrrigation?: boolean;
  hasElectricity?: boolean;
  hasFencing?: boolean;
  hasWater?: boolean;

  // --- Module 11: Land Information (LAND) ---
  landUse?: string;
  buildabilityIndex?: number | string;
  occupancyIndex?: number | string;
  hasConstruction?: boolean;

  // --- Module 12: Multimedia ---
  images?: string[];
  youtubeUrl?: string;
  tour360Url?: string;

  // --- Module 13: Contact Information ---
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  showAgencyContact?: boolean;

  // Internal / parcel
  id?: number | string;
  parcelCCA?: string;
  parcelPDA?: string;
  parcelGeom?: Record<string, unknown>;
  latitude?: number;
  longitude?: number;
  extraData?: Record<string, unknown>;
}

export type ModuleStatus = "empty" | "partial" | "complete";

export interface ModuleDefinition {
  id: number;
  label: string;
  /** Property types this module applies to. Empty array = all types. */
  visibleFor: string[];
  getStatus: (form: PropertyUploadFormData) => ModuleStatus;
}
