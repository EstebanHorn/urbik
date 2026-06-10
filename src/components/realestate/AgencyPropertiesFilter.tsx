"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Building2, ChevronDown } from "lucide-react";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import PriceFilterCard from "@/components/search/PriceFilterCard";
import RoomsFilterCard from "@/components/search/RoomsFilterCard";

export type Property = {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  operation_type: string;
  address: string;
  city: string;
  images?: string[];
  sale_price?: number | null;
  rent_price?: number | null;
  sale_currency?: string | null;
  rent_currency?: string | null;
  rooms?: number;
  bathrooms?: number;
};

const PROPERTY_LABELS: Record<string, string> = {
  HOUSE: "Casa",
  APARTMENT: "Departamento",
  PH: "PH",
  COUNTRY: "Country",
  LAND: "Terreno",
  FIELD: "Campo",
  COMMERCIAL_PROPERTY: "Local Comercial",
  OFFICE: "Oficina",
};

const OPERATION_LABELS: Record<string, string> = {
  SALE: "Venta",
  RENT: "Alquiler",
  TEMP_RENT: "Temporal",
  SALE_RENT: "Venta / Alquiler",
};

const glassCard = "md:rounded-[30px] rounded-3xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[30px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";

function formatPrice(price?: number | null, currency?: string | null): string {
  if (!price) return "Consultar";
  const symbol = currency === "ARS" ? "$" : "USD";
  return `${symbol} ${price.toLocaleString("es-AR")}`;
}

export default function AgencyPropertiesFilter({ properties }: { properties: Property[] }) {
  const [filterOperation, setFilterOperation] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<"price" | "rooms" | null>(null);
  
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filterCurrency, setFilterCurrency] = useState<string | null>("");

  const [filterRooms, setFilterRooms] = useState<string[]>([]);
  const [filterBedrooms, setFilterBedrooms] = useState<string[]>([]);
  const [filterBathrooms, setFilterBathrooms] = useState<string[]>([]);

  useEffect(() => {
    if (!activeFilter) return;
    const handleOutside = (e: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node)) {
        setActiveFilter(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [activeFilter]);

  const handleRoomsChange = (field: "rooms" | "bedrooms" | "bathrooms", value: string | null) => {
    if (field === "rooms") setFilterRooms(value ? [value] : []);
    if (field === "bedrooms") setFilterBedrooms(value ? [value] : []);
    if (field === "bathrooms") setFilterBathrooms(value ? [value] : []);
  };

  const filteredProperties = properties.filter((prop) => {
    let matches = true;
    
    if (filterOperation && prop.operation_type !== filterOperation) matches = false;
    if (filterType && prop.type !== filterType) matches = false;

    const propPrice = prop.sale_price ?? prop.rent_price ?? 0;
    const propCurrency = prop.sale_currency ?? prop.rent_currency ?? "USD";

    if (minPrice && propPrice < Number(minPrice)) matches = false;
    if (maxPrice && propPrice > Number(maxPrice)) matches = false;
    if (filterCurrency && propCurrency !== filterCurrency) matches = false;

    if (filterRooms.length > 0) {
      const val = filterRooms[0];
      if (val.includes('+')) {
        if ((prop.rooms || 0) < parseInt(val)) matches = false;
      } else {
        if (String(prop.rooms || 0) !== val) matches = false;
      }
    }

    if (filterBathrooms.length > 0) {
      const val = filterBathrooms[0];
      if (val.includes('+')) {
        if ((prop.bathrooms || 0) < parseInt(val)) matches = false;
      } else {
        if (String(prop.bathrooms || 0) !== val) matches = false;
      }
    }
    
    return matches;
  });

  return (
    <section className="pb-20">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between px-2 md:px-10 gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl font-black text-urbik-black/90 uppercase tracking-tight">
            Cartera de Propiedades
          </h2>
          <span className="text-sm font-bold text-urbik-muted hidden sm:block">
            {filteredProperties.length} {filteredProperties.length === 1 ? "propiedad" : "propiedades"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2" ref={filterPanelRef}>
          <CustomDropdown
            label={filterOperation ? (OPERATION_LABELS[filterOperation] || filterOperation) : "Operación"}
            value={filterOperation}
            options={[
              { label: "Todas", value: "" },
              { label: "Venta", value: "SALE" },
              { label: "Alquiler", value: "RENT" },
              { label: "Temporal", value: "TEMP_RENT" },
            ]}
            onChange={(val) => setFilterOperation(val)}
            variant="white1"
          />

          <CustomDropdown
            label={filterType ? (PROPERTY_LABELS[filterType] || filterType) : "Tipo"}
            value={filterType}
            options={[
              { label: "Todos", value: "" },
              { label: "Casa", value: "HOUSE" },
              { label: "Departamento", value: "APARTMENT" },
              { label: "PH", value: "PH" },
              { label: "Terreno", value: "LAND" },
              { label: "Local", value: "COMMERCIAL_PROPERTY" },
              { label: "Oficina", value: "OFFICE" },
            ]}
            onChange={(val) => setFilterType(val)}
            variant="white1"
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveFilter((v) => (v === "price" ? null : "price"))}
              className={`h-10 cursor-pointer px-3 md:px-5 py-2 rounded-full tracking-wide transition-colors duration-200 flex items-center justify-center md:justify-between gap-2 min-w-10 md:min-w-[120px] font-bold ${
                minPrice || maxPrice || filterCurrency
                  ? "bg-white/70 border border-white text-urbik-black/70 shadow-md"
                  : activeFilter === "price"
                    ? "bg-white/70 border border-white text-urbik-black/70 shadow-md"
                    : "bg-white/70 border border-white text-urbik-black/70 hover:bg-gray-50 shadow-sm"
              }`}
            >
              <span className="text-sm md:text-md tracking-wider flex items-center justify-center">
                {minPrice || maxPrice
                  ? `${filterCurrency || ""}${minPrice ? ` ≥${Number(minPrice).toLocaleString("es-AR")}` : ""}${maxPrice ? ` ≤${Number(maxPrice).toLocaleString("es-AR")}` : ""}`
                  : "Precio"}
              </span>
              <ChevronDown size={16} strokeWidth={3} className={`hidden md:block w-4 h-4 transition-transform duration-200 ${activeFilter === "price" ? "rotate-180" : ""}`} />
            </button>

            {activeFilter === "price" && (
              <div className="absolute top-full left-0 md:right-0 md:left-auto mt-3 z-[999] w-80 rounded-2xl border border-gray-200 bg-white text-urbik-black/70 shadow-xl p-5">
                <PriceFilterCard
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  currency={filterCurrency || ""}
                  operationType={filterOperation}
                  propertyType={filterType}
                  onChangeMin={setMinPrice}
                  onChangeMax={setMaxPrice}
                  onChangeCurrency={setFilterCurrency}
                />
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveFilter((v) => (v === "rooms" ? null : "rooms"))}
              className={`h-10 cursor-pointer px-3 md:px-5 py-2 rounded-full tracking-wide transition-colors duration-200 flex items-center justify-center md:justify-between gap-2 min-w-10 md:min-w-[120px] font-bold ${
                filterRooms.length > 0 || filterBedrooms.length > 0 || filterBathrooms.length > 0
                  ? "bg-white/70 border border-white text-urbik-black/70 shadow-md"
                  : activeFilter === "rooms"
                    ? "bg-white/70 border border-white text-urbik-black/70 shadow-md"
                    : "bg-white/70 border border-white text-urbik-black/70 hover:bg-gray-50 shadow-sm"
              }`}
            >
              <span className="text-sm md:text-md tracking-wider flex items-center justify-center">
                {filterRooms[0]
                  ? `${filterRooms[0]} amb.`
                  : filterBedrooms[0]
                    ? `${filterBedrooms[0]} hab.`
                    : "Ambientes"}
              </span>
              <ChevronDown size={16} strokeWidth={3} className={`hidden md:block w-4 h-4 transition-transform duration-200 ${activeFilter === "rooms" ? "rotate-180" : ""}`} />
            </button>

            {activeFilter === "rooms" && (
              <div className="absolute top-full right-0 mt-3 z-[999] w-80 rounded-2xl border border-gray-200 bg-white text-urbik-black/70 shadow-xl p-5">
                <RoomsFilterCard
                  rooms={filterRooms}
                  bedrooms={filterBedrooms}
                  bathrooms={filterBathrooms}
                  onChange={handleRoomsChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-urbik-g200 rounded-2xl">
          <p className="text-urbik-muted font-bold text-lg">
            {properties.length === 0 
                ? "Esta inmobiliaria aún no tiene propiedades publicadas." 
                : "No hay propiedades que coincidan con los filtros aplicados."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property, index) => (
            <Link
              key={property.id}
              href={`/property/${property.id}`}
              className={`group flex flex-col gap-4 p-4 cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] animate-fade-in-up relative ${glassCard}`}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "both"
              }}
            >
              <div className="relative h-64 md:h-72 w-full overflow-hidden rounded-t-2xl bg-urbik-g200">
                {property.images?.[0] ? (
                  <Image
                    src={property.images[0]}
                    alt={property.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105 [mask-image:linear-gradient(to_bottom,black_52%,transparent_95%)] [-webkit-mask-image:linear-gradient(to_bottom,black_52%,transparent_95%)]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-white text-xs font-bold text-black/70">
                    <Building2 size={36} className="text-urbik-g400" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between min-w-0 z-10">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/20 bg-urbik-black/80 px-3 py-1 text-xs font-bold text-white uppercase shadow-sm z-1">
                      {PROPERTY_LABELS[property.type] ?? property.type}
                    </span>
                    <span className="rounded-full border border-white/20 bg-urbik-black/80 px-3 py-1 text-xs font-bold text-white uppercase shadow-sm z-1">
                      {OPERATION_LABELS[property.operation_type] ?? property.operation_type}
                    </span>
                  </div>

                  <h3 className="line-clamp-2 text-base font-black tracking-tight text-urbik-black">
                    {property.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-urbik-black/70 line-clamp-2 leading-snug">
                    {property.description}
                  </p>
                  <p className="mt-2 flex items-center gap-1 truncate text-xs font-semibold text-urbik-black/80">
                    <MapPin size={12} className="shrink-0 text-urbik-cyan" />
                    {property.address}, {property.city}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-white/60 pt-4">
                  <span className="text-base font-black tracking-tight text-urbik-black/70 z-1">
                    {formatPrice(
                      property.sale_price || property.rent_price || null,
                      property.sale_currency || property.rent_currency || null
                    )}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}