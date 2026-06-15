import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const buildNumericSelectionFilter = (values: string[]) => {
  if (values.length === 0) return null;

  const exactValues = values
    .filter((value) => !value.endsWith("+"))
    .map((value) => parseInt(value, 10))
    .filter((value) => !Number.isNaN(value));

  const plusValues = values
    .filter((value) => value.endsWith("+"))
    .map((value) => parseInt(value.replace("+", ""), 10))
    .filter((value) => !Number.isNaN(value));

  if (exactValues.length === 0 && plusValues.length === 0) {
    return null;
  }

  return {
    exactValues,
    minPlusValue:
      plusValues.length > 0 ? Math.min(...plusValues) : null,
  };
};

const PROPERTY_SELECT = `
  id,
  title,
  sale_price,
  sale_currency,
  rent_price,
  rent_currency,
  latitude,
  longitude,
  city,
  province,
  operation_type,
  type,
  parcel_cca,
  parcel_geom,
  images,
  address,
  display_address,
  rooms,
  bedrooms,
  bathrooms,
  area,
  has_water,
  has_electricity,
  has_gas,
  has_internet,
  has_parking,
  has_pool,
  has_balcony,
  has_grill,
  has_garden,
  has_laundry,
  has_air_conditioning,
  real_estate_id,
  real_estates ( agency_name, logo_url )
`;

interface MapPropertyRow {
  id: string | number;
  title: string;
  sale_price?: number | null;
  sale_currency?: string | null;
  rent_price?: number | null;
  rent_currency?: string | null;
  latitude: number;
  longitude: number;
  city: string;
  province: string;
  operation_type: string;
  type: string;
  parcel_cca?: string | null;
  parcel_geom?: unknown;
  images: string[];
  address: string;
  display_address?: string | null;
  rooms: number;
  bedrooms: number | null;
  bathrooms: number;
  area: number;
  has_water: boolean;
  has_electricity: boolean;
  has_gas: boolean;
  has_internet: boolean;
  has_parking: boolean;
  has_pool: boolean;
  has_balcony: boolean;
  has_grill: boolean;
  has_garden: boolean;
  has_laundry: boolean;
  has_air_conditioning: boolean;
  real_estate_id?: string | null;
  real_estates?: { agency_name?: string | null; logo_url?: string | null } | null;
}

const mapProperty = (property: MapPropertyRow) => ({
  id: property.id,
  title: property.title,
  salePrice: property.sale_price,
  saleCurrency: property.sale_currency,
  rentPrice: property.rent_price,
  rentCurrency: property.rent_currency,
  latitude: property.latitude,
  longitude: property.longitude,
  city: property.city,
  province: property.province,
  operationType: property.operation_type,
  type: property.type,
  parcelCCA: property.parcel_cca,
  parcelGeom: property.parcel_geom,
  images: property.images,
  address: property.address,
  displayAddress: property.display_address ?? null,
  rooms: property.rooms,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  area: property.area,
  hasWater: property.has_water,
  hasElectricity: property.has_electricity,
  hasGas: property.has_gas,
  hasInternet: property.has_internet,
  hasParking: property.has_parking,
  hasPool: property.has_pool,
  hasBalcony: property.has_balcony,
  hasGrill: property.has_grill,
  hasGarden: property.has_garden,
  hasLaundry: property.has_laundry,
  hasAirConditioning: property.has_air_conditioning,
  realEstateId: property.real_estate_id ?? null,
  agencyName: property.real_estates?.agency_name ?? null,
  agencyLogoUrl: property.real_estates?.logo_url ?? null,
  agencyLogo: property.real_estates?.logo_url ?? null,
});

export async function GET(request: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);

  const minLat = parseFloat(searchParams.get("minLat") ?? "");
  const maxLat = parseFloat(searchParams.get("maxLat") ?? "");
  const minLon = parseFloat(searchParams.get("minLon") ?? "");
  const maxLon = parseFloat(searchParams.get("maxLon") ?? "");

  const operationType = searchParams.get("operationType");
  const propertyType = searchParams.get("propertyType");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const currency = searchParams.get("currency");

  const bedrooms = searchParams.getAll("bedrooms");
  const bathrooms = searchParams.getAll("bathrooms");

  const minArea = searchParams.get("minArea");
  const maxArea = searchParams.get("maxArea");

  const age = searchParams.get("age");

  const city = searchParams.get("city");
  const province = searchParams.get("province");

  const text = searchParams.get("q");

  if (
    Number.isNaN(minLat) ||
    Number.isNaN(maxLat) ||
    Number.isNaN(minLon) ||
    Number.isNaN(maxLon)
  ) {
    return NextResponse.json(
      { error: "Coordenadas inválidas" },
      { status: 400 },
    );
  }

  try {
    const admin = createAdminClient();
    const { data: inactiveProfiles } = await admin
      .from("profiles")
      .select("id")
      .eq("is_active", false);
    const inactiveIds = (inactiveProfiles ?? []).map((p: { id: string }) => p.id);

    let query = supabase
      .from("properties")
      .select(PROPERTY_SELECT)
      .eq("status", "AVAILABLE")
      .gte("latitude", minLat)
      .lte("latitude", maxLat)
      .gte("longitude", minLon)
      .lte("longitude", maxLon);

    if (inactiveIds.length > 0) {
      query = query.or(`real_estate_id.is.null,real_estate_id.not.in.(${inactiveIds.join(",")})`);
    }

    if (operationType) {
      query = query.eq("operation_type", operationType);
    }

    if (propertyType) {
      query = query.eq("type", propertyType);
    }

    if (city) {
      query = query.ilike("city", `%${city}%`);
    }

    if (province) {
      query = query.ilike("province", `%${province}%`);
    }

    if (text) {
      query = query.or(
        `title.ilike.%${text}%,address.ilike.%${text}%,city.ilike.%${text}%,province.ilike.%${text}%`,
      );
    }

    const roomsFilter = buildNumericSelectionFilter(bedrooms);

    if (roomsFilter) {
      const conditions: string[] = [];

      if (roomsFilter.exactValues.length > 0) {
        conditions.push(
          `rooms.in.(${roomsFilter.exactValues.join(",")})`,
        );
      }

      if (roomsFilter.minPlusValue !== null) {
        conditions.push(`rooms.gte.${roomsFilter.minPlusValue}`);
      }

      query = query.or(conditions.join(","));
    }

    const bathroomsFilter =
      buildNumericSelectionFilter(bathrooms);

    if (bathroomsFilter) {
      const conditions: string[] = [];

      if (bathroomsFilter.exactValues.length > 0) {
        conditions.push(
          `bathrooms.in.(${bathroomsFilter.exactValues.join(",")})`,
        );
      }

      if (bathroomsFilter.minPlusValue !== null) {
        conditions.push(
          `bathrooms.gte.${bathroomsFilter.minPlusValue}`,
        );
      }

      query = query.or(conditions.join(","));
    }

    if (minArea) {
      query = query.gte("area", parseFloat(minArea));
    }

    if (maxArea) {
      query = query.lte("area", parseFloat(maxArea));
    }

    if (age) {
      const ageInYears = parseInt(age, 10);

      if (!Number.isNaN(ageInYears)) {
        const minDate = new Date();

        minDate.setFullYear(
          minDate.getFullYear() - ageInYears,
        );

        query = query.gte(
          "created_at",
          minDate.toISOString(),
        );
      }
    }

    if (minPrice || maxPrice) {
      const saleConditions: string[] = [];
      const rentConditions: string[] = [];

      if (minPrice) {
        saleConditions.push(`sale_price.gte.${minPrice}`);
        rentConditions.push(`rent_price.gte.${minPrice}`);
      }

      if (maxPrice) {
        saleConditions.push(`sale_price.lte.${maxPrice}`);
        rentConditions.push(`rent_price.lte.${maxPrice}`);
      }

      if (currency) {
        saleConditions.push(`sale_currency.eq.${currency}`);
        rentConditions.push(`rent_currency.eq.${currency}`);
      }

      query = query.or(
        `and(${saleConditions.join(",")}),and(${rentConditions.join(",")})`,
      );
    } else if (currency) {
      query = query.or(
        `sale_currency.eq.${currency},rent_currency.eq.${currency}`,
      );
    }

    const amenities = [
      ["hasWater", "has_water"],
      ["hasElectricity", "has_electricity"],
      ["hasGas", "has_gas"],
      ["hasInternet", "has_internet"],
      ["hasParking", "has_parking"],
      ["hasPool", "has_pool"],
      ["hasBalcony", "has_balcony"],
      ["hasGrill", "has_grill"],
      ["hasGarden", "has_garden"],
      ["hasLaundry", "has_laundry"],
      ["hasAirConditioning", "has_air_conditioning"],
    ];

    for (const [param, column] of amenities) {
      if (searchParams.get(param) === "true") {
        query = query.eq(column, true);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      properties: (data || []).map((prop) => mapProperty(prop as unknown as MapPropertyRow)),
    });
  } catch (error) {
    console.error(
      "Error fetching properties in bounds:",
      error,
    );

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}