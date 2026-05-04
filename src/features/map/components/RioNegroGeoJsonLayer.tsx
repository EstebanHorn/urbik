"use client";

import { GeoJSON, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import type { FeatureCollection } from "geojson";

const MIN_ZOOM = 14;

export function RioNegroGeoJsonLayer() {
  const map = useMap();
  const [data, setData] = useState<FeatureCollection | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastKeyRef = useRef<string>("");

  const fetchParcels = async () => {
    if (!map) return;
    if (map.getZoom() < MIN_ZOOM) {
      setData(null);
      return;
    }

    const bounds = map.getBounds();
    const key = `${bounds.getSouth().toFixed(4)},${bounds.getNorth().toFixed(4)},${bounds.getWest().toFixed(4)},${bounds.getEast().toFixed(4)}`;
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const url = `/api/parcels/rio-negro?minLat=${bounds.getSouth()}&maxLat=${bounds.getNorth()}&minLon=${bounds.getWest()}&maxLon=${bounds.getEast()}`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return;
      const json = (await res.json()) as FeatureCollection;
      setData(json);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Error fetching Rio Negro parcels:", err);
      }
    }
  };

  useEffect(() => {
    fetchParcels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useMapEvents({
    moveend: fetchParcels,
    zoomend: fetchParcels,
  });

  if (!data || !data.features?.length) return null;

  return (
    <GeoJSON
      key={lastKeyRef.current}
      data={data}
      style={{
        color: "#00ff8e",
        weight: 0.8,
        fillColor: "transparent",
        fillOpacity: 0,
      }}
    />
  );
}
