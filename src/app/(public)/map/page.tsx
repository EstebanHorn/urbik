"use client";

export const dynamic = "force-dynamic";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamicImport from "next/dynamic";
import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import type {
  MapBounds,
  MapProperty,
  BaseLayerId,
} from "@/components/map/types";
import { mapBaseLayers, defaultBaseLayerId } from "@/components/map/types";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import GoogleMapProvider from "@/components/google-map/GoogleMapProvider";

import {
  appendFiltersToApiQuery,
  applyFiltersToParams,
  areFiltersEqual,
  parseFiltersFromQuery,
  type FilterState,
} from "@/utils/propertyFilters";

import {
  Map as MapIcon,
  List,
  X,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import PriceFilterCard from "@/components/search/PriceFilterCard";
import RoomsFilterCard from "@/components/search/RoomsFilterCard";

import PropertySlidePanel from "@/components/map/PropertySlidePanel";
import MobileSearchFilterBar from "@/components/search/MobileSearchFilterBar";
import DesktopSearchFilterBar from "@/components/search/DesktopSearchFilterBar";

const PropertiesSidebar = dynamicImport(
  () =>
    import("@/components/map/PropertiesSidebar").then(
      (mod) => mod.PropertiesSidebar,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 text-sm text-slate-400">Cargando propiedades...</div>
    ),
  },
);

const InteractiveMap = dynamicImport(
  () => import("@/components/google-map/GoogleMapClient"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-white text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-600"></div>
        <span className="text-sm font-medium">Cargando Google Maps...</span>
      </div>
    ),
  },
);

interface RawProperty {
  lat: number;
  lon: number;
  salePrice?: number;
  rentPrice?: number;
  saleCurrency?: string;
  rentCurrency?: string;
  price?: number;
  [key: string]: unknown;
}

export default function MapPage() {
  const [baseLayer, setBaseLayer] = useState<BaseLayerId>(defaultBaseLayerId);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const boundsRef = useRef<MapBounds | null>(null);
  const skipUrlSync = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  const lastFetchKeyRef = useRef("");

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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(
    null,
  );

  const [filters, setFilters] = useState<FilterState>(() =>
    parseFiltersFromQuery(new URLSearchParams(searchParams.toString())),
  );

  useEffect(() => {
    const next = parseFiltersFromQuery(
      new URLSearchParams(searchParams.toString()),
    );
    setFilters((prev) => (areFiltersEqual(prev, next) ? prev : next));
    skipUrlSync.current = true;
  }, [searchParams]);

  const syncFiltersToUrl = useCallback(
    (nextFilters: FilterState) => {
      const nextQuery = applyFiltersToParams(
        new URLSearchParams(searchParams.toString()),
        nextFilters,
      ).toString();
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
    syncFiltersToUrl(filters);
  }, [filters, syncFiltersToUrl]);

  const fetchFilteredProperties = useCallback(
    async (visibleBounds: MapBounds, currentFilters: FilterState) => {
      const EXPANSION_FACTOR = 2.0;

      const latDiff = visibleBounds.maxLat - visibleBounds.minLat;
      const lonDiff = visibleBounds.maxLon - visibleBounds.minLon;

      const latPadding = (latDiff * (EXPANSION_FACTOR - 1)) / 2;
      const lonPadding = (lonDiff * (EXPANSION_FACTOR - 1)) / 2;

      const expandedBounds: MapBounds = {
        minLat: visibleBounds.minLat - latPadding,
        maxLat: visibleBounds.maxLat + latPadding,
        minLon: visibleBounds.minLon - lonPadding,
        maxLon: visibleBounds.maxLon + lonPadding,
      };

      const signature = JSON.stringify({
        bounds: visibleBounds,
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
          minLat: expandedBounds.minLat.toString(),
          maxLat: expandedBounds.maxLat.toString(),
          minLon: expandedBounds.minLon.toString(),
          maxLon: expandedBounds.maxLon.toString(),
        });
        appendFiltersToApiQuery(query, currentFilters);

        const res = await fetch(
          `/api/properties/in-bounds?${query.toString()}`,
          { signal: controller.signal },
        );
        if (!res.ok) {
          setProperties([]);
          return;
        }

        const data = await res.json();
        const rawList = data.properties || [];
        const normalizedList = rawList.map((p: RawProperty) => ({
          ...p,
          price: p.salePrice ?? p.rentPrice ?? p.price ?? 0,
          currency: p.saleCurrency ?? p.rentCurrency,
          inMapBounds:
            p.lat >= visibleBounds.minLat &&
            p.lat <= visibleBounds.maxLat &&
            p.lon >= visibleBounds.minLon &&
            p.lon <= visibleBounds.maxLon,
        }));

        setProperties(normalizedList as MapProperty[]);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Error al filtrar propiedades:", error);
      } finally {
        if (abortRef.current === controller) setIsLoading(false);
      }
    },
    [],
  );

const handleBoundsChange = useCallback(
    (bounds: MapBounds) => {
      boundsRef.current = bounds;
      fetchFilteredProperties(bounds, filters);

      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set("minLat", bounds.minLat.toString());
      currentParams.set("maxLat", bounds.maxLat.toString());
      currentParams.set("minLon", bounds.minLon.toString());
      currentParams.set("maxLon", bounds.maxLon.toString());
      
      router.replace(`${pathname}?${currentParams.toString()}`, { scroll: false });
    },
    [fetchFilteredProperties, filters, pathname, router, searchParams],
  );

  useEffect(() => {
    if (!boundsRef.current) return;
    const timeoutId = window.setTimeout(
      () => fetchFilteredProperties(boundsRef.current as MapBounds, filters),
      220,
    );
    return () => window.clearTimeout(timeoutId);
  }, [filters, fetchFilteredProperties]);


  const layerOptions = useMemo(() => Object.values(mapBaseLayers), []);

  return (
    <div className="fixed bottom-0 left-0 right-0 top-16 z-0 flex flex-col overflow-hidden bg-white">
      {!showMobileList && !selectedProperty && <MobileSearchFilterBar />}
      <DesktopSearchFilterBar />
      <div className="relative flex flex-1 overflow-hidden">
        <aside
          className={`absolute inset-0 z-30 flex flex-col transition-transform duration-300 ease-in-out md:static md:h-full md:w-1/3 lg:w-2/5 shadow-2xl md:shadow-none bg-white ${
            showMobileList
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="shrink-0 p-4 shadow-sm md:hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Resultados ({properties.length})
              </h2>
              <button
                onClick={() => setShowMobileList(false)}
                className="cursor-pointer p-2 text-slate-500"
              >
                <X size={20} />
              </button>
            </div>
          </div>
{/*
          <div className="shrink-0 border-b border-slate-100 p-4">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="flex w-full items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={15} />
                Filtros
                {(filters.minPrice ||
                  filters.maxPrice ||
                  filters.rooms.length > 0 ||
                  filters.bedrooms.length > 0 ||
                  filters.bathrooms.length > 0) && (
                  <span className="h-5 w-5 flex items-center justify-center rounded-full bg-geora-cyan text-[10px] font-black text-white">
                    ●
                  </span>
                )}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`}
              />
            </button>

            {showFilters && (
              <div className="mt-4 space-y-6">
                <PriceFilterCard
                  minPrice={filters.minPrice}
                  maxPrice={filters.maxPrice}
                  currency={filters.currency}
                  operationType={filters.operationType}
                  propertyType={filters.propertyType}
                  onChangeMin={(v) =>
                    setFilters((prev) => ({ ...prev, minPrice: v }))
                  }
                  onChangeMax={(v) =>
                    setFilters((prev) => ({ ...prev, maxPrice: v }))
                  }
                  onChangeCurrency={(v) =>
                    setFilters((prev) => ({ ...prev, currency: v }))
                  }
                />
                <div className="border-t border-slate-100 pt-6">
                  <RoomsFilterCard
                    rooms={filters.rooms}
                    bedrooms={filters.bedrooms}
                    bathrooms={filters.bathrooms}
                    onChange={handleMapRoomsChange}
                  />
                </div>
              </div>
            )}
          </div>
*/}
          <div className="flex-1 overflow-y-auto">
            <PropertiesSidebar
              properties={properties}
              visualLimit={6}
              isLoading={isLoading}
              selectedPropertyId={selectedProperty?.id}
              onSelectProperty={setSelectedProperty}
            />
          </div>
        </aside>

        <main className="relative z-10 h-full w-full flex-1 bg-white overflow-hidden">
          <GoogleMapProvider>
            <InteractiveMap
              key={`map-${lat}-${lon}`}
              lat={lat}
              lon={lon}
              baseLayer={baseLayer}
              properties={properties}
              onBoundsChange={handleBoundsChange}
              onPropertySelect={setSelectedProperty}
              height="100%"
            />
          </GoogleMapProvider>

          <div
            className={`absolute inset-0 z-20 bg-white/95 backdrop-blur-xl shadow-[-20px_0_40px_rgba(0,0,0,0.15)] transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
              selectedProperty ? "translate-x-0" : "-translate-x-full"
            } flex flex-col overflow-y-auto overflow-x-hidden`}
          >
            {selectedProperty && (
              <PropertySlidePanel
                propertyId={selectedProperty.id}
                onClose={() => setSelectedProperty(null)}
              />
            )}
          </div>

          <div className="absolute right-5 bottom-6 z-11 pointer-events-none">
            <div className="pointer-events-auto">
              <CustomDropdown
                label="Capa del Mapa"
                variant="map-layer"
                direction="up"
                value={baseLayer}
                onChange={(val) => setBaseLayer(val as BaseLayerId)}
                options={layerOptions.map((layer) => ({
                  label: layer.label,
                  value: layer.id,
                }))}
              />
            </div>
          </div>

          <div className="pointer-events-auto absolute bottom-6 left-1/2 z-50 w-max -translate-x-1/2 md:hidden">
            <button
              onClick={() => setShowMobileList(!showMobileList)}
              className="flex cursor-pointer items-center gap-3 rounded-full bg-slate-900 px-6 py-3 font-medium text-white shadow-2xl transition-transform active:scale-95"
            >
              {showMobileList ? (
                <>
                  <MapIcon className="h-4 w-4" /> Ver Mapa
                </>
              ) : (
                <>
                  <List className="h-4 w-4" /> Ver Lista{" "}
                  <span className="rounded-full bg-slate-700 px-2 text-xs">
                    {properties.length}
                  </span>
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
