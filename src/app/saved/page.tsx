"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import Versus from "../../components/SmartZone/SmartCompare";
import FavoriteButton from "../../components/FavoritesButton";

// Extendemos la interfaz para cumplir con lo que espera el componente Versus (SmartCompare)
interface FavoriteProperty {
  id: number;
  title: string;
  type: string;
  operationType: string;
  price: number | null;
  currency?: string | null;
  images: string[];
  city: string;
  // Propiedades requeridas por Versus
  area?: number;
  rooms?: number;
  bathrooms?: number;
  address?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
}

// Interfaz local para adaptar los datos al componente Versus si es necesario
interface VersusProperty {
  id: number;
  title: string;
  price: number;
  area: number;
  rooms: number;
  bathrooms: number;
  images: string[];
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
}

export default function GuardadosPage() {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const [isSmartZone, setIsSmartZone] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/properties/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch {
      console.error("Error cargando favoritos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchFavorites();
  }, [session]);

  const toggleSelectProperty = (id: number) => {
    if (!isSmartZone) return;
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : prev.length < 5
          ? [...prev, id]
          : prev,
    );
  };

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
        return "CASA";
      case "APARTMENT":
        return "DPTO";
      case "LAND":
        return "TERRENO";
      case "COMMERCIAL_PROPERTY":
        return "LOCAL";
      case "OFFICE":
        return "OFICINA";
      default:
        return type;
    }
  };

  // Función para adaptar las propiedades favoritas al formato que espera Versus
  const getSelectedPropertiesForVersus = (): VersusProperty[] => {
    return favorites
      .filter((p) => selectedIds.includes(p.id))
      .map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price || 0,
        area: p.area || 0,
        rooms: p.rooms || 0,
        bathrooms: p.bathrooms || 0,
        images: p.images,
        address: p.address || "",
        city: p.city,
        province: p.province || "",
        latitude: p.latitude || 0,
        longitude: p.longitude || 0,
      }));
  };

  if (!session)
    return (
      <div className="pt-20 text-center font-medium">
        Inicia sesión para ver tus favoritos.
      </div>
    );

  return (
    <div className="bg-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 py-20 min-h-screen relative mt-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl ml-5 font-display font-bold text-urbik-black tracking-tighter">
              Propiedades
            </h1>
            <span className="italic font-black text-6xl text-urbik-black">
              Guardadas.
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mt-12 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-urbik-g200 h-64 rounded-3xl" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 mt-10 bg-urbik-white2 rounded-4xl border border-dashed border-urbik-black/10">
            <p className="text-urbik-muted font-medium">
              Aún no has guardado ninguna propiedad.
            </p>
            <Link
              href="/"
              className="text-urbik-black font-bold underline mt-4 block"
            >
              Explorar propiedades
            </Link>
          </div>
        ) : (
          <div className="mt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 mb-15">
              {favorites.map((prop) => {
                const isSelected = selectedIds.includes(prop.id);

                return (
                  <div
                    key={prop.id}
                    onClick={() => toggleSelectProperty(prop.id)}
                    className={`relative transition-all duration-300 ${isSmartZone ? "cursor-pointer" : ""}`}
                  >
                    <div
                      className={`h-full transition-all duration-500 ${isSmartZone && !isSelected ? "opacity-40 grayscale scale-[0.95]" : "opacity-100"}`}
                    >
                      <div
                        className={`bg-urbik-white2 rounded-md border overflow-hidden hover:scale-105 hover:brightness-105
                        hover:bg-none hover:shadow-lg transition-all h-full flex flex-col relative ${isSelected ? "border-urbik-emerald" : "border-urbik-g100"}`}
                      >
                        {!isSmartZone && (
                          <Link
                            href={`/property/${prop.id}`}
                            className="absolute inset-0 z-10"
                          />
                        )}

                        {!isSmartZone && (
                          <div className="absolute top-3 right-3 z-20">
                            <FavoriteButton
                              propertyId={prop.id.toString()}
                              initialIsFavorite={true}
                              small={true}
                            />
                          </div>
                        )}

                        <div className="relative h-40 bg-urbik-g200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={prop.images[0] || "/placeholder-property.jpg"}
                            alt={prop.title}
                            className="object-cover w-full h-full"
                          />
                        </div>

                        <div className="p-4 flex flex-col grow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="bg-urbik-black text-white text-xs px-3 py-1 rounded-full font-bold tracking-tight">
                              {getPropertyLabel(prop.type)}
                            </span>
                            <span className="bg-urbik-cyan text-urbik-muted text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tight">
                              {getOperationLabel(prop.operationType)}
                            </span>
                          </div>

                          <h3 className="text-lg font-black mb-1 line-clamp-1 text-urbik-dark uppercase">
                            {prop.title}
                          </h3>

                          <div className="flex items-center justify-end text-urbik-dark/60 mb-2">
                            <MapPin size={12} strokeWidth={3} />
                            <p className="text-xs font-bold text-urbik-dark ">
                              {prop.city}
                            </p>
                          </div>

                          <div className="mt-auto">
                            <hr className="border-urbik-g100 mb-4" />
                            <p className="text-xl font-black text-urbik-dark tracking-tighter text-right">
                              $ {prop.price?.toLocaleString("es-AR")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Versus
              selectedProperties={getSelectedPropertiesForVersus()}
              isVersusMode={isSmartZone}
              setIsVersusMode={setIsSmartZone}
              hasFavorites={favorites.length > 1}
              setSelectedIds={setSelectedIds}
            />
          </div>
        )}
      </div>
    </div>
  );
}
