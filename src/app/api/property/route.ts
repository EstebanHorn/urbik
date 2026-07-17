import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse, NextRequest } from "next/server";

interface PropertyRequestBody {
  title: string;
  description?: string;
  address: string;
  displayAddress?: string | null;
  city: string;
  province?: string;
  country?: string;
  type: string;
  salePrice?: number | string;
  rentPrice?: number | string;
  saleCurrency?: string;
  rentCurrency?: string;
  areaM2?: number | string;
  rooms?: number | string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  operationType: string;
  images?: string[];
  propertySubtype?: string;
  youtubeUrl?: string;
  tour360Url?: string;
  isPriceHidden?: boolean;
  featureGroups?: Record<string, Record<string, boolean>>;
}

// GET — propiedades del stock propio de la inmobiliaria autenticada.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("properties")
      .select("*")
      .eq("real_estate_id", authUser.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ properties: data ?? [] });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { error: "Error al obtener propiedades", detail: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401 },
    );
  }

  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role, status")
      .eq("id", authUser.id)
      .single();

    if (!profile || profile.role !== "REALESTATE") {
      return NextResponse.json(
        { error: "Acceso denegado." },
        { status: 403 },
      );
    }

    if (profile.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Tu inmobiliaria todavía no fue aprobada por el equipo de Geora." },
        { status: 403 },
      );
    }

    const body: PropertyRequestBody = await req.json();

    const {
      title,
      description,
      address,
      displayAddress,
      city,
      province,
      country,
      type,
      salePrice,
      saleCurrency,
      rentPrice,
      rentCurrency,
      areaM2,
      rooms,
      bedrooms,
      bathrooms,
      operationType,
      images,
      propertySubtype,
      youtubeUrl,
      tour360Url,
      isPriceHidden,
      featureGroups,
    } = body;

    if (!title || !city || !operationType) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 },
      );
    }

    const { data: newProperty, error } = await admin
      .from("properties")
      .insert({
        title,
        description: description || "",
        address,
        display_address: displayAddress || null,
        city,
        province: province ?? "",
        country: country ?? "Argentina",
        type,
        property_subtype: propertySubtype || null,
        operation_type: operationType,
        status: "AVAILABLE",
        is_price_hidden: Boolean(isPriceHidden),
        sale_price: salePrice
          ? parseFloat(salePrice.toString())
          : null,
        sale_currency: saleCurrency || "USD",
        rent_price: rentPrice
          ? parseFloat(rentPrice.toString())
          : null,
        rent_currency: rentCurrency || "ARS",
        area: areaM2
          ? parseFloat(areaM2.toString())
          : null,
        rooms: rooms
          ? parseInt(rooms.toString())
          : null,
        bedrooms: bedrooms
          ? parseInt(bedrooms.toString())
          : null,
        bathrooms: bathrooms
          ? parseInt(bathrooms.toString())
          : null,
        images: images || [],
        youtube_url: youtubeUrl || null,
        tour360_url: tour360Url || null,
        feature_groups: featureGroups || {},
        real_estate_id: authUser.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(newProperty, { status: 201 });
  } catch (err) {
    const error = err as Error;

    console.error("Error al crear propiedad:", error);

    return NextResponse.json(
      {
        error: "Error al crear la propiedad",
        detail: error.message,
      },
      { status: 500 },
    );
  }
}