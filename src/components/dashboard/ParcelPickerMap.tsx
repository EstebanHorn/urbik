"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, WMSTileLayer, GeoJSON, useMap, useMapEvents } from "react-leaflet";
import type { FeatureCollection, Geometry } from "geojson";

const PROVINCE_CENTERS: Record<string, [number, number]> = {
  "Buenos Aires": [-36.7, -60.3],
  "CABA": [-34.6, -58.4],
  "Ciudad Autónoma de Buenos Aires": [-34.6, -58.4],
  "Córdoba": [-31.4, -64.2],
  "Santa Fe": [-30.7, -60.7],
  "Mendoza": [-32.9, -68.8],
  "Tucumán": [-26.8, -65.2],
  "Entre Ríos": [-31.8, -58.9],
  "Salta": [-24.8, -65.4],
  "Río Negro": [-40.7, -63.6],
  "Neuquén": [-38.9, -68.1],
  "Chubut": [-44.0, -68.5],
  "Jujuy": [-23.2, -65.3],
  "Corrientes": [-27.9, -57.1],
  "Misiones": [-27.4, -55.9],
  "La Pampa": [-37.1, -65.5],
  "Chaco": [-27.4, -61.0],
  "Formosa": [-23.0, -59.2],
  "Santiago del Estero": [-27.8, -64.3],
  "San Juan": [-31.0, -68.5],
  "San Luis": [-33.3, -66.3],
  "Catamarca": [-28.5, -65.8],
  "La Rioja": [-29.4, -66.9],
  "Santa Cruz": [-51.6, -69.2],
  "Tierra del Fuego": [-54.8, -68.3],
};

function getProvinceCenter(province: string): [number, number] {
  const normalized = province.trim();
  const exact = PROVINCE_CENTERS[normalized];
  if (exact) return exact;
  for (const [key, coords] of Object.entries(PROVINCE_CENTERS)) {
    if (normalized.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(normalized.toLowerCase())) {
      return coords;
    }
  }
  return [-34.6, -58.4];
}

function isRioNegro(province: string) {
  return /r[íi]o\s*negro/i.test(province);
}

// Rio Negro GeoJSON layer with click-to-select via Turf.js
function RioNegroClickLayer({ onParcelClick }: { onParcelClick: (lat: number, lng: number) => void }) {
  const map = useMap();
  const [data, setData] = useState<FeatureCollection | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheRef = useRef<Map<string, FeatureCollection>>(new Map());
  const lastKeyRef = useRef("");

  const fetchParcels = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const zoom = map.getZoom();
      if (zoom < 13) { setData(null); return; }
      const bounds = map.getBounds().pad(0.1);
      const key = `${bounds.getSouth().toFixed(3)},${bounds.getNorth().toFixed(3)},${bounds.getWest().toFixed(3)},${bounds.getEast().toFixed(3)}`;
      if (key === lastKeyRef.current) return;
      lastKeyRef.current = key;
      const cached = cacheRef.current.get(key);
      if (cached) { setData(cached); return; }
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const url = `/api/parcels/rio-negro?minLat=${bounds.getSouth()}&maxLat=${bounds.getNorth()}&minLon=${bounds.getWest()}&maxLon=${bounds.getEast()}&limit=3000`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) return;
        const json = await res.json() as FeatureCollection;
        if (cacheRef.current.size > 20) {
          const firstKey = cacheRef.current.keys().next().value;
          if (firstKey) cacheRef.current.delete(firstKey);
        }
        cacheRef.current.set(key, json);
        setData(json);
      } catch { /* ignore abort */ }
    }, 250);
  };

  useEffect(() => {
    fetchParcels();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useMapEvents({ moveend: fetchParcels, zoomend: fetchParcels });

  useEffect(() => {
    const prev = map.getContainer().style.cursor;
    map.getContainer().style.cursor = "crosshair";
    return () => { map.getContainer().style.cursor = prev; };
  }, [map]);

  if (!data || !data.features?.length) return null;

  return (
    <GeoJSON
      key={lastKeyRef.current}
      data={data}
      style={{ color: "#00ff8e", weight: 0.7, fillColor: "transparent", fillOpacity: 0 }}
      eventHandlers={{
        click: (e) => {
          const { lat, lng } = e.latlng;
          onParcelClick(lat, lng);
        },
      }}
    />
  );
}

// Buenos Aires: WMS tiles + click handler that calls API
function BuenosAiresClickLayer({ onParcelClick }: { onParcelClick: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    const prev = map.getContainer().style.cursor;
    map.getContainer().style.cursor = "crosshair";
    return () => { map.getContainer().style.cursor = prev; };
  }, [map]);

  useMapEvents({
    click: (e) => {
      onParcelClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <WMSTileLayer
      url="https://geo.arba.gov.ar/geoserver/idera/ows?"
      layers="Parcela"
      format="image/png"
      transparent={true}
      version="1.1.1"
      tileSize={256}
      maxZoom={19}
      minZoom={15}
      className="brightness-200 saturate-200"
    />
  );
}

// Highlight layer for selected parcel
function SelectedParcelLayer({ geometry }: { geometry: Geometry | null }) {
  if (!geometry) return null;

  const feature = {
    type: "Feature" as const,
    geometry,
    properties: {},
  };

  return (
    <GeoJSON
      key={JSON.stringify(geometry).slice(0, 50)}
      data={feature}
      style={{ color: "#10b981", weight: 3, fillColor: "#10b981", fillOpacity: 0.35 }}
    />
  );
}

function MapAutoCenter({ city, province }: { city?: string; province: string }) {
  const map = useMap();

  useEffect(() => {
    const q = [city, province, "Argentina"].filter(Boolean).join(", ");
    if (!q.trim()) return;

    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=ar&limit=1`,
    )
      .then((r) => r.json())
      .then((data: Array<{ lat: string; lon: string }>) => {
        if (data[0]) {
          map.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 16);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function ZoomHint() {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  if (zoom >= 15) return null;

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white/90 rounded-xl px-4 py-2.5 shadow border border-gray-100 pointer-events-none">
      <p className="text-xs font-bold text-gray-600">Acercate para ver las parcelas</p>
    </div>
  );
}

interface ParcelPickerMapProps {
  province: string;
  city?: string;
  onParcelClick: (lat: number, lng: number) => void;
  selectedGeometry: Geometry | null;
}

export default function ParcelPickerMap({
  province,
  city,
  onParcelClick,
  selectedGeometry,
}: ParcelPickerMapProps) {
  const center = getProvinceCenter(province);
  const rioNegro = isRioNegro(province);

  return (
    <MapContainer
      center={center}
      zoom={rioNegro ? 13 : 16}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      attributionControl={false}
    >
      <ZoomControls />
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <MapAutoCenter city={city} province={province} />

      {rioNegro ? (
        <RioNegroClickLayer onParcelClick={onParcelClick} />
      ) : (
        <>
          <BuenosAiresClickLayer onParcelClick={onParcelClick} />
          <ZoomHint />
        </>
      )}

      <SelectedParcelLayer geometry={selectedGeometry} />
    </MapContainer>
  );
}

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute bottom-5 left-4 z-[1000] flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="w-9 h-9 bg-white rounded-xl shadow-md border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
      >
        +
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="w-9 h-9 bg-white rounded-xl shadow-md border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
      >
        −
      </button>
    </div>
  );
}
