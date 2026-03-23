"use client";

import { useEffect } from "react";
import { MapContainer, CircleMarker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
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
}

function FitToProperties({ properties, lat, lon }: Props) {
  const map = useMap();

  useEffect(() => {
    const points = properties
      .filter((p) => p.latitude !== null && p.longitude !== null)
      .map((p) => [p.latitude as number, p.longitude as number] as [number, number]);

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
  }, [lat, lon, map, properties]);

  return null;
}

export default function PropertiesPreviewMap({ properties, lat, lon }: Props) {
  const withCoords = properties.filter(
    (p) => p.latitude !== null && p.longitude !== null,
  );

  return (
    <div className="h-[260px] w-full overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer
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
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />

        <FitToProperties properties={properties} lat={lat} lon={lon} />

        {withCoords.map((property) => (
          <CircleMarker
            key={property.id}
            center={[property.latitude as number, property.longitude as number]}
            radius={7}
            pathOptions={{ color: "#0f172a", weight: 2, fillColor: "#10b981", fillOpacity: 0.9 }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
