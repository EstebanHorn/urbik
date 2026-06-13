"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

import {
  MapPin,
  Home,
  Droplet,
  Building2,
} from "lucide-react";

import type { MapProperty } from "./types";
import { createClient } from "@/lib/supabase/client";

interface PropertiesSidebarProps {
  properties: MapProperty[];
  isLoading: boolean;
  visualLimit: number;
  selectedPropertyId?: string | null;
  onSelectProperty?: (prop: MapProperty) => void;
}

interface FavoriteProperty {
  id: string;
}

interface SessionState {
  access_token?: string;
}

const glassCard =
  " rounded-2xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[10px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";

export function PropertiesSidebar({
  properties,
  isLoading,
  visualLimit,
  selectedPropertyId,
  onSelectProperty,
}: PropertiesSidebarProps) {
  const supabase = createClient();

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [session, setSession] = useState<SessionState | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
  }, [supabase]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!session) return;
      try {
        const res = await fetch("/api/properties/favorites");
        if (!res.ok) return;
        const data: FavoriteProperty[] = await res.json();
        setFavoriteIds(data.map((fav) => fav.id));
      } catch (error) {
        console.error("Error cargando favoritos:", error);
      }
    };
    fetchFavorites();
  }, [session]);

  const getOperationLabel = (type: string) => {
    switch (type) {
      case "SALE": return "Venta";
      case "RENT": return "Alquiler";
      case "TEMP_RENT": return "Temporal";
      case "SALE_RENT": return "Venta / Alq";
      default: return type;
    }
  };

  const getPropertyLabel = (type: string) => {
    switch (type) {
      case "HOUSE": return "Casa";
      case "APARTMENT": return "Dpto";
      case "LAND": return "Terreno";
      case "FIELD": return "Campo";
      case "BUSINESS_BACKGROUND": return "Fondo de Com.";
      case "GARAGE": return "Cochera";
      case "WAREHOUSE": return "Galpón";
      case "DEVELOPMENT": return "Desarrollo";
      case "PH": return "PH";
      case "COUNTRY": return "Country";
      case "COMMERCIAL_PROPERTY": return "Local";
      case "OFFICE": return "Oficina";
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4 text-slate-500">
        <span className="animate-pulse font-medium">Buscando propiedades...</span>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-urbik-black/50">
        <MapPin className="mb-2 h-10 w-10" />
        <p className="font-medium">No se encontraron propiedades.</p>
      </div>
    );
  }

  const sortedProperties = [...properties].sort((a, b) => {
    // @ts-ignore
    const aInMap = a.inMapBounds ?? false;
    // @ts-ignore
    const bInMap = b.inMapBounds ?? false;
    if (aInMap && !bInMap) return -1;
    if (!aInMap && bInMap) return 1;
    return 0;
  });

  const hasSelection = Boolean(selectedPropertyId);

  return (
    <div className="h-full overflow-y-auto bg-transparent p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5 mt-17">
        {sortedProperties.slice(0, visualLimit).map((prop, index) => {
          const isInitiallyFavorite = favoriteIds.includes(prop.id);
          const isSelected = selectedPropertyId === prop.id;

          return (
            <div
              key={prop.id}
              className={`group relative flex flex-col cursor-pointer transition-all duration-500 animate-fade-in-up ${glassCard}
                ${hasSelection && !isSelected ? "opacity-60 scale-[0.98] saturate-50" : "hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)]"}
                ${isSelected ? "scale-[1.03] shadow-[0_20px_60px_rgba(0,0,0,0.15)] ring-2 ring-urbik-black z-30" : ""}
              `}
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: "both",
              }}
            >
              <div
                onClick={() => onSelectProperty?.(prop)}
                className="absolute inset-0 z-20"
              />

              <div className="relative h-40 md:h-48 w-full overflow-hidden rounded-t-2xl bg-urbik-g200">
                {prop.images?.[0] ? (
                  <Image
                    src={prop.images[0]}
                    alt={prop.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105 [mask:linear-gradient(to_bottom,black_82%,white_98%)] [-webkit-mask-image:linear-gradient(to_bottom,black_82%,white_98%)]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-white text-xs font-bold text-black/70">
                    <Building2 size={36} className="text-urbik-g400" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-4 pt-2 z-10">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/20 bg-urbik-black/80 px-2.5 py-1 text-[10px] font-bold text-white uppercase shadow-sm z-1">
                        {getPropertyLabel(prop.type)}
                      </span>
                      <span className="rounded-full border border-white/20 bg-urbik-black/80 px-2.5 py-1 text-[10px] font-bold text-white uppercase shadow-sm z-1">
                        {getOperationLabel(prop.operationType)}
                      </span>
                    </div>

                    {(prop as any).agencyLogo && (
                      <div className="h-10 w-10 shrink-0 overflow-hidden z-1">
                        <img
                          src={(prop as any).agencyLogo}
                          alt="Logo Inmobiliaria"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <h3 className="line-clamp-2 text-sm font-black tracking-tight text-urbik-black">
                    {prop.title}
                  </h3>

                  <p className="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-urbik-black/80">
                    <MapPin size={12} className="shrink-0 text-urbik-black/80" />
                    {prop.address}, {prop.city}
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t border-white/60">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black tracking-tight text-urbik-black/90 z-1">
                      $ {prop.price?.toLocaleString("es-AR")}
                    </span>

                    {isInitiallyFavorite && (
                      <span className="text-[10px] font-bold text-urbik-emerald">
                        Guardada
                      </span>
                    )}
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