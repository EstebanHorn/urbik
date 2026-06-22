"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { GeoJsonObject } from "geojson";

type SafeGeoJSON = GeoJsonObject & { id?: string | number };

interface PropertyData {
  id: string | number;
  parcelGeom?: SafeGeoJSON | null;
  [key: string]: unknown;
}

interface PropertyParcelMapProps {
  lat: number;
  lon: number;
  selectedGeom?: SafeGeoJSON | null;
  allProperties?: PropertyData[];
}

const DynamicMap = dynamic(() => import("./PropertyParcelMapInner"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-geora-white2 animate-pulse rounded-md" />,
});

export default function PropertyParcelMap({ 
  lat, 
  lon, 
  selectedGeom, 
  allProperties = [] 
}: PropertyParcelMapProps) {
  return (
    <div className="h-full w-full">
      <DynamicMap 
        lat={lat} 
        lon={lon} 
        selectedGeom={selectedGeom} 
        allProperties={allProperties} 
      />
    </div>
  );
}