import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const toNumberOrNull = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

type RealEstateData = { user_id: string } | { user_id: string }[] | null | undefined;

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", authUser.id)
      .single();

    if (!profile || (profile.role !== "REALESTATE" && profile.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Solo las inmobiliarias pueden crear propiedades" },
        { status: 403 },
      );
    }

    const realEstateId = authUser.id;

    const normalizedOperation =
      body.operationType === "rent" || body.operationType === "RENT"
        ? "RENT"
        : body.operationType === "temp_rent" ||
            body.operationType === "TEMP_RENT"
          ? "TEMP_RENT"
          : body.operationType === "sale" ||
              body.operationType === "SALE"
            ? "SALE"
            : body.operationType === "both" ||
                body.operationType === "SALE_RENT"
              ? "SALE_RENT"
              : "RENT";

    const normalizedStatus = body.status || "AVAILABLE";

    const title = String(body.title || "").trim();
    const type = String(body.type || "").trim();
    const city = String(body.city || "").trim();
    const province = String(body.province || "").trim();
    const streetName = String(
      body.streetName || body.street || "",
    ).trim();
    const streetNumber = String(
      body.streetNumber || body.number || "",
    ).trim();

    const address = String(
      body.address ||
        `${streetName} ${streetNumber}`.trim() ||
        "Sin dirección",
    );

    if (!title || !type || !city || !province || !streetName) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios de publicación" },
        { status: 400 },
      );
    }

    const isPriceHidden = Boolean(body.isPriceHidden);

    const hasSale =
      body.salePrice !== null &&
      body.salePrice !== undefined &&
      body.salePrice !== "";

    const hasRent =
      body.rentPrice !== null &&
      body.rentPrice !== undefined &&
      body.rentPrice !== "";

    if (!isPriceHidden) {
      if (normalizedOperation === "SALE" && !hasSale) {
        return NextResponse.json(
          { error: "Falta precio de venta" },
          { status: 400 },
        );
      }

      if (
        (normalizedOperation === "RENT" ||
          normalizedOperation === "TEMP_RENT") &&
        !hasRent
      ) {
        return NextResponse.json(
          { error: "Falta precio de alquiler" },
          { status: 400 },
        );
      }

      if (
        normalizedOperation === "SALE_RENT" &&
        !hasSale &&
        !hasRent
      ) {
        return NextResponse.json(
          {
            error:
              "Completá al menos un precio o marcá Sin precio",
          },
          { status: 400 },
        );
      }
    }

    const { data: newProperty, error } = await supabase
      .from("properties")
      .insert({
        real_estate_id: realEstateId, 
        title,
        description: body.description || "",
        address,
        city,
        province,
        country: body.country || "Argentina",
        district: body.district || null,
        locality: body.locality || null,
        neighborhood: body.neighborhood || null,
        street_name: streetName,
        street_number: streetNumber || null,
        floor: body.floor || null,
        unit_number: body.unitNumber || null,
        type,
        unit_type: body.unitType || null,
        property_subtype: body.propertySubtype || null,
        status: normalizedStatus,
        operation_type: normalizedOperation,
        is_price_hidden: isPriceHidden,
        sale_price: toNumberOrNull(body.salePrice),
        rent_price: toNumberOrNull(body.rentPrice),
        sale_currency: body.saleCurrency || "USD",
        rent_currency: body.rentCurrency || "ARS",
        area: toNumberOrNull(body.areaM2 ?? body.area),
        rooms: toNumberOrNull(body.rooms),
        bedrooms: toNumberOrNull(body.bedrooms),
        bathrooms: toNumberOrNull(body.bathrooms),
        toilets: toNumberOrNull(body.toilets),
        garages: toNumberOrNull(body.garages),
        plants: toNumberOrNull(body.plants),
        covered_area: toNumberOrNull(body.coveredArea),
        semi_covered_area: toNumberOrNull(body.semiCoveredArea),
        uncovered_area: toNumberOrNull(body.uncoveredArea),
        front_length: toNumberOrNull(body.frontLength),
        back_length: toNumberOrNull(body.backLength),
        expenses: toNumberOrNull(body.expenses),
        has_laundry: body.laundryType ? true : false,
        has_water: !!body.hasWater,
        has_electricity: !!body.hasElectricity,
        has_gas: !!body.hasGas,
        has_internet: !!body.hasInternet,
        has_parking: !!body.hasParking,
        has_pool: !!body.hasPool,
        feature_groups: body.featureGroups || {},
        extra_data: {
          ...(body.extraData || {}),
          laundryType: body.laundryType || null,
        },
        youtube_url: body.youtubeUrl || null,
        tour360_url: body.tour360Url || null,
        images: body.images ?? [],
        latitude: toNumberOrNull(body.latitude),
        longitude: toNumberOrNull(body.longitude),
        parcel_cca: body.parcelCCA,
        parcel_pda: body.parcelPDA,
        parcel_geom: body.parcelGeom,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(newProperty);
  } catch (error) {
    console.error("ERROR_CREATING_PROPERTY:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}