import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface FeaturedProperty {
  id: string | number;
  title: string;
  sale_price?: number | null;
  rent_price?: number | null;
  operation_type: string;
  address: string;
  city: string;
  images: string[];
  rooms: number;
  bathrooms: number;
  area: number;
  type: string;
}

const mapProperty = (
  property: FeaturedProperty,
  isFavorite = false,
) => ({
  id: property.id,
  title: property.title,
  salePrice: property.sale_price,
  rentPrice: property.rent_price,
  operationType: property.operation_type,
  address: property.address,
  city: property.city,
  images: property.images,
  rooms: property.rooms,
  bathrooms: property.bathrooms,
  area: property.area,
  type: property.type,
  isFavorite,
});

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: properties, error } = await supabase
      .from("properties")
      .select(`
        id,
        title,
        sale_price,
        rent_price,
        operation_type,
        address,
        city,
        images,
        rooms,
        bathrooms,
        area,
        type
      `)
      .eq("status", "AVAILABLE")
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      throw error;
    }

    if (!user) {
      return NextResponse.json(
        (properties || []).map((prop) =>
          mapProperty(prop as unknown as FeaturedProperty, false),
        ),
      );
    }

    const propertyIds = (properties || []).map((p) => p.id);

    const { data: favorites } = await supabase
      .from("favorites")
      .select("property_id")
      .eq("user_id", user.id)
      .in("property_id", propertyIds);

    const favoriteIds = new Set(
      (favorites || []).map((fav) => fav.property_id),
    );

    return NextResponse.json(
      (properties || []).map((prop) =>
        mapProperty(prop as unknown as FeaturedProperty, favoriteIds.has(prop.id)),
      ),
    );
  } catch (error) {
    console.error(
      "Error fetching featured properties:",
      error,
    );

    return NextResponse.json(
      { error: "Error al obtener propiedades destacadas" },
      { status: 500 },
    );
  }
}