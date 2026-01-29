/*
Este código define una serie de tipos de datos en TypeScript para estructurar y validar
información geográfica basada en el estándar GeoJSON, específicamente orientada a la
representación de parcelas de la ciudad de La Plata. A través de interfaces y tipos
personalizados, el script establece las propiedades esperadas para una parcela (como
los identificadores CCA y PDA), define colecciones de geometrías de tipo polígono o
multipolígono para el mapeo, y estructura los objetos necesarios para manejar selecciones
de parcelas en el mapa o capas superpuestas (overlays) con sus respectivas coordenadas y
etiquetas.
*/

import type {
  FeatureCollection,
  Polygon,
  MultiPolygon,
  Geometry,
  Feature,
} from "geojson";

export type ParcelaProps = {
  CCA?: string;
  PDA?: string;
  [key: string]: unknown;
};

export type LaplataGeoJSON = FeatureCollection<
  Polygon | MultiPolygon,
  ParcelaProps
>;

export type SelectedParcel = {
  CCA: string | null;
  PDA: string | null;
  geometry: Geometry;
  lat: number;
  lon: number;
};

export type Overlay = {
  geometry: Geometry;
  label?: string;
};

export type ParcelaFeature = Feature<Geometry, ParcelaProps>;
