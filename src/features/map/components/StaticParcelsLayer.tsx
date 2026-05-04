"use client";

import { WMSTileLayer, useMapEvents } from "react-leaflet";
import { useState } from "react";
import { detectRegion, type Region } from "../utils/regionDetection";

export function StaticParcelsLayer() {
  const [region, setRegion] = useState<Region>("buenos-aires");

  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      setRegion(detectRegion(center.lat, center.lng));
    },
  });

  if (region === "rio-negro") {
    return (
      <WMSTileLayer
        key="rio-negro"
        url="https://mapasagencia.rionegro.gov.ar/server/services/Municipios/GC_201904_WMS_V7/MapServer/WMSServer?"
        layers="GIS_PARCELAS"
        format="image/png"
        transparent={true}
        version="1.3.0"
        className="parcel-layer-shadow brightness-200 saturate-200"
        tileSize={256}
        maxZoom={20}
        minZoom={14}
      />
    );
  }

  return (
    <WMSTileLayer
      key="buenos-aires"
      url="https://geo.arba.gov.ar/geoserver/idera/ows?"
      layers="Parcela"
      format="image/png"
      transparent={true}
      version="1.1.1"
      className="parcel-layer-shadow brightness-200 saturate-200"
      tileSize={256}
      maxZoom={20}
      minZoom={15}
    />
  );
}