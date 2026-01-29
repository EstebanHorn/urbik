/*
Este componente de React, denominado ParcelsLayer, utiliza la biblioteca React-Leaflet para renderizar
y gestionar una capa de datos geográficos en formato GeoJSON que representa parcelas inmobiliarias obtenidas
desde una API interna. Su funcionalidad principal consiste en cargar dinámicamente la información espacial
mediante un useEffect, aplicar un estilo visual personalizado (bordes naranjas con relleno traslúcido) y
añadir interactividad a cada polígono; específicamente, vincula ventanas emergentes (popups) con datos
técnicos como el CCA y PDA, y gestiona un sistema de resaltado visual mediante eventos de ratón (mouseover,
mouseout) y clics, asegurando a través de una referencia (useRef) que solo una parcela permanezca destacada
con un estilo azul distintivo al ser seleccionada.
*/

"use client";

import { useEffect, useState, useRef } from "react";
import { GeoJSON } from "react-leaflet";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import type { Layer } from "leaflet";
import L from "leaflet";

type ParcelProps = {
  CCA: string | null;
  PDA: string | null;
};

type ParcelFeature = Feature<Geometry, ParcelProps>;

export function ParcelsLayer() {
  const [data, setData] = useState<FeatureCollection<
    Geometry,
    ParcelProps
  > | null>(null);
  const lastHighlighted = useRef<Layer | null>(null);

  useEffect(() => {
    fetch("/api/parcels")
      .then((res) => res.json())
      .then((json: FeatureCollection<Geometry, ParcelProps>) => setData(json))
      .catch(console.error);
  }, []);

  if (!data) return null;

  const baseStyle = () => ({
    color: "#ff6600",
    weight: 1.2,
    fillColor: "#ff9933",
    fillOpacity: 0.25,
  });

  const highlightStyle = {
    color: "#0077ff",
    weight: 2,
    fillColor: "#3399ff",
    fillOpacity: 0.5,
  };

  const setLayerStyle = (layer: Layer, style: L.PathOptions) => {
    const path = layer as unknown as L.Path;
    if (path.setStyle) path.setStyle(style);
  };

  const onEachFeature = (feature: ParcelFeature, layer: Layer) => {
    const props = feature.properties;

    layer.bindPopup(`
      <b>Parcela publicada</b><br/>
      CCA: ${props.CCA ?? "-"}<br/>
      PDA: ${props.PDA ?? "-"}
    `);

    layer.on("click", () => {
      if (lastHighlighted.current && lastHighlighted.current !== layer) {
        setLayerStyle(lastHighlighted.current, baseStyle());
      }
      setLayerStyle(layer, highlightStyle);
      lastHighlighted.current = layer;
    });

    layer.on("mouseover", () => {
      setLayerStyle(layer, { weight: 2, fillOpacity: 0.4 });
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
