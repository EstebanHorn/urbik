/// <reference types="@types/google.maps" />
"use client";

import { useEffect, useState, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { detectRegion, type Region } from "@/components/map/utils";
import { parcelTileUrl, PARCEL_MIN_ZOOM } from "@/lib/rioNegroParcels";

export function GoogleStaticParcelsLayer() {
  const map = useMap();
  const [region, setRegion] = useState<Region>("buenos-aires");
  const overlayRef = useRef<google.maps.ImageMapType | null>(null);

  useEffect(() => {
    if (!map) return;

    const updateRegion = () => {
      const center = map.getCenter();
      if (center) setRegion(detectRegion(center.lat(), center.lng()));
    };
    const listener = map.addListener("idle", updateRegion);

    return () => { google.maps.event.removeListener(listener); };
  }, [map]);

  useEffect(() => {
    if (!map) return;

    // Quita el overlay anterior (si cambió la región).
    const detach = () => {
      if (!overlayRef.current) return;
      const arr = map.overlayMapTypes.getArray();
      const idx = arr.indexOf(overlayRef.current);
      if (idx !== -1) map.overlayMapTypes.removeAt(idx);
      overlayRef.current = null;
    };
    detach();

    // Buenos Aires: WMS de ARBA. Río Negro: teselas del catastro provincial
    // (ArcGIS). Ambas se sirven como imágenes PNG por bbox.
    const getTileUrl =
      region === "buenos-aires"
        ? (coord: google.maps.Point, zoom: number) => {
            if (zoom < 15) return null;
            const r = 6378137;
            const mapSize = 256 * Math.pow(2, zoom);
            const res = (2 * Math.PI * r) / mapSize;
            const xmin = (coord.x * 256) * res - (Math.PI * r);
            const ymax = (Math.PI * r) - (coord.y * 256) * res;
            const xmax = ((coord.x + 1) * 256) * res - (Math.PI * r);
            const ymin = (Math.PI * r) - ((coord.y + 1) * 256) * res;
            const bbox = `${xmin},${ymin},${xmax},${ymax}`;
            return `https://geo.arba.gov.ar/geoserver/idera/ows?service=WMS&version=1.1.1&request=GetMap&layers=Parcela&styles=&bbox=${bbox}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true`;
          }
        : region === "rio-negro"
          ? (coord: google.maps.Point, zoom: number) => {
              if (zoom < PARCEL_MIN_ZOOM) return null;
              return parcelTileUrl(coord.x, coord.y, zoom);
            }
          : null;

    if (!getTileUrl) return;

    const overlay = new google.maps.ImageMapType({
      getTileUrl,
      tileSize: new google.maps.Size(256, 256),
      maxZoom: 19,
      opacity: 0.85,
    });
    map.overlayMapTypes.push(overlay);
    overlayRef.current = overlay;

    return detach;
  }, [map, region]);

  return null;
}
