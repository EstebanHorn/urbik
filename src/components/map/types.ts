import type { FeatureCollection, Polygon, MultiPolygon, Geometry, Feature } from "geojson";

export type BaseLayerId = "roadmap" | "satellite" | "hybrid" | "terrain";

type BaseLayerConfig = {
  id: BaseLayerId;
  label: string;
  description: string;
};

export const mapBaseLayers: Record<BaseLayerId, BaseLayerConfig> = {
  roadmap: {
    id: "roadmap", 
    label: "Plano", 
    description: "Mapa de calles estándar.",
  },
  terrain: {
    id: "terrain", 
    label: "Relieve", 
    description: "Mapa con topografía y relieve natural.",
  },
  satellite: {
    id: "satellite", 
    label: "Satelital", 
    description: "Fotografía aérea pura del terreno.",
  },
  hybrid: {
    id: "hybrid", 
    label: "Híbrido", 
    description: "Satelital con nombres de calles y rutas.",
  },
};

export const defaultBaseLayerId: BaseLayerId = "roadmap";

export function isBaseLayerId(value: string): value is BaseLayerId { 
  return value in mapBaseLayers; 
}

export type ParcelaProps = { CCA?: string; PDA?: string; [key: string]: unknown; };
export type LaplataGeoJSON = FeatureCollection<Polygon | MultiPolygon, ParcelaProps>;
export type ParcelaFeature = Feature<Geometry, ParcelaProps>;

export type SelectedParcel = { CCA: string | null; PDA: string | null; geometry: Geometry; lat: number; lon: number; };
export type Overlay = { geometry: Geometry; label?: string; };
export interface MapBounds { minLat: number; maxLat: number; minLon: number; maxLon: number; }

export interface MapProperty {
  id: string; title: string; price: number; currency?: string; latitude: number; longitude: number;
  parcelGeom?: Geometry | string | Record<string, unknown> | null; parcelCCA?: string;
  operationType: string; type: string; images?: string[]; address?: string; displayAddress?: string | null; city?: string;
  rooms?: number; bathrooms?: number; area?: number; hasWater?: boolean; hasElectricity?: boolean;
  hasGas?: boolean; hasInternet?: boolean; hasParking?: boolean; hasPool?: boolean; hasBalcony?: boolean;
  hasGrill?: boolean; hasGarden?: boolean; hasLaundry?: boolean; hasAirConditioning?: boolean;
  realEstateId?: string | null;
  agencyName?: string | null;
  agencyLogoUrl?: string | null;
}