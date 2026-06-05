import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Building2 } from "lucide-react";

import bgImage from "@/assets/login_bg.png";
import AdminActions from "@/components/administrate/AdminActions";
import { createClient } from "@/lib/supabase/server";
import StartChatButton from "@/components/chat/StartChatButton";
import RealEstateReviews from "@/components/realestate/RealEstateReviews";
import TrackAgencyView from "@/components/analytics/TrackAgencyView";

const PROPERTY_LABELS: Record<string, string> = {
  HOUSE: "Casa",
  APARTMENT: "Departamento",
  PH: "PH",
  COUNTRY: "Country",
  LAND: "Terreno",
  FIELD: "Campo",
  COMMERCIAL_PROPERTY: "Local Comercial",
  OFFICE: "Oficina",
};

const OPERATION_LABELS: Record<string, string> = {
  SALE: "Venta",
  RENT: "Alquiler",
  TEMP_RENT: "Temporal",
  SALE_RENT: "Venta / Alquiler",
};

// --- NUEVA ESTÉTICA: Glass Card ---
const glassCard = "md:rounded-[30px] rounded-3xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[30px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";

type Property = {
  id: string;
  title: string;
  status: string;
  type: string;
  operation_type: string;
  address: string;
  city: string;
  images?: string[];
  sale_price?: number | null;
  rent_price?: number | null;
  sale_currency?: string | null;
  rent_currency?: string | null;
};

function formatPrice(
  price: number | null,
  currency: string | null
): string {
  if (!price) return "Consultar";

  const symbol = currency === "ARS" ? "$" : "USD";

  return `${symbol} ${price.toLocaleString("es-AR")}`;
}

// --- COMPONENTE: Estrellas con soporte para fracciones ---
function HeaderFractionalStars({ average, total }: { average: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          // Calculamos cuánto debe llenarse esta estrella específica (0 a 100)
          const fillPercentage = Math.max(0, Math.min(100, (average - star + 1) * 100));
          // ID único pero determinista para evitar errores de hidratación
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
                  <stop offset={`${fillPercentage}%`} stopColor="#000000" /> {/* Color dorado */}
                  <stop offset={`${fillPercentage}%`} stopColor="#bfbfbf" /> {/* Color gris de fondo */}
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
                    : `url(${bgImage.src})`,
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

        <section className="pb-20">
          <div className="mb-5 flex items-baseline justify-between px-10">
            <h2 className="text-2xl font-black text-urbik-black/90 uppercase tracking-tight">
              Cartera de Propiedades
            </h2>

            <span className="text-sm font-bold text-urbik-muted">
              {activeProperties.length}{" "}
              {activeProperties.length === 1
                ? "propiedad"
                : "propiedades"}
            </span>
          </div>

          {activeProperties.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-urbik-g200 rounded-2xl">
              <p className="text-urbik-muted font-bold text-lg">
                Esta inmobiliaria aún no tiene propiedades publicadas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeProperties.map((property: Property, index: number) => (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className={`group flex flex-col gap-4 p-4 cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] animate-fade-in-up relative ${glassCard}`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "both"
                  }}
                >
                  {/* --- IMAGEN CON MÁSCARA Y HOVER --- */}
                  <div className="relative h-64 md:h-72 w-full overflow-hidden rounded-t-2xl bg-urbik-g200">
                    {property.images?.[0] ? (
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105 [mask-image:linear-gradient(to_bottom,black_52%,transparent_95%)] [-webkit-mask-image:linear-gradient(to_bottom,black_52%,transparent_95%)]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-white text-xs font-bold text-black/70">
                        <Building2
                          size={36}
                          className="text-urbik-g400"
                        />
                      </div>
                    )}
                  </div>

                  {/* --- CONTENIDO --- */}
                  <div className="flex flex-1 flex-col justify-between min-w-0 z-10">
                    <div>
                      {/* ETIQUETAS ESTILO GLASS */}
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/20 bg-urbik-black/80 px-3 py-1 text-xs font-bold text-white uppercase shadow-sm z-1">
                          {PROPERTY_LABELS[property.type] ?? property.type}
                        </span>
                        <span className="rounded-full border border-white/20 bg-urbik-black/80 px-3 py-1 text-xs font-bold text-white uppercase shadow-sm z-1">
                          {OPERATION_LABELS[property.operation_type] ?? property.operation_type}
                        </span>
                      </div>

                      <h3 className="line-clamp-2 text-base font-black tracking-tight text-urbik-black">
                        {property.title}
                      </h3>

                      <p className="mt-2 flex items-center gap-1 truncate text-xs font-semibold text-urbik-black/80">
                        <MapPin
                          size={12}
                          className="shrink-0 text-urbik-cyan"
                        />
                        {property.address}, {property.city}
                      </p>
                    </div>

                    {/* --- PRECIO Y PIE DE TARJETA --- */}
                    <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-white/60 pt-4">
                      <span className="text-base font-black tracking-tight text-urbik-black/70 z-1">
                        {formatPrice(
                          property.sale_price || property.rent_price || null,
                          property.sale_currency || property.rent_currency || null
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        
        <RealEstateReviews
          realEstateId={id}
          currentUserId={user?.id ?? null}
          isOwner={!!user && user.id === id}
        />
      </div>
    </div>
  );
}