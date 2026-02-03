"use client";

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function PropertyParcelView({ lat, lon, selectedGeom, allProperties }: any) {
  return (
    <MapContainer
      center={[lat, lon]}
      zoom={17}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      touchZoom={false}
      zoomControl={false}
      attributionControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

      {allProperties.map((prop: any) => (
        prop.parcelGeom && prop.id !== selectedGeom?.id && (
          <GeoJSON 
            key={prop.id}
            data={prop.parcelGeom} 
            style={{
              color: "#94a3b8",
              weight: 1,
              fillColor: "#cbd5e1",
              fillOpacity: 0.1
            }} 
          />
        )
      ))}

      {selectedGeom && (
        <GeoJSON 
          data={selectedGeom} 
          style={{
            color: "#00E5FF", 
            weight: 3,
            fillColor: "#00E5FF",
            fillOpacity: 0.3
          }} 
        />
      )}
    </MapContainer>
  );
}