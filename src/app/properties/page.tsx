"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CustomDropdown } from "@/components/CustomDropdown";
import LocationSelectors from "@/components/LocationSelectors";
import {
  appendFiltersToApiQuery,
  applyFiltersToParams,
  areFiltersEqual,
  DEFAULT_FILTERS,
  parseFiltersFromQuery,
  type AmenityFlagKey,
  type FilterState,
} from "@/features/search/utils/propertyFilters";
import {
  Building2,
  Car,
  Droplets,
  Flame,
  Grid3X3,
  List,
  Search,
  Shirt,
  SlidersHorizontal,
  Trees,
  UtensilsCrossed,
  Waves,
  Wifi,
  Wind,
  Zap,
} from "lucide-react";

const PreviewMap = dynamic(
  () => import("@/features/properties/components/PropertiesPreviewMap"),
  { ssr: false },
);

type ViewMode = "list" | "grid";

type SearchProperty = {
  id: number;
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

const AMENITIES_CONFIG: Array<{
  id: AmenityFlagKey;
  label: string;
  icon: React.ElementType;
}> = [
  { id: "hasElectricity", label: "Luz", icon: Zap },
  { id: "hasGas", label: "Gas", icon: Flame },
  { id: "hasInternet", label: "Internet", icon: Wifi },
  { id: "hasParking", label: "Cochera", icon: Car },
  { id: "hasPool", label: "Pileta", icon: Waves },
  { id: "hasWater", label: "Agua", icon: Droplets },
  { id: "hasBalcony", label: "Balcón", icon: Building2 },
  { id: "hasGrill", label: "Parrilla", icon: UtensilsCrossed },
  { id: "hasGarden", label: "Jardín", icon: Trees },
  { id: "hasLaundry", label: "Lavadero", icon: Shirt },
  { id: "hasAirConditioning", label: "Aire", icon: Wind },
];

const PAGE_SIZE_DEFAULT = 24;

function getOperationLabel(type: string) {
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

function getTypeLabel(type: string) {
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

export default function PropertiesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showFiltersMenu, setShowFiltersMenu] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(
    null,
  );
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
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 120000,
      },
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
          {
            signal: controller.signal,
          },
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
              if (value === true) {
                (next as Record<string, unknown>)[key] = true;
              }
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

      // Solo aplicar filtro geográfico si viene explícito en URL.
      // La ubicación del navegador se usa para centrar el mini mapa, no para recortar resultados.
      if (typeof lat === "number") query.set("lat", String(lat));
      if (typeof lon === "number") query.set("lon", String(lon));
      if (searchParams.get("radius"))
        query.set("radius", searchParams.get("radius") as string);

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
  }, [filters, lat, lon, page, pageSize, searchParams]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchData();
    }, 180);
    return () => window.clearTimeout(timeoutId);
  }, [fetchData]);

  const toggleMultiValue = (key: "bedrooms" | "bathrooms", value: string) => {
    setPage(1);
    setFilters((prev) => {
      const exists = prev[key].includes(value);
      return {
        ...prev,
        [key]: exists
          ? prev[key].filter((item) => item !== value)
          : [...prev[key], value],
      };
    });
  };

  const toggleAmenity = (key: AmenityFlagKey) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPage(1);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResolveLocation = async () => {
    const locationQuery = [filters.city, filters.province]
      .filter(Boolean)
      .join(", ");
    if (!locationQuery.trim()) return;

    setIsSearchingLocation(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(locationQuery)}`,
      );
      const data = await response.json();
      const firstAddress = (data.suggestions || []).find(
        (item: { type?: string; lat?: number; lon?: number }) =>
          item.type === "ADDRESS" && item.lat && item.lon,
      );

      if (firstAddress) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", String(firstAddress.lat));
        params.set("lon", String(firstAddress.lon));
        params.set("zoom", "13");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const clearFilters = () => {
    setPage(1);
    setFilters(DEFAULT_FILTERS);
  };

  const mapHref = useMemo(() => {
    const params = applyFiltersToParams(
      new URLSearchParams(searchParams.toString()),
      filters,
    );
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    params.set("view", viewMode);
    const effectiveLat = typeof lat === "number" ? lat : userCoords?.lat;
    const effectiveLon = typeof lon === "number" ? lon : userCoords?.lon;
    if (typeof effectiveLat === "number")
      params.set("lat", String(effectiveLat));
    if (typeof effectiveLon === "number")
      params.set("lon", String(effectiveLon));
    return `/map?${params.toString()}`;
  }, [filters, lat, lon, page, pageSize, searchParams, userCoords, viewMode]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFiltersMenu((prev) => !prev)}
              className="h-10 px-4 rounded-full border border-black/50 text-[11px] font-bold bg-white inline-flex items-center gap-2"
            >
              <SlidersHorizontal size={14} /> Filtros
            </button>

            <CustomDropdown
              label="Operación"
              variant="white2"
              value={filters.operationType}
              onChange={(val) => {
                setPage(1);
                setFilters((f) => ({ ...f, operationType: val }));
              }}
              options={[
                { label: "Operación", value: "" },
                { label: "Venta", value: "SALE" },
                { label: "Alquiler", value: "RENT" },
                { label: "Temporal", value: "TEMP_RENT" },
                { label: "Venta y Alquiler", value: "SALE_RENT" },
              ]}
            />

            <CustomDropdown
              label="Tipo"
              variant="white2"
              value={filters.propertyType}
              onChange={(val) => {
                setPage(1);
                setFilters((f) => ({ ...f, propertyType: val }));
              }}
              options={[
                { label: "Tipo", value: "" },
                { label: "Casa", value: "HOUSE" },
                { label: "Departamento", value: "APARTMENT" },
                { label: "Local", value: "COMMERCIAL_PROPERTY" },
                { label: "PH", value: "PH" },
                { label: "Terreno", value: "LAND" },
                { label: "Campo", value: "FIELD" },
                { label: "Fondo de comercio", value: "BUSINESS_BACKGROUND" },
                { label: "Oficina", value: "OFFICE" },
                { label: "Cochera", value: "GARAGE" },
                { label: "Galpón", value: "WAREHOUSE" },
                { label: "Desarrollo", value: "DEVELOPMENT" },
                { label: "Country", value: "COUNTRY" },
              ]}
            />

            <div className="w-full md:w-[340px]">
              <LocationSelectors
                provinceValue={filters.province}
                cityValue={filters.city}
                onChange={(name, val) => {
                  setPage(1);
                  if (name === "province") {
                    setFilters((prev) => ({
                      ...prev,
                      province: val,
                      city: "",
                    }));
                  }
                  if (name === "city") {
                    setFilters((prev) => ({ ...prev, city: val }));
                  }
                }}
              />
            </div>

            <div className="relative w-full md:w-[240px]">
              <input
                type="text"
                name="q"
                value={filters.q}
                onChange={handleInputChange}
                placeholder="Zona, calle o barrio"
                className="h-10 w-full rounded-full border border-black/50 px-4 text-xs font-semibold"
              />
            </div>

            <button
              type="button"
              onClick={handleResolveLocation}
              disabled={isSearchingLocation}
              className="h-10 px-4 rounded-full border border-urbik-emerald text-[11px] font-bold bg-urbik-emerald text-urbik-black inline-flex items-center gap-2"
            >
              <Search size={14} />{" "}
              {isSearchingLocation ? "Buscando..." : "Ir a ubicación"}
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="h-10 px-4 rounded-full border border-black/20 text-[11px] font-bold bg-white"
            >
              Limpiar
            </button>

            <Link
              href={mapHref}
              className="ml-auto h-10 px-4 rounded-full bg-urbik-black text-white text-[11px] font-bold inline-flex items-center"
            >
              Abrir mapa completo
            </Link>
          </div>

          {showFiltersMenu && (
            <div className="mt-3 border-t border-slate-200 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <CustomDropdown
                  label="Moneda"
                  variant="white2"
                  value={filters.currency}
                  onChange={(val) => {
                    setPage(1);
                    setFilters((f) => ({ ...f, currency: val }));
                  }}
                  options={[
                    { label: "Moneda", value: "" },
                    { label: "USD", value: "USD" },
                    { label: "ARS", value: "ARS" },
                  ]}
                />

                <input
                  type="number"
                  name="minPrice"
                  placeholder="Mín $"
                  value={filters.minPrice}
                  onChange={handleInputChange}
                  className="h-10 w-24 rounded-full border border-black/50 px-3 text-[11px] font-bold"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Máx $"
                  value={filters.maxPrice}
                  onChange={handleInputChange}
                  className="h-10 w-24 rounded-full border border-black/50 px-3 text-[11px] font-bold"
                />

                <div className="flex items-center gap-1 border border-black/50 rounded-full px-2 h-10 bg-white">
                  <span className="text-[10px] font-bold text-urbik-black/70">
                    Dorm
                  </span>
                  {["1", "2", "3", "4+"].map((value) => {
                    const isActive = filters.bedrooms.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleMultiValue("bedrooms", value)}
                        className={`px-2 py-1 text-[10px] rounded-full border ${
                          isActive
                            ? "bg-urbik-emerald text-white border-urbik-emerald"
                            : "border-slate-300 text-urbik-black/70"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1 border border-black/50 rounded-full px-2 h-10 bg-white">
                  <span className="text-[10px] font-bold text-urbik-black/70">
                    Baños
                  </span>
                  {["1", "2", "3", "4+"].map((value) => {
                    const isActive = filters.bathrooms.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleMultiValue("bathrooms", value)}
                        className={`px-2 py-1 text-[10px] rounded-full border ${
                          isActive
                            ? "bg-urbik-emerald text-white border-urbik-emerald"
                            : "border-slate-300 text-urbik-black/70"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="number"
                  name="minArea"
                  placeholder="Mín m²"
                  value={filters.minArea}
                  onChange={handleInputChange}
                  className="h-10 w-24 rounded-full border border-black/50 px-3 text-[11px] font-bold"
                />
                <input
                  type="number"
                  name="maxArea"
                  placeholder="Máx m²"
                  value={filters.maxArea}
                  onChange={handleInputChange}
                  className="h-10 w-24 rounded-full border border-black/50 px-3 text-[11px] font-bold"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-200 pt-3">
                {AMENITIES_CONFIG.map((amenity) => {
                  const Icon = amenity.icon;
                  const isActive = filters[amenity.id];
                  return (
                    <button
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[10px] font-bold transition-all ${
                        isActive
                          ? "bg-urbik-emerald text-white border-urbik-emerald"
                          : "bg-white text-urbik-black/60 border-slate-300"
                      }`}
                    >
                      <Icon size={12} /> {amenity.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <h2 className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">
              Vista previa de mapa
            </h2>
            <PreviewMap
              properties={items}
              lat={typeof lat === "number" ? lat : userCoords?.lat}
              lon={typeof lon === "number" ? lon : userCoords?.lon}
              hoveredPropertyId={hoveredPropertyId}
              onHoverProperty={setHoveredPropertyId}
            />
            <Link
              href={mapHref}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-urbik-black px-4 py-2 text-xs font-bold text-white"
            >
              Ir al mapa
            </Link>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-black text-slate-900">
                {total.toLocaleString("es-AR")} propiedades
              </h1>

              <div className="ml-auto inline-flex rounded-full border border-slate-200 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1 ${
                    viewMode === "list"
                      ? "bg-slate-900 text-white"
                      : "text-slate-500"
                  }`}
                >
                  <List size={14} /> Lista
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1 ${
                    viewMode === "grid"
                      ? "bg-slate-900 text-white"
                      : "text-slate-500"
                  }`}
                >
                  <Grid3X3 size={14} /> Cuadrícula
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-32 animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm font-semibold text-slate-500">
                No se encontraron propiedades con esos filtros.
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-3 md:grid-cols-2"
                    : "flex flex-col gap-3"
                }
              >
                {items.map((property) => {
                  const price = property.salePrice ?? property.rentPrice ?? 0;
                  const currency =
                    property.saleCurrency ?? property.rentCurrency ?? "ARS";
                  return (
                    <Link
                      key={property.id}
                      href={`/property/${property.id}`}
                      onMouseEnter={() => setHoveredPropertyId(property.id)}
                      onMouseLeave={() =>
                        setHoveredPropertyId((current) =>
                          current === property.id ? null : current,
                        )
                      }
                      className={`group grid grid-cols-[120px_1fr] gap-3 rounded-xl border p-2 transition hover:shadow-sm ${
                        hoveredPropertyId === property.id
                          ? "border-emerald-500 ring-2 ring-emerald-200"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="h-24 overflow-hidden rounded-lg bg-slate-100">
                        {property.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-bold text-slate-400">
                            Sin imagen
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
                            {getTypeLabel(property.type)}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            {getOperationLabel(property.operationType)}
                          </span>
                        </div>

                        <h3 className="truncate text-sm font-black text-slate-900">
                          {property.title}
                        </h3>
                        <p className="truncate text-xs font-semibold text-slate-500">
                          {property.address}, {property.city},{" "}
                          {property.province}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">
                            {property.rooms || 0} amb ·{" "}
                            {property.bathrooms || 0} baños ·{" "}
                            {property.area || 0} m²
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            {currency} {Number(price).toLocaleString("es-AR")}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-bold disabled:opacity-30"
              >
                Anterior
              </button>

              <span className="text-xs font-bold text-slate-500">
                Página {page} de {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-bold disabled:opacity-30"
              >
                Siguiente
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
