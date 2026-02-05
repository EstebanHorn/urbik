"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import LocationSelectors from "@/components/LocationSelectors";

// Icono de Lupa simple (SVG) para evitar dependencias externas en este ejemplo
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
  buttonData: { width: number; x: number };
  updatePill: (el: HTMLButtonElement | null) => void;
  onSearch: () => void;
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
  buttonData,
  updatePill,
  onSearch,
}: Props) {
  const propertyOptions = [
    { id: "COMMERCIAL_PROPERTY", label: "LOCAL COMERCIAL" },
    { id: "HOUSE", label: "CASA" },
    { id: "APARTMENT", label: "DEPARTAMENTO" },
    { id: "LAND", label: "TERRENO" },
  ];

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const initialButton = document.getElementById(
        `btn-${propertyType}`,
      ) as HTMLButtonElement;
      if (initialButton) updatePill(initialButton);
    });
    return () => cancelAnimationFrame(frameId);
  }, [propertyType, updatePill]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mt-10 lg:mt-20">
      <div>
        <h1 className="text-6xl font-display font-bold text-urbik-black leading-[0.8] tracking-tighter">
          <span>Encontrá tu lugar</span>
          <br />
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span>en el</span>
            <span className="font-black italic text-7xl text-urbik-black">
              mundo.
            </span>
          </div>
        </h1>
        <p className="text-urbik-dark2 mb-12 max-w-md font-medium mt-4">
          La primera plataforma de búsqueda inmobiliaria que integra y visualiza
          información catastral de cada propiedad.
        </p>

        {/* --- SECCIÓN 1: BÚSQUEDA POR TEXTO (Mejorada) --- */}
        <div className="mb-2 ml-4 text-md font-medium text-urbik-black opacity-60 tracking-wide">
          Búsqueda rápida
        </div>

        <div className="relative mb-10 w-full">
          {/* Contenedor del Input */}
          <div className="relative flex items-center bg-urbik-white2 rounded-full border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-urbik-black focus-within:border-transparent transition-all overflow-hidden">
            <input
              type="text"
              placeholder="Dirección, barrio o nombre de inmobiliaria..."
              className="w-full bg-transparent py-4 pl-6 pr-14 outline-none text-urbik-black font-medium placeholder:text-gray-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />

            {/* Botón de acción DIRECTA dentro del input */}
            <button
              onClick={onSearch}
              className="absolute right-2 p-2 bg-urbik-black text-white rounded-full hover:bg-gray-800 transition-colors active:scale-95"
              title="Buscar ahora"
            >
              <SearchIcon />
            </button>
          </div>
        </div>

        {/* --- SECCIÓN 2: BÚSQUEDA DETALLADA --- */}
        <div className="mb-2 ml-4 text-md font-medium text-urbik-black opacity-60 tracking-wide">
          Búsqueda detallada
        </div>

        {/* Operación */}
        <div className="relative flex bg-gray-100 rounded-full w-fit mb-6 overflow-hidden cursor-pointer p-1 border border-gray-200">
          <motion.div
            className="absolute top-1 bottom-1 left-1 bg-urbik-black rounded-full shadow-sm"
            initial={false}
            animate={{ x: operation === "SALE" ? "0%" : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ width: "calc(50% - 4px)" }}
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

        {/* Tipo de Propiedad */}
        <div className="relative flex bg-gray-100 rounded-full w-fit max-w-full flex-wrap mb-6 p-1 gap-1 border border-gray-200">
          <motion.div
            className="absolute top-1 bottom-1 bg-urbik-black rounded-full shadow-sm"
            initial={false}
            animate={{ width: buttonData.width, x: buttonData.x }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          {propertyOptions.map((opt) => (
            <button
              key={opt.id}
              id={`btn-${opt.id}`}
              onClick={(e) => {
                setPropertyType(opt.id);
                updatePill(e.currentTarget);
              }}
              className={`relative z-10 px-4 py-2 font-bold text-xs transition-colors duration-200 whitespace-nowrap rounded-full ${
                propertyType === opt.id
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Selectores Geográficos */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 w-full">
          <LocationSelectors
            provinceValue={province}
            cityValue={city}
            onChange={(name, val) => {
              if (name === "province") setProvince(val);
              if (name === "city") setCity(val);
            }}
            onCityCoordsChange={(coords) => setCoords(coords)}
          />
        </div>

        {/* Botón Principal de Búsqueda Detallada */}
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

      {/* Video / Visual */}
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
