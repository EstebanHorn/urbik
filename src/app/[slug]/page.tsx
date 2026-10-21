import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import RealEstateProfile from "@/components/realestate/RealEstateProfile";
import { getRealEstateMetadataBySlug } from "@/lib/realEstateMeta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return getRealEstateMetadataBySlug(slug);
}

export default async function RealEstateBySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: realEstate } = await supabase
    .from("real_estates")
    .select("profile_id")
    .eq("slug", slug)
    .single();

  if (!realEstate) {
    notFound();
  }

  return <RealEstateProfile profileId={realEstate.profile_id} />;
}
