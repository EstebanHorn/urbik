"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, ChevronDown, SlidersHorizontal } from "lucide-react";

import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { useSearch, type SearchSuggestion } from "@/hooks/useSearch";
import { parseFiltersFromQuery } from "@/utils/propertyFilters";
import PriceFilterCard from "@/components/search/PriceFilterCard";
import RoomsFilterCard from "@/components/search/RoomsFilterCard";

function getSuggestionBadge(s: SearchSuggestion): {
  label: string;
  className: string;
} {
  if (s.type === "PROPERTY_SEARCH")
    return {
      label: "Propiedad",
      className: "bg-violet-100/80 text-violet-700",
    };
  if (s.type === "ADDRESS")
    return { label: "Dirección", className: "bg-blue-50/80 text-blue-600" };
  return {
    label: "Inmobiliaria",
    className: "bg-emerald-50/80 text-emerald-700",
  };
}

function getSuggestionLabel(s: SearchSuggestion): string {
  if (s.type === "PROPERTY_SEARCH")
    return s.display_name || "Buscar propiedades";
  const display = s.display_name || s.name || "";
  const parts = display.split(",");
  return parts.length > 3 ? parts.slice(0, 3).join(",").trim() : display.trim();
}

/**
 * Barra de búsqueda + filtros para desktop. Autocontenida: lee y escribe
 * los filtros directamente en la URL, así cualquier página que la use
 * (Home, Mapa, Listado) reacciona a los cambios sin necesidad de props.
 */
export default function DesktopSearchFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeFilter, setActiveFilter] = useState<"price" | "rooms" | null>(null);
  const [localMinPrice, setLocalMinPrice] = useState("");
  const [localMaxPrice, setLocalMaxPrice] = useState("");

  const searchRef = useRef<HTMLDivElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    query,
    setQuery,
    suggestions,
    isLoading: searchLoading,
    onSelectSuggestion,
    clearAutocomplete,
  } = useSearch();

  const currentFilters = parseFiltersFromQuery(
    new URLSearchParams(searchParams.toString()),
  );

  const hasMoreFilters =
    currentFilters.hasWater ||
    currentFilters.hasElectricity ||
    currentFilters.hasGas ||
    currentFilters.hasInternet ||
    currentFilters.hasParking ||
    currentFilters.hasPool ||
    currentFilters.hasBalcony ||
    currentFilters.hasGrill ||
    currentFilters.hasGarden ||
    currentFilters.hasLaundry ||
    currentFilters.hasAirConditioning ||
    currentFilters.minArea ||
    currentFilters.maxArea ||
    currentFilters.age;

  useEffect(() => {
    setLocalMinPrice(searchParams.get("minPrice") || "");
    setLocalMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  useEffect(() => {
    if (!activeFilter) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(e.target as Node)
      ) {
        setActiveFilter(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [activeFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        clearAutocomplete();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clearAutocomplete]);

  const handleParamChange = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handlePriceChange = useCallback(
    (field: "minPrice" | "maxPrice", value: string) => {
      if (field === "minPrice") setLocalMinPrice(value);
      else setLocalMaxPrice(value);
      if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
      priceTimerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        const newMin = field === "minPrice" ? value : localMinPrice;
        const newMax = field === "maxPrice" ? value : localMaxPrice;
        if (newMin) params.set("minPrice", newMin);
        else params.delete("minPrice");
        if (newMax) params.set("maxPrice", newMax);
        else params.delete("maxPrice");
        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }, 500);
    },
    [pathname, router, searchParams, localMinPrice, localMaxPrice],
  );

  const handleCurrencySwitch = useCallback(
    (newCurrency: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newCurrency) params.set("currency", newCurrency);
      else params.delete("currency");

      params.delete("minPrice");
      params.delete("maxPrice");
      params.set("page", "1");

      setLocalMinPrice("");
      setLocalMaxPrice("");

      if (priceTimerRef.current) clearTimeout(priceTimerRef.current);

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleRoomsChange = useCallback(
    (field: "rooms" | "bedrooms" | "bathrooms", value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(field);
      if (value) params.set(field, value);
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        onSelectSuggestion(suggestions[0]);
      } else if (query.trim()) {
        clearAutocomplete();
        router.push(`/properties?q=${encodeURIComponent(query.trim())}`);
      }
    }
    if (e.key === "Escape") {
      clearAutocomplete();
    }
  };

  return (
    <div className="hidden md:flex fixed top-[76px] left-0 right-0 w-full bg-white shadow-sm border-b border-gray-200 z-[1000] h-[60px] items-center px-6 transition-all duration-300 anim-bar">
      <div className="mx-auto w-full md:px-10 flex items-center justify-center gap-4">
        <div className="flex items-center gap-4 flex-1 max-w-md justify-end">
          <div ref={searchRef} className="relative flex-1 w-full anim-item delay-1">
            <div className="flex items-center w-full rounded-full px-3 py-1 border transition-colors duration-300 bg-white border-gray-200 shadow-md">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Buscar ciudad, dirección o propiedad..."
                className="flex-1 bg-transparent border-none outline-none py-1 w-full text-sm md:text-base transition-colors duration-300 text-black placeholder:text-black/70"
              />
              {query ? (
                <button
                  type="button"
                  onClick={clearAutocomplete}
                  className="p-1 transition-colors shrink-0 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  if (suggestions.length > 0) {
                    onSelectSuggestion(suggestions[0]);
                  } else if (query.trim()) {
                    clearAutocomplete();
                    router.push(
                      `/properties?q=${encodeURIComponent(query.trim())}`,
                    );
                  }
                }}
                className="p-1 transition-colors shrink-0 text-gray-500 hover:text-gray-700"
              >
                {searchLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4 cursor-pointer" />
                )}
              </button>
            </div>

            {!searchLoading && suggestions.length > 0 && (
              <ul className="absolute bottom-full mb-1 md:bottom-auto md:top-full md:mb-0 md:mt-1 left-0 right-0 z-[1050] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden max-h-72 overflow-y-auto">
                {suggestions.map((suggestion, index) => {
                  const badge = getSuggestionBadge(suggestion);
                  const label = getSuggestionLabel(suggestion);
                  const sub =
                    suggestion.type === "REALESTATE_USER" && suggestion.city
                      ? suggestion.city
                      : null;
                  return (
                    <li
                      key={`${suggestion.type}-${index}`}
                      className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center text-sm border-b last:border-none border-gray-100"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onSelectSuggestion(suggestion)}
                    >
                      <div className="flex flex-col overflow-hidden mr-2">
                        <span className="truncate text-gray-800 font-medium">
                          {label}
                        </span>
                        {sub && (
                          <span className="text-[11px] text-gray-500 truncate">
                            {sub}
                          </span>
                        )}
                      </div>
                      <span
                        className={`shrink-0 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2" ref={filterPanelRef}>
          <div className="anim-item delay-2">
            <CustomDropdown
              label={
                currentFilters.operationType
                  ? currentFilters.operationType === "SALE"
                    ? "Venta"
                    : currentFilters.operationType === "RENT"
                      ? "Alquiler"
                      : "Temporal"
                  : "Operación"
              }
              value={currentFilters.operationType || ""}
              options={[
                { label: "Venta", value: "SALE" },
                { label: "Alquiler", value: "RENT" },
                { label: "Temporal", value: "TEMP_RENT" },
              ]}
              onChange={(val) => {
                const current = searchParams.get("operationType") || "";
                handleParamChange(
                  "operationType",
                  val === current ? null : val,
                );
              }}
              variant="white1"
            />
          </div>

          <div className="anim-item delay-3">
            <CustomDropdown
              label={
                currentFilters.propertyType
                  ? (() => {
                      const map: Record<string, string> = {
                        HOUSE: "Casa",
                        APARTMENT: "Depto",
                        PH: "PH",
                        LAND: "Terreno",
                        COMMERCIAL_PROPERTY: "Local",
                        OFFICE: "Oficina",
                        GARAGE: "Cochera",
                        FIELD: "Campo",
                        WAREHOUSE: "Galpón",
                      };
                      return map[currentFilters.propertyType] || "Tipo";
                    })()
                  : "Tipo"
              }
              value={currentFilters.propertyType || ""}
              options={[
                { label: "Casa", value: "HOUSE" },
                { label: "Departamento", value: "APARTMENT" },
                { label: "PH", value: "PH" },
                { label: "Terreno", value: "LAND" },
                { label: "Local", value: "COMMERCIAL_PROPERTY" },
                { label: "Oficina", value: "OFFICE" },
                { label: "Cochera", value: "GARAGE" },
                { label: "Campo", value: "FIELD" },
                { label: "Galpón", value: "WAREHOUSE" },
              ]}
              onChange={(val) => {
                const current = searchParams.get("propertyType") || "";
                handleParamChange(
                  "propertyType",
                  val === current ? null : val,
                );
              }}
              variant="white1"
            />
          </div>

          <div className="relative anim-item delay-4">
            <button
              type="button"
              onClick={() =>
                setActiveFilter((v) => (v === "price" ? null : "price"))
              }
              className={`h-10 cursor-pointer px-3 md:px-5 py-2 rounded-full tracking-wide transition-colors duration-200 flex items-center justify-center md:justify-between gap-2 w-[180px] font-bold ${
                currentFilters.minPrice ||
                currentFilters.maxPrice ||
                currentFilters.currency
                  ? "bg-white border border-gray-200 text-geora-black/70 shadow-md"
                  : activeFilter === "price"
                    ? "bg-white border border-gray-200 text-geora-black/70 shadow-md"
                    : "bg-white border border-gray-200 text-geora-black/70 hover:bg-gray-50 shadow-sm"
              }`}
            >
              <span className="text-md tracking-wider flex items-center justify-center truncate">
                Precio
              </span>
              <ChevronDown
                size={16}
                strokeWidth={3}
                className={`hidden md:block w-4 h-4 shrink-0 transition-transform duration-200 ${activeFilter === "price" ? "rotate-180" : ""}`}
              />
            </button>

            {activeFilter === "price" && (
              <div className="absolute top-full left-0 mt-3 z-999 w-80 rounded-2xl border border-gray-200 bg-white text-geora-black/70 shadow-xl p-5">
                <PriceFilterCard
                  minPrice={localMinPrice}
                  maxPrice={localMaxPrice}
                  currency={searchParams.get("currency") || ""}
                  operationType={searchParams.get("operationType") || ""}
                  propertyType={searchParams.get("propertyType") || ""}
                  onChangeMin={(v) => handlePriceChange("minPrice", v)}
                  onChangeMax={(v) => handlePriceChange("maxPrice", v)}
                  onChangeCurrency={handleCurrencySwitch}
                />
              </div>
            )}
          </div>

          <div className="relative anim-item delay-5">
            <button
              type="button"
              onClick={() =>
                setActiveFilter((v) => (v === "rooms" ? null : "rooms"))
              }
              className={`h-10 cursor-pointer px-3 md:px-5 py-2 rounded-full tracking-wide transition-colors duration-200 flex items-center justify-center md:justify-between gap-2 w-[130px] md:w-[170px] font-bold ${
                currentFilters.rooms.length > 0 ||
                currentFilters.bedrooms.length > 0 ||
                currentFilters.bathrooms.length > 0
                  ? "bg-white border border-gray-200 text-geora-black/70 shadow-md"
                  : activeFilter === "rooms"
                    ? "bg-white border border-gray-200 text-geora-black/70 shadow-md"
                    : "bg-white border border-gray-200 text-geora-black/70 hover:bg-gray-50 shadow-sm"
              }`}
            >
              <span className="text-md tracking-wider flex items-center justify-center">
                {currentFilters.rooms[0]
                  ? `${currentFilters.rooms[0]} amb.`
                  : currentFilters.bedrooms[0]
                    ? `${currentFilters.bedrooms[0]} hab.`
                    : "Ambientes"}
              </span>
              <ChevronDown
                size={16}
                strokeWidth={3}
                className={`hidden md:block w-4 h-4 shrink-0 transition-transform duration-200 ${activeFilter === "rooms" ? "rotate-180" : ""}`}
              />
            </button>

            {activeFilter === "rooms" && (
              <div className="absolute top-full left-0 mt-3 z-[999] w-80 rounded-2xl border border-gray-200 bg-white text-geora-black/70 shadow-xl p-5">
                <RoomsFilterCard
                  rooms={searchParams.getAll("rooms")}
                  bedrooms={searchParams.getAll("bedrooms")}
                  bathrooms={searchParams.getAll("bathrooms")}
                  onChange={handleRoomsChange}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("toggle-sidebar"))}
            className={`anim-item delay-6 h-10 cursor-pointer px-3 md:px-5 py-2 rounded-full tracking-wide transition-colors duration-200 flex items-center justify-center gap-2 font-bold ${
              hasMoreFilters
                ? "bg-white border border-gray-200 text-geora-black/70 shadow-md"
                : "bg-white border border-gray-200 text-geora-black/70 hover:bg-gray-50 shadow-sm"
            }`}
          >
            <SlidersHorizontal size={15} />
            <span className="text-md tracking-wider">Más filtros</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideDownBar {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInItem {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-bar {
          animation: slideDownBar 0.3s ease-out forwards;
        }
        .anim-item {
          opacity: 0;
          animation: fadeInItem 0.4s ease-out forwards;
        }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.3s; }
        .delay-3 { animation-delay: 0.4s; }
        .delay-4 { animation-delay: 0.5s; }
        .delay-5 { animation-delay: 0.6s; }
      `}</style>
    </div>
  );
}
