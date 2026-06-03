/// <reference types="@types/google.maps" />
"use client";

import { useEffect, useState, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { detectRegion, type Region } from "@/components/map/utils";
import type { FeatureCollection } from "geojson";

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

  useEffect(() => {
    if (!map || region !== "rio-negro") {
      map?.data.forEach((feature: google.maps.Data.Feature) => {
        if (feature.getProperty("isRioNegro")) map.data.remove(feature);
      });
      return;
    }

    const fetchRioNegro = async () => {
      const zoom = map.getZoom() || 0;
      if (zoom < 14) return;

      const bounds = map.getBounds();
      if (!bounds) return;

      const minLat = bounds.getSouthWest().lat();
      const minLon = bounds.getSouthWest().lng();
      const maxLat = bounds.getNorthEast().lat();
      const maxLon = bounds.getNorthEast().lng();

      try {
        const res = await fetch(`/api/parcels/rio-negro?minLat=${minLat}&maxLat=${maxLat}&minLon=${minLon}&maxLon=${maxLon}`);
        if (res.ok) {
          const json = (await res.json()) as FeatureCollection;
          json.features.forEach(f => {
            if (!f.properties) f.properties = {};
            f.properties.isRioNegro = true;
          });
          map.data.addGeoJson(json);
          
          map.data.setStyle((feature: google.maps.Data.Feature) => {
            if (feature.getProperty("isRioNegro")) {
              return { fillColor: "transparent", strokeColor: "#00ff8e", strokeWeight: 1 };
            }
            return {};
          });
        }
      } catch {
        // Error ignorado silenciosamente
      }
    };

    const listener = map.addListener("idle", fetchRioNegro);
    fetchRioNegro();

    return () => { google.maps.event.removeListener(listener); };
  }, [map, region]);

  return null;
}