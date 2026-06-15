"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { SearchProperty } from "@/app/(public)/page";

const cardClass =
  "group relative md:rounded-[20px] rounded-2xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)]";

function getOperationLabel(type: string) {
  if (type === "SALE") return "Venta";
  if (type === "RENT") return "Alquiler";
  if (type === "TEMP_RENT") return "Temporal";
  if (type === "SALE_RENT") return "Venta y alquiler";
  return type;
}

export default function NearbyProperties() {
  const searchParams = useSearchParams();
  const operationType = searchParams.get("operationType");

  const [city, setCity] = useState<string | null>(null);
  const [items, setItems] = useState<SearchProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (!res.ok) {
          if (!cancelled) setLoading(false);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        const userCity = (data?.city ?? "").trim();
        if (data?.role !== "USER" || !userCity) {
          setLoading(false);
          return;
        }
        setCity(userCity);
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({ city });
        if (operationType) params.set("operationType", operationType);
        const res = await fetch(`/api/properties/nearby?${params.toString()}`);
        if (!res.ok) {
          if (!cancelled) setLoading(false);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setItems(data?.properties ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [city, operationType]);

  if (loading || !city || items.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-5 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl text-urbik-black/80 font-black">
          Cerca tuyo en {city}
        </h2>
        <span className="text-urbik-black/50 text-sm md:text-base">
          Propiedades disponibles en tu ciudad.
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((property) => {
          const price = property.salePrice ?? property.rentPrice ?? 0;
          const currency = property.saleCurrency ?? property.rentCurrency ?? "ARS";
          return (
            <Link key={property.id} href={`/property/${property.id}`} className={cardClass}>
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-bold text-black/70">
                    Sin imagen
                  </div>
                )}
                <span className="absolute top-3 left-3 rounded-full bg-urbik-black/80 px-3 py-1 text-[10px] font-bold text-white uppercase">
                  {getOperationLabel(property.operationType)}
                </span>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-base font-black tracking-tight text-urbik-black">
                  {property.title}
                </h3>
                <p className="mt-1 truncate text-xs font-semibold text-urbik-black/60">
                  {property.displayAddress || property.address}, {property.city}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
                  <span className="text-xs font-bold text-urbik-black/50">
                    {property.bedrooms || 0} hab · {property.area || 0} m²
                  </span>
                  <span className="text-sm font-black text-urbik-black/80">
                    {currency} {Number(price).toLocaleString("es-AR")}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
