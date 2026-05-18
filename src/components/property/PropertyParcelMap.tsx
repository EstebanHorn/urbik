"use client";

import dynamic from "next/dynamic";
import React from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
// @ts-expect-error: TypeScript no encuentra los tipos del CSS, pero Next.js lo resuelve en el build sin problemas
import "leaflet/dist/leaflet.css";
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

function MapView({ lat, lon, selectedGeom, allProperties = [] }: PropertyParcelMapProps) {
  return (
    <MapContainer
      center={[lat, lon]}
      zoom={17}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      touchZoom={false}
      zoomControl={false}
      attributionControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

      {allProperties.map((prop) =>
        prop.parcelGeom && prop.id !== selectedGeom?.id && (
          <GeoJSON
            key={prop.id}
            data={prop.parcelGeom}
            style={{ color: "#94a3b8", weight: 1, fillColor: "#cbd5e1", fillOpacity: 0.1 }}
          />
        )
      )}

      {selectedGeom && (
        <GeoJSON
          data={selectedGeom}
          style={{ color: "#00E5FF", weight: 3, fillColor: "#00E5FF", fillOpacity: 0.3 }}
        />
      )}
    </MapContainer>
  );
}

const DynamicMap = dynamic(() => Promise.resolve(MapView), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-urbik-white2 animate-pulse rounded-md" />,
});

export default function PropertyParcelMap({ lat, lon, selectedGeom, allProperties = [] }: PropertyParcelMapProps) {
  return (
    <div className="h-full w-full">
      <DynamicMap lat={lat} lon={lon} selectedGeom={selectedGeom as SafeGeoJSON} allProperties={allProperties} />
    </div>
  );
}