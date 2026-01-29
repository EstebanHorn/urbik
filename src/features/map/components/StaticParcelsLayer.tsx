/*
Este componente de React, denominado StaticParcelsLayer, integra una capa de teselas
WMS (Web Map Service) en un mapa de Leaflet para visualizar la cartografía de parcelas
provista por ARBA. El código utiliza la directiva "use client" para asegurar su ejecución
en el navegador y configura el acceso al servidor geoespacial especificando parámetros
técnicos como el formato de imagen transparente, la versión del servicio y un rango de
zoom restringido (entre 15 y 20) para mostrar los datos solo en niveles de detalle urbano;
además, aplica clases de CSS personalizadas para modificar visualmente la capa mediante
efectos de brillo y saturación.
*/

"use client";

import { WMSTileLayer } from "react-leaflet";

export function StaticParcelsLayer() {
  return (
    <WMSTileLayer
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