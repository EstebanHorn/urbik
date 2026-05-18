"use client";

import { useMapEvents } from "react-leaflet";
import { useEffect, useCallback, useRef } from "react";
import type { MapBounds } from "./types";
import { useMapSettings } from "@/components/map/MapSettingsProvider";

export interface ZoneData {
  lat: number;
  lng: number;
  address: string;
  zone: string;
  zoom: number;
}

interface MapEventsHandlerProps {
  onBoundsChange: (bounds: MapBounds) => void;
  onCenterChange: (data: ZoneData) => void;
}

export function MapEventsHandler({
  onBoundsChange,
  onCenterChange,
}: MapEventsHandlerProps) {
  const { isZoneAnalysisEnabled } = useMapSettings();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchAddress = useCallback(
    async (lat: number, lng: number, zoom: number) => {
      if (!isZoneAnalysisEnabled || !isMountedRef.current || zoom < 14) {
        onCenterChange({ lat, lng, address: "", zone: "", zoom });
        return;
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
          { headers: { "Accept-Language": "es" } },
        );

        if (!response.ok) {
          if (isMountedRef.current) {
            onCenterChange({ lat, lng, address: "", zone: "", zoom });
          }
          return;
        }

        const data = await response.json();

        if (data && data.address && isMountedRef.current) {
          const { road, house_number, suburb, city, town, village } =
            data.address;
          const street = road || "Calle desconocida";
          const number = house_number ? ` ${house_number}` : "";
          const neighborhood =
            suburb || city || town || village || "Zona no identificada";

          onCenterChange({
            lat,
            lng,
            address: `${street}${number}`,
            zone: neighborhood,
            zoom,
          });
        }
      } catch {
        if (isMountedRef.current) {
          onCenterChange({ lat, lng, address: "", zone: "", zoom });
        }
      }
    },
    [onCenterChange, isZoneAnalysisEnabled],
  );

  const map = useMapEvents({
    load: (e) => {
      const m = e.target;
      const center = m.getCenter();
      const bounds = m.getBounds();
      const zoom = m.getZoom();
      fetchAddress(center.lat, center.lng, zoom);
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLon: bounds.getWest(),
        maxLon: bounds.getEast(),
      });
    },
    moveend: () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!map || !(map as any)._loaded) return;

      const center = map.getCenter();
      const bounds = map.getBounds();
      const zoom = map.getZoom();

      fetchAddress(center.lat, center.lng, zoom);

      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLon: bounds.getWest(),
        maxLon: bounds.getEast(),
      });
    },
  });

  return null;
}
