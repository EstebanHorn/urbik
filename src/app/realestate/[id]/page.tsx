/*
Este componente de React es una página de servidor de Next.js que renderiza el perfil público
de una inmobiliaria y su catálogo de propiedades disponibles. El código extrae el ID de la
agencia desde la URL, verifica la sesión del usuario para habilitar acciones administrativas
si el rol es "ADMIN", y realiza una consulta a la base de datos mediante Prisma para obtener
los datos de la agencia y su lista de inmuebles filtrados por estado "AVAILABLE". En la interfaz,
presenta un encabezado con la información de contacto y ubicación de la inmobiliaria seguido de
un listado detallado de propiedades, donde utiliza funciones auxiliares para formatear etiquetas
de tipo de propiedad, superficies y precios según la moneda correspondiente.
*/

import React from "react";
import prisma from "../../../libs/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import bgImage from "../../../assets/login_bg.png";
import AdminActions from "../../../features/administrate/components/AdminActions"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const getPropertyLabel = (type: string) => {
  const labels: Record<string, string> = {
    HOUSE: "Casa",
    APARTMENT: "Departamento",
    LAND: "Terreno",
    COMMERCIAL_PROPERTY: "Local",
    OFFICE: "Oficina",
  };
  return labels[type] || type;
};

const getSpecsLabel = (p: any) => {
  const parts = [];
  if (p.area) parts.push(`${p.area} m²`);
  if (p.rooms) parts.push(`${p.rooms} ambientes`);
  return parts.join(" — ") || "Consultar detalles";
};

export default async function RealEstatePage({
  params,
}: {
  params: { id: string };
}) {
  const realEstateId = parseInt(params.id);
  const session = await getServerSession(authOptions) as any; 

  if (isNaN(realEstateId)) notFound();

  const realEstate = await prisma.realEstate.findUnique({
    where: { user_id: realEstateId },
    include: {
      allUser: true,
      properties: {
        where: { status: "AVAILABLE" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!realEstate) notFound();

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        
        {isAdmin && (
          <div className="mb-6">
            <AdminActions id={realEstate.user_id} type="user" />
          </div>
        )}

        <div className="relative overflow-hidden rounded-full border border-gray-100 p-2 shadow-sm group">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage.src})` }}
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-l from-urbik-black/100 via-urbik-black/90 to-transparent" />

          <div className="relative z-20 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-center gap-8 min-w-0 w-full">
              <div 
                className="w-28 h-28 shrink-0 rounded-full flex items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage.src})` }}
              >
              </div>

              <div className="min-w-0 w-full flex flex-col items-center justify-center -mr-20">
                  <h1 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-3">
                    {realEstate.agencyName}
                  </h1>
                  <p className="flex items-center gap-2 text-urbik-white font-medium">
                    <MapPin size={16} />
                    {realEstate.city}, {realEstate.province}. {realEstate.street} {realEstate.address}
                  </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 justify-end md:mr-8 w-full md:w-1/4">
              <div className="text-md font-bold text-white/80">
                Estado: <span className="text-urbik-emerald">Verificada</span>
              </div>
              <a
                href={`tel:${realEstate.phone}`}
                className="w-full text-center rounded-full bg-urbik-white2 px-4 py-2 text-md font-black text-black hover:bg-urbik-cyan hover:text-urbik-white transition-colors "
              >
                Contactar Agencia
              </a>
            </div>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12 ">
          <h2 className="text-4xl font-black text-urbik-dark uppercase italic tracking-tighter text-left">
            Cartera de Propiedades
          </h2>
          <p className="text-urbik-muted font-bold text-right">
            Mostrando {realEstate.properties.length} unidades disponibles
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {realEstate.properties.map((property) => (
            <div
              key={property.id}
              className="relative overflow-hidden w-full h-auto md:h-[450px] rounded-md border border-urbik-g200 bg-white hover:shadow-2xl transition-all group"
            >
              <Link
                href={`/property/${property.id}`}
                className="flex flex-col md:flex-row h-full"
              >
                <div className="relative w-full md:w-2/5 h-64 md:h-full overflow-hidden bg-urbik-g200">
                  <img
                    src={property.images[0] || "/placeholder-property.jpg"}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                <div className="w-full md:w-3/5 p-8 flex flex-col bg-urbik-white2 relative">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-urbik-black text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase">
                      {getPropertyLabel(property.type)}
                    </span>
                    <span className="bg-urbik-cyan text-urbik-muted text-[10px] px-3 py-1 rounded-full font-black uppercase">
                      {property.operationType === "SALE" ? "VENTA" : "ALQUILER"}
                    </span>
                  </div>

                  <h3 className="text-3xl font-black mb-2 text-urbik-dark uppercase leading-none tracking-tighter">
                    {property.title}
                  </h3>

                  <div className="flex items-center gap-1 text-urbik-dark/60 mb-4">
                    <MapPin size={14} strokeWidth={3} className="text-urbik-cyan" />
                    <p className="text-xs font-bold text-urbik-dark uppercase tracking-tight">
                      {property.city} — <span className="opacity-70">{property.address}</span>
                    </p>
                  </div>

                  <p className="text-urbik-muted text-sm line-clamp-3 font-medium mb-6">
                    {property.description}
                  </p>

                  <div className="mt-auto flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-urbik-black/40">
                        Especificaciones
                      </span>
                      <span className="text-md font-bold text-urbik-muted">
                        {getSpecsLabel(property)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-4xl font-black text-urbik-emerald">
                        {property.currency === "USD" ? "USD" : "ARS"}
                      </span>
                      <span className="text-4xl font-bold text-urbik-dark ml-3">
                        ${property.price?.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}

          {realEstate.properties.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-md">
              <p className="text-urbik-muted font-bold text-xl">
                Esta inmobiliaria no tiene propiedades activas en este momento.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}