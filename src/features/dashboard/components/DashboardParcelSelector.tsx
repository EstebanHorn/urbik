/*
Este componente de React utiliza la biblioteca React-Leaflet para implementar un selector de
ubicación interactivo sobre un mapa centrado por defecto en La Plata, Argentina. Su funcionamiento
principal radica en el uso de un componente auxiliar llamado LocationSelector, que mediante el
hook useMapEvents captura las coordenadas de cualquier clic realizado por el usuario, actualizando
un estado local para renderizar un marcador visual y notificando la posición seleccionada (latitud
y longitud) al componente padre a través de la función onLocationSelect. Además, el código configura
manualmente los iconos de Leaflet para asegurar que el marcador se visualice correctamente, integra
una capa de mapas de CARTO y presenta una interfaz amigable que incluye un mensaje flotante para guiar
al usuario hasta que se selecciona un punto en el mapa.
*/

"use client";

import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapInvalidator } from "@/features/map/components/MapInvalidator";

const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface LocationSelectorProps {
  onSelect: (lat: number, lng: number) => void;
}

function LocationSelector({ onSelect }: LocationSelectorProps) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface DashboardParcelSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function DashboardParcelSelector({
  onLocationSelect,
}: DashboardParcelSelectorProps) {
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);

  const handleSelect = (lat: number, lng: number) => {
    setSelectedPos([lat, lng]);
    onLocationSelect(lat, lng);
  };

  return (

    <div className="relative h-[300px] w-full overflow-hidden rounded-lg border border-slate-300 bg-slate-100 isolate">
      <MapContainer
        center={[-34.92145, -57.95453]}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapInvalidator />

        <LocationSelector onSelect={handleSelect} />

        {selectedPos && <Marker position={selectedPos} />}
      </MapContainer>

      {!selectedPos && (
        <div className="pointer-events-none absolute bottom-4 left-0 right-0 z-400 flex justify-center">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm">
            Haz click en el mapa para ubicar la propiedad
          </span>
        </div>
      )}
    </div>
  );
}
