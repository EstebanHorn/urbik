"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  MapPin,
  Home,
  Droplet,
  Wind,
  Car,
  Waves,
} from "lucide-react";

import type { MapProperty } from "./types";

import { createClient } from "@/lib/supabase/client";

interface PropertiesSidebarProps {
  properties: MapProperty[];
  isLoading: boolean;
  visualLimit: number;
}

interface FavoriteProperty {
  id: number;
}

interface SessionState {
  access_token?: string;
}

export function PropertiesSidebar({
  properties,
  isLoading,
  visualLimit,
}: PropertiesSidebarProps) {
  const supabase = createClient();

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [session, setSession] = useState<SessionState | null>(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
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
        console.error(
          "Error cargando favoritos:",
          error,
        );
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
      <div className="flex h-full w-full items-center justify-center p-4 text-slate-500">
        <span className="animate-pulse font-medium">
          Buscando propiedades...
        </span>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-urbik-black/50">
        <MapPin className="mb-2 h-10 w-10" />

        <p className="font-medium">
          No se encontraron propiedades.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white p-4 scrollbar-thin scrollbar-thumb-slate-200">
      <h2 className="sticky top-0 z-10 mb-4 border-b border-urbik-black bg-white py-2 text-xs font-black uppercase tracking-widest text-urbik-dark">
        {properties.length} Propiedades Encontradas
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {properties
          .slice(0, visualLimit)
          .map((prop) => {
            const isInitiallyFavorite =
              favoriteIds.includes(Number(prop.id));

            return (
              <div
                key={prop.id}
                className="group relative"
              >
                <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-urbik-g100 bg-urbik-white2 transition-all hover:scale-[1.01] hover:brightness-105 hover:shadow-xl">
                  <Link
                    href={`/property/${prop.id}`}
                    className="absolute inset-0 z-10"
                  />

                  <div className="relative h-48 overflow-hidden bg-white">
                    {prop.images?.[0] ? (
                      <Image
                        src={prop.images[0]}
                        alt={prop.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-urbik-muted">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div className="flex grow flex-col p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="whitespace-nowrap rounded-full bg-urbik-black px-2.5 py-1 text-[9px] font-bold tracking-tight text-white">
                        {getPropertyLabel(prop.type)}
                      </span>

                      <span className="whitespace-nowrap rounded-full bg-urbik-cyan px-2.5 py-1 text-[8px] font-black uppercase tracking-tight text-urbik-muted">
                        {getOperationLabel(
                          prop.operationType,
                        )}
                      </span>
                    </div>

                    <h3 className="mb-2 line-clamp-2 text-sm font-black uppercase text-urbik-dark">
                      {prop.title}
                    </h3>

                    <div className="mb-3 flex items-center gap-2 text-urbik-dark/70">
                      <MapPin
                        size={14}
                        strokeWidth={2.5}
                        className="shrink-0"
                      />

                      <p className="line-clamp-1 text-xs font-bold">
                        {prop.city || prop.address}
                      </p>
                    </div>

                    {prop.area && (
                      <p className="mb-2 text-xs text-urbik-dark/60">
                        <span className="font-bold">
                          {prop.area}
                        </span>{" "}
                        m²
                      </p>
                    )}

                    <div className="mb-3 flex gap-3 text-xs text-urbik-dark/70">
                      {prop.rooms && (
                        <div className="flex items-center gap-1">
                          <Home
                            size={12}
                            strokeWidth={2.5}
                          />

                          <span className="font-semibold">
                            {prop.rooms}
                          </span>
                        </div>
                      )}

                      {prop.bathrooms && (
                        <div className="flex items-center gap-1">
                          <Droplet
                            size={12}
                            strokeWidth={2.5}
                          />

                          <span className="font-semibold">
                            {prop.bathrooms}
                          </span>
                        </div>
                      )}
                    </div>

                    {(prop.hasParking ||
                      prop.hasPool ||
                      prop.hasGarden) && (
                      <div className="mb-3 flex gap-2 text-urbik-dark/70">
                        {prop.hasParking && (
                          <Car
                            size={14}
                            strokeWidth={2}
                            className="shrink-0"
                          />
                        )}

                        {prop.hasPool && (
                          <Waves
                            size={14}
                            strokeWidth={2}
                            className="shrink-0"
                          />
                        )}

                        {prop.hasGarden && (
                          <Wind
                            size={14}
                            strokeWidth={2}
                            className="shrink-0"
                          />
                        )}
                      </div>
                    )}

                    <div className="mt-auto">
                      <hr className="mb-3 border-urbik-g100" />

                      <p className="text-lg font-black tracking-tighter text-urbik-dark">
                        ${" "}
                        {prop.price?.toLocaleString(
                          "es-AR",
                        )}
                      </p>

                      {isInitiallyFavorite && (
                        <p className="mt-1 text-[10px] font-bold text-urbik-emerald">
                          Guardada en favoritos
                        </p>
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