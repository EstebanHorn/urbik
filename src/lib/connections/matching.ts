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
    mandatory: c.mandatory_fields ?? c.mandatoryFields ?? [],
  };
}

export interface MatchedProperty {
  id: string;
  title: string;
  type: string;
  operation_type: string;
  city: string | null;
  province: string | null;
  address: string | null;
  display_address: string | null;
  sale_price: number | null;
  rent_price: number | null;
  sale_currency: string | null;
  rent_currency: string | null;
  area: number | null;
  rooms: number | null;
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
      "id, title, type, operation_type, city, province, address, display_address, " +
        "sale_price, rent_price, sale_currency, rent_currency, area, rooms, bathrooms, " +
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
  if (c.city) query = query.ilike("city", `%${c.city}%`);

  if (c.minPrice !== null) query = query.gte(priceCol, c.minPrice);
  if (c.maxPrice !== null) query = query.lte(priceCol, c.maxPrice);
  if (c.currency) query = query.eq(currencyCol, c.currency);

  if (c.minArea !== null) query = query.gte("area", c.minArea);
  if (c.maxArea !== null) query = query.lte("area", c.maxArea);

  query = query.limit(opts.limit ?? 100);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as MatchedProperty[];
}
