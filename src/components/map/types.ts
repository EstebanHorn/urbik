import type { FeatureCollection, Polygon, MultiPolygon, Geometry, Feature } from "geojson";

export type BaseLayerId = "cartoLight" | "osm" | "satellite" | "darkMatter";

type BaseLayerConfig = {
  id: BaseLayerId;
  label: string;
  description: string;
  url: string;
  attribution: string;
};

export const mapBaseLayers: Record<BaseLayerId, BaseLayerConfig> = {
  cartoLight: {
    id: "cartoLight", label: "Callejero limpio", description: "Carto Light, ideal para resaltar capas y datos.",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
  osm: {
    id: "osm", label: "Clásico OSM", description: "OpenStreetMap estándar, balanceado y familiar.",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    id: "satellite", label: "Satelital", description: "Fotografía aérea de Esri, ideal para revisar el terreno.",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, IGN y otros",
  },
  darkMatter: {
    id: "darkMatter", label: "Oscuro", description: "Carto Dark Matter, contraste alto para mapas nocturnos.",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
};

export const defaultBaseLayerId: BaseLayerId = "cartoLight";
export function isBaseLayerId(value: string): value is BaseLayerId { return value in mapBaseLayers; }

export type ParcelaProps = { CCA?: string; PDA?: string; [key: string]: unknown; };
export type LaplataGeoJSON = FeatureCollection<Polygon | MultiPolygon, ParcelaProps>;
export type ParcelaFeature = Feature<Geometry, ParcelaProps>;

export type SelectedParcel = { CCA: string | null; PDA: string | null; geometry: Geometry; lat: number; lon: number; };
export type Overlay = { geometry: Geometry; label?: string; };
export interface MapBounds { minLat: number; maxLat: number; minLon: number; maxLon: number; }

export interface MapProperty {
  id: string; title: string; price: number; currency?: string; latitude: number; longitude: number;
  parcelGeom?: Geometry | string | Record<string, unknown> | null; parcelCCA?: string;
  operationType: string; type: string; images?: string[]; address?: string; city?: string;
  rooms?: number; bathrooms?: number; area?: number; hasWater?: boolean; hasElectricity?: boolean;
  hasGas?: boolean; hasInternet?: boolean; hasParking?: boolean; hasPool?: boolean; hasBalcony?: boolean;
  hasGrill?: boolean; hasGarden?: boolean; hasLaundry?: boolean; hasAirConditioning?: boolean;
}