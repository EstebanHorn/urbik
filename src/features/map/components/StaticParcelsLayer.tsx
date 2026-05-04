"use client";

import { WMSTileLayer, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { detectRegion, type Region } from "../utils/regionDetection";

const ORIGIN = 20037508.342789244;
const RESOLUTION_Z0 = (ORIGIN * 2) / 256;

function tileToBBox3857(x: number, y: number, z: number): string {
  const resolution = RESOLUTION_Z0 / Math.pow(2, z);
  const tileSize = 256 * resolution;
  const minX = -ORIGIN + x * tileSize;
  const maxX = -ORIGIN + (x + 1) * tileSize;
  const maxY = ORIGIN - y * tileSize;
  const minY = ORIGIN - (y + 1) * tileSize;
  return `${minX},${minY},${maxX},${maxY}`;
}

function RioNegroParcelsLayer() {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!map) return;

    const ArcGISExportLayer = L.TileLayer.extend({
      getTileUrl: function (coords: { x: number; y: number; z: number }) {
        const bbox = tileToBBox3857(coords.x, coords.y, coords.z);
        return (
          "https://mapasagencia.rionegro.gov.ar/server/rest/services/Hosted/PARCELARIO/MapServer/export" +
          `?bbox=${bbox}&bboxSR=3857&imageSR=3857&size=256,256` +
          "&dpi=96&format=png32&transparent=true&f=image"
        );
      },
    });

    const layer = new (ArcGISExportLayer as unknown as new (
      url: string,
      options: L.TileLayerOptions,
    ) => L.TileLayer)("", {
      tileSize: 256,
      minZoom: 14,
      maxZoom: 20,
      opacity: 1,
      className: "parcel-layer-shadow brightness-200 saturate-200",
    });

    layer.addTo(map);
    layerRef.current = layer;

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