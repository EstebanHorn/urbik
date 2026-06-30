import Flatbush from "flatbush";
import { gunzipSync } from "zlib";
import { createAdminClient } from "@/lib/supabase/admin";

// Artefacto pre-procesado: coordenadas ya en lon/lat (6 decimales), estructura
// compacta y comprimido con gzip. Se genera con `scripts/prepare-riocolorado.mjs`
// a partir del geojson crudo (Web Mercator) que vive en el mismo bucket.
const GEOJSON_BUCKET = "geojson";
const GEOJSON_PATH = "riocolorado.min.json.gz";

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

function computeBBox(geom: LonLatGeometry): [number, number, number, number] {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  const scanRing = (ring: number[][]) => {
    for (const [lon, lat] of ring) {
      if (lon < minX) minX = lon;
      if (lon > maxX) maxX = lon;
      if (lat < minY) minY = lat;
      if (lat > maxY) maxY = lat;
    }
  };

  if (geom.type === "Polygon") {
    (geom.coordinates as number[][][]).forEach(scanRing);
  } else {
    (geom.coordinates as number[][][][]).forEach((poly) => poly.forEach(scanRing));
  }

  return [minX, minY, maxX, maxY];
}

export async function loadIndex(): Promise<CachedIndex> {
  if (CACHE) return CACHE;
  if (LOADING) return LOADING;

  LOADING = (async () => {
    const supabase = createAdminClient();
    const { data: blob, error } = await supabase.storage
      .from(GEOJSON_BUCKET)
      .download(GEOJSON_PATH);

    if (error || !blob) {
      LOADING = null;
      throw new Error(
        `No se pudo descargar ${GEOJSON_PATH} del bucket ${GEOJSON_BUCKET}: ${error?.message ?? "respuesta vacía"}`,
      );
    }

    const buf = Buffer.from(await blob.arrayBuffer());
    const data = JSON.parse(gunzipSync(buf).toString("utf8")) as {
      features: CompactFeature[];
    };

    const total = data.features.length;
    const spatial = new Flatbush(total);

    for (let i = 0; i < total; i++) {
      const bbox = computeBBox(data.features[i].geometry);
      spatial.add(bbox[0], bbox[1], bbox[2], bbox[3]);
    }
    spatial.finish();

    CACHE = { features: data.features, spatial };
    LOADING = null;
    return CACHE;
  })();

  return LOADING;
}
