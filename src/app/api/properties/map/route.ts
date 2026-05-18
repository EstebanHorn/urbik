import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface MapRoutePropertyRow {
  id: string | number;
  title: string;
  sale_price?: number | null;
  rent_price?: number | null;
  sale_currency?: string | null;
  rent_currency?: string | null;
  latitude: number;
  longitude: number;
  city: string;
  province: string;
  operation_type: string;
  type: string;
  parcel_cca?: string | null;
}

const mapProperty = (property: MapRoutePropertyRow) => ({
  id: property.id,
  title: property.title,
  salePrice: property.sale_price,
  rentPrice: property.rent_price,
  saleCurrency: property.sale_currency,
  rentCurrency: property.rent_currency,
  latitude: property.latitude,
  longitude: property.longitude,
  city: property.city,
  province: property.province,
  operationType: property.operation_type,
  type: property.type,
  parcelCCA: property.parcel_cca,
});

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("properties")
      .select(`
        id,
        title,
        sale_price,
        rent_price,
        sale_currency,
        rent_currency,
        latitude,
        longitude,
        city,
        province,
        operation_type,
        type,
        parcel_cca
      `)
      .eq("status", "AVAILABLE")
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      properties: (data || []).map((prop) => 
        mapProperty(prop as unknown as MapRoutePropertyRow)
      ),
    });
  } catch (error) {
    console.error("Error fetching properties for map:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}