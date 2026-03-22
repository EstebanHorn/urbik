/*
Este código define una serie de estructuras de datos y tipos de TypeScript destinados a
modelar la información de una plataforma inmobiliaria con integración geográfica. A través
de interfaces y tipos personalizados, establece el esquema para representar propiedades con
sus atributos comerciales (precio, tipo de operación, habitaciones), límites geográficos
para mapas, polígonos de parcelas mediante el estándar GeoJSON y la gestión de selecciones
específicas en el mapa. Su función principal es garantizar la consistencia de los datos en
el desarrollo del frontend o la API, facilitando el manejo de coordenadas, geometrías y
detalles de inmuebles de forma tipada y organizada.
*/

import type { Geometry } from "geojson";

export type Overlay = {
  geometry: Geometry;
  label?: string;
};

export type OperationType = "RENT" | "SALE" | "TEMP_RENT" | "SALE_RENT";

export type PropertyType =
  | "HOUSE"
  | "APARTMENT"
  | "PH"
  | "COUNTRY"
  | "LAND"
  | "FIELD"
  | "BUSINESS_BACKGROUND"
  | "GARAGE"
  | "WAREHOUSE"
  | "DEVELOPMENT"
  | "COMMERCIAL_PROPERTY"
  | "OFFICE";

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export interface MapProperty {
  id: string;
  title: string;
  price: number;
  currency?: string;
  latitude: number;
  longitude: number;
  parcelGeom?: Geometry | string | Record<string, unknown> | null;
  parcelCCA?: string;
  operationType: string;
  images?: string[];
  address?: string;
  city?: string;
  rooms?: number;
  bathrooms?: number;
  area?: number;
  hasWater?: boolean;
  hasElectricity?: boolean;
  hasGas?: boolean;
  hasInternet?: boolean;
  hasParking?: boolean;
  hasPool?: boolean;
  hasBalcony?: boolean;
  hasGrill?: boolean;
  hasGarden?: boolean;
  hasLaundry?: boolean;
  hasAirConditioning?: boolean;
}

export interface SelectedParcel {
  CCA: string | null;
  PDA: string | null;
  geometry: Geometry;
  lat: number;
  lon: number;
}
