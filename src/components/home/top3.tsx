import React from "react";
import Link from "next/link";
import { SearchProperty, getTypeLabel, getOperationLabel, glassCard } from "../../app/(public)/page";

interface Top3Props {
  items: SearchProperty[];
  setHoveredPropertyId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function Top3({ items, setHoveredPropertyId }: Top3Props) {
  if (items.length === 0) return null;

  return (
    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.slice(0, 3).map((property, index) => {
        const price = property.salePrice ?? property.rentPrice ?? 0;
        const currency = property.salePrice != null
          ? (property.saleCurrency ?? "USD")
          : (property.rentCurrency ?? "ARS");

        return (
          <Link
            key={property.id}
            href={`/property/${property.id}`}
            onMouseEnter={() => setHoveredPropertyId(property.id)}
            onMouseLeave={() =>
              setHoveredPropertyId((current) => (current === property.id ? null : current))
            }
            className={`group flex flex-col gap-4 p-4 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] animate-fade-in-up ${glassCard}`}
            style={{
              animationDelay: `${index * 150}ms`,
              animationFillMode: "both"
            }}
          >
            <div className="relative h-64 md:h-72 w-full overflow-hidden rounded-t-2xl">
              {property.images?.[0] ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105 [mask-image:linear-gradient(to_bottom,black_52%,transparent_95%)] [-webkit-mask-image:linear-gradient(to_bottom,black_52%,transparent_95%)]"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-white text-xs font-bold text-black/70">
                  Sin imagen
                </div>
              )}
            </div>
            
            <div className="flex flex-1 flex-col justify-between min-w-0 z-100">
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/20 bg-geora-black/80 px-3 py-1 text-xs font-bold text-white uppercase shadow-sm z-1">
                      {getTypeLabel(property.type)}
                    </span>
                    <span className="rounded-full border border-white/20 bg-geora-black/80 px-3 py-1 text-xs font-bold text-white uppercase shadow-sm z-1">
                      {getOperationLabel(property.operationType)}
                    </span>
                  </div>
                  
                  {property.agencyLogo && (
                    <div className="h-12 w-12 shrink-0 overflow-hidden z-1">
                      <img
                        src={property.agencyLogo}
                        alt="Logo Inmobiliaria"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <h3 className="line-clamp-2 text-base font-black tracking-tight text-geora-black">
                  {property.title}
                </h3>
                <p className="mt-2 truncate text-xs font-semibold text-geora-black/80">
                  {property.displayAddress || property.address}, {property.city}, {property.province}
                </p>
              </div>
              
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/60 pt-4">
                <span className="text-xs font-bold text-geora-black/50 z-1">
                  {property.bedrooms || 0} hab · {property.area || 0} m²
                </span>
                <span className="text-base font-black tracking-tight text-geora-black/70 z-1">
                  {currency} {Number(price).toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}