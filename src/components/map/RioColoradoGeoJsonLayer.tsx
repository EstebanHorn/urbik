"use client";

import { GeoJSON, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import type { FeatureCollection } from "geojson";
import { snapBBoxToGrid } from "./utils";

const MIN_ZOOM = 14;
const DEBOUNCE_MS = 250;

const canvasRenderer = L.canvas({ padding: 0.5 });

export function RioColoradoGeoJsonLayer() {
  const map = useMap();
  const [data, setData] = useState<FeatureCollection | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheRef = useRef<Map<string, FeatureCollection>>(new Map());
  const lastBoundsKeyRef = useRef<string>("");

  const style = useMemo<L.PathOptions>(
    () => ({
      color: "#00ff8e",
      weight: 0.7,
      fillColor: "transparent",
      fillOpacity: 0,
      interactive: false,
    }),
    [],
  );

  const fetchParcels = () => {
    if (!map) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const zoom = map.getZoom();
      if (zoom < MIN_ZOOM) {
        if (data) setData(null);
        return;
      }

      const bounds = map.getBounds();
      const { minLat, maxLat, minLon, maxLon } = snapBBoxToGrid({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLon: bounds.getWest(),
        maxLon: bounds.getEast(),
      });

      const key = `${minLat},${maxLat},${minLon},${maxLon}`;
      if (key === lastBoundsKeyRef.current) return;
      lastBoundsKeyRef.current = key;

      const cached = cacheRef.current.get(key);
      if (cached) {
        setData(cached);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const url = `/api/parcels/rio-colorado?minLat=${minLat}&maxLat=${maxLat}&minLon=${minLon}&maxLon=${maxLon}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return;
        const json = (await res.json()) as FeatureCollection;

        if (cacheRef.current.size > 30) {
          const firstKey = cacheRef.current.keys().next().value;
          if (firstKey) cacheRef.current.delete(firstKey);
        }
        cacheRef.current.set(key, json);
        setData(json);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error fetching Rio Colorado parcels:", err);
        }
      }
    }, DEBOUNCE_MS);
  };

  useEffect(() => {
    fetchParcels();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useMapEvents({
    moveend: fetchParcels,
    zoomend: fetchParcels,
  });

  if (!data || !data.features?.length) return null;

  return (
    <GeoJSON
      key={lastBoundsKeyRef.current}
      data={data}
      style={style}
      pathOptions={{ renderer: canvasRenderer }}
    />
  );
}
