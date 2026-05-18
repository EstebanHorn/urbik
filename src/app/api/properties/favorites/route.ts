import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface SupabaseProperty {
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
  images: string[];
  address: string;
  rooms: number;
  bathrooms: number;
  area: number;
  created_at: string;
}

const mapProperty = (property: SupabaseProperty) => ({
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
  images: property.images,
  address: property.address,
  rooms: property.rooms,
  bathrooms: property.bathrooms,
  area: property.area,
  createdAt: property.created_at,
});

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 },
      );
    }

    const { data, error } = await supabase
      .from("favorites")
      .select(`
        created_at,
        property:properties(*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const favoriteProperties = (data || [])
      .map((fav) => {
        const prop = Array.isArray(fav.property) ? fav.property[0] : fav.property;
        return prop as unknown as SupabaseProperty;
      })
      .filter(Boolean)
      .map(mapProperty);

    return NextResponse.json(favoriteProperties);
  } catch (error) {
    console.error("ERROR EN API FAVORITES (LIST):", error);

    return NextResponse.json(
      { error: "Error al obtener favoritos" },
      { status: 500 },
    );
  }
}