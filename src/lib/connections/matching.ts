import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Criterios de una búsqueda (subset de property_searches / search_params de un cliente).
 * Acepta tanto snake_case (fila de DB) como camelCase (payload del form / search_params).
 */
export interface SearchCriteria {
  operation_type?: string | null;
  operationType?: string | null;
  property_type?: string | null;
  propertyType?: string | null;
  city?: string | null;
  min_price?: number | string | null;
  minPrice?: number | string | null;
  max_price?: number | string | null;
  maxPrice?: number | string | null;
  currency?: string | null;
  min_area?: number | string | null;
  minArea?: number | string | null;
  max_area?: number | string | null;
  maxArea?: number | string | null;
  min_bedrooms?: number | string | null;
  minBedrooms?: number | string | null;
  min_bathrooms?: number | string | null;
  minBathrooms?: number | string | null;
  mandatory_fields?: string[] | null;
  mandatoryFields?: string[] | null;
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeCriteria(c: SearchCriteria) {
  return {
    operationType: c.operation_type ?? c.operationType ?? null,
    propertyType: c.property_type ?? c.propertyType ?? null,
    city: c.city ?? null,
    minPrice: num(c.min_price ?? c.minPrice),
    maxPrice: num(c.max_price ?? c.maxPrice),
    currency: c.currency ?? null,
    minArea: num(c.min_area ?? c.minArea),
    maxArea: num(c.max_area ?? c.maxArea),
    minBedrooms: num(c.min_bedrooms ?? c.minBedrooms),
    minBathrooms: num(c.min_bathrooms ?? c.minBathrooms),
    mandatory: c.mandatory_fields ?? c.mandatoryFields ?? [],
  };
}

export interface MatchedProperty {
  id: string;
  title: string;
  type: string;
  operation_type: string;
  city: string | null;
  locality: string | null;
  province: string | null;
  address: string | null;
  display_address: string | null;
  sale_price: number | null;
  rent_price: number | null;
  sale_currency: string | null;
  rent_currency: string | null;
  area: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  images: string[] | null;
  status: string;
  real_estate_id: string;
}

export interface MatchOptions {
  /** Si se define, sólo cruza contra el stock de esta inmobiliaria (matching interno, Flujo 4). */
  ownerId?: string;
  /** Si se define, excluye el stock de esta inmobiliaria (matching de red, Flujo 1). */
  excludeOwnerId?: string;
  limit?: number;
}

/**
 * Devuelve las propiedades de Geora que cumplen los criterios de una búsqueda.
 *
 * - El precio se compara contra sale_price (SALE) o rent_price (RENT/TEMP_RENT).
 * - operation_type 'SALE_RENT' en una propiedad satisface tanto SALE como RENT.
 * - Sólo se consideran propiedades AVAILABLE.
 */
export async function findMatchingProperties(
  supabase: SupabaseClient,
  criteria: SearchCriteria,
  opts: MatchOptions = {}
) {
  const c = normalizeCriteria(criteria);
  const isRent = c.operationType === "RENT" || c.operationType === "TEMP_RENT";
  const priceCol = isRent ? "rent_price" : "sale_price";
  const currencyCol = isRent ? "rent_currency" : "sale_currency";

  let query = supabase
    .from("properties")
    .select(
      "id, title, type, operation_type, city, locality, province, address, display_address, " +
        "sale_price, rent_price, sale_currency, rent_currency, area, rooms, bedrooms, bathrooms, " +
        "images, status, real_estate_id"
    )
    .eq("status", "AVAILABLE");

  if (opts.ownerId) query = query.eq("real_estate_id", opts.ownerId);
  if (opts.excludeOwnerId) query = query.neq("real_estate_id", opts.excludeOwnerId);

  // operación: la propiedad debe cubrir la operación buscada (o ser mixta SALE_RENT)
  if (c.operationType) {
    query = query.in("operation_type", [c.operationType, "SALE_RENT"]);
  }
  if (c.propertyType) query = query.eq("type", c.propertyType);
  if (c.city) {
    // La búsqueda guarda en "city" el valor más específico elegido (localidad o
    // departamento), pero la propiedad separa "city" (departamento) de
    // "locality" (localidad puntual, ej. "City Bell" dentro de "La Plata").
    // Hay que cruzar contra ambas columnas para no perder matches válidos.
    const safeCity = c.city.replace(/[,()%]/g, " ").trim();
    if (safeCity) {
      query = query.or(`city.ilike.%${safeCity}%,locality.ilike.%${safeCity}%`);
    }
  }

  if (c.minPrice !== null) query = query.gte(priceCol, c.minPrice);
  if (c.maxPrice !== null) query = query.lte(priceCol, c.maxPrice);
  if (c.currency) query = query.eq(currencyCol, c.currency);

  if (c.minArea !== null) query = query.gte("area", c.minArea);
  if (c.maxArea !== null) query = query.lte("area", c.maxArea);

  if (c.minBedrooms !== null) query = query.gte("bedrooms", c.minBedrooms);
  if (c.minBathrooms !== null) query = query.gte("bathrooms", c.minBathrooms);

  query = query.limit(opts.limit ?? 100);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as MatchedProperty[];
}

/** Subset de columnas de "properties" necesario para evaluar un match en memoria. */
export interface PropertyForMatch {
  type: string | null;
  operation_type: string | null;
  city: string | null;
  locality?: string | null;
  sale_price: number | null;
  rent_price: number | null;
  sale_currency: string | null;
  rent_currency: string | null;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
}

/**
 * Misma lógica que findMatchingProperties pero evaluada en memoria contra una
 * lista de propiedades ya cargada, para no hacer una query por búsqueda
 * (ej. marcar en la lista de la red qué búsquedas coinciden con mi stock).
 */
export function propertyMatchesCriteria(
  property: PropertyForMatch,
  criteria: SearchCriteria
): boolean {
  const c = normalizeCriteria(criteria);
  const isRent = c.operationType === "RENT" || c.operationType === "TEMP_RENT";
  const price = isRent ? property.rent_price : property.sale_price;
  const currency = isRent ? property.rent_currency : property.sale_currency;

  if (c.operationType) {
    if (property.operation_type !== c.operationType && property.operation_type !== "SALE_RENT") {
      return false;
    }
  }
  if (c.propertyType && property.type !== c.propertyType) return false;

  if (c.city) {
    const needle = c.city.toLowerCase();
    const cityVal = (property.city ?? "").toLowerCase();
    const localityVal = (property.locality ?? "").toLowerCase();
    if (!cityVal.includes(needle) && !localityVal.includes(needle)) return false;
  }

  if (c.minPrice !== null && (price === null || price < c.minPrice)) return false;
  if (c.maxPrice !== null && (price === null || price > c.maxPrice)) return false;
  if (c.currency && currency !== c.currency) return false;

  if (c.minArea !== null && (property.area === null || property.area < c.minArea)) return false;
  if (c.maxArea !== null && (property.area === null || property.area > c.maxArea)) return false;

  if (c.minBedrooms !== null && (property.bedrooms === null || property.bedrooms < c.minBedrooms)) {
    return false;
  }
  if (c.minBathrooms !== null && (property.bathrooms === null || property.bathrooms < c.minBathrooms)) {
    return false;
  }

  return true;
}

/** Ids de las búsquedas que coinciden con al menos una propiedad del stock dado. */
export function findSearchIdsWithMatch<T extends SearchCriteria & { id: string }>(
  searches: T[],
  properties: PropertyForMatch[]
): Set<string> {
  const matched = new Set<string>();
  for (const search of searches) {
    if (properties.some((p) => propertyMatchesCriteria(p, search))) {
      matched.add(search.id);
    }
  }
  return matched;
}
