"use client";

import dynamic from "next/dynamic";
import React from "react";

const MapComponent = dynamic(
  () => import("./PropertyParcelView"),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-urbik-white2 animate-pulse rounded-md" />
  }
);

interface WrapperProps {
  lat: number;
  lon: number;
  selectedGeom: any;
  allProperties?: any[]; // Nueva prop para las demás parcelas
}

export default function PropertyParcelWrapper({ lat, lon, selectedGeom, allProperties = [] }: WrapperProps) {
  return (
    <div className="h-full w-full">
      <MapComponent 
        lat={lat} 
        lon={lon} 
        selectedGeom={selectedGeom} 
        allProperties={allProperties} 
      />
    </div>
  );
}