"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import LocationSelectors from "@/components/LocationSelectors";
import { SearchSuggestion } from "@/features/search/hooks/useAutocompleteSuggestions";
import { CustomDropdown } from "@/components/CustomDropdown"; 

const ROTATING_PROVINCES = [
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Fe",
  "Santa Cruz",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
  "Ciudad Autónoma de Buenos Aires",
];

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

interface Props {
  query: string;
  setQuery: (v: string) => void;
  operation: "SALE" | "RENT";
  setOperation: (v: "SALE" | "RENT") => void;
  propertyType: string;
  setPropertyType: (v: string) => void;
  province: string;
  city: string;
  setProvince: (v: string) => void;
  setCity: (v: string) => void;
  setCoords: (coords: { lat: number; lon: number } | null) => void;
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  onSelectSuggestion: (suggestion: SearchSuggestion) => void;
  buttonData: { width: number; x: number };
  updatePill: (el: HTMLButtonElement | null) => void;
  onSearch: () => void;
}

function formatSuggestionLabel(suggestion: SearchSuggestion) {
  if (suggestion.type !== "ADDRESS") {
    return suggestion.display_name || suggestion.name || "Sin nombre";
  }

  if (suggestion.fullLabel?.trim()) {
    return suggestion.fullLabel.trim();
  }

  const street = suggestion.display_name?.split(",")[0]?.trim() || "Dirección";
  const city = suggestion.city?.trim() || "Ciudad";
  const province = suggestion.province?.trim() || "Provincia";

  return `${street} — ${city}, ${province}`;
}

export function SearchSection({
  query,
  setQuery,
  operation,
  setOperation,
  propertyType,
  setPropertyType,
  province,
  city,
  setProvince,
  setCity,
  setCoords,
  suggestions,
  isLoading,
  onSelectSuggestion,
  onSearch,
}: Props) {
  const [currentProvinceIndex, setCurrentProvinceIndex] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const propertyOptions = [
    { value: "HOUSE", label: "CASA" },
    { value: "APARTMENT", label: "DEPARTAMENTO" },
    { value: "COMMERCIAL_PROPERTY", label: "LOCAL" },
    { value: "PH", label: "PH" },
    { value: "LAND", label: "TERRENO" },
    { value: "FIELD", label: "CAMPO" },
    { value: "BUSINESS_BACKGROUND", label: "FONDO COM." },
    { value: "OFFICE", label: "OFICINA" },
    { value: "GARAGE", label: "COCHERA" },
    { value: "WAREHOUSE", label: "GALPÓN" },
    { value: "DEVELOPMENT", label: "DESARROLLO" },
    { value: "COUNTRY", label: "COUNTRY" },
  ];

  const normalizedSuggestions = useMemo(
    () =>
      suggestions.map((suggestion) => ({
        ...suggestion,
        listLabel: formatSuggestionLabel(suggestion),
      })),
    [suggestions],
  );

  const hasSuggestions = normalizedSuggestions.length > 0;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const rotationId = window.setInterval(() => {
      setCurrentProvinceIndex(
        (prevIndex) => (prevIndex + 1) % ROTATING_PROVINCES.length,
      );
    }, 2200);

    return () => window.clearInterval(rotationId);
  }, [isHydrated]);

  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [query, suggestions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mt-10 lg:mt-20">
      <div>
        <h1 className="text-6xl font-display font-bold text-urbik-black leading-[0.8] tracking-tighter">
          <span>Encontrá tu lugar en </span>

          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className="font-black italic text-7xl text-urbik-black inline-flex min-w-[28ch] min-h-[1.1em]">
              {!isHydrated ? (
                <span>{ROTATING_PROVINCES[0]}</span>
              ) : (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={ROTATING_PROVINCES[currentProvinceIndex]}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="block"
                  >
                    {ROTATING_PROVINCES[currentProvinceIndex]}
                  </motion.span>
                </AnimatePresence>
              )}
            </span>
          </div>
        </h1>

        <p className="text-urbik-dark2 mb-12 max-w-md font-medium mt-4">
          La primera plataforma de búsqueda inmobiliaria que integra y visualiza
          información catastral de cada propiedad.
        </p>

        <div className="mb-2 ml-4 text-md font-medium text-urbik-black opacity-60 tracking-wide">
          Búsqueda rápida
        </div>

        <div className="relative mb-10 w-full">
          <div className="relative flex items-center bg-urbik-white2 rounded-full border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-urbik-black focus-within:border-transparent transition-all overflow-hidden">
            <input
              type="text"
              placeholder="Dirección, barrio o nombre de inmobiliaria..."
              className="w-full bg-transparent py-4 pl-6 pr-14 outline-none text-urbik-black font-medium placeholder:text-gray-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (normalizedSuggestions.length === 0) return;
                  setActiveSuggestionIndex((prev) =>
                    prev < normalizedSuggestions.length - 1 ? prev + 1 : 0,
                  );
                  return;
                }

                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (normalizedSuggestions.length === 0) return;
                  setActiveSuggestionIndex((prev) =>
                    prev > 0 ? prev - 1 : normalizedSuggestions.length - 1,
                  );
                  return;
                }

                if (e.key === "Enter") {
                  if (
                    activeSuggestionIndex >= 0 &&
                    normalizedSuggestions[activeSuggestionIndex]
                  ) {
                    e.preventDefault();
                    onSelectSuggestion(
                      normalizedSuggestions[activeSuggestionIndex],
                    );
                    setActiveSuggestionIndex(-1);
                    return;
                  }

                  onSearch();
                  return;
                }

                if (e.key === "Escape") {
                  setActiveSuggestionIndex(-1);
                }
              }}
            />

            <button
              onClick={onSearch}
              className="absolute right-2 p-2 bg-urbik-black text-white rounded-full hover:bg-gray-800 transition-colors active:scale-95"
              title="Buscar ahora"
            >
              <SearchIcon />
            </button>
          </div>

          {(isLoading || hasSuggestions) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 max-h-72 overflow-auto">
              {isLoading && (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Buscando sugerencias...
                </div>
              )}

              {!isLoading && (
                <ul>
                  {normalizedSuggestions.map((suggestion, index) => (
                    <li
                      key={`${suggestion.type}-${suggestion.id ?? index}`}
                      className={`px-4 py-3 text-sm cursor-pointer border-b border-gray-100 last:border-b-0 ${
                        index === activeSuggestionIndex
                          ? "bg-gray-100"
                          : "hover:bg-gray-50"
                      }`}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setActiveSuggestionIndex(index)}
                      onClick={() => {
                        onSelectSuggestion(suggestion);
                        setActiveSuggestionIndex(-1);
                      }}
                    >
                      <div className="font-medium text-urbik-black truncate">
                        {suggestion.listLabel}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {suggestion.type === "ADDRESS"
                          ? "Dirección"
                          : "Inmobiliaria"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="mb-2 ml-4 text-md font-medium text-urbik-black opacity-60 tracking-wide">
          Búsqueda detallada
        </div>

<div className="w-full flex justify-between">
        <div className="relative flex bg-gray-100 rounded-full w-fit mb-6 overflow-hidden cursor-pointer p-1 border border-gray-200">
          <motion.div
            className="absolute top-0 bottom-0 left-0 h-full bg-urbik-black rounded-full shadow-sm"
            initial={false}
            animate={{ x: operation === "SALE" ? "0%" : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ width: "calc(50%)" }}
          />

          <button
            onClick={() => setOperation("SALE")}
            className={`relative z-10 px-8 py-2 font-bold text-sm rounded-full transition-colors duration-200 ${
              operation === "SALE"
                ? "text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            COMPRAR
          </button>

          <button
            onClick={() => setOperation("RENT")}
            className={`relative z-10 px-8 py-2 font-bold text-sm rounded-full transition-colors duration-200 ${
              operation === "RENT"
                ? "text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            ALQUILAR
          </button>
        </div>

        <div className="mb-6 w-fit">
          <CustomDropdown
            label="Tipo de propiedad"
            value={propertyType}
            options={propertyOptions}
            onChange={(val) => setPropertyType(val)}
            variant="white"
            className="w-full sm:w-auto"
          />
        </div>
        </div>
        

        <div className="flex flex-col sm:flex-row gap-3 mb-8 w-full">
          <LocationSelectors
            provinceValue={province}
            cityValue={city}
            onChange={(name, val) => {
              if (name === "province") setProvince(val);
              if (name === "city") setCity(val);
            }}
            onCityCoordsChange={(nextCoords) => setCoords(nextCoords)}
          />
        </div>

        <div className="flex justify-start w-full">
          <button
            onClick={onSearch}
            className="w-full sm:w-auto px-10 py-3.5 cursor-pointer rounded-full bg-urbik-black text-white font-bold text-lg transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl hover:bg-gray-800 hover:shadow-2xl"
          >
            <SearchIcon />
            <span>Buscar Propiedades</span>
          </button>
        </div>
      </div>

      <div className="hidden lg:flex flex-col items-center w-full relative">
        <div className="rounded-3xl w-full aspect-square bg-gray-100 relative">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/video.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
}