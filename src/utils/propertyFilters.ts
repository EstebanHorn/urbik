export type FilterState = {
  operationType: string;
  propertyType: string;
  currency: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string[];
  bathrooms: string[];
  minArea: string;
  maxArea: string;
  age: string;
  city: string;
  province: string;
  q: string;
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
};

export type AmenityFlagKey =
  | "hasWater"
  | "hasElectricity"
  | "hasGas"
  | "hasInternet"
  | "hasParking"
  | "hasPool"
  | "hasBalcony"
  | "hasGrill"
  | "hasGarden"
  | "hasLaundry"
  | "hasAirConditioning";

export const AMENITY_KEYS: AmenityFlagKey[] = [
  "hasWater",
  "hasElectricity",
  "hasGas",
  "hasInternet",
  "hasParking",
  "hasPool",
  "hasBalcony",
  "hasGrill",
  "hasGarden",
  "hasLaundry",
  "hasAirConditioning",
];

export const DEFAULT_FILTERS: FilterState = {
  operationType: "",
  propertyType: "",
  currency: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: [],
  bathrooms: [],
  minArea: "",
  maxArea: "",
  age: "",
  city: "",
  province: "",
  q: "",
  hasWater: false,
  hasElectricity: false,
  hasGas: false,
  hasInternet: false,
  hasParking: false,
  hasPool: false,
  hasBalcony: false,
  hasGrill: false,
  hasGarden: false,
  hasLaundry: false,
  hasAirConditioning: false,
};

export function parseFiltersFromQuery(params: URLSearchParams): FilterState {
  return {
    operationType: params.get("operationType") || "",
    propertyType: params.get("propertyType") || "",
    currency: params.get("currency") || "",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    bedrooms: params.getAll("bedrooms").length
      ? params.getAll("bedrooms")
      : params.get("rooms")
        ? [params.get("rooms") as string]
        : [],
    bathrooms: params.getAll("bathrooms"),
    minArea: params.get("minArea") || "",
    maxArea: params.get("maxArea") || "",
    age: params.get("age") || "",
    city: params.get("city") || "",
    province: params.get("province") || "",
    q: params.get("q") || "",
    hasWater: params.get("hasWater") === "true",
    hasElectricity: params.get("hasElectricity") === "true",
    hasGas: params.get("hasGas") === "true",
    hasInternet: params.get("hasInternet") === "true",
    hasParking: params.get("hasParking") === "true",
    hasPool: params.get("hasPool") === "true",
    hasBalcony: params.get("hasBalcony") === "true",
    hasGrill: params.get("hasGrill") === "true",
    hasGarden: params.get("hasGarden") === "true",
    hasLaundry: params.get("hasLaundry") === "true",
    hasAirConditioning: params.get("hasAirConditioning") === "true",
  };
}

export function areFiltersEqual(a: FilterState, b: FilterState) {
  return (
    a.operationType === b.operationType &&
    a.propertyType === b.propertyType &&
    a.currency === b.currency &&
    a.minPrice === b.minPrice &&
    a.maxPrice === b.maxPrice &&
    a.minArea === b.minArea &&
    a.maxArea === b.maxArea &&
    a.age === b.age &&
    a.city === b.city &&
    a.province === b.province &&
    a.q === b.q &&
    a.hasWater === b.hasWater &&
    a.hasElectricity === b.hasElectricity &&
    a.hasGas === b.hasGas &&
    a.hasInternet === b.hasInternet &&
    a.hasParking === b.hasParking &&
    a.hasPool === b.hasPool &&
    a.hasBalcony === b.hasBalcony &&
    a.hasGrill === b.hasGrill &&
    a.hasGarden === b.hasGarden &&
    a.hasLaundry === b.hasLaundry &&
    a.hasAirConditioning === b.hasAirConditioning &&
    a.bedrooms.join("|") === b.bedrooms.join("|") &&
    a.bathrooms.join("|") === b.bathrooms.join("|")
  );
}

export function applyFiltersToParams(
  params: URLSearchParams,
  filters: FilterState,
): URLSearchParams {
  const next = new URLSearchParams(params.toString());

  const setOrDelete = (key: string, value: string) => {
    if (value?.trim()) next.set(key, value.trim());
    else next.delete(key);
  };

  setOrDelete("operationType", filters.operationType);
  setOrDelete("propertyType", filters.propertyType);
  setOrDelete("currency", filters.currency);
  setOrDelete("minPrice", filters.minPrice);
  setOrDelete("maxPrice", filters.maxPrice);
  setOrDelete("minArea", filters.minArea);
  setOrDelete("maxArea", filters.maxArea);
  setOrDelete("age", filters.age);
  setOrDelete("city", filters.city);
  setOrDelete("province", filters.province);
  setOrDelete("q", filters.q);

  next.delete("bedrooms");
  next.delete("bathrooms");
  filters.bedrooms.forEach((value) => next.append("bedrooms", value));
  filters.bathrooms.forEach((value) => next.append("bathrooms", value));

  AMENITY_KEYS.forEach((key) => {
    if (filters[key]) next.set(key, "true");
    else next.delete(key);
  });

  return next;
}

export function appendFiltersToApiQuery(
  query: URLSearchParams,
  filters: FilterState,
) {
  if (filters.operationType) query.append("operationType", filters.operationType);
  if (filters.propertyType) query.append("propertyType", filters.propertyType);
  if (filters.currency) query.append("currency", filters.currency);
  if (filters.minPrice) query.append("minPrice", filters.minPrice);
  if (filters.maxPrice) query.append("maxPrice", filters.maxPrice);
  if (filters.minArea) query.append("minArea", filters.minArea);
  if (filters.maxArea) query.append("maxArea", filters.maxArea);
  if (filters.age) query.append("age", filters.age);
  if (filters.city) query.append("city", filters.city);
  if (filters.province) query.append("province", filters.province);
  if (filters.q) query.append("q", filters.q);

  filters.bedrooms.forEach((bedroom) => query.append("bedrooms", bedroom));
  filters.bathrooms.forEach((bathroom) => query.append("bathrooms", bathroom));

  AMENITY_KEYS.forEach((key) => {
    if (filters[key]) {
      query.append(key, "true");
    }
  });
}
