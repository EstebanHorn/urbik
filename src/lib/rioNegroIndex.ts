import { promises as fs } from "fs";
import path from "path";
import Flatbush from "flatbush";

interface RawFeature {
  type: "Feature";
  properties: { fid: number; cca: string };
  geometry: {
    type: "MultiPolygon" | "Polygon";
    coordinates: number[][][][] | number[][][];
  };
}

export type LonLatGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

export type CompactFeature = {
  fid: number;
  cca: string;
  geometry: LonLatGeometry;
};

interface CachedIndex {
  features: CompactFeature[];
  spatial: Flatbush;
}

let CACHE: CachedIndex | null = null;
let LOADING: Promise<CachedIndex> | null = null;

const ORIGIN = 20037508.342789244;

function mercatorToLonLat(x: number, y: number): [number, number] {
  const lon = (x / ORIGIN) * 180;
  const lat =
    (180 / Math.PI) *
    (2 * Math.atan(Math.exp((y / ORIGIN) * Math.PI)) - Math.PI / 2);
  return [
    Math.round(lon * 1e6) / 1e6,
    Math.round(lat * 1e6) / 1e6,
  ];
}

function reprojectRing(ring: number[][]): number[][] {
  return ring.map((c) => {
    const [lon, lat] = mercatorToLonLat(c[0], c[1]);
    return [lon, lat];
  });
}

function reprojectAndBBox(geom: RawFeature["geometry"]): {
  geometry: LonLatGeometry;
  bbox: [number, number, number, number];
} {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  const trackRing = (ring: number[][]): number[][] =>
    ring.map((c) => {
      const [lon, lat] = mercatorToLonLat(c[0], c[1]);
      if (lon < minX) minX = lon;
      if (lon > maxX) maxX = lon;
      if (lat < minY) minY = lat;
      if (lat > maxY) maxY = lat;
      return [lon, lat];
    });

  let geometry: LonLatGeometry;
  if (geom.type === "Polygon") {
    geometry = {
      type: "Polygon",
      coordinates: (geom.coordinates as number[][][]).map(trackRing),
    };
  } else {
    geometry = {
      type: "MultiPolygon",
      coordinates: (geom.coordinates as number[][][][]).map((poly) =>
        poly.map(trackRing),
      ),
    };
  }

  return { geometry, bbox: [minX, minY, maxX, maxY] };
}

export async function loadIndex(): Promise<CachedIndex> {
  if (CACHE) return CACHE;
  if (LOADING) return LOADING;

  LOADING = (async () => {
    const filePath = path.join(process.cwd(), "public", "rio.geojson");
    const raw = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(raw) as { features: RawFeature[] };

    const total = data.features.length;
    const compact: CompactFeature[] = new Array(total);
    const spatial = new Flatbush(total);

    for (let i = 0; i < total; i++) {
      const f = data.features[i];
      const { geometry, bbox } = reprojectAndBBox(f.geometry);
      compact[i] = { fid: f.properties.fid, cca: f.properties.cca, geometry };
      spatial.add(bbox[0], bbox[1], bbox[2], bbox[3]);
    }
    spatial.finish();

    CACHE = { features: compact, spatial };
    LOADING = null;
    return CACHE;
  })();

  return LOADING;
}

export { reprojectRing };
