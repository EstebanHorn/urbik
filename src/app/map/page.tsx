/*
Este código implementa una página de búsqueda inmobiliaria interactiva en que permite
a los usuarios visualizar propiedades en un mapa dinámico y filtrarlas en tiempo real según
criterios como tipo de operación, precio y cantidad de ambientes. El componente gestiona de
manera asíncrona la obtención de datos desde una API basándose en los límites geográficos
visibles del mapa (bounding box), integrando una barra lateral de resultados, un sistema de
análisis de zonas y una interfaz adaptativa (responsive) que permite alternar entre la vista
de mapa y la lista de propiedades en dispositivos móviles.
*/

"use client";

import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { PropertiesSidebar } from "@/features/map/components/PropertiesSidebar";
import type { MapBounds, MapProperty } from "@/features/map/types/types";
import { useMapSettings } from "@/features/map/context/MapSettingsProvider";
import { ZoneAnalysis } from "../../components/SmartZone/SmartArea";
import { ZoneData } from "../../features/map/components/MapEventsHandler";
import { CustomDropdown } from "../../components/CustomDropdown";
import {
  Map as MapIcon,
  List,
  X,
  Zap,
  Flame,
  Wifi,
  Car,
  Waves,
  Droplets
} from "lucide-react";

const InteractiveMap = dynamic(
  () =>
    import("../../features/map/components/InteractiveMapClient").then(
      (mod) => mod.InteractiveMapClient
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
        <span className="text-sm font-medium">Cargando mapa...</span>
      </div>
    ),
  }
);

const AMENITIES_CONFIG = [
  { id: "hasElectricity", label: "Luz", icon: Zap },
  { id: "hasGas", label: "Gas", icon: Flame },
  { id: "hasInternet", label: "Internet", icon: Wifi },
  { id: "hasParking", label: "Cochera", icon: Car },
  { id: "hasPool", label: "Pileta", icon: Waves },
  { id: "hasWater", label: "Agua", icon: Droplets },
];

export default function MapPage() {
  const { propertiesLimit } = useMapSettings();
  const searchParams = useSearchParams();
  const boundsRef = useRef<MapBounds | null>(null);

  const defaultLat = -34.92145;
  const defaultLon = -57.95453;
  const lat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : defaultLat;
  const lon = searchParams.get("lon") ? parseFloat(searchParams.get("lon")!) : defaultLon;

  const [properties, setProperties] = useState<MapProperty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);
  const [currentZone, setCurrentZone] = useState<ZoneData | null>(null);

  const [filters, setFilters] = useState({
    operationType: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    rooms: "",
    hasWater: false,
    hasElectricity: false,
    hasGas: false,
    hasInternet: false,
    hasParking: false,
    hasPool: false,
  });

  const fetchFilteredProperties = useCallback(async (bounds: MapBounds, currentFilters: typeof filters) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        minLat: bounds.minLat.toString(),
        maxLat: bounds.maxLat.toString(),
        minLon: bounds.minLon.toString(),
        maxLon: bounds.maxLon.toString(),
      });

      if (currentFilters.operationType) query.append("operationType", currentFilters.operationType);
      if (currentFilters.propertyType) query.append("propertyType", currentFilters.propertyType);
      if (currentFilters.minPrice) query.append("minPrice", currentFilters.minPrice);
      if (currentFilters.maxPrice) query.append("maxPrice", currentFilters.maxPrice);
      if (currentFilters.rooms) query.append("rooms", currentFilters.rooms);
      
      if (currentFilters.hasWater) query.append("hasWater", "true");
      if (currentFilters.hasElectricity) query.append("hasElectricity", "true");
      if (currentFilters.hasGas) query.append("hasGas", "true");
      if (currentFilters.hasInternet) query.append("hasInternet", "true");
      if (currentFilters.hasParking) query.append("hasParking", "true");
      if (currentFilters.hasPool) query.append("hasPool", "true");

      const res = await fetch(`/api/properties/in-bounds?${query}`);
      if (!res.ok) throw new Error("Error fetching properties");
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (error) {
      console.error("Error al filtrar propiedades:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    boundsRef.current = bounds;
    fetchFilteredProperties(bounds, filters);
  }, [fetchFilteredProperties, filters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (boundsRef.current) {
      fetchFilteredProperties(boundsRef.current, filters);
    }
  }, [filters, fetchFilteredProperties]);

  const clearFilters = () => {
    setFilters({
      operationType: "",
      propertyType: "",
      minPrice: "",
      maxPrice: "",
      rooms: "",
      hasWater: false,
      hasElectricity: false,
      hasGas: false,
      hasInternet: false,
      hasParking: false,
      hasPool: false,
    });
  };

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 z-0 flex flex-col bg-slate-100 overflow-hidden">
      
      <div className="w-full bg-white border-b border-slate-200 z-40 px-6 py-3 shadow-sm flex items-center justify-between">
        
        <button 
          onClick={clearFilters}
          className="h-10 px-4 text-md font-black cursor-pointer text-urbik-black/50 hover:text-urbik-rose transition-colors flex items-center gap-1 shrink-0"
        >
          <X size={20} /> Limpiar filtros
        </button>

        <div className="flex flex-wrap gap-4 items-center justify-end">
          
          <div className="flex flex-wrap gap-1.5 border-r border-slate-200 pr-4 mr-2">
            {AMENITIES_CONFIG.map((amenity) => {
              const Icon = amenity.icon;
              const isActive = filters[amenity.id as keyof typeof filters];
              return (
                <button
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id as keyof typeof filters)}
                  className={`
                    flex items-center cursor-pointer gap-1 px-2.5 py-1.5 rounded-full border text-[10px] font-bold transition-all
                    ${isActive 
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

          <div className="flex flex-wrap gap-2 items-center">
            <CustomDropdown 
              label="Operación"
              variant="white2"
              value={filters.operationType}
              onChange={(val) => setFilters(f => ({ ...f, operationType: val }))}
              options={[
                { label: "Operación", value: "" },
                { label: "Venta", value: "SALE" },
                { label: "Alquiler", value: "RENT" },
                { label: "Venta y Alquiler", value: "SALE_RENT" },
              ]}
            />

            <CustomDropdown 
              label="Tipo"
              variant="white2"
              value={filters.propertyType}
              onChange={(val) => setFilters(f => ({ ...f, propertyType: val }))}
              options={[
                { label: "Tipo", value: "" },
                { label: "Casa", value: "HOUSE" },
                { label: "Departamento", value: "APARTMENT" },
                { label: "Terreno", value: "LAND" },
                { label: "Oficina", value: "OFFICE" },
                { label: "Local", value: "COMMERCIAL_PROPERTY" },
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
                  className="w-16 bg-transparent text-urbik-black text-[10px] font-bold outline-none placeholder:text-urbik-black/50"
                />
              </div>

              <div className="flex items-center bg-urbik-white border border-black/50 hover:bg-slate-50 rounded-full px-3 h-10">
                <input 
                  type="number" 
                  name="maxPrice" 
                  placeholder="Máx $" 
                  value={filters.maxPrice} 
                  onChange={handleInputChange}
                  className="w-16 bg-transparent text-urbik-black text-[10px] font-bold outline-none placeholder:text-urbik-black/50"
                />
              </div>
            </div>

            <CustomDropdown 
              label="Ambientes"
              variant="white2"
              value={filters.rooms}
              onChange={(val) => setFilters(f => ({ ...f, rooms: val }))}
              options={[
                { label: "Ambientes", value: "" },
                { label: "1+ amb", value: "1" },
                { label: "2+ amb", value: "2" },
                { label: "3+ amb", value: "3" },
                { label: "4+ amb", value: "4" },
              ]}
            />
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
            <h2 className="font-bold text-lg text-slate-800">
              Resultados ({properties.length})
            </h2>
            <button onClick={() => setShowMobileList(false)} className=" cursor-pointer text-slate-500 p-2">✕</button>
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

          <div className="absolute bottom-10 right-10 z-[9999] pointer-events-auto hidden md:block">
            <ZoneAnalysis data={currentZone} />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[50] md:hidden pointer-events-auto w-max">
            <button
              onClick={() => setShowMobileList(!showMobileList)}
              className="bg-slate-900 text-white px-6 py-3 cursor-pointer rounded-full shadow-2xl flex items-center gap-3 font-medium active:scale-95 transition-transform"
            >
              {showMobileList ? (
                <> <MapIcon className="w-4 h-4" /> Ver Mapa </>
              ) : (
                <>
                  <List className="w-4 h-4" /> Ver Lista{" "}
                  <span className="bg-slate-700 px-2 text-xs rounded-full">
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