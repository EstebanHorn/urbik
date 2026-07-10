import RealEstateProfile from "@/components/realestate/RealEstateProfile";

export default async function RealEstatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <RealEstateProfile profileId={id} />;
}
