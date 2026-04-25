import type { ModuleDefinition, ModuleStatus, PropertyUploadFormData } from "./types";

const ALL: string[] = [];

const RESIDENTIAL = ["HOUSE", "APARTMENT", "PH", "COUNTRY"];
const APARTMENT_LIKE = ["APARTMENT", "PH"];
const COMMERCIAL_LIKE = ["COMMERCIAL_PROPERTY", "OFFICE"];
const SURFACES_TYPES = [
  "HOUSE", "APARTMENT", "PH", "COUNTRY", "COMMERCIAL_PROPERTY",
  "OFFICE", "WAREHOUSE", "LAND", "FIELD", "DEVELOPMENT",
];
const ENVIRONMENTS_TYPES = [
  "HOUSE", "APARTMENT", "PH", "COUNTRY", "COMMERCIAL_PROPERTY", "OFFICE", "WAREHOUSE",
];
const CHARACTERISTICS_TYPES = [
  "HOUSE", "APARTMENT", "PH", "COMMERCIAL_PROPERTY", "OFFICE",
];

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
    id: 1,
    label: "Datos de la Propiedad",
    visibleFor: ALL,
    getStatus(form): ModuleStatus {
      const required = [form.type, form.operationType, form.status];
      const priceOk =
        Boolean(form.isPriceHidden) ||
        hasValue(form.salePrice) ||
        hasValue(form.rentPrice);
      const requiredFilled = required.filter(hasValue).length;
      if (requiredFilled === 3 && priceOk) return "complete";
      if (requiredFilled > 0) return "partial";
      return "empty";
    },
  },
  {
    id: 2,
    label: "Ubicación",
    visibleFor: ALL,
    getStatus(form): ModuleStatus {
      const required = [form.province, form.city, form.street, form.number];
      const filled = required.filter(hasValue).length;
      return partial(filled, required.length);
    },
  },
  {
    id: 3,
    label: "Contenido",
    visibleFor: ALL,
    getStatus(form): ModuleStatus {
      const titleOk = hasValue(form.title);
      const descOk = hasValue(form.description);
      if (titleOk && descOk) return "complete";
      if (titleOk || descOk) return "partial";
      return "empty";
    },
  },
  {
    id: 4,
    label: "Superficies",
    visibleFor: SURFACES_TYPES,
    getStatus(form): ModuleStatus {
      return hasValue(form.areaM2) ? "complete" : "empty";
    },
  },
  {
    id: 5,
    label: "Ambientes",
    visibleFor: ENVIRONMENTS_TYPES,
    getStatus(form): ModuleStatus {
      const fields = [form.rooms, form.bathrooms, form.toilets, form.garages, form.plants];
      const filled = fields.filter(hasValue).length;
      return partial(filled, 2); // at least rooms + bathrooms = complete
    },
  },
  {
    id: 6,
    label: "Características Básicas",
    visibleFor: CHARACTERISTICS_TYPES,
    getStatus(form): ModuleStatus {
      const fields = [form.condition, form.orientation, form.constructionYear];
      const filled = fields.filter(hasValue).length;
      return partial(filled, fields.length);
    },
  },
  {
    id: 7,
    label: "Tags y Servicios",
    visibleFor: ALL,
    getStatus(form): ModuleStatus {
      const amenityCount = Object.values(form.amenities || {}).filter(Boolean).length;
      if (amenityCount >= 3) return "complete";
      if (amenityCount > 0) return "partial";
      return "empty";
    },
  },
  {
    id: 8,
    label: "Información del Edificio",
    visibleFor: APARTMENT_LIKE,
    getStatus(form): ModuleStatus {
      const fields = [form.buildingCondition, form.buildingFloors, form.unitsPerFloor];
      const filled = fields.filter(hasValue).length;
      return partial(filled, fields.length);
    },
  },
  {
    id: 9,
    label: "Información Comercial",
    visibleFor: COMMERCIAL_LIKE,
    getStatus(form): ModuleStatus {
      return hasValue(form.commercialActivity) ? "complete" : "empty";
    },
  },
  {
    id: 10,
    label: "Información del Campo",
    visibleFor: ["FIELD"],
    getStatus(form): ModuleStatus {
      return hasValue(form.hectares) || hasValue(form.soilType) ? "partial" : "empty";
    },
  },
  {
    id: 11,
    label: "Información del Terreno",
    visibleFor: ["LAND"],
    getStatus(form): ModuleStatus {
      return hasValue(form.landUse) ? "complete" : "empty";
    },
  },
  {
    id: 12,
    label: "Multimedia",
    visibleFor: ALL,
    getStatus(form): ModuleStatus {
      const imageCount = (form.images || []).length;
      const hasVideo = hasValue(form.youtubeUrl) || hasValue(form.tour360Url);
      if (imageCount >= 5) return "complete";
      if (imageCount > 0 || hasVideo) return "partial";
      return "empty";
    },
  },
  {
    id: 13,
    label: "Información de Contacto",
    visibleFor: ALL,
    getStatus(form): ModuleStatus {
      const fields = [form.contactName, form.contactPhone, form.contactEmail];
      const filled = fields.filter(hasValue).length;
      return partial(filled, fields.length);
    },
  },
];

/** Returns only the modules relevant for the current property type. */
export function getVisibleModules(
  propertyType: string | undefined,
): ModuleDefinition[] {
  if (!propertyType) return MODULE_DEFINITIONS.filter((m) => m.visibleFor.length === 0);
  return MODULE_DEFINITIONS.filter(
    (m) => m.visibleFor.length === 0 || m.visibleFor.includes(propertyType),
  );
}
