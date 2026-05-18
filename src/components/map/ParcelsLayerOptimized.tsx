"use client";

import React, { useEffect, useState, useRef } from "react";
import { useMap } from "react-leaflet";
import { DbParcelsLayer } from "./DbParcelsLayer";
import type { MapProperty } from "./types";
import { detectRegion, getZoomThresholdForRegion } from "./utils";

interface ParcelsLayerOptimizedProps {
  properties: MapProperty[];
  onPropertySelect?: (prop: MapProperty) => void;
}

export function ParcelsLayerOptimized({
  properties,
  onPropertySelect,
}: ParcelsLayerOptimizedProps) {
  const map = useMap();
  const [shouldShow, setShouldShow] = useState(false);
  const lastCheckRef = useRef(0);

  useEffect(() => {
    if (!map) return;

    const checkZoom = () => {
      const now = Date.now();
      if (now - lastCheckRef.current < 200) return;
      lastCheckRef.current = now;

      const center = map.getCenter();
      const zoom = map.getZoom();
      const region = detectRegion(center.lat, center.lng);
      const threshold = getZoomThresholdForRegion(region);

      setShouldShow(zoom >= threshold);
    };

    checkZoom();
    map.on("zoomend", checkZoom);
    map.on("moveend", checkZoom);

    return () => {
      map.off("zoomend", checkZoom);
      map.off("moveend", checkZoom);
    };
  }, [map]);

  if (!shouldShow || properties.length === 0) return null;

  return (
    <DbParcelsLayer properties={properties} onPropertySelect={onPropertySelect} />
  );
}