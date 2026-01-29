/*
Este código implementa un proveedor de contexto de React diseñado para gestionar
el estado global de capas e interacciones en un mapa, permitiendo rastrear y manipular
qué elementos geográficos (basados en el estándar GeoJSON) están actualmente bajo el
cursor (hovered) o han sido seleccionados (selected). Mediante el uso de createContext
y un hook personalizado llamado useMapLayers, el componente facilita que cualquier
subcomponente dentro de la jerarquía acceda a estos estados y a sus funciones de
actualización de manera eficiente, optimizando el rendimiento con useMemo para evitar
re-renderizados innecesarios y garantizando la integridad del tipado mediante TypeScript.
*/

"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type { Geometry } from "geojson";

export type Overlay = {
  geometry: Geometry;
  label?: string;
};

type Ctx = {
  hovered: Overlay | null;
  selected: Overlay | null;
  setHovered: (o: Overlay | null) => void;
  setSelected: (o: Overlay | null) => void;
  clearAll: () => void;
};

const MapLayersContext = createContext<Ctx | null>(null);

export function MapLayersProvider({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState<Overlay | null>(null);
  const [selected, setSelected] = useState<Overlay | null>(null);

  const value = useMemo<Ctx>(
    () => ({
      hovered,
      selected,
      setHovered,
      setSelected,
      clearAll: () => {
        setHovered(null);
        setSelected(null);
      },
    }),
    [hovered, selected]
  );

  return (
    <MapLayersContext.Provider value={value}>
      {children}
    </MapLayersContext.Provider>
  );
}

export function useMapLayers() {
  const ctx = useContext(MapLayersContext);
  if (!ctx) {
    throw new Error("useMapLayers must be used inside MapLayersProvider");
  }
  return ctx;
}
