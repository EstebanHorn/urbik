import type { Metadata } from "next";
import RealEstateProfile from "@/components/realestate/RealEstateProfile";
import { getRealEstateMetadataByProfileId } from "@/lib/realEstateMeta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return getRealEstateMetadataByProfileId(id);
}

export default async function RealEstatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <RealEstateProfile profileId={id} />;
}
