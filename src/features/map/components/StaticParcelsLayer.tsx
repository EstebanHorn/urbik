"use client";

import { WMSTileLayer, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
// @ts-expect-error - esri-leaflet has no types installed
import * as esri from "esri-leaflet";
import { detectRegion, type Region } from "../utils/regionDetection";

function RioNegroParcelsLayer() {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!map) return;

    const layer = esri.dynamicMapLayer({
      url: "https://mapasagencia.rionegro.gov.ar/server/rest/services/Hosted/PARCELARIO/MapServer",
      opacity: 1,
      format: "png32",
      transparent: true,
      f: "image",
      minZoom: 14,
      maxZoom: 20,
      className: "parcel-layer-shadow brightness-200 saturate-200",
    });

    layer.addTo(map);
    layerRef.current = layer as unknown as L.Layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map]);

  return null;
}

export function StaticParcelsLayer() {
  const [region, setRegion] = useState<Region>("buenos-aires");

  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      setRegion(detectRegion(center.lat, center.lng));
    },
  });

  if (region === "rio-negro") {
    return <RioNegroParcelsLayer key="rio-negro" />;
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