/*
Este componente de React, denominado SearchSection, constituye la sección principal de búsqueda
de una plataforma inmobiliaria y permite a los usuarios filtrar propiedades mediante una interfaz
altamente interactiva y visual. El código gestiona múltiples estados de búsqueda, incluyendo
consultas por texto, la elección entre compra o alquiler, la selección de tipos de propiedad
(como casas o departamentos) y la ubicación geográfica, utilizando Framer Motion para crear
transiciones fluidas y un indicador visual animado (pill) que resalta la opción seleccionada.
Además de integrar un video promocional y selectores de ubicación personalizados, el componente
sincroniza dinámicamente la posición de sus elementos visuales mediante un efecto de React para
asegurar que la interfaz responda correctamente a las interacciones del usuario antes de ejecutar
la función de búsqueda final.
*/

"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import LocationSelectors from "@/components/LocationSelectors";

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
  // NUEVO: Prop para recibir las coordenadas
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
  setCoords, // Desestructuramos
  buttonData,
  updatePill,
  onSearch,
}: Props) {
  const propertyOptions = [
    { id: "COMMERCIAL_PROPERTY", label: "LOCAL COMERCIAL" }, // IDs corregidos para coincidir con tu DB
    { id: "HOUSE", label: "CASA" },
    { id: "APARTMENT", label: "DEPARTAMENTO" },
    { id: "LAND", label: "TERRENO" },
  ];

  useEffect(() => {
    // Usamos requestAnimationFrame para asegurar que el DOM esté listo
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
          La primer plataforma de búsqueda inmobiliaria que integra y visualiza
          información catastral de cada propiedad.
        </p>

        {/* Input de Búsqueda Libre */}
        <div className="mb-2 ml-10 text-md font-medium text-urbik-black opacity-40 tracking-wide">
          Busqueda por dirección o nombre de inmobiliaria
        </div>
        <div className="relative mb-8 flex justify-center">
          <div className="border border-gray-300 flex items-center justify-center bg-urbik-white2 rounded-full px-10 w-full py-3 focus-within:ring-2 focus-within:ring-urbik-black transition-all shadow-sm">
            <input
              type="text"
              placeholder="Escribe una dirección..."
              className="bg-transparent outline-none text-center w-full placeholder:text-urbik-dark font-medium opacity-70"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
          </div>
        </div>

        {/* Toggle Operación (Compra/Alquiler) */}
        <div className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
          Busqueda detallada
        </div>
        <div className="relative flex bg-gray-200 rounded-full w-fit mb-6 overflow-hidden cursor-pointer group p-1">
          <motion.div
            className="absolute top-1 bottom-1 left-1 bg-urbik-black rounded-full"
            initial={false}
            animate={{ x: operation === "SALE" ? "0%" : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ width: "calc(50% - 4px)" }}
          />
          <button
            onClick={() => setOperation("SALE")}
            className={`relative z-10 px-8 py-2 font-bold text-sm rounded-full transition-colors duration-300 ${
              operation === "SALE"
                ? "text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            COMPRAR
          </button>
          <button
            onClick={() => setOperation("RENT")}
            className={`relative z-10 px-8 py-2 font-bold text-sm rounded-full transition-colors duration-300 ${
              operation === "RENT"
                ? "text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ALQUILAR
          </button>
        </div>

        {/* Toggle Tipo de Propiedad */}
        <div className="relative flex bg-gray-200 rounded-full w-fit mb-6 overflow-hidden p-1 gap-1">
          <motion.div
            className="absolute top-1 bottom-1 bg-urbik-black rounded-full shadow-md"
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
              className={`relative z-10 px-4 py-2 font-bold text-xs transition-colors duration-300 whitespace-nowrap rounded-full ${
                propertyType === opt.id
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Selectores de Ubicación */}
        <div className="flex flex-wrap md:flex-nowrap gap-3 mb-8 w-full">
          <LocationSelectors
            provinceValue={province}
            cityValue={city}
            onChange={(name, val) => {
              if (name === "province") setProvince(val);
              if (name === "city") setCity(val);
            }}
            // Conectamos el setter de coordenadas aquí
            onCityCoordsChange={(coords) => setCoords(coords)}
          />
        </div>

        <div className="flex justify-start w-full">
          <button
            onClick={onSearch}
            className="px-8 py-3 cursor-pointer rounded-full bg-urbik-black text-white font-bold transition-all flex items-center gap-2 active:scale-95 shadow-lg hover:bg-gray-800"
          >
            Buscar Propiedades
          </button>
        </div>
      </div>

      {/* Video */}
      <div className="hidden lg:flex flex-col items-center w-full relative">
        <div className="rounded-3xl overflow-hidden shadow-2xl w-full aspect-[4/3] bg-gray-100 relative">
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
