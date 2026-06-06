import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function mapProperty(p: any) {
  const op = p.operation_type as string | undefined;
  const price =
    op === "SALE" ? p.sale_price :
    op === "SALE_RENT" ? p.sale_price :
    p.rent_price;

  return {
    id: p.id,
    title: p.title,
    description: p.description,
    price: price ?? undefined,
    city: p.city,
    province: p.province,
    address: p.address,
    isAvailable: p.status === "AVAILABLE",
    status: p.status,
    operationType: p.operation_type,
    type: p.type,
    images: p.images ?? [],
    area: p.area,
    rooms: p.rooms,
    bathrooms: p.bathrooms,
    propertySubtype: p.property_subtype,
    youtubeUrl: p.youtube_url,
    tour360Url: p.tour360_url,
    isPriceHidden: p.is_price_hidden,
    featureGroups: p.feature_groups,
    latitude: p.latitude,
    longitude: p.longitude,
    parcelCCA: p.parcel_cca,
    parcelPDA: p.parcel_pda,
    parcelGeom: p.parcel_geom,
  };
}

export async function GET() {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const admin = createAdminClient();
  
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role, email, is_active") 
    .eq("id", authUser.id)
    .single();

  if (!profile) {
    console.error("🚨 ERROR SUPABASE (Profiles):", profileError);
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  if (profile.role === "REALESTATE" || profile.role === "ADMIN") {
    const { data: realEstate } = await admin
      .from("real_estates")
      .select("agency_name, slug, phone, address, street, website, instagram, bio, province, city, logo_url, banner_url")
      .eq("profile_id", authUser.id)
      .single();

    const { data: properties } = await admin
      .from("properties")
      .select("*")
      .eq("real_estate_id", authUser.id)
      .order("id", { ascending: false });

    const { data: reviews } = await admin
      .from("real_estate_reviews")
      .select("rating")
      .eq("real_estate_id", authUser.id);

      let averageRating = 0;
    if (reviews && reviews.length > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = sum / reviews.length;
    }

    return NextResponse.json({
      id: authUser.id,
      role: profile.role,
      email: profile.email, 
      isActive: Boolean(profile.is_active),
      agencyData: {
        name: realEstate?.agency_name ?? null,
        slug: realEstate?.slug ?? null,
        phone: realEstate?.phone ?? null,
        address: realEstate?.address ?? null,
        street: realEstate?.street ?? null,
        website: realEstate?.website ?? null,
        instagram: realEstate?.instagram ?? null,
        bio: realEstate?.bio ?? null,
        province: realEstate?.province ?? null,
        city: realEstate?.city ?? null,
        logoUrl: realEstate?.logo_url ?? null,
        bannerUrl: realEstate?.banner_url ?? null,
        properties: (properties ?? []).map(mapProperty),
        reviewCount: reviews?.length ?? 0,
        reviewAverage: averageRating,
      },
    });
  }

  const { data: userProfile } = await admin
    .from("user_profiles")
    .select("first_name, last_name")
    .eq("profile_id", authUser.id)
    .single();

  return NextResponse.json({
    id: authUser.id,
    role: profile.role,
    email: profile.email,
    phone: null,
    isActive: Boolean(profile.is_active),
    firstName: userProfile?.first_name ?? null,
    lastName: userProfile?.last_name ?? null,
    properties: [],
  });
}