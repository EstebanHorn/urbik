import { NextResponse } from "next/server";
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

type LonLatGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

type CompactFeature = {
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

function reprojectAndBBox(geom: RawFeature["geometry"]): {
  geometry: LonLatGeometry;
  bbox: [number, number, number, number];
} {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const reprojectRing = (ring: number[][]): number[][] =>
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
      coordinates: (geom.coordinates as number[][][]).map(reprojectRing),
    };
  } else {
    geometry = {
      type: "MultiPolygon",
      coordinates: (geom.coordinates as number[][][][]).map((poly) =>
        poly.map(reprojectRing),
      ),
    };
  }

  return { geometry, bbox: [minX, minY, maxX, maxY] };
}

async function loadIndex(): Promise<CachedIndex> {
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
      compact[i] = {
        fid: f.properties.fid,
        cca: f.properties.cca,
        geometry,
      };
      spatial.add(bbox[0], bbox[1], bbox[2], bbox[3]);
    }
    spatial.finish();

    CACHE = { features: compact, spatial };
    LOADING = null;
    return CACHE;
  })();

  return LOADING;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const minLat = parseFloat(searchParams.get("minLat") ?? "");
  const maxLat = parseFloat(searchParams.get("maxLat") ?? "");
  const minLon = parseFloat(searchParams.get("minLon") ?? "");
  const maxLon = parseFloat(searchParams.get("maxLon") ?? "");
  const limit = Math.min(
    parseInt(searchParams.get("limit") ?? "8000", 10) || 8000,
    20000,
  );

  if ([minLat, maxLat, minLon, maxLon].some(Number.isNaN)) {
    return NextResponse.json({ error: "bbox inválido" }, { status: 400 });
  }

  try {
    const { features, spatial } = await loadIndex();
    const ids = spatial.search(minLon, minLat, maxLon, maxLat);
    const slice = ids.length > limit ? ids.slice(0, limit) : ids;
    const matches = slice.map((i) => ({
      type: "Feature",
      properties: { fid: features[i].fid, cca: features[i].cca },
      geometry: features[i].geometry,
    }));

    return NextResponse.json(
      { type: "FeatureCollection", features: matches, total: ids.length },
      {
        headers: {
          "Cache-Control": "public, max-age=600, s-maxage=3600",
        },
      },
    );
  } catch (error) {
    console.error("Error loading rio-negro parcels:", error);
    return NextResponse.json(
      { type: "FeatureCollection", features: [] },
      { status: 500 },
    );
  }
}
