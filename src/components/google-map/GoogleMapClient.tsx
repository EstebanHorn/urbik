"use client";

import { Map } from '@vis.gl/react-google-maps';
import GoogleSearchBar from './GoogleSearchBar';
import { GoogleDbParcelsLayer } from './GoogleDbParcelsLayer';
import { GoogleStaticParcelsLayer } from './GoogleStaticParcelsLayer';
import type { MapProperty, MapBounds } from "@/components/map/types";

export interface GoogleMapClientProps {
  lat: number;
  lon: number;
  properties?: MapProperty[];
  onBoundsChange?: (bounds: MapBounds) => void;
  onPropertySelect?: (prop: MapProperty) => void;
  height?: string;
}

export default function GoogleMapClient({
  lat,
  lon,
  properties = [],
  onBoundsChange,
  onPropertySelect,
  height = "100%",
}: GoogleMapClientProps) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      {/* Barra de Búsqueda de Google */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-md">
        <GoogleSearchBar />
      </div>

      <Map
        defaultCenter={{ lat, lng: lon }}
        defaultZoom={15}
        minZoom={3}
        maxZoom={19}
        disableDefaultUI={true}
        gestureHandling="greedy" // Permite hacer zoom con scroll directamente
        // Usamos onIdle para disparar la búsqueda de la DB solo cuando el mapa se detiene, evitando spam a la API
        onIdle={(e) => {
          if (!onBoundsChange) return;
          const bounds = e.map.getBounds();
          if (bounds) {
            onBoundsChange({
              minLat: bounds.getSouthWest().lat(),
              maxLat: bounds.getNorthEast().lat(),
              minLon: bounds.getSouthWest().lng(),
              maxLon: bounds.getNorthEast().lng(),
            });
          }
        }}
      >
        <GoogleStaticParcelsLayer />
<GoogleDbParcelsLayer properties={properties} onPropertySelect={onPropertySelect} />
      </Map>
    </div>
  );
}