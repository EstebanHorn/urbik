/// <reference types="@types/google.maps" />
"use client";

import { useEffect, useRef, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { detectRegion, type Region } from "@/components/map/utils";

export function GoogleStaticParcelsLayer() {
  const map = useMap();
  const [region, setRegion] = useState<Region>("buenos-aires");
  const wmsLayerRef = useRef<google.maps.ImageMapType | null>(null);

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
    if (!map || region !== "buenos-aires") {
      if (wmsLayerRef.current) {
        map?.overlayMapTypes.removeAt(0);
        wmsLayerRef.current = null;
      }
      return;
    }

    if (!wmsLayerRef.current) {
      const wmsMapType = new google.maps.ImageMapType({
        getTileUrl: function (coord: google.maps.Point, zoom: number) {
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
        },
        tileSize: new google.maps.Size(256, 256),
        maxZoom: 19,
        opacity: 0.8,
      });

      map.overlayMapTypes.push(wmsMapType);
      wmsLayerRef.current = wmsMapType;
    }
  }, [map, region]);

  const arcgisLayerRef = useRef<google.maps.ImageMapType | null>(null);

  useEffect(() => {
    if (!map || region !== "rio-negro") {
      if (arcgisLayerRef.current) {
        map?.overlayMapTypes.removeAt(
          (map.overlayMapTypes.getArray() as google.maps.ImageMapType[]).indexOf(
            arcgisLayerRef.current,
          ),
        );
        arcgisLayerRef.current = null;
      }
      return;
    }

    if (!arcgisLayerRef.current) {
      const arcgisMapType = new google.maps.ImageMapType({
        getTileUrl: function (coord: google.maps.Point, zoom: number) {
          if (zoom < 14) return null;
          const r = 6378137;
          const mapSize = 256 * Math.pow(2, zoom);
          const res = (2 * Math.PI * r) / mapSize;
          const xmin = coord.x * 256 * res - Math.PI * r;
          const ymax = Math.PI * r - coord.y * 256 * res;
          const xmax = (coord.x + 1) * 256 * res - Math.PI * r;
          const ymin = Math.PI * r - (coord.y + 1) * 256 * res;
          const bbox = `${xmin},${ymin},${xmax},${ymax}`;

          return (
            `https://mapasagencia.rionegro.gov.ar/server/rest/services/Hosted/PARCELARIO/MapServer/export` +
            `?bbox=${bbox}&bboxSR=3857&layers=show:0&size=256,256` +
            `&imageSR=3857&format=png32&transparent=true&f=image`
          );
        },
        tileSize: new google.maps.Size(256, 256),
        maxZoom: 19,
        opacity: 1,
      });

      map.overlayMapTypes.push(arcgisMapType);
      arcgisLayerRef.current = arcgisMapType;
    }
  }, [map, region]);

  return null;
}