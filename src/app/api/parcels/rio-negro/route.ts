import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface RawFeature {
  type: "Feature";
  properties: { fid: number; cca: string };
  geometry: {
    type: "MultiPolygon" | "Polygon";
    coordinates: number[][][][] | number[][][];
  };
}

interface IndexedFeature {
  feature: RawFeature;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

let INDEX: IndexedFeature[] | null = null;
let LOADING: Promise<IndexedFeature[]> | null = null;

const ORIGIN = 20037508.342789244;

function lonLatToMercator(lon: number, lat: number): [number, number] {
  const x = (lon * ORIGIN) / 180;
  const y =
    (Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) * ORIGIN) / Math.PI;
  return [x, y];
}

function mercatorToLonLat(x: number, y: number): [number, number] {
  const lon = (x / ORIGIN) * 180;
  const lat =
    (180 / Math.PI) *
    (2 * Math.atan(Math.exp((y / ORIGIN) * Math.PI)) - Math.PI / 2);
  return [lon, lat];
}

function computeFeatureBBox(geom: RawFeature["geometry"]): [number, number, number, number] {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const visit = (coord: number[]) => {
    if (coord[0] < minX) minX = coord[0];
    if (coord[0] > maxX) maxX = coord[0];
    if (coord[1] < minY) minY = coord[1];
    if (coord[1] > maxY) maxY = coord[1];
  };
  if (geom.type === "Polygon") {
    (geom.coordinates as number[][][]).forEach((ring) => ring.forEach(visit));
  } else {
    (geom.coordinates as number[][][][]).forEach((poly) =>
      poly.forEach((ring) => ring.forEach(visit)),
    );
  }
  return [minX, minY, maxX, maxY];
}

function reprojectGeometry(geom: RawFeature["geometry"]): RawFeature["geometry"] {
  const reprojectRing = (ring: number[][]): number[][] =>
    ring.map((c) => mercatorToLonLat(c[0], c[1]));
  if (geom.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: (geom.coordinates as number[][][]).map(reprojectRing),
    };
  }
  return {
    type: "MultiPolygon",
    coordinates: (geom.coordinates as number[][][][]).map((poly) =>
      poly.map(reprojectRing),
    ),
  };
}

async function loadIndex(): Promise<IndexedFeature[]> {
  if (INDEX) return INDEX;
  if (LOADING) return LOADING;

  LOADING = (async () => {
    const filePath = path.join(process.cwd(), "public", "rio.geojson");
    const raw = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(raw) as { features: RawFeature[] };

    const indexed: IndexedFeature[] = data.features.map((feature) => {
      const [minX, minY, maxX, maxY] = computeFeatureBBox(feature.geometry);
      return { feature, minX, minY, maxX, maxY };
    });

    INDEX = indexed;
    LOADING = null;
    return indexed;
  })();

  return LOADING;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const minLat = parseFloat(searchParams.get("minLat") ?? "");
  const maxLat = parseFloat(searchParams.get("maxLat") ?? "");
  const minLon = parseFloat(searchParams.get("minLon") ?? "");
  const maxLon = parseFloat(searchParams.get("maxLon") ?? "");

  if ([minLat, maxLat, minLon, maxLon].some(Number.isNaN)) {
    return NextResponse.json({ error: "bbox inválido" }, { status: 400 });
  }

  try {
    const index = await loadIndex();
    const [bMinX, bMinY] = lonLatToMercator(minLon, minLat);
    const [bMaxX, bMaxY] = lonLatToMercator(maxLon, maxLat);

    const matches: RawFeature[] = [];
    const limit = 5000;
    for (const item of index) {
      if (
        item.maxX < bMinX ||
        item.minX > bMaxX ||
        item.maxY < bMinY ||
        item.minY > bMaxY
      ) continue;
      matches.push({
        ...item.feature,
        geometry: reprojectGeometry(item.feature.geometry),
      });
      if (matches.length >= limit) break;
    }

    return NextResponse.json(
      { type: "FeatureCollection", features: matches },
      { headers: { "Cache-Control": "public, max-age=300" } },
    );
  } catch (error) {
    console.error("Error loading rio-negro parcels:", error);
    return NextResponse.json(
      { type: "FeatureCollection", features: [] },
      { status: 500 },
    );
  }
}
