/*
Este código define un componente de React llamado PropertiesSidebar que renderiza una barra
lateral interactiva para visualizar un listado de inmuebles, gestionando automáticamente
estados de carga, listas vacías y una cuadrícula adaptable según el límite visual de elementos.
El componente transforma datos técnicos en etiquetas legibles (como el tipo de operación y de
propiedad), formatea precios a moneda local y presenta cada propiedad en tarjetas animadas con
Framer Motion que incluyen imágenes, ubicación y un botón funcional para marcar favoritos, todo
integrado con navegación dinámica mediante Next.js.
*/
"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Home, Droplet, Wind, Wifi, Car, Waves } from "lucide-react";
import type { MapProperty } from "../types/types";
import FavoriteButton from "../../../components/FavoritesButton";
import { useSession } from "next-auth/react";

interface PropertiesSidebarProps {
  properties: MapProperty[];
  isLoading: boolean;
  visualLimit: number;
}

interface ExtendedMapProperty extends MapProperty {
  type: string;
}

interface FavoriteProperty {
  id: number;
  [key: string]: unknown;
}

export function PropertiesSidebar({
  properties,
  isLoading,
  visualLimit,
}: PropertiesSidebarProps) {
  const { data: session } = useSession();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (session) {
        try {
          const res = await fetch("/api/properties/favorites");
          if (res.ok) {
            const data: FavoriteProperty[] = await res.json();
            setFavoriteIds(data.map((fav) => fav.id));
          }
        } catch (error) {
          console.error("Error cargando favoritos:", error);
        }
      }
    };
    fetchFavorites();
  }, [session]);

  const getOperationLabel = (type: string) => {
    switch (type) {
      case "SALE":
        return "Venta";
      case "RENT":
        return "Alquiler";
      case "TEMP_RENT":
        return "Alquiler temporal";
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
      case "FIELD":
        return "CAMPO";
      case "BUSINESS_BACKGROUND":
        return "FONDO DE COM.";
      case "GARAGE":
        return "COCHERA";
      case "WAREHOUSE":
        return "GALPÓN";
      case "DEVELOPMENT":
        return "DESARROLLO";
      case "PH":
        return "PH";
      case "COUNTRY":
        return "COUNTRY";
      case "COMMERCIAL_PROPERTY":
        return "LOCAL";
      case "OFFICE":
        return "OFICINA";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full p-4 flex items-center justify-center text-slate-500">
        <span className="animate-pulse font-medium">
          Buscando propiedades...
        </span>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="h-full w-full p-8 flex flex-col items-center justify-center text-center text-slate-500">
        <MapPin className="h-10 w-10 mb-2 opacity-50" />
        <p className="font-medium">No se encontraron propiedades.</p>
      </div>
    );
  }

  const gridConfig = "grid-cols-1";

  return (
    <div className="h-full overflow-y-auto bg-white p-4 scrollbar-thin scrollbar-thumb-slate-200">
      <h2 className="text-xs font-black mb-4 text-urbik-dark uppercase tracking-widest sticky top-0 bg-white z-10 py-2 border-b border-urbik-g100">
        {properties.length} Propiedades Encontradas
      </h2>

      <div className={`grid gap-4 ${gridConfig}`}>
        {properties.map((rawProp) => {
          const prop = rawProp as ExtendedMapProperty;
          const isInitiallyFavorite = favoriteIds.includes(Number(prop.id));

          return (
            <div key={prop.id} className="relative group">
              <div className="bg-urbik-white2 rounded-lg border border-urbik-g100 overflow-hidden hover:scale-[1.01] hover:brightness-105 hover:shadow-xl transition-all h-full flex flex-col relative">
                <Link
                  href={`/property/${prop.id}`}
                  className="absolute inset-0 z-10"
                />

                <div className="absolute top-3 right-3 z-20">
                  <FavoriteButton
                    propertyId={prop.id.toString()}
                    initialIsFavorite={isInitiallyFavorite}
                    small={true}
                  />
                </div>

                <div className="relative h-48 bg-urbik-g200 overflow-hidden">
                  {prop.images && prop.images[0] ? (
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-urbik-muted text-[10px]">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col grow">
                  <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                    <span className="bg-urbik-black text-white text-[9px] px-2.5 py-1 rounded-full font-bold tracking-tight whitespace-nowrap">
                      {getPropertyLabel(prop.type)}
                    </span>
                    <span className="bg-urbik-cyan text-urbik-muted text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-tight whitespace-nowrap">
                      {getOperationLabel(prop.operationType)}
                    </span>
                  </div>

                  <h3 className="text-sm font-black mb-2 line-clamp-2 text-urbik-dark uppercase">
                    {prop.title}
                  </h3>

                  <div className="flex items-center gap-2 text-urbik-dark/70 mb-3">
                    <MapPin size={14} strokeWidth={2.5} className="flex-shrink-0" />
                    <p className="text-xs font-bold line-clamp-1">
                      {prop.city || prop.address}
                    </p>
                  </div>

                  {prop.area && (
                    <p className="text-xs text-urbik-dark/60 mb-2">
                      <span className="font-bold">{prop.area}</span> m²
                    </p>
                  )}

                  <div className="flex gap-3 mb-3 text-urbik-dark/70 text-xs">
                    {prop.rooms && (
                      <div className="flex items-center gap-1">
                        <Home size={12} strokeWidth={2.5} />
                        <span className="font-semibold">{prop.rooms}</span>
                      </div>
                    )}
                    {prop.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Droplet size={12} strokeWidth={2.5} />
                        <span className="font-semibold">{prop.bathrooms}</span>
                      </div>
                    )}
                  </div>

                  {(prop.hasParking || prop.hasPool || prop.hasGarden) && (
                    <div className="flex gap-2 mb-3 text-urbik-dark/70">
                      {prop.hasParking && <Car size={14} strokeWidth={2} className="flex-shrink-0" />}
                      {prop.hasPool && <Waves size={14} strokeWidth={2} className="flex-shrink-0" />}
                      {prop.hasGarden && <Wind size={14} strokeWidth={2} className="flex-shrink-0" />}
                    </div>
                  )}

                  <div className="mt-auto">
                    <hr className="border-urbik-g100 mb-3" />
                    <p className="text-lg font-black text-urbik-dark tracking-tighter">
                      $ {prop.price?.toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
