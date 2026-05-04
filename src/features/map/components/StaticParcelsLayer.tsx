"use client";

import { WMSTileLayer, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import { detectRegion } from "../utils/regionDetection";

export function StaticParcelsLayer() {
  const [wmsConfig, setWmsConfig] = useState({
    url: "https://geo.arba.gov.ar/geoserver/idera/ows?",
    layers: "Parcela",
    minZoom: 15,
  });

  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const center = map.getCenter();
      const region = detectRegion(center.lat, center.lng);

      let newConfig = {
        url: "https://geo.arba.gov.ar/geoserver/idera/ows?",
        layers: "Parcela",
        minZoom: 15,
      };

      if (region === "rio-negro") {
        newConfig = {
          url: "https://mapasagencia.rionegro.gov.ar/server/services/Municipios/GC_201904_WMS_V7/MapServer/WMSServer?",
          layers: "GIS_PARCELAS",
          minZoom: 14,
        };
      }

      setWmsConfig(newConfig);
    },
  });

  return (
    <WMSTileLayer
      key={`wms-${wmsConfig.url}-${wmsConfig.layers}`}
      url={wmsConfig.url}
      layers={wmsConfig.layers}
      format="image/png"
      transparent={true}
      version="1.1.1"
      className="parcel-layer-shadow brightness-200 saturate-200"
      tileSize={256}
      maxZoom={20}
      minZoom={wmsConfig.minZoom}
    />
  );
}