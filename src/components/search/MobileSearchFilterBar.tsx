"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useSearch, type SearchSuggestion } from "@/hooks/useSearch";
import { parseFiltersFromQuery } from "@/utils/propertyFilters";
import PriceFilterCard from "@/components/search/PriceFilterCard";

function getSuggestionLabel(s: SearchSuggestion): string {
  if (s.type === "PROPERTY_SEARCH") return s.display_name || "Buscar propiedades";
  const display = s.display_name || s.name || "";
  const parts = display.split(",");
  return parts.length > 3 ? parts.slice(0, 3).join(",").trim() : display.trim();
}

/**
 * Barra de búsqueda + filtros rápidos para mobile. Autocontenida: lee y
 * escribe los filtros directamente en la URL (igual que DesktopSearchFilterBar),
 * así funciona sin props en cualquier página (Mapa, Listado).
 */
export default function MobileSearchFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [priceOpen, setPriceOpen] = useState(false);
  const [localMinPrice, setLocalMinPrice] = useState("");
  const [localMaxPrice, setLocalMaxPrice] = useState("");

  const searchRef = useRef<HTMLDivElement>(null);
  const priceButtonRef = useRef<HTMLButtonElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    query,
    setQuery,
    suggestions,
    isLoading: searchLoading,
    onSelectSuggestion,
    clearAutocomplete,
  } = useSearch();

  const filters = parseFiltersFromQuery(new URLSearchParams(searchParams.toString()));

  useEffect(() => {
    setLocalMinPrice(searchParams.get("minPrice") || "");
    setLocalMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insidePrice =
        priceButtonRef.current?.contains(target) || priceRef.current?.contains(target);
      if (!insidePrice) {
        setPriceOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(target)) {
        clearAutocomplete();
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [clearAutocomplete]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) onSelectSuggestion(suggestions[0]);
    }
    if (e.key === "Escape") clearAutocomplete();
  };

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

  const toggleOperation = (val: "SALE" | "RENT") => {
    handleParamChange("operationType", filters.operationType === val ? null : val);
  };

  const hasPrice = !!(filters.minPrice || filters.maxPrice || filters.currency);
  const hasMoreFilters =
    filters.propertyType ||
    filters.rooms.length > 0 ||
    filters.bedrooms.length > 0 ||
    filters.bathrooms.length > 0 ||
    filters.hasWater ||
    filters.hasElectricity ||
    filters.hasGas ||
    filters.hasInternet ||
    filters.hasParking ||
    filters.hasPool ||
    filters.hasBalcony ||
    filters.hasGrill ||
    filters.hasGarden ||
    filters.hasLaundry ||
    filters.hasAirConditioning;

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100">
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <div ref={searchRef} className="relative flex-1">
          <div className="flex items-center w-full rounded-full bg-slate-100 px-3 py-2 border border-slate-200 focus-within:border-slate-300 transition-colors">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar ciudad, dirección..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400"
            />
            {query ? (
              <button
                type="button"
                onClick={clearAutocomplete}
                className="p-1 text-slate-400 shrink-0"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : searchLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </div>

          {!searchLoading && suggestions.length > 0 && (
            <ul className="absolute top-full mt-1.5 left-0 right-0 z-[1050] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden max-h-64 overflow-y-auto">
              {suggestions.map((s, i) => (
                <li
                  key={`${s.type}-${i}`}
                  className="px-4 py-3 text-sm text-slate-700 border-b last:border-none border-slate-100"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelectSuggestion(s)}
                >
                  {getSuggestionLabel(s)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 pb-3 overflow-x-auto no-scrollbar">
        <div className="flex shrink-0 rounded-full bg-slate-100 p-1">
          {(
            [
              { v: "SALE", l: "Venta" },
              { v: "RENT", l: "Alquiler" },
            ] as const
          ).map(({ v, l }) => (
            <button
              key={v}
              type="button"
              onClick={() => toggleOperation(v)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                filters.operationType === v
                  ? "bg-geora-black text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="relative shrink-0">
          <button
            ref={priceButtonRef}
            type="button"
            onClick={() => setPriceOpen((v) => !v)}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              hasPrice || priceOpen
                ? "bg-geora-black text-white shadow-sm"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            Precio
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${priceOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("toggle-sidebar"))}
          className={`relative flex shrink-0 items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
            hasMoreFilters ? "bg-geora-black text-white shadow-sm" : "bg-slate-100 text-slate-500"
          }`}
        >
          <SlidersHorizontal size={13} />
          Más filtros
        </button>
      </div>

      {priceOpen && (
        <div
          ref={priceRef}
          className="absolute left-3 right-3 top-full mt-2 z-[1050] rounded-2xl border border-slate-200 bg-white shadow-xl p-4"
        >
          <PriceFilterCard
            minPrice={localMinPrice}
            maxPrice={localMaxPrice}
            currency={filters.currency}
            operationType={filters.operationType}
            propertyType={filters.propertyType}
            onChangeMin={(v) => handlePriceChange("minPrice", v)}
            onChangeMax={(v) => handlePriceChange("maxPrice", v)}
            onChangeCurrency={handleCurrencySwitch}
          />
        </div>
      )}
    </div>
  );
}
