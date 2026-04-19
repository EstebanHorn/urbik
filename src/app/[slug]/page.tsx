/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Globe, Instagram, Building2 } from "lucide-react";
import prisma from "@/libs/db";

interface AgencyProfilePageProps {
  params: { slug: string };
}

const PROPERTY_LABELS: Record<string, string> = {
  HOUSE: "Casa",
  APARTMENT: "Departamento",
  PH: "PH",
  COUNTRY: "Country",
  LAND: "Terreno",
  FIELD: "Campo",
  BUSINESS_BACKGROUND: "Fondo de Comercio",
  GARAGE: "Cochera",
  WAREHOUSE: "Depósito",
  DEVELOPMENT: "Emprendimiento",
  COMMERCIAL_PROPERTY: "Local Comercial",
  OFFICE: "Oficina",
};

const OPERATION_LABELS: Record<string, string> = {
  SALE: "Venta",
  RENT: "Alquiler",
  TEMP_RENT: "Alquiler Temporario",
  SALE_RENT: "Venta / Alquiler",
};

function formatPrice(price: number | null, currency: string | null): string {
  if (!price) return "Consultar";
  const symbol = currency === "ARS" ? "$" : "USD";
  return `${symbol} ${price.toLocaleString("es-AR")}`;
}

export default async function AgencyProfilePage({
  params,
}: AgencyProfilePageProps) {
  const realEstate = await prisma.realEstate.findUnique({
    where: { slug: params.slug },
    include: {
      properties: {
        where: { status: "AVAILABLE" },
        take: 12,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!realEstate) {
    notFound();
  }

  const displayPrice = (property: (typeof realEstate.properties)[number]) => {
    const isSale =
      property.operationType === "SALE" ||
      property.operationType === "SALE_RENT";
    if (isSale && property.salePrice) {
      return formatPrice(property.salePrice, property.saleCurrency ?? "USD");
    }
    return formatPrice(property.rentPrice, property.rentCurrency ?? "ARS");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      <div className="relative w-full h-56 md:h-72 overflow-hidden">
        {realEstate.bannerUrl ? (
          <img
            src={realEstate.bannerUrl}
            alt={`Banner de ${realEstate.agencyName}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-urbik-black via-urbik-dark2 to-urbik-dark" />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Agency header */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative -mt-16 md:-mt-20 flex flex-col md:flex-row items-start gap-6">
          {/* Logo */}
          <div className="shrink-0 w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-urbik-g200">
            {realEstate.logoUrl ? (
              <img
                src={realEstate.logoUrl}
                alt={`Logo de ${realEstate.agencyName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-urbik-g200">
                <Building2 size={40} className="text-urbik-g400" />
              </div>
            )}
          </div>

          {/* Name + info */}
          <div className="pt-20 md:pt-16 pb-6 flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-black text-urbik-black tracking-tight leading-none mb-2">
              {realEstate.agencyName}
            </h1>

            {(realEstate.city || realEstate.province) && (
              <p className="flex items-center gap-1.5 text-urbik-muted font-medium text-sm mb-3">
                <MapPin size={14} className="text-urbik-cyan shrink-0" />
                {[realEstate.city, realEstate.province]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}

            {/* Social links */}
            <div className="flex flex-wrap gap-3 mt-2">
              {realEstate.website && (
                <a
                  href={
                    realEstate.website.startsWith("http")
                      ? realEstate.website
                      : `https://${realEstate.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-urbik-dark border border-urbik-g200 rounded-full px-4 py-1.5 hover:border-urbik-cyan hover:text-urbik-cyan transition-colors"
                >
                  <Globe size={13} />
                  {realEstate.website.replace(/^https?:\/\//, "")}
                </a>
              )}
              {realEstate.instagram && (
                <a
                  href={
                    realEstate.instagram.startsWith("http")
                      ? realEstate.instagram
                      : `https://instagram.com/${realEstate.instagram.replace(/^@/, "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-urbik-dark border border-urbik-g200 rounded-full px-4 py-1.5 hover:border-urbik-cyan hover:text-urbik-cyan transition-colors"
                >
                  <Instagram size={13} />
                  {realEstate.instagram.startsWith("@")
                    ? realEstate.instagram
                    : `@${realEstate.instagram}`}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {realEstate.bio && (
          <div className="mt-4 mb-8 max-w-2xl">
            <p className="text-urbik-muted font-medium leading-relaxed text-sm">
              {realEstate.bio}
            </p>
          </div>
        )}

        <div className="border-t border-urbik-g200 my-8" />

        {/* Properties section */}
        <section className="pb-20">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="text-2xl font-black text-urbik-black uppercase tracking-tight">
              Propiedades
            </h2>
            <span className="text-sm font-bold text-urbik-muted">
              {realEstate.properties.length}{" "}
              {realEstate.properties.length === 1
                ? "propiedad disponible"
                : "propiedades disponibles"}
            </span>
          </div>

          {realEstate.properties.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-urbik-g200 rounded-2xl">
              <p className="text-urbik-muted font-bold text-lg">
                Esta inmobiliaria aún no tiene propiedades publicadas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {realEstate.properties.map((property) => (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="group rounded-2xl border border-urbik-g200 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Property image */}
                  <div className="relative w-full h-48 bg-urbik-g200 overflow-hidden">
                    {property.images[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-urbik-g200">
                        <Building2 size={36} className="text-urbik-g400" />
                      </div>
                    )}

                    {/* Operation badge */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full bg-urbik-black text-white">
                        {PROPERTY_LABELS[property.type] ?? property.type}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full bg-urbik-cyan text-urbik-black">
                        {OPERATION_LABELS[property.operationType] ??
                          property.operationType}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <h3 className="font-bold text-urbik-black text-base leading-tight line-clamp-2 mb-1.5">
                      {property.title}
                    </h3>

                    {property.address && (
                      <p className="flex items-center gap-1 text-xs font-medium text-urbik-muted line-clamp-1 mb-3">
                        <MapPin size={11} className="shrink-0 text-urbik-cyan" />
                        {property.address}
                        {property.city ? `, ${property.city}` : ""}
                      </p>
                    )}

                    <p className="text-lg font-black text-urbik-black">
                      {displayPrice(property)}
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
