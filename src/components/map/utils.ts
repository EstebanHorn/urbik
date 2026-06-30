import type { PathOptions } from "leaflet";
import type { MapProperty } from "./types";

export const normalParcelStyle: PathOptions = { color: "#00ff8e", weight: 0.5, fillColor: "transparent", fillOpacity: 0 };
export const loadedParcelStyle: PathOptions = { color: "#00ff8e", weight: 2, fillColor: "#00ff8e", fillOpacity: 0.6 };
export const activeParcelStyle: PathOptions = { color: "#00ff8e", weight: 3, fillColor: "#00ff8e", fillOpacity: 0.5, dashArray: "5, 5" };

export const getDynamicParcelStyle = (
  property: Partial<MapProperty>, 
  colorMode: "uniform" | "operation" | "propertyType"
): PathOptions => {
  let fillColor = "#00ff8e";

  if (colorMode === "operation") {
    switch (property.operationType) {
      case "SALE": fillColor = "#00ff8e"; break;
      case "RENT": fillColor = "#00deff"; break; 
      case "SALE_RENT": fillColor = "#ff0077"; break;
    }
  } else if (colorMode === "propertyType") {
    switch (property.type) {
      case "HOUSE": fillColor = "#10b981"; break;
      case "APARTMENT": fillColor = "#f59e0b"; break;   
      case "LAND": fillColor = "#84cc16"; break; 
      case "COMMERCIAL_PROPERTY": fillColor = "#ec4899"; break; 
      case "OFFICE": fillColor = "#06b6d4"; break; 
    }
  }

  return { color: fillColor, fillColor: fillColor, weight: 2, fillOpacity: 0.6 };
};

export type Region = "buenos-aires" | "rio-colorado" | "other";

// Acotado a la zona de Río Colorado (localidad de la provincia de Río Negro).
// Ajustar si la extensión real de riocolorado.geojson lo requiere; el layer solo
// renderiza cuando hay features, así que un bbox algo holgado es inofensivo.
const RIO_COLORADO_BOUNDS = { minLat: -39.65, maxLat: -38.78, minLon: -65.30, maxLon: -63.35 };
const BUENOS_AIRES_BOUNDS = { minLat: -41.05, maxLat: -33.05, minLon: -63.50, maxLon: -56.19 };

export function detectRegion(lat: number, lon: number): Region {
  if (lat >= RIO_COLORADO_BOUNDS.minLat && lat <= RIO_COLORADO_BOUNDS.maxLat && lon >= RIO_COLORADO_BOUNDS.minLon && lon <= RIO_COLORADO_BOUNDS.maxLon) return "rio-colorado";
  if (lat >= BUENOS_AIRES_BOUNDS.minLat && lat <= BUENOS_AIRES_BOUNDS.maxLat && lon >= BUENOS_AIRES_BOUNDS.minLon && lon <= BUENOS_AIRES_BOUNDS.maxLon) return "buenos-aires";
  return "other";
}

export function getZoomThresholdForRegion(region: Region): number {
  return region === "rio-colorado" ? 14 : 15;
}

// Grilla (~0.02° ≈ 2.2km) a la que se "snapea" el bbox pedido al endpoint de
// parcelas de Río Colorado. Discretizar el bbox hace que paneos cortos generen
// la misma URL → el CDN puede cachear la respuesta (s-maxage) y el cache del
// cliente acierta en vez de re-bajar ~2MB de geometría en cada movimiento.
// floor/ceil garantizan que el viewport quede siempre cubierto.
export const PARCEL_GRID = 0.02;

export interface BBox {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export function snapBBoxToGrid(bbox: BBox, grid = PARCEL_GRID): BBox {
  const snap = (v: number, dir: "floor" | "ceil") => {
    const n = dir === "floor" ? Math.floor(v / grid) : Math.ceil(v / grid);
    // Redondeo final para evitar ruido de punto flotante (-39.620000000000005)
    // y mantener URLs/keys estables.
    return Math.round(n * grid * 1e6) / 1e6;
  };
  return {
    minLat: snap(bbox.minLat, "floor"),
    maxLat: snap(bbox.maxLat, "ceil"),
    minLon: snap(bbox.minLon, "floor"),
    maxLon: snap(bbox.maxLon, "ceil"),
  };
}