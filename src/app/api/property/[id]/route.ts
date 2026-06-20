import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const toNumberOrUndefined = (
  value: unknown,
): number | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return undefined;

  const parsed = Number(value);

  return Number.isNaN(parsed) ? undefined : parsed;
};

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await req.json();

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", authUser.id)
      .single();

    const { data: property } = await admin
      .from("properties")
      .select("id, real_estate_id")
      .eq("id", id)
      .single();

    if (!property || !profile) {
      return NextResponse.json(
        { error: "No encontrado" },
        { status: 404 },
      );
    }

    const isOwner = property.real_estate_id === authUser.id;
    const isAdmin = profile.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 },
      );
    }

    const updateData: Record<string, unknown> = {
      title: body.title,
      description: body.description,
      type: body.type,
      unit_type: body.unitType ?? undefined,
      status: body.status ?? undefined,
      operation_type: body.operationType ?? undefined,
      country: body.country ?? undefined,
      province: body.province ?? undefined,
      city: body.city ?? undefined,
      district: body.district ?? undefined,
      locality: body.locality ?? undefined,
      neighborhood: body.neighborhood ?? undefined,
      street_name:
        body.streetName ?? body.street ?? undefined,
      street_number:
        body.streetNumber ?? body.number ?? undefined,
      floor: body.floor ?? undefined,
      unit_number: body.unitNumber ?? undefined,
      address: body.address ?? undefined,
      display_address:
        body.displayAddress !== undefined
          ? body.displayAddress || null
          : undefined,
      area: toNumberOrUndefined(body.area ?? body.areaM2),
      rooms: toNumberOrUndefined(body.rooms),
      bedrooms: toNumberOrUndefined(body.bedrooms),
      bathrooms: toNumberOrUndefined(body.bathrooms),
      toilets: toNumberOrUndefined(body.toilets),
      garages: toNumberOrUndefined(body.garages),
      plants: toNumberOrUndefined(body.plants),
      covered_area: toNumberOrUndefined(body.coveredArea),
      semi_covered_area: toNumberOrUndefined(
        body.semiCoveredArea,
      ),
      uncovered_area: toNumberOrUndefined(
        body.uncoveredArea,
      ),
      front_length: toNumberOrUndefined(body.frontLength),
      back_length: toNumberOrUndefined(body.backLength),
      expenses: toNumberOrUndefined(body.expenses),
      images: body.images,
      property_subtype:
        body.propertySubtype || undefined,
      youtube_url: body.youtubeUrl || undefined,
      tour360_url: body.tour360Url || undefined,
      is_price_hidden:
        body.isPriceHidden !== undefined
          ? Boolean(body.isPriceHidden)
          : undefined,
      feature_groups:
        body.featureGroups || undefined,
      extra_data:
        body.laundryType !== undefined
          ? {
              ...(body.extraData || {}),
              laundryType: body.laundryType || null,
            }
          : body.extraData || undefined,
      has_laundry:
        body.laundryType !== undefined
          ? !!body.laundryType
          : undefined,
      has_water:
        typeof body.amenities?.agua === "boolean"
          ? body.amenities.agua
          : undefined,
      has_electricity:
        typeof body.amenities?.luz === "boolean"
          ? body.amenities.luz
          : undefined,
      has_gas:
        typeof body.amenities?.gas === "boolean"
          ? body.amenities.gas
          : undefined,
      has_internet:
        typeof body.amenities?.internet === "boolean"
          ? body.amenities.internet
          : undefined,
      has_parking:
        typeof body.amenities?.cochera === "boolean"
          ? body.amenities.cochera
          : undefined,
      has_pool:
        typeof body.amenities?.pileta === "boolean"
          ? body.amenities.pileta
          : undefined,
      sale_price:
        body.salePrice !== undefined
          ? body.salePrice === "" || body.salePrice === null
            ? null
            : Number(body.salePrice)
          : undefined,
      rent_price:
        body.rentPrice !== undefined
          ? body.rentPrice === "" || body.rentPrice === null
            ? null
            : Number(body.rentPrice)
          : undefined,
      sale_currency: body.saleCurrency ?? undefined,
      rent_currency: body.rentCurrency ?? undefined,
      latitude: body.latitude != null ? Number(body.latitude) : undefined,
      longitude: body.longitude != null ? Number(body.longitude) : undefined,
      parcel_cca: body.parcelCCA || undefined,
      parcel_pda: body.parcelPDA || undefined,
      parcel_geom: body.parcelGeom || undefined,
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Marca de última modificación, para poder ordenar por "últimas modificaciones".
    updateData.updated_at = new Date().toISOString();

    const { data: updated, error } = await admin
      .from("properties")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("ERROR EN PUT PROPERTY:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido";

    return NextResponse.json(
      { error: "Error interno", message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const admin2 = createAdminClient();
    const { data: profile2 } = await admin2
      .from("profiles")
      .select("role")
      .eq("id", authUser.id)
      .single();

    const { data: property } = await admin2
      .from("properties")
      .select("id, real_estate_id")
      .eq("id", id)
      .single();

    if (!property || !profile2) {
      return NextResponse.json(
        { error: "No encontrada" },
        { status: 404 },
      );
    }

    const isOwner = property.real_estate_id === authUser.id;
    const isAdmin = profile2.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Prohibido" },
        { status: 403 },
      );
    }

    const { error } = await admin2
      .from("properties")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: "Propiedad eliminada correctamente",
    });
  } catch (error) {
    console.error("Error en DELETE property:", error);

    return NextResponse.json(
      { error: "Error al eliminar" },
      { status: 500 },
    );
  }
}