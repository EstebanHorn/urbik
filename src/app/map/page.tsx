"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { PropertiesSidebar } from "@/features/map/components/PropertiesSidebar";
import type { MapBounds, MapProperty } from "@/features/map/types/types";
import { useMapSettings } from "@/features/map/context/MapSettingsProvider";
import { ZoneAnalysis } from "../../components/SmartZone/SmartArea";
import { ZoneData } from "../../features/map/components/MapEventsHandler";
import { CustomDropdown } from "../../components/CustomDropdown";
import LocationSelectors from "@/components/LocationSelectors";
import { mapBaseLayers, type BaseLayerId } from "@/features/map/config/baseLayers";
import {
  Map as MapIcon,
  List,
  X,
  Zap,
  Flame,
  Wifi,
  Car,
  Waves,
  Droplets,
  Building2,
  UtensilsCrossed,
  Trees,
  Shirt,
  Wind,
  Layers,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const InteractiveMap = dynamic(
  () =>
    import("../../features/map/components/InteractiveMapClient").then(
      (mod) => mod.InteractiveMapClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
        <span className="text-sm font-medium">Cargando mapa...</span>
      </div>
    ),
  },
);

type FilterState = {
  operationType: string;
  propertyType: string;
  currency: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string[];
  bathrooms: string[];
  minArea: string;
  maxArea: string;
  age: string;
  city: string;
  province: string;
  q: string;
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

interface RawProperty {
  salePrice?: number;
  rentPrice?: number;
  saleCurrency?: string;
  rentCurrency?: string;
  price?: number;
  hasWater?: boolean;
  hasElectricity?: boolean;
  hasGas?: boolean;
  hasInternet?: boolean;
  hasParking?: boolean;
  hasPool?: boolean;
  hasBalcony?: boolean;
  hasGrill?: boolean;
  hasGarden?: boolean;
  hasLaundry?: boolean;
  hasAirConditioning?: boolean;
  [key: string]: unknown;
}

type AmenityFlagKey =
  | "hasWater"
  | "hasElectricity"
  | "hasGas"
  | "hasInternet"
  | "hasParking"
  | "hasPool"
  | "hasBalcony"
  | "hasGrill"
  | "hasGarden"
  | "hasLaundry"
  | "hasAirConditioning";

interface AmenityConfig {
  id: AmenityFlagKey;
  label: string;
  icon: React.ElementType;
}

const AMENITIES_CONFIG: AmenityConfig[] = [
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

function parseFiltersFromQuery(params: URLSearchParams): FilterState {
  return {
    operationType: params.get("operationType") || "",
    propertyType: params.get("propertyType") || "",
    currency: params.get("currency") || "",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    bedrooms: params.getAll("bedrooms").length
      ? params.getAll("bedrooms")
      : params.get("rooms")
        ? [params.get("rooms") as string]
        : [],
    bathrooms: params.getAll("bathrooms"),
    minArea: params.get("minArea") || "",
    maxArea: params.get("maxArea") || "",
    age: params.get("age") || "",
    city: params.get("city") || "",
    province: params.get("province") || "",
    q: params.get("q") || "",
    hasWater: params.get("hasWater") === "true",
    hasElectricity: params.get("hasElectricity") === "true",
    hasGas: params.get("hasGas") === "true",
    hasInternet: params.get("hasInternet") === "true",
    hasParking: params.get("hasParking") === "true",
    hasPool: params.get("hasPool") === "true",
    hasBalcony: params.get("hasBalcony") === "true",
    hasGrill: params.get("hasGrill") === "true",
    hasGarden: params.get("hasGarden") === "true",
    hasLaundry: params.get("hasLaundry") === "true",
    hasAirConditioning: params.get("hasAirConditioning") === "true",
  };
}

function areFiltersEqual(a: FilterState, b: FilterState) {
  return (
    a.operationType === b.operationType &&
    a.propertyType === b.propertyType &&
    a.currency === b.currency &&
    a.minPrice === b.minPrice &&
    a.maxPrice === b.maxPrice &&
    a.minArea === b.minArea &&
    a.maxArea === b.maxArea &&
    a.age === b.age &&
    a.city === b.city &&
    a.province === b.province &&
    a.q === b.q &&
    a.hasWater === b.hasWater &&
    a.hasElectricity === b.hasElectricity &&
    a.hasGas === b.hasGas &&
    a.hasInternet === b.hasInternet &&
    a.hasParking === b.hasParking &&
    a.hasPool === b.hasPool &&
    a.hasBalcony === b.hasBalcony &&
    a.hasGrill === b.hasGrill &&
    a.hasGarden === b.hasGarden &&
    a.hasLaundry === b.hasLaundry &&
    a.hasAirConditioning === b.hasAirConditioning &&
    a.bedrooms.join("|") === b.bedrooms.join("|") &&
    a.bathrooms.join("|") === b.bathrooms.join("|")
  );
}

export default function MapPage() {
  const { propertiesLimit, baseLayer, setBaseLayer } = useMapSettings();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const boundsRef = useRef<MapBounds | null>(null);
  const skipUrlSync = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  const lastFetchKeyRef = useRef<string>("");

  const defaultLat = -34.92145;
  const defaultLon = -57.95453;
  const lat = searchParams.get("lat")
    ? parseFloat(searchParams.get("lat") as string)
    : defaultLat;
  const lon = searchParams.get("lon")
    ? parseFloat(searchParams.get("lon") as string)
    : defaultLon;

  const [properties, setProperties] = useState<MapProperty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);
  const [currentZone, setCurrentZone] = useState<ZoneData | null>(null);
  const [showFiltersMenu, setShowFiltersMenu] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const [filters, setFilters] = useState<FilterState>(() =>
    parseFiltersFromQuery(new URLSearchParams(searchParams.toString())),
  );

  useEffect(() => {
    const next = parseFiltersFromQuery(new URLSearchParams(searchParams.toString()));
    setFilters((prev) => (areFiltersEqual(prev, next) ? prev : next));
    skipUrlSync.current = true;
  }, [searchParams]);

  const syncFiltersToUrl = useCallback(
    (nextFilters: FilterState) => {
      const params = new URLSearchParams(searchParams.toString());
      const setOrDelete = (key: string, value: string) => {
        if (value?.trim()) params.set(key, value.trim());
        else params.delete(key);
      };

      setOrDelete("operationType", nextFilters.operationType);
      setOrDelete("propertyType", nextFilters.propertyType);
      setOrDelete("currency", nextFilters.currency);
      setOrDelete("minPrice", nextFilters.minPrice);
      setOrDelete("maxPrice", nextFilters.maxPrice);
      setOrDelete("minArea", nextFilters.minArea);
      setOrDelete("maxArea", nextFilters.maxArea);
      setOrDelete("age", nextFilters.age);
      setOrDelete("city", nextFilters.city);
      setOrDelete("province", nextFilters.province);
      setOrDelete("q", nextFilters.q);

      params.delete("bedrooms");
      params.delete("bathrooms");
      nextFilters.bedrooms.forEach((value) => params.append("bedrooms", value));
      nextFilters.bathrooms.forEach((value) => params.append("bathrooms", value));

      const boolKeys: AmenityFlagKey[] = [
        "hasWater",
        "hasElectricity",
        "hasGas",
        "hasInternet",
        "hasParking",
        "hasPool",
        "hasBalcony",
        "hasGrill",
        "hasGarden",
        "hasLaundry",
        "hasAirConditioning",
      ];

      boolKeys.forEach((key) => {
        if (nextFilters[key]) params.set(key, "true");
        else params.delete(key);
      });

      const nextQuery = params.toString();
      const currentQuery = searchParams.toString();
      if (nextQuery === currentQuery) return;
      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (skipUrlSync.current) {
      skipUrlSync.current = false;
      return;
    }
    syncFiltersToUrl(filters);
  }, [filters, syncFiltersToUrl]);

  const fetchFilteredProperties = useCallback(
    async (bounds: MapBounds, currentFilters: FilterState) => {
      const signature = JSON.stringify({
        bounds,
        filters: currentFilters,
      });

      if (signature === lastFetchKeyRef.current) return;
      lastFetchKeyRef.current = signature;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          minLat: bounds.minLat.toString(),
          maxLat: bounds.maxLat.toString(),
          minLon: bounds.minLon.toString(),
          maxLon: bounds.maxLon.toString(),
        });

        if (currentFilters.operationType)
          query.append("operationType", currentFilters.operationType);
        if (currentFilters.propertyType)
          query.append("propertyType", currentFilters.propertyType);
        if (currentFilters.currency) query.append("currency", currentFilters.currency);
        if (currentFilters.minPrice) query.append("minPrice", currentFilters.minPrice);
        if (currentFilters.maxPrice) query.append("maxPrice", currentFilters.maxPrice);
        if (currentFilters.minArea) query.append("minArea", currentFilters.minArea);
        if (currentFilters.maxArea) query.append("maxArea", currentFilters.maxArea);
        if (currentFilters.age) query.append("age", currentFilters.age);
        if (currentFilters.city) query.append("city", currentFilters.city);
        if (currentFilters.province) query.append("province", currentFilters.province);
        if (currentFilters.q) query.append("q", currentFilters.q);

        currentFilters.bedrooms.forEach((bedroom) => query.append("bedrooms", bedroom));
        currentFilters.bathrooms.forEach((bathroom) => query.append("bathrooms", bathroom));

        if (currentFilters.hasWater) query.append("hasWater", "true");
        if (currentFilters.hasElectricity) query.append("hasElectricity", "true");
        if (currentFilters.hasGas) query.append("hasGas", "true");
        if (currentFilters.hasInternet) query.append("hasInternet", "true");
        if (currentFilters.hasParking) query.append("hasParking", "true");
        if (currentFilters.hasPool) query.append("hasPool", "true");
        if (currentFilters.hasBalcony) query.append("hasBalcony", "true");
        if (currentFilters.hasGrill) query.append("hasGrill", "true");
        if (currentFilters.hasGarden) query.append("hasGarden", "true");
        if (currentFilters.hasLaundry) query.append("hasLaundry", "true");
        if (currentFilters.hasAirConditioning)
          query.append("hasAirConditioning", "true");

        const res = await fetch(`/api/properties/in-bounds?${query}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setProperties([]);
          return;
        }

        const data = await res.json();
        const rawList = data.properties || [];

        const normalizedList = rawList.map((p: RawProperty) => {
          const resolvedPrice = p.salePrice ?? p.rentPrice ?? p.price ?? 0;
          return {
            ...p,
            price: resolvedPrice,
            currency: p.saleCurrency ?? p.rentCurrency,
            hasWater: Boolean(p.hasWater),
            hasElectricity: Boolean(p.hasElectricity),
            hasGas: Boolean(p.hasGas),
            hasInternet: Boolean(p.hasInternet),
            hasParking: Boolean(p.hasParking),
            hasPool: Boolean(p.hasPool),
            hasBalcony: Boolean(p.hasBalcony),
            hasGrill: Boolean(p.hasGrill),
            hasGarden: Boolean(p.hasGarden),
            hasLaundry: Boolean(p.hasLaundry),
            hasAirConditioning: Boolean(p.hasAirConditioning),
          };
        });

        setProperties(normalizedList as MapProperty[]);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Error al filtrar propiedades:", error);
      } finally {
        if (abortRef.current === controller) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  const handleBoundsChange = useCallback(
    (bounds: MapBounds) => {
      boundsRef.current = bounds;
      fetchFilteredProperties(bounds, filters);
    },
    [fetchFilteredProperties, filters],
  );

  useEffect(() => {
    if (boundsRef.current) {
      const timeoutId = window.setTimeout(() => {
        fetchFilteredProperties(boundsRef.current as MapBounds, filters);
      }, 220);
      return () => window.clearTimeout(timeoutId);
    }
  }, [filters, fetchFilteredProperties]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (key: AmenityFlagKey) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleMultiValue = (key: "bedrooms" | "bathrooms", value: string) => {
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

  const handleResolveLocation = async () => {
    const locationQuery = [filters.city, filters.province].filter(Boolean).join(", ");
    if (!locationQuery.trim()) return;

    setIsSearchingLocation(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(locationQuery)}`);
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
    setFilters({
      operationType: "",
      propertyType: "",
      currency: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: [],
      bathrooms: [],
      minArea: "",
      maxArea: "",
      age: "",
      city: "",
      province: "",
      q: "",
      hasWater: false,
      hasElectricity: false,
      hasGas: false,
      hasInternet: false,
      hasParking: false,
      hasPool: false,
      hasBalcony: false,
      hasGrill: false,
      hasGarden: false,
      hasLaundry: false,
      hasAirConditioning: false,
    });
  };

  const layerOptions = useMemo(
    () => Object.values(mapBaseLayers),
    [],
  );

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 z-0 flex flex-col bg-slate-100 overflow-hidden">
      {/* HEADER DE FILTROS - Todo a la misma altura */}
      <div className="w-full bg-white border-b border-slate-200 z-40 px-6 py-3 shadow-sm flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowFiltersMenu((prev) => !prev)}
          className="h-10 px-4 rounded-full border border-black/50 text-[11px] font-bold bg-white inline-flex items-center gap-2 shrink-0"
        >
          <SlidersHorizontal size={14} />
          Filtros
        </button>

        <CustomDropdown
          label="Operación"
          variant="white2"
          value={filters.operationType}
          onChange={(val) => setFilters((f) => ({ ...f, operationType: val }))}
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
          onChange={(val) => setFilters((f) => ({ ...f, propertyType: val }))}
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

        <div className="w-full md:w-[360px] shrink-0">
          <LocationSelectors
            provinceValue={filters.province}
            cityValue={filters.city}
            onChange={(name, val) => {
              if (name === "province") {
                setFilters((prev) => ({ ...prev, province: val, city: "" }));
              }
              if (name === "city") {
                setFilters((prev) => ({ ...prev, city: val }));
              }
            }}
          />
        </div>

        <div className="relative w-full md:w-[260px] shrink-0">
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
          className="h-10 px-4 rounded-full border border-urbik-emerald text-[11px] text-w font-bold bg-urbik-emerald inline-flex items-center gap-2 shrink-0"
        >
          <Search size={14} />
          {isSearchingLocation ? "Buscando..." : "Ir a ubicación"}
        </button>

        <button
          onClick={clearFilters}
          className="ml-auto h-10 px-4 text-md font-black cursor-pointer text-urbik-black/50 hover:text-urbik-rose transition-colors flex items-center gap-1 shrink-0"
        >
          <X size={20} /> Limpiar
        </button>
      </div>

      {/* MENÚ DE FILTROS DESPLEGABLE CON ANIMACIÓN */}
      <div
        className={`w-full bg-white z-30 overflow-hidden transition-all duration-300 ease-in-out ${
          showFiltersMenu
            ? "max-h-[800px] border-b border-slate-200 opacity-100 py-3"
            : "max-h-0 border-b-0 opacity-0 py-0"
        }`}
      >
        <div className="px-6">
          <div className="flex flex-wrap items-center gap-2">
            <CustomDropdown
              label="Moneda"
              variant="white2"
              value={filters.currency}
              onChange={(val) => setFilters((f) => ({ ...f, currency: val }))}
              options={[
                { label: "Moneda", value: "" },
                { label: "USD", value: "USD" },
                { label: "ARS", value: "ARS" },
              ]}
            />

            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-urbik-white border border-black/50 hover:bg-slate-50 rounded-full px-3 h-10">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Mín $"
                  value={filters.minPrice}
                  onChange={handleInputChange}
                  className="w-20 bg-transparent text-urbik-black text-[10px] font-bold outline-none placeholder:text-urbik-black/50"
                />
              </div>

              <div className="flex items-center bg-urbik-white border border-black/50 hover:bg-slate-50 rounded-full px-3 h-10">
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Máx $"
                  value={filters.maxPrice}
                  onChange={handleInputChange}
                  className="w-20 bg-transparent text-urbik-black text-[10px] font-bold outline-none placeholder:text-urbik-black/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 border border-black/50 rounded-full px-2 h-10 bg-white">
              <span className="text-[10px] font-bold text-urbik-black/70">Dorm</span>
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
              <span className="text-[10px] font-bold text-urbik-black/70">Baños</span>
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

            <div className="flex items-center gap-1.5">
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
              <input
                type="number"
                name="age"
                placeholder="Antig. máx"
                value={filters.age}
                onChange={handleInputChange}
                className="h-10 w-28 rounded-full border border-black/50 px-3 text-[11px] font-bold"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-slate-200 pt-3 mt-3">
            {AMENITIES_CONFIG.map((amenity) => {
              const Icon = amenity.icon;
              const isActive = filters[amenity.id];
              return (
                <button
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`
                    flex items-center cursor-pointer gap-1 px-2.5 py-1.5 rounded-full border text-[10px] font-bold transition-all
                    ${
                      isActive
                        ? "bg-urbik-emerald text-white border-urbik-emerald shadow-sm"
                        : "bg-white text-urbik-black/60 border-slate-300 hover:border-urbik-emerald/50"
                    }
                  `}
                >
                  <Icon size={12} strokeWidth={isActive ? 3 : 2} />
                  {amenity.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-row overflow-hidden relative">
        <aside
          className={`
            absolute inset-0 z-30 bg-white md:static md:w-[400px] md:h-full border-r border-slate-200
            transition-transform duration-300 ease-in-out flex flex-col
            ${showMobileList ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div className="md:hidden p-4 border-b flex justify-between items-center bg-white shadow-sm shrink-0">
            <h2 className="font-bold text-lg text-slate-800">Resultados ({properties.length})</h2>
            <button
              onClick={() => setShowMobileList(false)}
              className="cursor-pointer text-slate-500 p-2"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <PropertiesSidebar
              properties={properties}
              visualLimit={propertiesLimit}
              isLoading={isLoading}
            />
          </div>
        </aside>

        <main className="flex-1 relative h-full w-full z-10 bg-gray-200">
          <InteractiveMap
            key={`map-${lat}-${lon}`}
            lat={lat}
            lon={lon}
            properties={properties}
            onBoundsChange={handleBoundsChange}
            onCenterChange={setCurrentZone}
            height="100%"
          />

          <div className="absolute top-5 left-5 z-[1001]">
             <CustomDropdown
                label="Capa del Mapa"
                variant="map-layer"
                value={baseLayer}
                onChange={(val) => setBaseLayer(val as BaseLayerId)}
                options={layerOptions.map(layer => ({ label: layer.label, value: layer.id }))}
             />
          </div>

          <div className="absolute bottom-10 right-10 z-9999 pointer-events-auto hidden md:block">
            {currentZone && currentZone.zoom >= 15 && (
              <ZoneAnalysis data={currentZone} />
            )}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden pointer-events-auto w-max">
            <button
              onClick={() => setShowMobileList(!showMobileList)}
              className="bg-slate-900 text-white px-6 py-3 cursor-pointer rounded-full shadow-2xl flex items-center gap-3 font-medium active:scale-95 transition-transform"
            >
              {showMobileList ? (
                <>
                  <MapIcon className="w-4 h-4" /> Ver Mapa
                </>
              ) : (
                <>
                  <List className="w-4 h-4" /> Ver Lista
                  <span className="bg-slate-700 px-2 text-xs rounded-full">{properties.length}</span>
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}