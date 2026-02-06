/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/libs/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
  Mail,
  Flame,
  Waves,
  Wifi,
  Car,
  Snowflake,
  Trees,
  ShieldCheck,
  Zap,
  Droplets,
  CheckCircle2,
} from "lucide-react";
import SmartZoneSingle from "../../../components/SmartZone/SmartView";
import FavoriteButton from "@/components/FavoritesButton";
import ImageGallery from "@/features/property/components/ImageGallery";

// --- TIPOS ---

interface PropertySummary {
  id: number;
  title: string;
  type: string;
  operationType: string;
  salePrice: number | null;
  rentPrice: number | null;
  currency: string | null;
  city: string | null;
  province: string | null;
  images: string[];
  favorites?: { userId: number }[];
  isFavorite?: boolean; // Agregado para el map de otras propiedades
}

interface RealEstateProfile {
  agencyName: string | null;
  phone: string | null;
  properties: PropertySummary[];
}

interface Property {
  id: number;
  title: string;
  description: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  status: string;
  type: string;
  operationType: string;
  salePrice: number | null;
  rentPrice: number | null;
  currency: string | null;
  area: number | null;
  rooms: number | null;
  bathrooms: number | null;
  images: string[];
  amenities: Record<string, boolean>;
  latitude: number | null;
  longitude: number | null;
  parcelGeom: unknown;
  realEstateId: number;
  RealEstate: RealEstateProfile | null;
  favorites?: { id: number }[];
  isFavorite: boolean;
}

// Interfaz auxiliar para el tipado de datos crudos de la DB
interface RawPropertyData {
  hasElectricity: boolean;
  hasGas: boolean;
  hasInternet: boolean;
  hasParking: boolean;
  hasPool: boolean;
  hasWater: boolean;
  [key: string]: unknown;
}

export const dynamic = "force-dynamic";

// --- CONFIGURACIÓN DE AMENITIES ---
const AMENITIES_CONFIG = [
  { id: "hasElectricity", label: "Luz", icon: <Zap size={18} /> },
  { id: "hasGas", label: "Gas Natural", icon: <Flame size={18} /> },
  { id: "hasInternet", label: "Internet", icon: <Wifi size={18} /> },
  { id: "hasParking", label: "Cochera", icon: <Car size={18} /> },
  { id: "hasPool", label: "Pileta", icon: <Waves size={18} /> },
  { id: "hasWater", label: "Agua Corriente", icon: <Droplets size={18} /> },
  { id: "aire", label: "Aire Acondicionado", icon: <Snowflake size={18} /> },
  { id: "jardin", label: "Jardín", icon: <Trees size={18} /> },
  { id: "seguridad", label: "Seguridad", icon: <ShieldCheck size={18} /> },
];

// --- HELPERS ---

const getOperationLabel = (type: string) => {
  switch (type) {
    case "SALE":
      return "Venta";
    case "RENT":
      return "Alquiler";
    case "SALE_RENT":
      return "Venta y Alquiler";
    default:
      return type;
  }
};

const getPropertyLabel = (type: string) => {
  switch (type) {
    case "HOUSE":
      return "Casa";
    case "APARTMENT":
      return "Departamento";
    case "LAND":
      return "Terreno";
    case "COMMERCIAL_PROPERTY":
      return "Local";
    case "OFFICE":
      return "Oficina";
    default:
      return type;
  }
};

function AmenitiesList({ data }: { data: Record<string, boolean> }) {
  if (!data || typeof data !== "object") return null;

  const activeAmenities = AMENITIES_CONFIG.filter(
    (config) => data[config.id] === true,
  );

  const extraKeys = Object.entries(data)
    .filter(
      ([key, value]) =>
        value === true && !AMENITIES_CONFIG.some((c) => c.id === key),
    )
    .map(([key]) => ({
      id: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      icon: <CheckCircle2 size={18} />,
    }));

  const allAmenities = [...activeAmenities, ...extraKeys];

  if (allAmenities.length === 0) return null;

  return (
    <div className="mt-10">
      <h3 className="text-2xl font-display font-bold text-urbik-muted tracking-tight ml-2 mb-4">
        Servicios y Comodidades
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {allAmenities.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-4 bg-urbik-white rounded-xl border border-urbik-g100 text-urbik-black hover:border-urbik-emerald/50 transition-colors"
          >
            <span className="text-urbik-emerald bg-urbik-emerald/10 p-2 rounded-full">
              {item.icon}
            </span>
            <span className="font-bold text-sm">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

async function getPropertyData(id: number, userId?: string) {
  try {
    const numericUserId = userId ? parseInt(userId) : undefined;

    const propertyRaw = await prisma.property.findUnique({
      where: { id },
      include: {
        RealEstate: {
          include: {
            properties: {
              where: {
                NOT: { id: id },
                status: "AVAILABLE",
              },
              take: 4,
              include: {
                favorites: numericUserId
                  ? { where: { userId: numericUserId } }
                  : false,
              },
            },
          },
        },
        favorites: numericUserId ? { where: { userId: numericUserId } } : false,
      },
    });

    if (!propertyRaw) return null;

    const {
      hasElectricity,
      hasGas,
      hasInternet,
      hasParking,
      hasPool,
      hasWater,
      ...rest
    } = propertyRaw as unknown as RawPropertyData;

    const amenitiesObj: Record<string, boolean> = {
      hasElectricity: !!hasElectricity,
      hasGas: !!hasGas,
      hasInternet: !!hasInternet,
      hasParking: !!hasParking,
      hasPool: !!hasPool,
      hasWater: !!hasWater,
    };

    // Reconstruimos el objeto con los tipos correctos para la interfaz Property
    const formattedProperty: Property = {
      id: propertyRaw.id,
      title: propertyRaw.title,
      description: propertyRaw.description,
      address: propertyRaw.address,
      city: propertyRaw.city,
      province: propertyRaw.province,
      status: propertyRaw.status,
      type: propertyRaw.type,
      operationType: propertyRaw.operationType,
      salePrice: propertyRaw.salePrice,
      rentPrice: propertyRaw.rentPrice,
      currency: (rest as Record<string, unknown>).currency as string | null, // Asumiendo que en DB puede venir string
      area: propertyRaw.area,
      rooms: propertyRaw.rooms,
      bathrooms: propertyRaw.bathrooms,
      latitude: propertyRaw.latitude,
      longitude: propertyRaw.longitude,
      parcelGeom: propertyRaw.parcelGeom,
      realEstateId: propertyRaw.realEstateId,

      amenities: amenitiesObj,
      images: propertyRaw.images || [],
      isFavorite: propertyRaw.favorites
        ? propertyRaw.favorites.length > 0
        : false,

      RealEstate: propertyRaw.RealEstate
        ? {
            agencyName: propertyRaw.RealEstate.agencyName,
            phone: propertyRaw.RealEstate.phone,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            properties: propertyRaw.RealEstate.properties.map((p: any) => ({
              id: p.id,
              title: p.title,
              type: p.type,
              operationType: p.operationType,
              salePrice: p.salePrice,
              rentPrice: p.rentPrice,
              currency: p.currency,
              city: p.city,
              province: p.province,
              images: p.images || [],
              favorites: p.favorites,
            })),
          }
        : null,
    };

    const otherProperties =
      formattedProperty.RealEstate?.properties.map((p) => ({
        ...p,
        isFavorite: p.favorites ? p.favorites.length > 0 : false,
      })) || [];

    return {
      property: formattedProperty,
      otherProperties,
    };
  } catch (error) {
    console.error("Error fetching property data:", error);
    return null;
  }
}

function StatBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-6 flex flex-col items-center justify-center text-center transition-all hover:shadow-md border border-urbik-g100 rounded-xl bg-white">
      <div className="text-urbik-white mb-3 p-3 bg-urbik-dark2 rounded-full shadow-sm">
        {icon}
      </div>
      <div className="text-md text-urbik-muted font-bold mb-1">{label}</div>
      <div className="text-xl font-black text-urbik-black tracking-tight">
        {value}
      </div>
    </div>
  );
}

const getStatusBadge = (property: Property) => {
  const s = property.status || "AVAILABLE";
  if (s === "SOLD")
    return { label: "VENDIDA", color: "bg-urbik-rose text-white" };
  if (s === "RENTED")
    return { label: "ALQUILADA", color: "bg-orange-500 text-white" };
  if (s === "PAUSED")
    return { label: "PAUSADA", color: "bg-urbik-g300 text-white" };

  return {
    label: getOperationLabel(property.operationType),
    color: "bg-urbik-cyan text-urbik-dark",
  };
};

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (isNaN(id)) return notFound();

  const session = await getServerSession(authOptions);
  const data = await getPropertyData(id, session?.user?.id);

  if (!data) return notFound();

  const { property, otherProperties } = data;

  // CORRECCIÓN: Tipado de session user de forma segura
  const user = session?.user as { role?: string } | undefined;
  const isAdmin = user?.role === "ADMIN";

  const formatter = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  });
  const currencySymbol = property.currency || "USD";
  const images = property.images || [];
  const statusBadge = getStatusBadge(property);
  const isBoth = property.operationType === "SALE_RENT";

  return (
    <main className="min-h-screen bg-white pb-20">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 pt-28 mb-8">
        <Link
          href="/dashboard"
          className="group text-urbik-black/50 inline-flex items-center gap-2 text-sm font-bold hover:text-urbik-black transition-colors"
        >
          <div className="p-2 bg-urbik-g100 rounded-full group-hover:bg-urbik-g200 transition-colors">
            <ChevronLeft size={18} />
          </div>
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
        {/* TÍTULO Y PRECIO */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
          <div className="space-y-4 w-full lg:w-auto">
            <div className="flex flex-wrap items-center gap-3">
              <FavoriteButton
                propertyId={property.id.toString()}
                initialIsFavorite={property.isFavorite}
              />
              <span className="bg-urbik-black text-urbik-white text-xs font-black uppercase tracking-wider border border-urbik-g100 px-4 py-2 rounded-full">
                {getPropertyLabel(property.type)}
              </span>
              <span
                className={`text-xs font-black uppercase px-4 py-2 rounded-full tracking-wider shadow-sm ${statusBadge.color}`}
              >
                {statusBadge.label}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-urbik-black italic tracking-tighter leading-tight">
              {property.title}
            </h1>

            <div className="flex items-center gap-2 text-urbik-muted font-medium italic">
              <MapPin size={20} className="text-urbik-emerald" />
              <span className="text-lg">
                {property.address}, {property.city}
              </span>
            </div>
          </div>

          <div className="lg:text-right w-full lg:w-auto p-4  rounded-2xl lg:bg-transparent lg:p-0">
            <div className={`flex flex-col ${isBoth ? "gap-2" : ""}`}>
              {(property.operationType === "SALE" || isBoth) &&
                property.salePrice && (
                  <div className="flex flex-col lg:items-end">
                    {isBoth && (
                      <span className="text-xs font-black text-urbik-muted uppercase tracking-widest mb-1">
                        Valor Venta
                      </span>
                    )}
                    <div
                      className={`${isBoth ? "text-3xl" : "text-5xl md:text-7xl"} font-display font-bold tracking-tighter flex items-baseline`}
                    >
                      <span className="text-urbik-emerald mr-2 font-black text-0.5em">
                        {currencySymbol}
                      </span>
                      <span className="text-urbik-black">
                        {formatter.format(property.salePrice)}
                      </span>
                    </div>
                  </div>
                )}
              {(property.operationType === "RENT" || isBoth) &&
                property.rentPrice && (
                  <div className="flex flex-col lg:items-end">
                    {isBoth && (
                      <span className="text-xs font-black text-urbik-muted uppercase tracking-widest mb-1 mt-2">
                        Valor Alquiler
                      </span>
                    )}
                    <div
                      className={`${isBoth ? "text-3xl" : "text-5xl md:text-7xl"} font-display font-bold tracking-tighter flex items-baseline`}
                    >
                      <span className="text-urbik-emerald mr-2 font-black text-0.5em">
                        {currencySymbol}
                      </span>
                      <span className="text-urbik-black">
                        {formatter.format(property.rentPrice)}
                      </span>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* --- NUEVO COMPONENTE DE GALERÍA + MODAL --- */}
        <ImageGallery
          images={images}
          title={property.title}
          parcelGeom={property.parcelGeom}
          latitude={property.latitude}
          longitude={property.longitude}
        />

        {/* CONTENIDO PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Izquierda: Detalles */}
          <div className="lg:col-span-8 space-y-10">
            <div>
              <h3 className="text-2xl font-display font-bold text-urbik-muted tracking-tight mb-4 ml-2">
                Resumen
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatBox
                  label="Superficie"
                  value={`${property.area ?? 0} m²`}
                  icon={<Maximize2 size={20} />}
                />
                <StatBox
                  label="Ambientes"
                  value={property.rooms ?? "-"}
                  icon={<BedDouble size={20} />}
                />
                <StatBox
                  label="Baños"
                  value={property.bathrooms ?? "-"}
                  icon={<Bath size={20} />}
                />
                <StatBox
                  label="Referencia"
                  value={`#${property.id}`}
                  icon={<Hash size={20} />}
                />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-display font-bold text-urbik-muted tracking-tight mb-4 ml-2">
                Descripción
              </h3>
              <div className="bg-white p-8 rounded-2xl border border-urbik-g100 shadow-sm">
                <div className="text-urbik-black/80 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                  {property.description || "Sin descripción disponible."}
                </div>
              </div>
            </div>

            <AmenitiesList data={property.amenities} />
          </div>

          {/* Derecha: Contacto */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 space-y-6">
              <div className="bg-urbik-white2 rounded-2xl p-8 text-urbik-dark shadow-xl border border-urbik-g100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-urbik-emerald/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-urbik-black rounded-2xl flex items-center justify-center text-urbik-white shadow-lg">
                      <Building2 size={32} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-urbik-muted mb-1">
                        Comercializa
                      </p>
                      <Link
                        href={`/realestate/${property.realEstateId}`}
                        className="hover:text-urbik-emerald transition-colors"
                      >
                        <h4 className="text-xl font-black leading-tight">
                          {property.RealEstate?.agencyName || "Inmobiliaria"}
                        </h4>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-urbik-g100">
                      <div className="bg-urbik-g100 p-2 rounded-full">
                        <Phone size={18} className="text-urbik-dark" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-urbik-muted uppercase">
                          Teléfono
                        </p>
                        <span className="font-bold text-sm">
                          {property.RealEstate?.phone || "No disponible"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-urbik-g100">
                      <div className="bg-urbik-g100 p-2 rounded-full">
                        <Mail size={18} className="text-urbik-dark" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-urbik-muted uppercase">
                          Email
                        </p>
                        <span className="font-bold text-sm">Consultar</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-urbik-black hover:bg-urbik-dark2 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                    <span>Contactar Ahora</span>
                    <ChevronLeft
                      size={16}
                      className="rotate-180 group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                  <Link
                    href={`/realestate/${property.realEstateId}`}
                    className="block mt-4 text-center text-xs font-bold text-urbik-muted hover:text-urbik-black underline decoration-dashed"
                  >
                    Ver todas las propiedades
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-12 border-t border-dashed border-urbik-g100 w-full">
          <SmartZoneSingle property={property} />
        </div>
        {/* --- OTRAS PROPIEDADES --- */}
        <div className="mt-24 pt-12 border-t border-urbik-g100">
          <h3 className="text-3xl font-display text-urbik-black tracking-tighter mb-8">
            <span className="font-medium">Más propiedades de </span>
            <span className="font-black italic uppercase text-urbik-emerald">
              {property.RealEstate?.agencyName || "la inmobiliaria"}
            </span>
          </h3>

          {otherProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* CORRECCIÓN: Eliminado any en el map */}
              {otherProperties.map((other: PropertySummary) => (
                <div
                  key={other.id}
                  className="group relative flex flex-col h-full bg-white rounded-xl border border-urbik-g100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <Link
                    href={`/property/${other.id}`}
                    className="absolute inset-0 z-10"
                  />
                  <div className="absolute top-3 right-3 z-20">
                    <FavoriteButton
                      propertyId={other.id.toString()}
                      initialIsFavorite={!!other.isFavorite} // Aseguramos booleano
                      small
                    />
                  </div>
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={other.images[0] || "/placeholder-property.jpg"}
                      alt={other.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded font-bold uppercase">
                        {getPropertyLabel(other.type)}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col grow">
                    <h3 className="text-md font-bold mb-1 line-clamp-2 text-urbik-dark group-hover:text-urbik-emerald transition-colors">
                      {other.title}
                    </h3>
                    <div className="flex items-center text-urbik-muted mb-4 text-xs font-medium">
                      <MapPin size={12} className="mr-1" />
                      <p>{other.city}</p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-end">
                      <p className="text-[10px] font-bold text-urbik-muted uppercase tracking-wider">
                        {getOperationLabel(other.operationType)}
                      </p>
                      <p className="text-lg font-black text-urbik-dark">
                        {other.currency || "USD"}{" "}
                        {(
                          other.salePrice ||
                          other.rentPrice ||
                          0
                        ).toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-12 rounded-2xl text-center border-2 border-dashed border-gray-200">
              <Building2 size={40} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-medium">
                Esta inmobiliaria no tiene otras propiedades similares.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
