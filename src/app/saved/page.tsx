"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import FavoriteButton from "@/components/ui/FavoriteButton";
import type { Session } from "@supabase/supabase-js";

interface FavoriteProperty {
  id: number; title: string; type: string; operationType: string;
  price: number | null; currency?: string | null; images: string[];
  city: string; area?: number; rooms?: number; bathrooms?: number;
  address?: string; province?: string; latitude?: number; longitude?: number;
}

export default function SavedPage() {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchFavorites();
      else setLoading(false);
    });
  }, [supabase]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/properties/favorites");
      if (res.ok) setFavorites(await res.json());
    } catch {
      console.error("Error cargando favoritos");
    } finally {
      setLoading(false);
    }
  };

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

  if (!loading && !session) return <div className="pt-20 text-center font-medium">Inicia sesión para ver tus favoritos.</div>;

  return (
    <div className="bg-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 py-20 min-h-screen relative mt-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl ml-5 font-display font-bold text-urbik-black tracking-tighter">Propiedades</h1>
            <span className="italic font-black text-6xl text-urbik-black">Guardadas.</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mt-12 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="bg-urbik-g200 h-64 rounded-3xl" />)}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 mt-10 bg-urbik-white2 rounded-4xl border border-dashed border-urbik-black/10">
            <p className="text-urbik-muted font-medium">Aún no has guardado ninguna propiedad.</p>
            <Link href="/" className="text-urbik-black font-bold underline mt-4 block">Explorar propiedades</Link>
          </div>
        ) : (
          <div className="mt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 mb-15">
              {favorites.map((prop) => (
                <div key={prop.id} className="relative transition-all duration-300">
                  <div className="h-full">
                    <div className="bg-urbik-white2 rounded-md border border-urbik-g100 overflow-hidden hover:scale-105 hover:brightness-105 hover:bg-none hover:shadow-lg transition-all h-full flex flex-col relative">
                      <Link href={`/property/${prop.id}`} className="absolute inset-0 z-10" />
                      <div className="absolute top-3 right-3 z-20">
                        <FavoriteButton propertyId={prop.id.toString()} initialIsFavorite={true} small={true} />
                      </div>
                      <div className="relative h-40 bg-urbik-g200">
                        <Image
                          src={prop.images[0] || "/placeholder-property.jpg"}
                          alt={prop.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 20vw"
                        />
                      </div>
                      <div className="p-4 flex flex-col grow">
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-urbik-black text-white text-xs px-3 py-1 rounded-full font-bold tracking-tight">{getPropertyLabel(prop.type)}</span>
                          <span className="bg-urbik-cyan text-urbik-muted text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tight">{getOperationLabel(prop.operationType)}</span>
                        </div>
                        <h3 className="text-lg font-black mb-1 line-clamp-1 text-urbik-dark uppercase">{prop.title}</h3>
                        <div className="flex items-center justify-end text-urbik-dark/60 mb-2">
                          <MapPin size={12} strokeWidth={3} />
                          <p className="text-xs font-bold text-urbik-dark">{prop.city}</p>
                        </div>
                        <div className="mt-auto">
                          <hr className="border-urbik-g100 mb-4" />
                          <p className="text-xl font-black text-urbik-dark tracking-tighter text-right">$ {prop.price?.toLocaleString("es-AR")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}