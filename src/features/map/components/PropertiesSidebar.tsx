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
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import type { MapProperty } from "../types/types";
import FavoriteButton from "../../../components/FavoritesButton";
import { useSession } from "next-auth/react";

interface PropertiesSidebarProps {
  properties: MapProperty[];
  isLoading: boolean;
  visualLimit: number;
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
            const data = await res.json();
            setFavoriteIds(data.map((fav: any) => fav.id));
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
      case "SALE": return "Venta";
      case "RENT": return "Alquiler";
      case "SALE_RENT": return "Venta y Alquiler";
      default: return type;
    }
  };

  const getPropertyLabel = (type: string) => {
    switch (type) {
      case "HOUSE": return "CASA";
      case "APARTMENT": return "DPTO";
      case "LAND": return "TERRENO";
      case "COMMERCIAL_PROPERTY": return "LOCAL";
      case "OFFICE": return "OFICINA";
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full p-4 flex items-center justify-center text-slate-500">
        <span className="animate-pulse font-medium">Buscando propiedades...</span>
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

  const gridConfig = visualLimit > 4 ? "grid-cols-2" : "grid-cols-1";
  
  return (
    <div className="h-full overflow-y-auto bg-white p-4 scrollbar-thin scrollbar-thumb-slate-200">
      <h2 className="text-xs font-black mb-4 text-urbik-dark uppercase tracking-widest sticky top-0 bg-white z-10 py-2 border-b border-urbik-g100">
        {properties.length} Propiedades Encontradas
      </h2>
      
      <div className={`grid gap-4 ${gridConfig}`}>
        {properties.map((prop) => {
          const isInitiallyFavorite = favoriteIds.includes(prop.id);

          return (
            <div key={prop.id} className="relative group">
              <div className="bg-urbik-white2 rounded-md border border-urbik-g100 overflow-hidden hover:scale-[1.02] hover:brightness-105 hover:shadow-lg transition-all h-full flex flex-col relative">
                
                <Link href={`/property/${prop.id}`} className="absolute inset-0 z-10" />

                <div className="absolute top-3 right-3 z-20">
                  <FavoriteButton 
                    propertyId={prop.id.toString()} 
                    initialIsFavorite={isInitiallyFavorite} 
                    small={true}
                  />
                </div>

                <div className="relative h-32 bg-urbik-g200 overflow-hidden">
                  {prop.images && prop.images[0] ? (
                    <img 
                      src={prop.images[0]} 
                      alt={prop.title} 
                      className="w-full h-full object-cover transition-transform duration-500" 
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-urbik-muted text-[10px]">Sin imagen</div>
                  )}
                </div>

                <div className="p-3 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-2 gap-1">
                    <span className="bg-urbik-black text-white text-[9px] px-2 py-0.5 rounded-full font-bold tracking-tight whitespace-nowrap">
                      {getPropertyLabel(prop.type)}
                    </span>
                    <span className="bg-urbik-cyan text-urbik-muted text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tight whitespace-nowrap">
                      {getOperationLabel(prop.operationType)}
                    </span>
                  </div>

                  <h3 className="text-sm font-black mb-1 line-clamp-1 text-urbik-dark uppercase">
                    {prop.title}
                  </h3>
                  <div className="w-full flex justify-end">
                    <div className="flex items-center justify-start text-urbik-dark/60 mb-2">
                      <MapPin size={10} strokeWidth={3} className="mr-1" />
                      <p className="text-[10px] font-bold text-urbik-dark truncate">
                        {prop.city || prop.address}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <hr className="border-urbik-g100 mb-2" />
                    <p className="text-base font-black text-urbik-dark tracking-tighter text-right">
                      $ {prop.price?.toLocaleString('es-AR')}
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