/*
Este código define un componente de búsqueda para una plataforma inmobiliaria en Next.js,
que permite a los usuarios filtrar propiedades por tipo de operación (venta o alquiler),
ubicación mediante un campo de texto y categoría del inmueble (casa, departamento, lote o
comercial). Al interactuar con la interfaz, el componente gestiona estados locales para 
capturar las preferencias del usuario y, al ejecutar la búsqueda, construye una URL con
parámetros de consulta (query strings) para redirigir dinámicamente a una página de
resultados en el mapa.
*/

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Home, Building2, Map as MapIcon, Store } from "lucide-react";

type OperationType = "SALE" | "RENT" | "SALE_RENT";
type PropertyType = "HOUSE" | "APARTMENT" | "LAND" | "COMMERCIAL";

export function HeroSearch() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [operation, setOperation] = useState<OperationType>("SALE");
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (operation !== "SALE_RENT") params.set("operation", operation);
    if (propertyType) params.set("type", propertyType);

    router.push(`/map?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setOperation("SALE")}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
            operation === "SALE"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-500 hover:bg-slate-50"
          }`}
        >
          Comprar
        </button>
        <button
          onClick={() => setOperation("RENT")}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
            operation === "RENT"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-500 hover:bg-slate-50"
          }`}
        >
          Alquilar
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-400 group-focus-within:text-[#00F0FF] transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por dirección, barrio o ciudad..."
            className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00F0FF] focus:border-transparent transition-all shadow-inner"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            Tipo de Propiedad
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FilterToggle
              active={propertyType === "HOUSE"}
              onClick={() =>
                setPropertyType(propertyType === "HOUSE" ? null : "HOUSE")
              }
              icon={<Home size={18} />}
              label="Casa"
            />
            <FilterToggle
              active={propertyType === "APARTMENT"}
              onClick={() =>
                setPropertyType(
                  propertyType === "APARTMENT" ? null : "APARTMENT"
                )
              }
              icon={<Building2 size={18} />}
              label="Depto"
            />
            <FilterToggle
              active={propertyType === "LAND"}
              onClick={() =>
                setPropertyType(propertyType === "LAND" ? null : "LAND")
              }
              icon={<MapIcon size={18} />}
              label="Lote"
            />
            <FilterToggle
              active={propertyType === "COMMERCIAL"}
              onClick={() =>
                setPropertyType(
                  propertyType === "COMMERCIAL" ? null : "COMMERCIAL"
                )
              }
              icon={<Store size={18} />}
              label="Comercial"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="w-full bg-[#00F0FF] hover:bg-[#00dbec] text-slate-900 font-black text-lg py-5 rounded-2xl shadow-lg shadow-cyan-500/30 transition-all transform active:scale-[0.99] uppercase tracking-wide flex items-center justify-center gap-2"
        >
          <Search className="w-6 h-6" />
          Buscar Propiedades
        </button>
      </div>
    </div>
  );
}

function FilterToggle({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl border-2 transition-all duration-200 ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-md transform scale-105"
          : "border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className={active ? "text-[#00F0FF]" : "text-slate-400"}>{icon}</div>
      <span className="text-xs font-bold uppercase">{label}</span>
    </button>
  );
}
