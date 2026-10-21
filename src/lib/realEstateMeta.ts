import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildMetadata } from "@/lib/seo";

async function buildAgencyMetadata(
  path: string,
  realEstate: {
    agency_name: string;
    bio: string | null;
    logo_url: string | null;
    city: string | null;
    province: string | null;
  } | null,
  isApproved: boolean,
): Promise<Metadata> {
  if (!realEstate) {
    return buildMetadata({
      title: "Inmobiliaria no encontrada",
      description: "La inmobiliaria que buscás no existe o no está disponible.",
      path,
      noIndex: true,
    });
  }

  const location = [realEstate.city, realEstate.province].filter(Boolean).join(", ");
  const title = `${realEstate.agency_name}${location ? ` - ${location}` : ""}`;
  const description =
    realEstate.bio?.slice(0, 160) ||
    `Conocé las propiedades publicadas por ${realEstate.agency_name}${location ? ` en ${location}` : ""} en Geora, el portal inmobiliario con mapa parcelario.`;

  return buildMetadata({
    title,
    description,
    path,
    image: realEstate.logo_url || undefined,
    type: "profile",
    noIndex: !isApproved,
  });
}

export async function getRealEstateMetadataByProfileId(
  profileId: string,
): Promise<Metadata> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("real_estates")
    .select("agency_name, bio, logo_url, city, province, profiles(status)")
    .eq("profile_id", profileId)
    .single();

  const isApproved = (data?.profiles as { status?: string } | null)?.status === "APPROVED";
  return buildAgencyMetadata(`/realestate/${profileId}`, data, isApproved);
}

export async function getRealEstateMetadataBySlug(slug: string): Promise<Metadata> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("real_estates")
    .select("agency_name, bio, logo_url, city, province, profiles(status)")
    .eq("slug", slug)
    .single();

  const isApproved = (data?.profiles as { status?: string } | null)?.status === "APPROVED";
  return buildAgencyMetadata(`/${slug}`, data, isApproved);
}
