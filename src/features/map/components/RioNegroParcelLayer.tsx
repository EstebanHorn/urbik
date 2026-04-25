"use client";

import { useEffect, useState, useRef } from "react";
import { GeoJSON } from "react-leaflet";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import type { Layer } from "leaflet";
import L from "leaflet";

type RioNegroParcelProps = {
  province?: string;
  [key: string]: unknown;
};

type RioNegroFeature = Feature<Geometry, RioNegroParcelProps>;

export function RioNegroParcelLayer() {
  const [data, setData] = useState<FeatureCollection<
    Geometry,
    RioNegroParcelProps
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const lastHighlighted = useRef<Layer | null>(null);

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const res = await fetch("/api/parcels/rionegro");
        const json: FeatureCollection<Geometry, RioNegroParcelProps> = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error loading Río Negro parcels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParcels();
  }, []);

  if (!data || loading) return null;

  const baseStyle = () => ({
    color: "#e74c3c",
    weight: 1.2,
    fillColor: "#e74c3c",
    fillOpacity: 0.2,
  });

  const highlightStyle = {
    color: "#c0392b",
    weight: 2.5,
    fillColor: "#e74c3c",
    fillOpacity: 0.4,
  };

  const setLayerStyle = (layer: Layer, style: L.PathOptions) => {
    const path = layer as unknown as L.Path;
    if (path.setStyle) path.setStyle(style);
  };

  const onEachFeature = (feature: RioNegroFeature, layer: Layer) => {
    const attrs = feature.properties;
    const attrsList = Object.entries(attrs)
      .slice(0, 5)
      .map(([key, val]) => `${key}: ${val}`)
      .join("<br/>");

    layer.bindPopup(`
      <b>Parcela - Río Negro</b><br/>
      ${attrsList}
    `);

    layer.on("click", () => {
      if (lastHighlighted.current && lastHighlighted.current !== layer) {
        setLayerStyle(lastHighlighted.current, baseStyle());
      }
      setLayerStyle(layer, highlightStyle);
      lastHighlighted.current = layer;
    });

    layer.on("mouseover", () => {
      setLayerStyle(layer, { weight: 2, fillOpacity: 0.3 });
    });

    layer.on("mouseout", () => {
      if (lastHighlighted.current === layer)
        setLayerStyle(layer, highlightStyle);
      else setLayerStyle(layer, baseStyle());
    });
  };

  return (
    <GeoJSON data={data} style={baseStyle} onEachFeature={onEachFeature} />
  );
}
