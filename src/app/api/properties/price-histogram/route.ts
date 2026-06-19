import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const buildNumericSelectionFilter = (values: string[]) => {
  if (values.length === 0) return null;
  const exactValues = values.filter((v) => !v.endsWith("+")).map((v) => parseInt(v, 10)).filter((v) => !Number.isNaN(v));
  const plusValues = values.filter((v) => v.endsWith("+")).map((v) => parseInt(v.replace("+", ""), 10)).filter((v) => !Number.isNaN(v));
  if (exactValues.length === 0 && plusValues.length === 0) return null;
  return { exactValues, minPlusValue: plusValues.length > 0 ? Math.min(...plusValues) : null };
};

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const operationType = searchParams.get("operationType");
  const propertyType = searchParams.get("propertyType");
  const currency = searchParams.get("currency") || "ARS";
  
  const city = searchParams.get("city");
  const province = searchParams.get("province");
  const text = searchParams.get("q");

  const bedrooms = searchParams.getAll("bedrooms");
  const bathrooms = searchParams.getAll("bathrooms");
  const rooms = searchParams.getAll("rooms");

  const minLat = searchParams.get("minLat");
  const maxLat = searchParams.get("maxLat");
  const minLon = searchParams.get("minLon");
  const maxLon = searchParams.get("maxLon");

  try {
    let query = supabase
      .from("properties")
      .select("sale_price, rent_price, sale_currency, rent_currency, operation_type")
      .eq("status", "AVAILABLE");

    if (minLat) query = query.gte("latitude", parseFloat(minLat));
    if (maxLat) query = query.lte("latitude", parseFloat(maxLat));
    if (minLon) query = query.gte("longitude", parseFloat(minLon));
    if (maxLon) query = query.lte("longitude", parseFloat(maxLon));

    if (operationType) query = query.eq("operation_type", operationType);
    if (propertyType) query = query.eq("type", propertyType);
    if (city) query = query.ilike("city", `%${city}%`);
    if (province) query = query.ilike("province", `%${province}%`);

    if (text) {
      query = query.or(`title.ilike.%${text}%,address.ilike.%${text}%,city.ilike.%${text}%,province.ilike.%${text}%`);
    }

    const roomsFilter = buildNumericSelectionFilter(rooms);
    if (roomsFilter) {
      const cond = [];
      if (roomsFilter.exactValues.length > 0) cond.push(`rooms.in.(${roomsFilter.exactValues.join(",")})`);
      if (roomsFilter.minPlusValue !== null) cond.push(`rooms.gte.${roomsFilter.minPlusValue}`);
      if (cond.length > 0) query = query.or(cond.join(","));
    }

    const bedsFilter = buildNumericSelectionFilter(bedrooms);
    if (bedsFilter) {
      const cond = [];
      if (bedsFilter.exactValues.length > 0) cond.push(`bedrooms.in.(${bedsFilter.exactValues.join(",")})`);
      if (bedsFilter.minPlusValue !== null) cond.push(`bedrooms.gte.${bedsFilter.minPlusValue}`);
      if (cond.length > 0) query = query.or(cond.join(","));
    }

    const bathsFilter = buildNumericSelectionFilter(bathrooms);
    if (bathsFilter) {
      const cond = [];
      if (bathsFilter.exactValues.length > 0) cond.push(`bathrooms.in.(${bathsFilter.exactValues.join(",")})`);
      if (bathsFilter.minPlusValue !== null) cond.push(`bathrooms.gte.${bathsFilter.minPlusValue}`);
      if (cond.length > 0) query = query.or(cond.join(","));
    }

    const { data, error } = await query.limit(2000);
    if (error) throw error;

    const isSale = !operationType || operationType === "SALE" || operationType === "SALE_RENT";

    const prices: number[] = (data ?? [])
      .map((p) => {
        const price = isSale ? (p.sale_price ?? p.rent_price) : p.rent_price;
        const priceCurrency = isSale ? (p.sale_currency ?? p.rent_currency) : p.rent_currency;
        if (!price || price <= 0) return null;
        if (priceCurrency !== currency) return null;
        return price;
      })
      .filter((p): p is number => p !== null)
      .sort((a, b) => a - b);

    if (prices.length === 0) return NextResponse.json({ buckets: [], min: 0, max: 0 });

    const min = prices[0];
    const max = prices[prices.length - 1];
    const BUCKETS = 12;
    const step = (max - min) / BUCKETS || 1;

    const buckets = Array.from({ length: BUCKETS }, (_, i) => {
      const from = min + i * step;
      const to = min + (i + 1) * step;
      const count = prices.filter((p) => p >= from && (i === BUCKETS - 1 ? p <= to : p < to)).length;
      return { from: Math.round(from), to: Math.round(to), count };
    });

    return NextResponse.json({ buckets, min, max });
  } catch (error) {
    console.error("price-histogram error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}