"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { Map, AdvancedMarker, useMap, useMapsLibrary, type MapMouseEvent } from "@vis.gl/react-google-maps";
import type { Geometry } from "geojson";
import { parcelTileUrl, PARCEL_MIN_ZOOM } from "@/lib/rioNegroParcels";

const PROVINCE_CENTERS: Record<string, { lat: number; lng: number }> = {
  // ... (Tus PROVINCE_CENTERS iguales)
  "Buenos Aires": { lat: -36.7, lng: -60.3 },
  "CABA": { lat: -34.6, lng: -58.4 },
  "Ciudad Autónoma de Buenos Aires": { lat: -34.6, lng: -58.4 },
  "Córdoba": { lat: -31.4, lng: -64.2 },
  "Santa Fe": { lat: -30.7, lng: -60.7 },
  "Mendoza": { lat: -32.9, lng: -68.8 },
  "Tucumán": { lat: -26.8, lng: -65.2 },
  "Entre Ríos": { lat: -31.8, lng: -58.9 },
  "Salta": { lat: -24.8, lng: -65.4 },
  "Río Negro": { lat: -40.7, lng: -63.6 },
  "Neuquén": { lat: -38.9, lng: -68.1 },
  "Chubut": { lat: -44.0, lng: -68.5 },
  "Jujuy": { lat: -23.2, lng: -65.3 },
  "Corrientes": { lat: -27.9, lng: -57.1 },
  "Misiones": { lat: -27.4, lng: -55.9 },
  "La Pampa": { lat: -37.1, lng: -65.5 },
  "Chaco": { lat: -27.4, lng: -61.0 },
  "Formosa": { lat: -23.0, lng: -59.2 },
  "Santiago del Estero": { lat: -27.8, lng: -64.3 },
  "San Juan": { lat: -31.0, lng: -68.5 },
  "San Luis": { lat: -33.3, lng: -66.3 },
  "Catamarca": { lat: -28.5, lng: -65.8 },
  "La Rioja": { lat: -29.4, lng: -66.9 },
  "Santa Cruz": { lat: -51.6, lng: -69.2 },
  "Tierra del Fuego": { lat: -54.8, lng: -68.3 },
};

function getProvinceCenter(province: string): { lat: number; lng: number } {
  const normalized = province.trim();
  if (PROVINCE_CENTERS[normalized]) return PROVINCE_CENTERS[normalized];
  for (const [key, coords] of Object.entries(PROVINCE_CENTERS)) {
    if (
      normalized.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(normalized.toLowerCase())
    ) {
      return coords;
    }
  }
  return { lat: -34.6, lng: -58.4 };
}

// Río Colorado es una localidad de la provincia de Río Negro: el formulario carga
// province = "Río Negro", así que el gate sigue siendo la provincia.
function usesLocalParcels(province: string) {
  return /r[íi]o\s*negro/i.test(province);
}

const DATA_STYLE_SELECTED = {
  strokeColor: "#10b981",
  strokeWeight: 3,
  fillColor: "#10b981",
  fillOpacity: 0.35,
  zIndex: 10,
};
const DATA_STYLE_RIO_COLORADO = {
  strokeColor: "#00c96e",
  strokeWeight: 2,
  fillColor: "#00c96e",
  fillOpacity: 0.08,
};

function applyDataStyle(map: google.maps.Map) {
  map.data.setStyle((feature) => {
    if (feature.getProperty("isSelectedParcel")) return DATA_STYLE_SELECTED;
    if (feature.getProperty("rioColorado")) return DATA_STYLE_RIO_COLORADO;
    return {};
  });
}

// ── Auto-center using Google Geocoding API ───────────────────────────────────

function MapAutoCenter({ city, province }: { city?: string; province: string }) {
  const map = useMap();
  const geocodingLib = useMapsLibrary("geocoding");
  const doneRef = useRef(false);

  useEffect(() => {
    if (!map || !geocodingLib || doneRef.current) return;
    doneRef.current = true;
    const geocoder = new geocodingLib.Geocoder();
    const address = [city, province, "Argentina"].filter(Boolean).join(", ");
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        map.panTo(results[0].geometry.location);
        map.setZoom(16);
      }
    });
  }, [map, geocodingLib, city, province]);

  return null;
}

// ── ARBA WMS overlay for Buenos Aires cadastral parcels ──────────────────────

function ARBAWMSLayer() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const overlay = new google.maps.ImageMapType({
      name: "ARBA Parcelas",
      tileSize: new google.maps.Size(256, 256),
      minZoom: 15,
      maxZoom: 19,
      opacity: 1,
      getTileUrl(coord, zoom) {
        if (zoom < 15) return "";
        const n = Math.pow(2, zoom);
        const west = (coord.x / n) * 360 - 180;
        const east = ((coord.x + 1) / n) * 360 - 180;
        const north =
          Math.atan(Math.sinh(Math.PI * (1 - (2 * coord.y) / n))) *
          (180 / Math.PI);
        const south =
          Math.atan(Math.sinh(Math.PI * (1 - (2 * (coord.y + 1)) / n))) *
          (180 / Math.PI);
        const sld = encodeURIComponent(
          `<?xml version="1.0"?><StyledLayerDescriptor version="1.0.0">` +
          `<NamedLayer><Name>idera:Parcela</Name><UserStyle><FeatureTypeStyle><Rule>` +
          `<PolygonSymbolizer>` +
          `<Stroke><CssParameter name="stroke">#1a7a4a</CssParameter>` +
          `<CssParameter name="stroke-width">2</CssParameter></Stroke>` +
          `<Fill><CssParameter name="fill">#00c96e</CssParameter>` +
          `<CssParameter name="fill-opacity">0.08</CssParameter></Fill>` +
          `</PolygonSymbolizer>` +
          `</Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>`
        );
        return (
          `https://geo.arba.gov.ar/geoserver/idera/ows?SERVICE=WMS&VERSION=1.1.1` +
          `&REQUEST=GetMap&LAYERS=Parcela&FORMAT=image%2Fpng` +
          `&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&SRS=EPSG%3A4326` +
          `&BBOX=${west},${south},${east},${north}&SLD_BODY=${sld}`
        );
      },
    });

    map.overlayMapTypes.push(overlay);
    return () => {
      const arr = map.overlayMapTypes.getArray();
      const idx = arr.indexOf(overlay);
      if (idx !== -1) map.overlayMapTypes.removeAt(idx);
    };
  }, [map]);

  return null;
}

// ── Río Negro: teselas del catastro provincial (ArcGIS) ──────────────────────
// Reemplaza la capa vectorial de Río Colorado (lenta): el server dibuja las
// parcelas como PNG. El click se maneja con el onClick nativo del <Map> (igual
// que ARBA), que dispara /api/parcels/point → identify.

function RioNegroArcGISLayer() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const overlay = new google.maps.ImageMapType({
      name: "Parcelas RN",
      tileSize: new google.maps.Size(256, 256),
      minZoom: PARCEL_MIN_ZOOM,
      maxZoom: 19,
      opacity: 0.9,
      getTileUrl(coord, zoom) {
        if (zoom < PARCEL_MIN_ZOOM) return null;
        return parcelTileUrl(coord.x, coord.y, zoom);
      },
    });

    map.overlayMapTypes.push(overlay);
    return () => {
      const arr = map.overlayMapTypes.getArray();
      const idx = arr.indexOf(overlay);
      if (idx !== -1) map.overlayMapTypes.removeAt(idx);
    };
  }, [map]);

  return null;
}

// ── Selected parcel geometry overlay ────────────────────────────────────────

function SelectedParcelLayer({ geometry }: { geometry: Geometry | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    map.data.forEach((f) => {
      if (f.getProperty("isSelectedParcel")) map.data.remove(f);
    });

    if (geometry) {
      map.data.addGeoJson({
        type: "Feature",
        geometry,
        properties: { isSelectedParcel: true },
      });
    }

    applyDataStyle(map);

    return () => {
      if (!map) return;
      map.data.forEach((f) => {
        if (f.getProperty("isSelectedParcel")) map.data.remove(f);
      });
    };
  }, [map, geometry]);

  return null;
}

// ── Custom Drawing Polygon Layer ────────────────────────────────────────────
function DrawnPolygonLayer({ path }: { path: { lat: number; lng: number }[] }) {
  const map = useMap();
  const polyRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!map || !window.google) return;
    
    // Instanciamos el polígono solo una vez
    if (!polyRef.current) {
      polyRef.current = new google.maps.Polygon({
        map,
        strokeColor: "#10b981", // Mantenemos la paleta "emerald"
        strokeWeight: 3,
        fillColor: "#10b981",
        fillOpacity: 0.35,
        zIndex: 20, // Por encima de los WMS
      });
    }
    
    // Actualizamos los vértices en vivo cada vez que llega un punto nuevo
    polyRef.current.setPath(path);
  }, [map, path]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (polyRef.current) {
        polyRef.current.setMap(null);
        polyRef.current = null;
      }
    };
  }, []);

  return null;
}

// ── Main component ───────────────────────────────────────────────────────────

export interface ParcelPickerMapProps {
  province: string;
  city?: string;
  onMapClick: (lat: number, lng: number) => void;
  selectedGeometry: Geometry | null;
  manualPin?: { lat: number; lng: number } | null;
  drawnPath?: { lat: number; lng: number }[];
  // Centro inicial cuando ya hay una parcela seleccionada/dibujada (al editar).
  initialCenter?: { lat: number; lng: number } | null;
}

export default function ParcelPickerMap({
  province,
  city,
  onMapClick,
  selectedGeometry,
  manualPin,
  drawnPath,
  initialCenter,
}: ParcelPickerMapProps) {
  const rioNegro = usesLocalParcels(province);
  const center = initialCenter ?? getProvinceCenter(province);
  const initialZoom = initialCenter ? 17 : 15;

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (e.detail.latLng) onMapClick(e.detail.latLng.lat, e.detail.latLng.lng);
    },
    [onMapClick]
  );

  return (
    <Map
      mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID as string}
      defaultCenter={center}
      defaultZoom={initialZoom}
      mapTypeId="hybrid"
      disableDefaultUI
      gestureHandling="greedy"
      onClick={handleMapClick}
      draggableCursor="pointer"
      draggingCursor="move"
      style={{ width: "100%", height: "100%" }}
    >
      {!initialCenter && <MapAutoCenter city={city} province={province} />}

      {rioNegro ? <RioNegroArcGISLayer /> : <ARBAWMSLayer />}

      <SelectedParcelLayer geometry={selectedGeometry} />

      {/* Renders del modo de dibujo manual */}
      {drawnPath && drawnPath.length > 0 && <DrawnPolygonLayer path={drawnPath} />}
      
      {drawnPath?.map((pt, i) => (
        <AdvancedMarker key={`draw-${i}`} position={pt}>
          <div 
            className="w-3.5 h-3.5 bg-white border-2 border-emerald-500 rounded-full shadow-md" 
            style={{ transform: "translate(-50%, -50%)" }} 
          />
        </AdvancedMarker>
      ))}

      {manualPin && (
        <AdvancedMarker position={manualPin}>
          <div
            style={{
              width: 36,
              height: 36,
              transform: "translate(-50%, -100%)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#10b981"
              stroke="#047857"
              strokeWidth={1.5}
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="none" />
            </svg>
          </div>
        </AdvancedMarker>
      )}
    </Map>
  );
}