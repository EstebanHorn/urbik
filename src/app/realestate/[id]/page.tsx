import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Building2 } from "lucide-react";

import bgImage from "@/assets/login_bg.png";
import AdminActions from "@/components/administrate/AdminActions";
import { createClient } from "@/lib/supabase/server";
import StartChatButton from "@/components/chat/StartChatButton";

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  let userRole: string | null = null;

  if (user) {
    const { data: currentUserProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    isAdmin = currentUserProfile?.role === "ADMIN";
    userRole = currentUserProfile?.role ?? null;
  }

  const activeProperties: Property[] =
    realEstate.properties?.filter(
      (p: Property) => p.status === "AVAILABLE"
    ) || [];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        {isAdmin && (
          <div className="mb-6">
            <AdminActions
              id={realEstate.profile_id}
              type="user"
            />
          </div>
        )}

        <div className="relative overflow-hidden rounded-full border border-gray-100 p-2 shadow-sm group">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${bgImage.src})`,
            }}
          />

          <div className="absolute inset-0 z-10 bg-linear-to-l from-urbik-black via-urbik-black/90 to-transparent" />

          <div className="relative z-20 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-center gap-8 min-w-0 w-full">
              <div
                className="w-28 h-28 shrink-0 rounded-full flex items-center justify-center bg-cover bg-center border-4 border-white shadow-xl overflow-hidden bg-urbik-g200"
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

              <div className="min-w-0 w-full flex flex-col items-center justify-center -mr-20">
                <h1 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-3">
                  {realEstate.agency_name}
                </h1>

                <p className="flex items-center gap-2 text-urbik-white font-medium">
                  <MapPin size={16} />
                  {realEstate.city}, {realEstate.province}.{" "}
                  {realEstate.street} {realEstate.address}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 justify-end md:mr-8 w-full md:w-1/4">
              <div className="text-md font-bold text-white/80">
                Estado:{" "}
                <span className="text-urbik-emerald">
                  Verificada
                </span>
              </div>

              <a
                href={`tel:${realEstate.phone}`}
                className="w-full text-center rounded-full bg-urbik-white2 px-4 py-2 text-md font-black text-black hover:bg-urbik-cyan hover:text-urbik-white transition-colors"
              >
                Contactar Agencia
              </a>
              {user && userRole === "USER" && (
                <StartChatButton
                  realEstateId={id}
                  label="Consultar por chat"
                />
              )}
            </div>
          </div>
        </div>

        {realEstate.bio && (
          <div className="mt-4 mb-8 max-w-2xl">
            <p className="text-urbik-muted font-medium leading-relaxed text-sm">
              {realEstate.bio}
            </p>
          </div>
        )}

        <div className="border-t border-urbik-g200 my-8" />

        <section className="pb-20">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="text-2xl font-black text-urbik-black uppercase tracking-tight">
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
                Esta inmobiliaria aún no tiene propiedades
                publicadas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeProperties.map((property: Property) => (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="group rounded-2xl border border-urbik-g200 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="relative w-full h-48 bg-urbik-g200 overflow-hidden">
                    {property.images?.[0] ? (
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-urbik-g200">
                        <Building2
                          size={36}
                          className="text-urbik-g400"
                        />
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                      <span className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full bg-urbik-black text-white">
                        {PROPERTY_LABELS[property.type] ??
                          property.type}
                      </span>

                      <span className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full bg-urbik-cyan text-urbik-black">
                        {OPERATION_LABELS[
                          property.operation_type
                        ] ?? property.operation_type}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-urbik-black text-base leading-tight line-clamp-2 mb-1.5">
                      {property.title}
                    </h3>

                    <p className="flex items-center gap-1 text-xs font-medium text-urbik-muted line-clamp-1 mb-3">
                      <MapPin
                        size={11}
                        className="shrink-0 text-urbik-cyan"
                      />
                      {property.address}, {property.city}
                    </p>

                    <p className="text-lg font-black text-urbik-black">
                      {formatPrice(
                        property.sale_price ||
                          property.rent_price ||
                          null,
                        property.sale_currency ||
                          property.rent_currency ||
                          null
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}