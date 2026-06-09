"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import * as EsriLeaflet from "esri-leaflet";

const ARCGIS_URL =
  "https://mapasagencia.rionegro.gov.ar/server/rest/services/Hosted/PARCELARIO/MapServer";

export function RioNegroGeoJsonLayer() {
  const map = useMap();
  const layerRef = useRef<EsriLeaflet.DynamicMapLayer | null>(null);

  useEffect(() => {
    if (!map || layerRef.current) return;

    layerRef.current = EsriLeaflet.dynamicMapLayer({
      url: ARCGIS_URL,
      layers: [0],
      format: "png32",
      transparent: true,
      opacity: 1,
      pane: "overlayPane",
    });

    layerRef.current.addTo(map);

    return () => {
      layerRef.current?.remove();
      layerRef.current = null;
    };
  }, [map]);

  return null;
}
