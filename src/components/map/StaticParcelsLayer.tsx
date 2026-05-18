"use client";

import { WMSTileLayer, useMapEvents } from "react-leaflet";
import { useState } from "react";
import { detectRegion, type Region } from "./utils";
import { RioNegroGeoJsonLayer } from "./RioNegroGeoJsonLayer";

export function StaticParcelsLayer() {
  const [region, setRegion] = useState<Region>("buenos-aires");

  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      setRegion(detectRegion(center.lat, center.lng));
    },
  });

  if (region === "rio-negro") {
    return <RioNegroGeoJsonLayer key="rio-negro-geojson" />;
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
      maxZoom={19}
      minZoom={15}
    />
  );
}
