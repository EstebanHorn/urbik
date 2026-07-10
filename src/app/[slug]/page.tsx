import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import RealEstateProfile from "@/components/realestate/RealEstateProfile";

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
