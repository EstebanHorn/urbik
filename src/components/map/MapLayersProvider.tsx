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
