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

export type Region = "buenos-aires" | "rio-negro" | "other";

const RIO_NEGRO_BOUNDS = { minLat: -41.79, maxLat: -37.93, minLon: -71.99, maxLon: -65.50 };
const BUENOS_AIRES_BOUNDS = { minLat: -35.88, maxLat: -33.05, minLon: -62.13, maxLon: -56.19 };

export function detectRegion(lat: number, lon: number): Region {
  if (lat >= RIO_NEGRO_BOUNDS.minLat && lat <= RIO_NEGRO_BOUNDS.maxLat && lon >= RIO_NEGRO_BOUNDS.minLon && lon <= RIO_NEGRO_BOUNDS.maxLon) return "rio-negro";
  if (lat >= BUENOS_AIRES_BOUNDS.minLat && lat <= BUENOS_AIRES_BOUNDS.maxLat && lon >= BUENOS_AIRES_BOUNDS.minLon && lon <= BUENOS_AIRES_BOUNDS.maxLon) return "buenos-aires";
  return "other";
}

export function getZoomThresholdForRegion(region: Region): number {
  return region === "rio-negro" ? 14 : 15;
}