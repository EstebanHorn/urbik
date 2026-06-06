"use client";

import { Map } from '@vis.gl/react-google-maps';
import { GoogleDbParcelsLayer } from './GoogleDbParcelsLayer';
import { GoogleStaticParcelsLayer } from './GoogleStaticParcelsLayer';
import type { MapProperty, MapBounds } from "@/components/map/types";

export interface GoogleMapClientProps {
  lat: number;
  lon: number;
  baseLayer?: string;
  properties?: MapProperty[];
  onBoundsChange?: (bounds: MapBounds) => void;
  onPropertySelect?: (prop: MapProperty) => void;
  height?: string;
}

export default function GoogleMapClient({
  lat,
  lon,
  baseLayer = "roadmap",
  properties = [],
  onBoundsChange,
  onPropertySelect,
  height = "100%",
}: GoogleMapClientProps) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>


      <Map
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID as string}
        mapTypeId={baseLayer}
        defaultCenter={{ lat, lng: lon }}
        defaultZoom={15}
        minZoom={3}
        maxZoom={19}
        disableDefaultUI={true}
        gestureHandling="greedy"
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