/*
Este componente de React, denominado SelectedParcelLayer, es un componente de cliente que utiliza
la biblioteca react-leaflet para representar visualmente una parcela seleccionada en un mapa
interactivo. Su función principal es recibir un objeto de datos que contiene la geometría de
la parcela y, siempre que existan coordenadas válidas, renderizar una capa de GeoJSON con un
estilo específico definido externamente. El uso de una clave única basada en la latitud y 
ongitud asegura que el componente se actualice correctamente cada vez que cambia la selección,
mientras que la propiedad de interactividad se mantiene desactivada para que la capa funcione
exclusivamente como un elemento de resaltado visual sobre el mapa.
*/

"use client";

import React from "react";
import { GeoJSON } from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import { activeParcelStyle } from "../utils/parcelStyles";
import type { SelectedParcel } from "../types/types"; 

interface SelectedParcelLayerProps {
  selectedParcel: SelectedParcel | null;
}

export function SelectedParcelLayer({
  selectedParcel,
}: SelectedParcelLayerProps) {
  if (!selectedParcel || !selectedParcel.geometry) return null;

  return (
    <GeoJSON
      key={`${selectedParcel.lat}-${selectedParcel.lon}`}
      data={selectedParcel.geometry as GeoJsonObject}
      style={activeParcelStyle}
      interactive={false}
    />
  );
}
