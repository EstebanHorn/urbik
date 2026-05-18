"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
// @ts-expect-error - TypeScript.
import "leaflet/dist/leaflet.css";

type PreviewProperty = {
  id: number;
  title: string;
  latitude: number | null;
  longitude: number | null;
};

interface Props {
  properties: PreviewProperty[];
  lat?: number;
  lon?: number;
  hoveredPropertyId?: number | null;
  onHoverProperty?: (propertyId: number | null) => void;
}

function createPinIcon(isActive: boolean) {
  const size = isActive ? 22 : 18;
  const tipSize = isActive ? 8 : 7;
  const borderColor = isActive ? "#064e3b" : "#0f172a";
  const fillColor = isActive ? "#34d399" : "#10b981";
  const shadow = isActive
    ? "0 6px 16px rgba(6, 78, 59, 0.45)"
    : "0 2px 8px rgba(15, 23, 42, 0.35)";

  return L.divIcon({
    className: "urbik-mini-pin",
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        border-radius: 999px;
        background: ${fillColor};
        border: 2px solid ${borderColor};
        box-shadow: ${shadow};
      ">
        <div style="
          position:absolute;
          left:50%;
          top:100%;
          transform:translateX(-50%);
          width: 0;
          height: 0;
          border-left: ${tipSize - 2}px solid transparent;
          border-right: ${tipSize - 2}px solid transparent;
          border-top: ${tipSize}px solid ${borderColor};
        "></div>
      </div>
    `,
    iconSize: [size, size + tipSize + 1],
    iconAnchor: [size / 2, size + tipSize + 1],
  });
}

function FitToProperties({ properties, lat, lon }: Props) {
  const map = useMap();
  const lastSignature = useRef("");

  useEffect(() => {
    const mapRef = map as unknown as {
      _loaded?: boolean;
      _container?: HTMLElement;
    };
    if (!mapRef?._loaded || !mapRef?._container) return;

    const signature = JSON.stringify({
      points: properties.map((p) => [p.id, p.latitude, p.longitude]),
      lat,
      lon,
    });
    if (signature === lastSignature.current) return;
    lastSignature.current = signature;

    const points = properties
      .filter((p) => p.latitude !== null && p.longitude !== null)
      .map(
        (p) =>
          [p.latitude as number, p.longitude as number] as [number, number],
      );

    const rafId = window.requestAnimationFrame(() => {
      if (!mapRef?._loaded || !mapRef?._container) return;

      if (points.length > 1) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [18, 18], maxZoom: 14 });
        return;
      }

      if (points.length === 1) {
        map.setView(points[0], 14);
        return;
      }

      if (typeof lat === "number" && typeof lon === "number") {
        map.setView([lat, lon], 12);
        return;
      }

      map.setView([-34.6037, -58.3816], 10);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [lat, lon, map, properties]);

  return null;
}

export default function PropertiesPreviewMap({
  properties,
  lat,
  lon,
  hoveredPropertyId = null,
  onHoverProperty,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const withCoords = properties.filter(
    (p) => p.latitude !== null && p.longitude !== null,
  );
  const mapKey = useMemo(
    () => `preview-${lat ?? "na"}-${lon ?? "na"}-${withCoords.length}`,
    [lat, lon, withCoords.length],
  );

  if (!mounted) {
    return (
      <div className="h-[260px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
    );
  }

  return (
    <div className="h-[260px] w-full overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer
        key={mapKey}
        center={[lat ?? -34.6037, lon ?? -58.3816]}
        zoom={12}
        minZoom={4}
        maxZoom={19}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        />

        <FitToProperties properties={properties} lat={lat} lon={lon} />

        {withCoords.map((property) => (
          <Marker
            key={property.id}
            position={[
              property.latitude as number,
              property.longitude as number,
            ]}
            icon={createPinIcon(property.id === hoveredPropertyId)}
            zIndexOffset={property.id === hoveredPropertyId ? 1000 : 0}
            eventHandlers={{
              mouseover: () => onHoverProperty?.(property.id),
              mouseout: () => onHoverProperty?.(null),
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -22]}
              opacity={1}
              permanent={property.id === hoveredPropertyId}
            >
              <span className="text-[10px] font-bold">{property.title}</span>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}