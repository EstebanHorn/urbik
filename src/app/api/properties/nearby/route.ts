import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  images,
  address,
  display_address,
  rooms,
  bedrooms,
  bathrooms,
  area,
  created_at
`;

interface NearbyPropertyRow {
  id: string;
  title: string;
  sale_price?: number | null;
  sale_currency?: string | null;
  rent_price?: number | null;
  rent_currency?: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string;
  province: string;
  operation_type: string;
  type: string;
  images: string[];
  address: string;
  display_address?: string | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  created_at: string;
}

const mapProperty = (p: NearbyPropertyRow) => ({
  id: p.id,
  title: p.title,
  salePrice: p.sale_price ?? null,
  saleCurrency: p.sale_currency ?? null,
  rentPrice: p.rent_price ?? null,
  rentCurrency: p.rent_currency ?? null,
  latitude: p.latitude,
  longitude: p.longitude,
  city: p.city,
  province: p.province,
  operationType: p.operation_type,
  type: p.type,
  images: p.images ?? [],
  address: p.address,
  displayAddress: p.display_address ?? null,
  rooms: p.rooms,
  bedrooms: p.bedrooms,
  bathrooms: p.bathrooms,
  area: p.area,
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
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city")?.trim();
    const operationType = searchParams.get("operationType");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "6", 10) || 6, 24);

    if (!city) {
      return NextResponse.json({ properties: [] });
    }

    let query = supabase
      .from("properties")
      .select(PROPERTY_SELECT)
      .eq("status", "AVAILABLE")
      .ilike("city", `%${city}%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (operationType && operationType !== "ambas") {
      query = query.eq("operation_type", operationType);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      properties: (data || []).map((p) => mapProperty(p as unknown as NearbyPropertyRow)),
    });
  } catch (error) {
    console.error("Error fetching nearby properties:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
