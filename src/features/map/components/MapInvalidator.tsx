/*
Este componente de React, diseñado para integrarse con la librería React Leaflet,
tiene como función principal forzar la actualización de las dimensiones internas del
mapa mediante el método map.invalidateSize() tras un breve retraso de 200 milisegundos
después del montaje. Al utilizar el hook useMap y un efecto de limpieza, asegura que el
contenedor del mapa se renderice correctamente y detecte sus dimensiones reales,
solucionando problemas comunes de visualización como mosaicos mal cargados o áreas
grises que suelen ocurrir cuando el mapa se inicializa dentro de contenedores con
dimensiones dinámicas, pestañas ocultas o animaciones de carga.
*/

"use client";

import { useMap } from "react-leaflet";
import { useEffect } from "react";

export function MapInvalidator() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}
