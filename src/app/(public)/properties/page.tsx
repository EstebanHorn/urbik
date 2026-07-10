"use client";

export const dynamic = "force-dynamic";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import DesktopSearchFilterBar from "@/components/search/DesktopSearchFilterBar";
import MobileSearchFilterBar from "@/components/search/MobileSearchFilterBar";
import {
  appendFiltersToApiQuery,
  applyFiltersToParams,
  areFiltersEqual,
  parseFiltersFromQuery,
  type FilterState,
} from "@/utils/propertyFilters";
import {
  getOperationLabel,
  getTypeLabel,
  glassCard,
  type SearchProperty,
} from "@/app/(public)/page";

const PAGE_SIZE = 24;

const RoomIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
    <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
    <path d="M12 3v6"/>
  </svg>
);

const BathIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>
    <line x1="10" x2="8" y1="5" y2="7"/>
    <line x1="2" x2="22" y1="12" y2="12"/>
    <line x1="7" x2="7" y1="19" y2="21"/>
    <line x1="17" x2="17" y1="19" y2="21"/>
  </svg>
);

const AreaIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 3h6v6"/>
    <path d="M9 21H3v-6"/>
    <path d="M21 3l-7 7"/>
    <path d="M3 21l7-7"/>
  </svg>
);

const FeaturePill = ({ icon: Icon, value, unit }: { icon: any, value: number | string, unit: string }) => (
  <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 border border-black/50 transition-colors group-hover:border-black ">
    <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-geora-black/50 group-hover:text-geora-black" />
    <span className="text-[11px] sm:text-sm text-geora-black/50 group-hover:text-geora-black">
      <strong className="font-bold text-geora-black/50 group-hover:text-geora-black">{value}</strong> {unit}
    </span>
  </div>
);

function PropertyFeatures({ property }: { property: SearchProperty }) {
  const propertyType = property.type?.toUpperCase() || "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {propertyType !== "TERRENO" && propertyType !== "LOTE" && propertyType !== "COCHERA" && propertyType !== "LOCAL" && propertyType !== "OFICINA" && (
        <FeaturePill icon={RoomIcon} value={property.bedrooms || 0} unit="hab" />
      )}

      {propertyType !== "TERRENO" && propertyType !== "LOTE" && propertyType !== "COCHERA" && (
        <FeaturePill icon={BathIcon} value={property.bathrooms || 0} unit="ba" />
      )}

      <FeaturePill icon={AreaIcon} value={property.area || 0} unit="m²" />
    </div>
  );
}

function PropertyCard({ property }: { property: SearchProperty }) {
  const price = property.salePrice ?? property.rentPrice ?? 0;
  const currency = property.saleCurrency ?? property.rentCurrency ?? "ARS";

  return (
    <Link
      href={`/property/${property.id}`}
      className={`group flex flex-col md:flex-row gap-4 p-3 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl rounded-2xl md:rounded-[24px] ${glassCard || "bg-white border border-slate-200"}`}
    >
      <div className="relative h-48 md:h-auto md:min-h-[220px] overflow-hidden rounded-l-xl md:rounded-l-[18px] w-full md:w-[340px] shrink-0">
        {property.images?.[0] ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100 text-xs font-bold text-gray-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between px-2 pb-2 md:py-3 md:pr-4 z-10">
        <div className="min-w-0">
          <div className="mb-2 md:mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-geora-white2 group-hover:bg-geora-black px-2 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider text-geora-black/80">
              {getTypeLabel(property.type)} en {getOperationLabel(property.operationType)}
            </span>
          </div>
          
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-lg sm:text-xl md:text-2xl font-black tracking-tight text-geora-black">
              {property.title}
            </h3>
            {property.agencyLogo && (
              <div className="h-12 w-12 md:h-18 md:w-18 shrink-0 overflow-hidden z-1">
                <img
                  src={property.agencyLogo}
                  alt="Logo Inmobiliaria"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          <p className="mt-1 md:mt-2 truncate text-xs sm:text-sm font-medium text-geora-black/50">
            {property.displayAddress || property.address}, {property.city}, {property.province}
          </p>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-black/5">
          <PropertyFeatures property={property} />

          <div className="flex items-center gap-3">
            <div className="text-xl font-black tracking-tight md:text-3xl text-geora-black">
              {currency} {Number(price).toLocaleString("es-AR")}
            </div>
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-geora-black transition-colors duration-300 group-hover:bg-geora-black group-hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PromotedPropertyCard({ property }: { property: SearchProperty }) {
  const price = property.salePrice ?? property.rentPrice ?? 0;
  const currency = property.saleCurrency ?? property.rentCurrency ?? "ARS";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, filter: "blur(8px)", scale: 0.95 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      exit={{ opacity: 0, filter: "blur(8px)", scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <Link
        href={`/property/${property.id}`}
        className="group relative flex flex-col md:flex-row items-center gap-6 overflow-hidden rounded-[30px] bg-transparent p-3 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="relative h-auto min-h-[140px] sm:h-48 md:h-80 overflow-hidden rounded-[20px] w-full md:w-1/3 shrink-0">
          {property.images?.[0] ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-100 text-xs font-bold text-slate-500">
              Sin imagen
            </div>
          )}
          <div className="absolute top-4 left-4 rounded-full bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-geora-black/60 shadow-lg">
            Propiedad Patrocinada
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center p-4 md:p-6 min-w-0 z-10 w-full">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-black/10 bg-geora-black px-3 py-1 text-xs font-bold text-white uppercase shadow-sm z-1">
              {getTypeLabel(property.type)} en {getOperationLabel(property.operationType)}
            </span>
            <span className="rounded-full border border-emerald-200  text-geora-emerald px-3 py-1 text-xs font-bold uppercase shadow-sm z-1">
              OPORTUNIDAD
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <h3 className="line-clamp-2 text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-geora-black/90 z-1">
              {property.title}
            </h3>
            {property.agencyLogo && (
              <div className="h-14 w-14 md:h-20 md:w-20 shrink-0 overflow-hidden z-1">
                <img
                  src={property.agencyLogo}
                  alt="Logo Inmobiliaria"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          <p className="mt-2 truncate text-sm font-medium text-geora-black/50 z-1">
            {property.address}, {property.city}, {property.province}
          </p>

          <div className="mt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-6 border-t border-black/5">
            <PropertyFeatures property={property} />

            <div className="flex items-center gap-4">
              <div className="text-2xl font-black tracking-tight md:text-4xl text-geora-black">
                {currency} {Number(price).toLocaleString("es-AR")}
              </div>
              <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-black/5 text-geora-black transition-colors duration-300 group-hover:bg-geora-black group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function PropertiesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const skipUrlSync = useRef(true);

  const [items, setItems] = useState<SearchProperty[]>([]);
  const [premiumProperty, setPremiumProperty] = useState<SearchProperty | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const initialPage = Math.max(
    1,
    Number.parseInt(searchParams.get("page") || "1", 10) || 1,
  );
  const [page, setPage] = useState(initialPage);

  const [filters, setFilters] = useState<FilterState>(() =>
    parseFiltersFromQuery(new URLSearchParams(searchParams.toString())),
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const nextFilters = parseFiltersFromQuery(params);
    const nextPage = Math.max(
      1,
      Number.parseInt(params.get("page") || "1", 10) || 1,
    );

    setFilters((prev) =>
      areFiltersEqual(prev, nextFilters) ? prev : nextFilters,
    );
    setPage((prev) => (prev === nextPage ? prev : nextPage));
    skipUrlSync.current = true;
  }, [searchParams]);

  const syncUrl = useCallback(
    (nextFilters: FilterState, nextPage: number) => {
      const paramsWithFilters = applyFiltersToParams(
        new URLSearchParams(searchParams.toString()),
        nextFilters,
      );
      paramsWithFilters.set("page", String(nextPage));

      const nextQuery = paramsWithFilters.toString();
      if (nextQuery === searchParams.toString()) return;

      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (skipUrlSync.current) {
      skipUrlSync.current = false;
      return;
    }
    syncUrl(filters, page);
  }, [filters, page, syncUrl]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      appendFiltersToApiQuery(query, filters);

      const res = await fetch(`/api/properties/search?${query.toString()}`);
      if (!res.ok) {
        setItems([]);
        setPremiumProperty(null);
        setTotal(0);
        setTotalPages(1);
        return;
      }

      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      

      setPremiumProperty(data.premiumProperty || (data.items && data.items.length > 0 ? data.items[0] : null));
    } catch (error) {
      console.error("Error cargando el listado:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchData();
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-white">
      <DesktopSearchFilterBar />
      <MobileSearchFilterBar />

      <div className="mx-auto w-full max-w-7xl px-4 pt-32 pb-24 md:px-8 md:pt-[152px] md:pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-geora-black/80">
              Listado de propiedades
            </h1>
            <span className="text-sm text-geora-black/50">
              {isLoading ? "Buscando..." : `${total} propiedades encontradas`}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-6 ">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-[220px] rounded-2xl md:rounded-[24px] border border-slate-200 bg-slate-50 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[24px] border border-slate-200 p-10 text-center text-sm font-semibold text-slate-500">
            No se encontraron propiedades con esos filtros.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {items.map((property, index) => {
              const normalCard = <PropertyCard key={property.id} property={property} />;

              if ((index + 1) % 5 === 0 && premiumProperty) {
                return (
                  <React.Fragment key={`wrapper-${property.id}`}>
                    {normalCard}
                    <PromotedPropertyCard property={premiumProperty} />
                  </React.Fragment>
                );
              }

              return normalCard;
            })}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="rounded-full border border-slate-200 bg-white px-4 md:px-5 py-2 text-[10px] md:text-xs font-black tracking-wide text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-30"
          >
            Anterior
          </button>
          <span className="text-[10px] md:text-xs font-bold tracking-wide text-slate-500">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="rounded-full border border-slate-200 bg-white px-4 md:px-5 py-2 text-[10px] md:text-xs font-black tracking-wide text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-30"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}