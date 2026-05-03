"use client";

import { useEffect, useState, useRef } from "react";
import { GeoJSON } from "react-leaflet";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import type { Layer } from "leaflet";
import L from "leaflet";

type RioNegroParcelProps = {
  cca?: string;
  fid?: number;
  [key: string]: unknown;
};

export function RioNegroParcelLayer() {
  const [data, setData] = useState<FeatureCollection<Geometry, RioNegroParcelProps> | null>(null);
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

  const onEachFeature = (feature: Feature<Geometry, RioNegroParcelProps>, layer: Layer) => {
    const cca = feature.properties?.cca || `Parcel ${feature.properties?.fid || "unknown"}`;
    const ara = feature.properties?.ara || "N/A";
    const tpa = feature.properties?.tpa || "N/A";

    layer.bindPopup(`
      <div style="padding: 10px; font-size: 12px; min-width: 200px;">
        <strong style="color: #e74c3c;">PARCELA - RÍO NEGRO</strong><br/>
        <hr style="margin: 6px 0; border: none; border-top: 1px solid #eee;"/>
        <div style="margin: 6px 0;">
          <strong>Código Catastral (CCA):</strong><br/>
          <span style="color: #666;">${cca}</span>
        </div>
        <div style="margin: 6px 0;">
          <strong>Área:</strong> ${ara} m²
        </div>
        <div style="margin: 6px 0;">
          <strong>Tipo:</strong> ${tpa}
        </div>
        <div style="margin: 6px 0; font-size: 10px; color: #999;">
          ID: ${feature.properties?.fid || "N/A"}
        </div>
      </div>
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
