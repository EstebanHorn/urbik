import React from "react";
import { notFound } from "next/navigation";
import { MapPin, Building2 } from "lucide-react";

import AdminActions from "@/components/administrate/AdminActions";
import { createClient } from "@/lib/supabase/server";
import StartChatButton from "@/components/chat/StartChatButton";
import RealEstateReviews from "@/components/realestate/RealEstateReviews";
import TrackAgencyView from "@/components/analytics/TrackAgencyView";
import AgencyPropertiesFilter, { Property } from "@/components/realestate/AgencyPropertiesFilter";

function HeaderFractionalStars({ average, total }: { average: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const fillPercentage = Math.max(0, Math.min(100, (average - star + 1) * 100));
          const gradientId = `star-grad-${star}-${fillPercentage.toFixed(0)}`;

          return (
            <svg 
              key={star} 
              viewBox="0 0 24 24" 
              className="w-5 h-5 stroke-1 text-red-500" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={gradientId} x1="0" x2="100%" y1="0" y2="0">
                  <stop offset={`${fillPercentage}%`} stopColor="#000000" />
                  <stop offset={`${fillPercentage}%`} stopColor="#bfbfbf" />
                </linearGradient>
              </defs>
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill={`url(#${gradientId})`}
              />
            </svg>
          );
        })}
      </div>
      <span className="text-xs text-urbik-muted font-medium">({total} {total === 1 ? 'reseña' : 'reseñas'})</span>
    </div>
  );
}

export default async function RealEstatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: realEstate, error } = await supabase
    .from("real_estates")
    .select(
      `
      *,
      profiles (role),
      properties (*)
    `
    )
    .eq("profile_id", id)
    .single();

  if (error || !realEstate) {
    notFound();
  }

  const { data: reviewsData } = await supabase
    .from("real_estate_reviews")
    .select("rating")
    .eq("real_estate_id", id); 

  let averageRating = 0;
  let totalReviews = 0;

  if (reviewsData && reviewsData.length > 0) {
    totalReviews = reviewsData.length;
    const sum = reviewsData.reduce((acc, curr) => acc + curr.rating, 0);
    averageRating = sum / totalReviews;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
    const { data: currentUserProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    isAdmin = currentUserProfile?.role === "ADMIN";
  }

  const activeProperties: Property[] =
    realEstate.properties?.filter(
      (p: Property) => p.status === "AVAILABLE"
    ) || [];

  return (
    <div className="min-h-screen">
      <TrackAgencyView realEstateId={realEstate.profile_id} />
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        {isAdmin && (
          <div className="mb-6">
            <AdminActions
              id={realEstate.profile_id}
              type="user"
            />
          </div>
        )}

        <div className="relative overflow-hidden group mb-20">
          <div className="relative z-20 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-center gap-8 min-w-0 w-full">
              <div
                className="w-28 h-28 shrink-0 rounded-full flex items-center justify-center bg-cover bg-center overflow-hidden bg-urbik-g200"
                style={{
                  backgroundImage: realEstate.logo_url
                    ? `url(${realEstate.logo_url})`
                    : 'none',
                }}
              >
                {!realEstate.logo_url && (
                  <Building2
                    size={40}
                    className="text-urbik-g400"
                  />
                )}
              </div>

              <div className="min-w-0 w-full flex flex-col items-start justify-center">
                <h1 className="text-3xl md:text-4xl font-black text-urbik-black/90 uppercase tracking-tighter mb-1">
                  {realEstate.agency_name}
                </h1>

                <p className="flex items-center gap-2 text-urbik-black/60 font-medium mb-3">
                  <MapPin size={16} />
                  {realEstate.city}, {realEstate.province}.{" "}
                  {realEstate.street} {realEstate.address}
                </p>

                {realEstate.bio && (
                  <p className="text-sm font-medium text-urbik-black/70 mb-3 max-w-2xl leading-relaxed">
                    {realEstate.bio}
                  </p>
                )}
                {totalReviews > 0 ? (
                  <HeaderFractionalStars average={averageRating} total={totalReviews} />
                ) : (
                  <div className="mb-3 mt-1">
                    <span className="text-sm font-medium text-urbik-muted bg-urbik-g100 px-2.5 py-1 rounded-md">
                      Sin reseñas todavía
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 justify-end md:mr-8 w-full md:w-1/4">
              <a
                href={`tel:${realEstate.phone}`}
                className="text-center rounded-full bg-white border border-black/10 px-5 py-2 text-sm font-bold text-urbik-black/80 hover:scale-105 hover:text-urbik-black/50 transform transition duration-200"
              >
                Contactar Agencia
              </a>
              {user && id !== user.id && (
                <StartChatButton
                  realEstateId={id}
                  label="Consultar por chat"
                />
              )}
            </div>
          </div>
        </div>

        <AgencyPropertiesFilter properties={activeProperties} />
        
        <RealEstateReviews
          realEstateId={id}
          currentUserId={user?.id ?? null}
          isOwner={!!user && user.id === id}
        />
      </div>
    </div>
  );
}