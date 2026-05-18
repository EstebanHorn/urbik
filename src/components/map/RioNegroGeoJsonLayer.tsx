"use client";

import { GeoJSON, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import type { FeatureCollection } from "geojson";

const MIN_ZOOM = 14;
const DEBOUNCE_MS = 250;
const PAD_RATIO = 0.25;

const canvasRenderer = L.canvas({ padding: 0.5 });

export function RioNegroGeoJsonLayer() {
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
      const padded = bounds.pad(PAD_RATIO);
      const minLat = padded.getSouth();
      const maxLat = padded.getNorth();
      const minLon = padded.getWest();
      const maxLon = padded.getEast();

      const key = `${minLat.toFixed(3)},${maxLat.toFixed(3)},${minLon.toFixed(3)},${maxLon.toFixed(3)}`;
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
        const url = `/api/parcels/rio-negro?minLat=${minLat}&maxLat=${maxLat}&minLon=${minLon}&maxLon=${maxLon}`;
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
          console.error("Error fetching Rio Negro parcels:", err);
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
