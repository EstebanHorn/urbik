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
  buttonData,
  updatePill,
  onSearch,
}: Props) {
  const propertyOptions = [
    { id: "COMMERCIAL", label: "LOCAL COMERCIAL" },
    { id: "HOUSE", label: "CASA" },
    { id: "APARTMENT", label: "DEPARTAMENTO" },
    { id: "LAND", label: "TERRENO" },
  ];


useEffect(() => {

  const timeoutId = setTimeout(() => {
    const initialButton = document.getElementById(
      `btn-${propertyType}`
    ) as HTMLButtonElement;
    
    if (initialButton) {
      updatePill(initialButton);
    }
  }, 0);

  return () => clearTimeout(timeoutId);

}, [propertyType]);

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

        <div className="mb-2 ml-10 text-md font-medium text-urbik-black opacity-40 tracking-wide">
          Busqueda por dirección o nombre de inmobiliaria
        </div>
        <div className="relative mb-8 flex justify-center">
          <div className="border border-gray-300 flex items-center justify-center bg-urbik-white2 rounded-full px-40 py-3 focus-within:ring-2 focus-within:ring-urbik-black transition-all">
            <input
              type="text"
              placeholder="Iniciar busqueda"
              className="bg-transparent outline-none text-center w-auto min-w-[150px] placeholder:text-urbik-dark font-medium opacity-70"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
          </div>
        </div>

        <div className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
          Busqueda detallada
        </div>
        <div className="relative flex bg-urbik-g300 rounded-full w-fit mb-6 overflow-hidden cursor-pointer group">
          <motion.div
            className="absolute top-0 bottom-0 left-0 bg-urbik-black rounded-full"
            initial={false}
            animate={{ x: operation === "SALE" ? "0%" : "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            style={{ width: "50%" }}
          />
          <button
            onClick={() => setOperation("SALE")}
            className={`relative z-10 px-10 py-3 font-bold tracking-wide text-md rounded-full transition-colors duration-300 flex-1 whitespace-nowrap ${
              operation === "SALE"
                ? "text-urbik-g100"
                : "text-urbik-muted hover:bg-urbik-g400/50"
            }`}
          >
            COMPRAR
          </button>
          <button
            onClick={() => setOperation("RENT")}
            className={`relative z-10 px-10 py-3 font-bold tracking-wide text-md rounded-full transition-colors duration-300 flex-1 whitespace-nowrap ${
              operation === "RENT"
                ? "text-urbik-white"
                : "text-urbik-muted hover:bg-urbik-g400/50"
            }`}
          >
            ALQUILAR
          </button>
        </div>

        <div className="relative flex bg-urbik-g300 rounded-full w-fit mb-6 overflow-hidden p-0">
          <motion.div
            className="absolute top-0 bottom-0 bg-urbik-black rounded-full"
            initial={false}
            animate={{ width: buttonData.width, x: buttonData.x }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
          {propertyOptions.map((opt) => (
            <button
              key={opt.id}
              id={`btn-${opt.id}`}
              onClick={(e) => {
                setPropertyType(opt.id);
                updatePill(e.currentTarget);
              }}
              className={`relative z-10 px-5.5 py-3 font-bold tracking-wide text-md transition-colors duration-300 whitespace-nowrap rounded-full ${
                propertyType === opt.id
                  ? "text-urbik-white"
                  : "text-urbik-muted hover:bg-urbik-g400/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-2 mb-5 w-full">
          <LocationSelectors
            provinceValue={province}
            cityValue={city}
            onChange={(name, val) => {
              if (name === "province") setProvince(val);
              if (name === "city") setCity(val);
            }}
            className="px-6 py-3 rounded-full bg-urbik-g300 text-urbik-black text-xs font-bold hover:bg-urbik-g200 transition outline-none min-w-[140px] border-none"
          />
        </div>
        <div className="flex justify-end w-full">
          <button
            onClick={onSearch}
            className="px-5 py-2 rounded-full bg-urbik-white3 text-urbik-muted font-bold transition-all flex items-center gap-2 active:scale-95 hover:bg-urbik-emerald hover:text-white hover:shadow-lg hover:shadow-urbik-emerald/20"
          >
            Buscar
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center lg:-mt-24 w-full">
        <div className="relative flex justify-center w-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="z-20 object-cover w-full h-auto mt-10"
          >
            <source src="/video.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
}