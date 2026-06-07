"use client";

export const dynamic = "force-dynamic";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

import { useSearch, type SearchSuggestion } from "@/hooks/useSearch";
import {
  appendFiltersToApiQuery,
  applyFiltersToParams,
  areFiltersEqual,
  DEFAULT_FILTERS,
  parseFiltersFromQuery,
  type AmenityFlagKey,
  type FilterState,
} from "@/utils/propertyFilters";

import Banner from "@/components/home/banner";
import Top3 from "@/components/home/top3";
import MiniBanner from "@/components/home/minibanner";
import List from "@/components/home/list";
import PriceFilterCard from "@/components/search/PriceFilterCard";
import RoomsFilterCard from "@/components/search/RoomsFilterCard";

export type ViewMode = "list" | "grid";

export type SearchProperty = {
  id: string;
  title: string;
  salePrice: number | null;
  saleCurrency: string | null;
  rentPrice: number | null;
  rentCurrency: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string;
  province: string;
  operationType: string;
  type: string;
  images: string[];
  address: string;
  rooms: number | null;
  bathrooms: number | null;
  area: number | null;
  hasWater: boolean;
  hasElectricity: boolean;
  hasGas: boolean;
  hasInternet: boolean;
  hasParking: boolean;
  hasPool: boolean;
  hasBalcony: boolean;
  hasGrill: boolean;
  hasGarden: boolean;
  hasLaundry: boolean;
  hasAirConditioning: boolean;
};

type ParsedSearchFilters = {
  propertyType: string | null;
  operationType: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  city: string | null;
  province: string | null;
  rooms: number | null;
  bathrooms: number | null;
  amenities: Partial<Record<AmenityFlagKey, boolean>>;
};

const PAGE_SIZE_DEFAULT = 24;

export function getOperationLabel(type: string) {
  switch (type) {
    case "SALE":
      return "Venta";
    case "RENT":
      return "Alquiler";
    case "TEMP_RENT":
      return "Temporal";
    case "SALE_RENT":
      return "Venta y Alquiler";
    default:
      return type;
  }
}

export function getTypeLabel(type: string) {
  switch (type) {
    case "HOUSE":
      return "Casa";
    case "APARTMENT":
      return "Departamento";
    case "PH":
      return "PH";
    case "COUNTRY":
      return "Country";
    case "LAND":
      return "Terreno";
    case "FIELD":
      return "Campo";
    case "BUSINESS_BACKGROUND":
      return "Fondo de comercio";
    case "GARAGE":
      return "Cochera";
    case "WAREHOUSE":
      return "Galpón";
    case "DEVELOPMENT":
      return "Desarrollo";
    case "COMMERCIAL_PROPERTY":
      return "Local";
    case "OFFICE":
      return "Oficina";
    default:
      return type;
  }
}

export const glassCard =
  "relative overflow-hidden md:rounded-[30px] rounded-3xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[30px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showAuthOverlay, setShowAuthOverlay] = useState(
    searchParams.get("fromAuth") === "true"
  );

  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [items, setItems] = useState<SearchProperty[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const skipUrlSync = useRef(true);
  const parsedQueryRef = useRef("");
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  const initialPage = Math.max(
    1,
    Number.parseInt(searchParams.get("page") || "1", 10) || 1,
  );
  const initialPageSize = Math.min(
    50,
    Math.max(
      1,
      Number.parseInt(
        searchParams.get("pageSize") || String(PAGE_SIZE_DEFAULT),
        10,
      ) || PAGE_SIZE_DEFAULT,
    ),
  );
  const initialView = searchParams.get("view") === "grid" ? "grid" : "list";

  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);

  const [filters, setFilters] = useState<FilterState>(() =>
    parseFiltersFromQuery(new URLSearchParams(searchParams.toString())),
  );

  const isSearchMode = !areFiltersEqual(filters, DEFAULT_FILTERS);

  const {
    setQuery: setSearchQuery,
    suggestions: autoSuggestions,
    isLoading: autoLoading,
  } = useSearch();

  useEffect(() => {
    if (showAuthOverlay) {
      document.documentElement.style.backgroundColor = "#0a0a0a";
      document.body.style.backgroundColor = "#0a0a0a";

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("fromAuth");
      window.history.replaceState({}, '', newUrl.toString());

      const timer = setTimeout(() => {
        setShowAuthOverlay(false);
        document.documentElement.style.backgroundColor = "";
        document.body.style.backgroundColor = "";
      }, 900);
      
      return () => {
        clearTimeout(timer);
        document.documentElement.style.backgroundColor = "";
        document.body.style.backgroundColor = "";
      };
    }
  }, [showAuthOverlay]);

  useEffect(() => {
    setSearchQuery(filters.q);
  }, [filters.q, setSearchQuery]);

  const lat = useMemo(() => {
    const raw = searchParams.get("lat");
    if (!raw) return undefined;
    const parsed = Number.parseFloat(raw);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, [searchParams]);

  const lon = useMemo(() => {
    const raw = searchParams.get("lon");
    if (!raw) return undefined;
    const parsed = Number.parseFloat(raw);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, [searchParams]);

  const radius = useMemo(() => searchParams.get("radius"), [searchParams]);

  useEffect(() => {
    if (lat !== undefined && lon !== undefined) return;
    if (typeof window === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        setUserCoords(null);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 },
    );
  }, [lat, lon]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const nextFilters = parseFiltersFromQuery(params);
    const nextPage = Math.max(
      1,
      Number.parseInt(params.get("page") || "1", 10) || 1,
    );
    const nextView: ViewMode = params.get("view") === "grid" ? "grid" : "list";

    setFilters((prev) =>
      areFiltersEqual(prev, nextFilters) ? prev : nextFilters,
    );
    setPage((prev) => (prev === nextPage ? prev : nextPage));
    setViewMode((prev) => (prev === nextView ? prev : nextView));
    skipUrlSync.current = true;
  }, [searchParams]);

  const syncUrl = useCallback(
    (nextFilters: FilterState, nextPage: number, nextView: ViewMode) => {
      const paramsWithFilters = applyFiltersToParams(
        new URLSearchParams(searchParams.toString()),
        nextFilters,
      );
      paramsWithFilters.set("page", String(nextPage));
      paramsWithFilters.set("pageSize", String(pageSize));
      paramsWithFilters.set("view", nextView);

      const nextQuery = paramsWithFilters.toString();
      if (nextQuery === searchParams.toString()) return;

      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    },
    [pageSize, pathname, router, searchParams],
  );

  useEffect(() => {
    if (skipUrlSync.current) {
      skipUrlSync.current = false;
      return;
    }
    syncUrl(filters, page, viewMode);
  }, [filters, page, syncUrl, viewMode]);

  useEffect(() => {
    const query = filters.q.trim();
    if (!query) {
      parsedQueryRef.current = "";
      return;
    }
    if (parsedQueryRef.current === query) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search/parse?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;

        const data = await response.json();
        const parsed = data.parsed as ParsedSearchFilters;
        parsedQueryRef.current = query;

        setFilters((prev) => {
          if (prev.q.trim() !== query) return prev;
          const next: FilterState = { ...prev };

          if (parsed.propertyType) next.propertyType = parsed.propertyType;
          if (parsed.operationType) next.operationType = parsed.operationType;
          if (parsed.minPrice) next.minPrice = String(parsed.minPrice);
          if (parsed.maxPrice) next.maxPrice = String(parsed.maxPrice);
          if (parsed.city) next.city = parsed.city;
          if (parsed.province) next.province = parsed.province;
          if (parsed.rooms) next.bedrooms = [String(parsed.rooms)];
          if (parsed.bathrooms) next.bathrooms = [String(parsed.bathrooms)];

          if (parsed.amenities) {
            Object.entries(parsed.amenities).forEach(([key, value]) => {
              if (value === true) (next as Record<string, unknown>)[key] = true;
            });
          }

          if (areFiltersEqual(prev, next)) return prev;
          setPage(1);
          return next;
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Error parseando filtros de texto:", error);
      }
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [filters.q]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      appendFiltersToApiQuery(query, filters);

      if (typeof lat === "number") query.set("lat", String(lat));
      if (typeof lon === "number") query.set("lon", String(lon));
      if (radius) query.set("radius", radius);

      const res = await fetch(`/api/properties/search?${query.toString()}`);
      if (!res.ok) {
        setItems([]);
        setTotal(0);
        setTotalPages(1);
        return;
      }

      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error cargando resultados:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, lat, lon, page, pageSize, radius]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchData();
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [fetchData]);

  const handleRoomsChange = useCallback(
    (field: "rooms" | "bedrooms" | "bathrooms", value: string | null) => {
      setFilters((prev) => ({ ...prev, [field]: value ? [value] : [] }));
      setPage(1);
    },
    [],
  );

  const premiumProperty = useMemo(() => {
    if (items.length === 0) return null;
    return [...items].sort((a, b) => {
      const scoreA = [
        a.hasPool,
        a.hasGarden,
        a.hasGrill,
        a.hasBalcony,
        a.hasAirConditioning,
        a.hasParking,
      ].filter(Boolean).length;
      const scoreB = [
        b.hasPool,
        b.hasGarden,
        b.hasGrill,
        b.hasBalcony,
        b.hasAirConditioning,
        b.hasParking,
      ].filter(Boolean).length;
      if (scoreA !== scoreB) return scoreB - scoreA;
      const priceA = a.salePrice ?? a.rentPrice ?? 0;
      const priceB = b.salePrice ?? b.rentPrice ?? 0;
      return priceB - priceA;
    })[0];
  }, [items]);

  return (
    <div className="min-h-screen bg-white relative">
      
      {/* OVERLAY DE TRANSICIÓN DESDE LOGIN */}
      {showAuthOverlay && (
        <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] overflow-hidden pointer-events-none animate-reveal-up">
          <style>{`
            @keyframes revealUp {
              0% { transform: translateY(0); }
              100% { transform: translateY(-100vh); }
            }
            .animate-reveal-up {
              animation: revealUp 0.8s cubic-bezier(0.7, 0, 0.3, 1) 0.1s both;
            }
          `}</style>
        </div>
      )}

      <div className="mx-auto w-full overflow-x-hidden">
        <div className="relative flex min-h-[800px] flex-col items-start gap-4 lg:flex-row">
          <main className="flex-1 min-w-0 w-full">
            {!isSearchMode && <Banner items={items} />}
            <section className="max-w-7xl w-full mx-auto px-4 md:px-8 mt-10">
              <div className="mt-10 md:mt-40 mb-5 ml-0 md:ml-10 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl text-urbik-black/80 font-black">
                  Propiedades Destacadas
                </h1>
                <span className="text-urbik-black/50 text-sm md:text-base">
                  Las mejores oportunidades del mercado seleccionadas para vos.
                </span>
              </div>

              <div className="mb-6 ml-0 md:ml-10">
                <button
                  type="button"
                  onClick={() => setShowFilters((v) => !v)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-sm font-bold text-slate-700 shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  <SlidersHorizontal size={15} />
                  Filtros
                  {(filters.minPrice ||
                    filters.maxPrice ||
                    filters.rooms.length > 0 ||
                    filters.bedrooms.length > 0 ||
                    filters.bathrooms.length > 0) && (
                    <span className="h-5 w-5 flex items-center justify-center rounded-full bg-urbik-cyan text-[10px] font-black text-white">
                      ●
                    </span>
                  )}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`}
                  />
                </button>

                {showFilters && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
                    <PriceFilterCard
                      minPrice={filters.minPrice}
                      maxPrice={filters.maxPrice}
                      currency={filters.currency}
                      operationType={filters.operationType}
                      propertyType={filters.propertyType}
                      onChangeMin={(v) => {
                        setFilters((prev) => ({ ...prev, minPrice: v }));
                        setPage(1);
                      }}
                      onChangeMax={(v) => {
                        setFilters((prev) => ({ ...prev, maxPrice: v }));
                        setPage(1);
                      }}
                      onChangeCurrency={(v) => {
                        setFilters((prev) => ({ ...prev, currency: v }));
                        setPage(1);
                      }}
                    />
                    <div className="md:border-l md:border-slate-200/60 md:pl-6">
                      <RoomsFilterCard
                        rooms={filters.rooms}
                        bedrooms={filters.bedrooms}
                        bathrooms={filters.bathrooms}
                        onChange={handleRoomsChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`${glassCard} h-36 animate-pulse`}
                    />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div
                  className={`${glassCard} p-10 text-center text-sm font-semibold text-slate-500`}
                >
                  No se encontraron propiedades con esos filtros.
                </div>
              ) : (
                <>
                  <Top3
                    items={items}
                    setHoveredPropertyId={setHoveredPropertyId}
                  />
                  <div className="mt-10 md:mt-30 ml-0 md:ml-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl text-urbik-black/80 font-black">
                      Somos Urbik®
                    </h1>
                    <span className="text-urbik-black/50 text-sm md:text-base">
                      Una nueva forma de comprar y vender propiedades
                    </span>
                  </div>
                  <MiniBanner />
                  <div className="w-full h-10" />
                  <div className="mt-10 md:mt-20 mb-5 text-center md:text-right">
                    <h1 className="text-3xl md:text-4xl text-urbik-black/80 font-black">
                      Opciones listas para vos
                    </h1>
                    <span className="text-urbik-black/50 text-sm md:text-base">
                      Explorá todo nuestro catálogo de propiedades disponibles.
                    </span>
                  </div>
                  <List
                    items={items}
                    viewMode={viewMode}
                    premiumProperty={premiumProperty}
                    setHoveredPropertyId={setHoveredPropertyId}
                  />
                </>
              )}

              <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5 mb-10">
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
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className="rounded-full border border-slate-200 bg-white px-4 md:px-5 py-2 text-[10px] md:text-xs font-black tracking-wide text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-30"
                >
                  Siguiente
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}