"use client";

import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import { parcelTileUrl, PARCEL_MIN_ZOOM } from "@/lib/rioNegroParcels";

// Teselas raster del catastro de Río Negro (ArcGIS `export`). Leaflet no tiene
// un TileLayer por-bbox nativo, así que extendemos L.TileLayer sobreescribiendo
// getTileUrl para construir la URL a partir del XYZ de cada tesela.
const ArcGISExportTileLayer = L.TileLayer.extend({
  getTileUrl(coords: L.Coords) {
    return parcelTileUrl(coords.x, coords.y, coords.z);
  },
}) as unknown as new (
  url: string,
  options?: L.TileLayerOptions,
) => L.TileLayer;

export function RioNegroParcelsTileLayer() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const layer = new ArcGISExportTileLayer("", {
      minZoom: PARCEL_MIN_ZOOM,
      maxZoom: 19,
      opacity: 0.9,
      className: "parcel-layer-shadow",
    });
    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map]);

  return null;
}
