import { NextRequest, NextResponse } from "next/server";

const PROPERTY_TYPE_PATTERNS: Array<{ regex: RegExp; value: string }> = [
  {
    regex: /\b(depto|departamento|dpto|apartamento|apto)\b/i,
    value: "APARTMENT",
  },
  { regex: /\b(ph|propiedad horizontal)\b/i, value: "PH" },
  { regex: /\b(country|barrio cerrado|club de campo)\b/i, value: "COUNTRY" },
  { regex: /\b(casa|casita|chalet)\b/i, value: "HOUSE" },
  { regex: /\b(terreno|lote|loteo|parcela)\b/i, value: "LAND" },
  { regex: /\b(campo|chacra|estancia)\b/i, value: "FIELD" },
  {
    regex: /\b(fondo de comercio|llave de negocio)\b/i,
    value: "BUSINESS_BACKGROUND",
  },
  { regex: /\b(cochera|garage|garaje)\b/i, value: "GARAGE" },
  { regex: /\b(galpon|deposito|nave)\b/i, value: "WAREHOUSE" },
  { regex: /\b(desarrollo|pozo|emprendimiento)\b/i, value: "DEVELOPMENT" },
  { regex: /\b(oficina|estudio profesional)\b/i, value: "OFFICE" },
  {
    regex: /\b(local|comercial|negocio)\b/i,
    value: "COMMERCIAL_PROPERTY",
  },
];

const OPERATION_PATTERNS: Array<{ regex: RegExp; value: string }> = [
  {
    regex: /\b(alquiler|alquilar|alquilo|renta|rentar|arriendo)\b/i,
    value: "RENT",
  },
  {
    regex: /\b(venta|vender|vendo|comprar|compra)\b/i,
    value: "SALE",
  },
];

const AMENITY_PATTERNS: Array<{ key: string; regex: RegExp }> = [
  { key: "hasPool", regex: /\b(pileta|piscina|pool)\b/i },
  {
    key: "hasParking",
    regex: /\b(cochera|garage|garaje|estacionamiento)\b/i,
  },
  { key: "hasInternet", regex: /\b(internet|wifi|wi-fi|fibra)\b/i },
  { key: "hasGas", regex: /\b(gas)\b/i },
  { key: "hasElectricity", regex: /\b(luz|electricidad)\b/i },
  { key: "hasWater", regex: /\b(agua)\b/i },
  { key: "hasGrill", regex: /\b(parrilla|parrila|quincho)\b/i },
  { key: "hasBalcony", regex: /\b(balcon|balcones)\b/i },
  { key: "hasGarden", regex: /\b(jardin|patio|parque)\b/i },
  { key: "hasLaundry", regex: /\b(lavadero|laundry)\b/i },
  {
    key: "hasAirConditioning",
    regex: /\b(aire|aire acondicionado|split|aa)\b/i,
  },
];

function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function parsePriceNumber(value: string) {
  const clean = value.replace(/\./g, "").replace(/,/g, "");
  const parsed = Number.parseInt(clean, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function extractPriceRange(query: string) {
  const normalized = normalizeText(query);

  const between = normalized.match(
    /\b(?:entre|de)\s*\$?\s*([\d.,]+)\s*(?:y|a|hasta)\s*\$?\s*([\d.,]+)\b/i,
  );
  if (between) {
    return {
      minPrice: parsePriceNumber(between[1]),
      maxPrice: parsePriceNumber(between[2]),
    };
  }

  const minMatch = normalized.match(
    /\b(?:desde|min(?:imo)?|mas de|mas que|arriba de)\s*\$?\s*([\d.,]+)\b/i,
  );
  const maxMatch = normalized.match(
    /\b(?:hasta|max(?:imo)?|menos de|por debajo de)\s*\$?\s*([\d.,]+)\b/i,
  );

  return {
    minPrice: minMatch ? parsePriceNumber(minMatch[1]) : null,
    maxPrice: maxMatch ? parsePriceNumber(maxMatch[1]) : null,
  };
}

function toTitleCase(text: string) {
  return text
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function extractLocation(query: string) {
  const locationMatch = query.match(/\ben\s+([\p{L}][\p{L}\s'.-]{1,60})$/iu);
  if (!locationMatch) return { city: null as string | null, province: null as string | null };

  const raw = locationMatch[1].trim().replace(/[,.]$/, "");
  const cleaned = raw
    .replace(/\b(provincia|ciudad|de|del)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return { city: null, province: null };

  if (/\bprov\b|\bprovincia\b/i.test(raw)) {
    return { city: null, province: toTitleCase(cleaned) };
  }

  return { city: toTitleCase(cleaned), province: null };
}

function extractRooms(query: string) {
  const normalized = normalizeText(query);
  const roomsMatch = normalized.match(
    /\b(\d+)\s*(?:ambientes?|amb|dormitorios?|habitaciones?)\b/i,
  );
  return roomsMatch ? Number.parseInt(roomsMatch[1], 10) : null;
}

function extractBathrooms(query: string) {
  const normalized = normalizeText(query);
  const bathroomsMatch = normalized.match(
    /\b(\d+)\s*(?:banos?|baños?)\b/i,
  );
  return bathroomsMatch ? Number.parseInt(bathroomsMatch[1], 10) : null;
}

function parseSearchQuery(query: string) {
  const normalized = normalizeText(query);

  const propertyType =
    PROPERTY_TYPE_PATTERNS.find(({ regex }) => regex.test(normalized))?.value ??
    null;
  const operationType =
    OPERATION_PATTERNS.find(({ regex }) => regex.test(normalized))?.value ??
    null;

  const { minPrice, maxPrice } = extractPriceRange(query);
  const { city, province } = extractLocation(query);
  const rooms = extractRooms(query);
  const bathrooms = extractBathrooms(query);

  const amenities = AMENITY_PATTERNS.reduce<Record<string, boolean>>(
    (acc, item) => {
      if (item.regex.test(normalized)) acc[item.key] = true;
      return acc;
    },
    {},
  );

  return {
    propertyType,
    operationType,
    minPrice,
    maxPrice,
    city,
    province,
    rooms,
    bathrooms,
    amenities,
    hasStructuredFilters:
      Boolean(propertyType) ||
      Boolean(operationType) ||
      Boolean(city) ||
      Boolean(province) ||
      Boolean(minPrice) ||
      Boolean(maxPrice) ||
      Boolean(rooms) ||
      Boolean(bathrooms) ||
      Object.keys(amenities).length > 0,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  if (!q.trim()) {
    return NextResponse.json({
      parsed: {
        propertyType: null,
        operationType: null,
        minPrice: null,
        maxPrice: null,
        city: null,
        province: null,
        rooms: null,
        bathrooms: null,
        amenities: {},
        hasStructuredFilters: false,
      },
    });
  }

  return NextResponse.json({ parsed: parseSearchQuery(q) });
}
