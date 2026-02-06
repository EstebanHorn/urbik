"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { GeoJsonObject } from "geojson";

const MapComponent = dynamic(() => import("./PropertyParcelView"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-urbik-white2 animate-pulse rounded-md" />
  ),
});

interface WrapperProps {
  lat: number;
  lon: number;
  selectedGeom: GeoJsonObject | null;
  allProperties?: Array<{
    id: string | number;
    parcelGeom?: GeoJsonObject | null;
    [key: string]: unknown;
  }>;
}

export default function PropertyParcelWrapper({
  lat,
  lon,
  selectedGeom,
  allProperties = [],
}: WrapperProps) {
  return (
    <div className="h-full w-full">
      <MapComponent
        lat={lat}
        lon={lon}
        // TypeScript ahora acepta selectedGeom porque es compatible con la firma del componente
        selectedGeom={
          selectedGeom as (GeoJsonObject & { id?: string | number }) | null
        }
        allProperties={allProperties}
      />
    </div>
  );
}
