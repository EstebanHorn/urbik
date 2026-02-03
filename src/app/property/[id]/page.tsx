/*
Este código define un componente para visualizar los detalles de una propiedad inmobiliaria
específica, encargándose de obtener los datos de forma asíncrona desde una base de datos
mediante Prisma, gestionar el estado de "favorito" según la sesión del usuario y renderizar
una interfaz dinámica que incluye galerías de imágenes, características técnicas (baños,
ambientes, superficie), información de contacto de la inmobiliaria y una sección de
propiedades recomendadas del mismo vendedor.
*/

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/libs/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import PropertyParcelWrapper from "../../../features/property/PropertyParcelWrapper";
import AdminActions from "../../../features/administrate/components/AdminActions";
import { 
  MapPin, 
  Maximize2, 
  BedDouble, 
  Bath, 
  Hash, 
  ChevronLeft, 
  Building2, 
  Phone, 
  Mail
} from "lucide-react";
import SmartZoneSingle from "../../../components/SmartZone/SmartView";
import FavoriteButton from "@/components/FavoritesButton";

export const dynamic = "force-dynamic";

const getOperationLabel = (type: string) => {
  switch (type) {
    case "SALE": return "Venta";
    case "RENT": return "Alquiler";
    case "SALE_RENT": return "Venta y Alquiler";
    default: return type;
  }
};

const getPropertyLabel = (type: string) => {
  switch (type) {
    case "HOUSE": return "Casa";
    case "APARTMENT": return "Departamento";
    case "LAND": return "Terreno";
    case "COMMERCIAL_PROPERTY": return "Local";
    case "OFFICE": return "Oficina";
    default: return type;
  }
};

async function getPropertyData(id: number, userId?: string) {
  try {
    const numericUserId = userId ? parseInt(userId) : undefined;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        RealEstate: {
          include: {
            
            properties: {
              where: {
                NOT: { id: id },
                status: "AVAILABLE"
              },
              take: 4,
              include: {
                favorites: numericUserId ? {
                  where: { userId: numericUserId }
                } : false
              }
            }
          }
        },
        favorites: numericUserId ? {
          where: { userId: numericUserId }
        } : false
      },
    });

    if (!property) return null;

    const formattedProperty = {
      ...property,
      isFavorite: property.favorites ? property.favorites.length > 0 : false
    };

    const otherProperties = property.RealEstate?.properties.map(p => ({
      ...p,
      isFavorite: p.favorites ? p.favorites.length > 0 : false
    })) || [];

    return {
      property: formattedProperty,
      otherProperties
    };
  } catch (error) {
    console.error("Error fetching property data:", error);
    return null;
  }
}

function StatBox({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="p-6 flex flex-col items-center justify-center text-center transition-all hover:shadow-md border border-urbik-g100 rounded-xl">
      <div className="text-urbik-white mb-3 p-3 bg-urbik-dark2 rounded-full shadow-sm">{icon}</div>
      <div className="text-md text-urbik-muted font-bold mb-1">
        {label}
      </div>
      <div className="text-xl font-black text-urbik-black tracking-tight">{value}</div>
    </div>
  );
}

const getStatusBadge = (property: any) => {
  const s = property.status || "AVAILABLE";
  if (s === "SOLD") return { label: "VENDIDA", color: "bg-urbik-rose text-white" };
  if (s === "RENTED") return { label: "ALQUILADA", color: "bg-orange-500 text-white" };
  if (s === "PAUSED") return { label: "PAUSADA", color: "bg-urbik-g300 text-white" };
  
  return { label: getOperationLabel(property.operationType), color: "bg-urbik-cyan text-urbik-dark" };
};

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (isNaN(id)) return notFound();

  const session = await getServerSession(authOptions);
  const data = await getPropertyData(id, session?.user?.id);
  
  if (!data) return notFound();

  const { property, otherProperties } = data;
  const isAdmin = session?.user?.role === "ADMIN";

  const formatter = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
  const currencySymbol = property.currency === "USD" ? "USD" : "$";
  const images = property.images || [];
  const statusBadge = getStatusBadge(property);

  const isBoth = property.operationType === "SALE_RENT";

  return (
    <main className="min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-28 mb-8">
        <Link
          href="/dashboard"
          className="group text-urbik-black/50 inline-flex items-center gap-2 text-sm font-bold hover:text-urbik-black transition-colors"
        >
          <div className="p-2"><ChevronLeft size={18} /></div>
          Volver al listado
        </Link>

{isAdmin && (
  <AdminActions 
    id={property.id} 
    currentStatus={property.status} 
    type="property" 
  />
)}
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
          <div className="space-y-4 w-full lg:w-auto">
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex flex-wrap items-center gap-3">
                
                <FavoriteButton 
                    propertyId={property.id.toString()} 
                    initialIsFavorite={property.isFavorite} 
                />

                <span className="bg-urbik-black text-urbik-white text-sm font-black uppercase tracking-wider border border-urbik-g100 px-5 py-2 rounded-full">
                  {getPropertyLabel(property.type)}
                </span>
                <span className={`text-sm font-black uppercase px-5 py-2 rounded-full tracking-wider shadow-sm ${statusBadge.color}`}>
                  {statusBadge.label}
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-black text-urbik-black italic tracking-tighter leading-none">
              {property.title}
            </h1>
            <div className="flex items-center gap-2 text-urbik-muted font-medium italic">
              <MapPin size={18} className="text-urbik-black-60" />
              {property.address}, {property.city}
            </div>
          </div>

          <div className="lg:text-right">

            <div className={`flex flex-col ${isBoth ? 'gap-1' : ''}`}>
              {(property.operationType === "SALE" || isBoth) && property.salePrice && (
                <div>
                  {isBoth && <span className="ml-2 text-md font-medium text-urbik-muted uppercase italic">Venta</span>}

                <div className={`${isBoth ? "text-3xl md:text-4xl" : "text-5xl md:text-7xl"} font-display font-bold tracking-tighter flex items-baseline lg:justify-end`}>
                  <span className="text-urbik-emerald mr-2 font-black">{property.saleCurrency}{currencySymbol}</span>
                  <span className="text-urbik-black">{formatter.format(property.salePrice)}</span>
                </div>
                                </div>

              )}
              {(property.operationType === "RENT" || isBoth) && property.rentPrice && (
                <div>
                                    {isBoth && <span className="ml-2 text-md font-medium text-urbik-muted uppercase italic">Alquiler</span>}

                <div className={`${isBoth ? "text-3xl md:text-4xl" : "text-5xl md:text-7xl"} font-display font-bold tracking-tighter flex items-baseline lg:justify-end`}>
                  <span className="text-urbik-emerald mr-2 font-black">{property.rentCurrency}{currencySymbol}</span>
                  <span className="text-urbik-black">{formatter.format(property.rentPrice)}</span>
                </div>
                
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[400px] md:h-[600px] mb-12">
          <div className="md:col-span-8 rounded-md overflow-hidden bg-urbik-white2 relative group">
            {images[0] ? (
              <img src={images[0]} alt="Principal" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            ) : (
              <div className="flex items-center justify-center h-full text-urbik-g300"><Building2 size={48} /></div>
            )}
          </div>
          <div className="hidden md:flex md:col-span-4 flex-col gap-4">
              <div className="h-1/2 rounded-md overflow-hidden bg-urbik-white border border-urbik-dark2/50 relative">
  {property.parcelGeom && property.latitude && property.longitude ? (
    <PropertyParcelWrapper 
      lat={property.latitude} 
      lon={property.longitude} 
      selectedGeom={property.parcelGeom} 
      allProperties={otherProperties} // Pasamos las otras propiedades para ver sus parcelas
    />
  ) : images[2] ? (
    <img src={images[2]} className="w-full h-full object-cover" alt="Vista 3" />
  ) : (
    <div className="h-full bg-urbik-white2 flex items-center justify-center" />
  )}
</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-2">
            <h3 className="text-2xl font-display font-bold text-urbik-muted tracking-tight ml-2">Características</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox label="Superficie" value={`${property.area ?? 0} m²`} icon={<Maximize2 size={20} />} />
              <StatBox label="Ambientes" value={property.rooms ?? "-"} icon={<BedDouble size={20} />} />
              <StatBox label="Baños" value={property.bathrooms ?? "-"} icon={<Bath size={20} />} />
              <StatBox label="Referencia" value={`#${property.id}`} icon={<Hash size={20} />} />
            </div>
            <div className="space-y-2 mt-10">
              <h3 className="text-2xl font-display font-bold text-urbik-muted tracking-tight ml-2">Descripción</h3>
              <div className="text-urbik-black/80 leading-relaxed whitespace-pre-wrap font-medium text-lg italic">
                {property.description || "Sin descripción disponible."}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="sticky top-28 space-y-6">
              <div className="bg-urbik-white2 rounded-md p-10 text-urbik-dark shadow-xl overflow-hidden relative">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-urbik-black rounded-full flex items-center justify-center text-urbik-white overflow-hidden ">
                      <Building2 size={32} />
                    </div>
                    <div>
                      <p className="text-md font-black text-urbik-dark">Comercializa</p>
<Link 
      href={`/realestate/${property.realEstateId}`} 
      className="hover:text-urbik-emerald transition-colors"
    >
      <h4 className="text-2xl font-bold leading-tight">
        {property.RealEstate?.agencyName || "Inmobiliaria"}
      </h4>
    </Link>                    </div>
                  </div>
                  <div className="space-y-4 mb-10 ">
                    <div className="flex items-center  text-xl justify-center py-3 text-urbik-black border-b border-urbik-g100/50">
                      <Phone size={22} className="mr-5"/>
                      <span className="font-bold">{property.RealEstate?.phone || "-"}</span>
                    </div>
                    <div className="flex items-center justify-center text-xl  py-3 text-urbik-black border-b border-urbik-g100/50">
                      <Mail size={22} className="mr-5"/>
                      <span className="font-bold">Email Directo</span>
                    </div>
                  </div>
                  <div className="w-full flex justify-center">
                    <button className="px-10 cursor-pointer bg-urbik-black hover:bg-white hover:text-urbik-emerald border border-urbik-black text-urbik-white font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2 group">
                        Ver Perfil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SmartZoneSingle property={property} />

        <div className="mt-24 pt-12 border-t border-urbik-g100">
          <h3 className="text-3xl font-display text-urbik-black tracking-tighter mb-8">
            <span className="font-medium">Otras propiedades de </span>
            <span className="font-black italic uppercase">
              {property.RealEstate?.agencyName || "la inmobiliaria"}
            </span>
          </h3>

          {otherProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {otherProperties.map((other: any) => (
                <div key={other.id} className="relative transition-all duration-300">
                  <div className="bg-urbik-white2 rounded-md border-1 border-urbik-g100 overflow-hidden hover:scale-105 hover:brightness-105 hover:shadow-lg transition-all h-full flex flex-col relative">
                    
                    <Link href={`/property/${other.id}`} className="absolute inset-0 z-10" />

                    <div className="absolute top-3 right-3 z-20">
                         <FavoriteButton 
                            propertyId={other.id.toString()} 
                            initialIsFavorite={other.isFavorite} 
                            small
                        />
                    </div>

                    <div className="relative h-40 bg-urbik-g200">
                      <img 
                        src={other.images[0] || "/placeholder-property.jpg"} 
                        alt={other.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-urbik-black text-white text-xs px-3 py-1 rounded-full font-bold tracking-tight">
                          {getPropertyLabel(other.type)}
                        </span>
                        <span className="bg-urbik-cyan text-urbik-muted text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tight">
                          {getOperationLabel(other.operationType)}
                        </span>
                      </div>

                      <h3 className="text-lg font-black mb-1 line-clamp-1 text-urbik-dark uppercase">
                        {other.title}
                      </h3>
                      
                      <div className="flex items-center justify-end text-urbik-dark/60 mb-2">
                        <MapPin size={12} strokeWidth={3} />
                        <p className="text-xs font-bold text-urbik-dark">{other.city}</p>
                      </div>

                      <div className="mt-auto">
                        <hr className="border-urbik-g100 mb-4" />
                        <div className="text-right">
                          <p className="text-xl font-black text-urbik-dark tracking-tighter">
                            {other.currency === "USD" ? "USD" : "$"} {(other.salePrice || other.rentPrice || 0).toLocaleString('es-AR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-urbik-white2 p-16 rounded-2xl text-center border-2 border-dashed border-urbik-g100">
              <Building2 size={40} className="mx-auto mb-4 text-urbik-g300" />
              <p className="text-urbik-muted font-bold italic">
                Esta inmobiliaria no tiene otras propiedades publicadas actualmente.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}