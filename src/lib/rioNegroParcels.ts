// Capa parcelaria de la provincia de Río Negro, servida por el ArcGIS Server del
// catastro provincial (SIREC): cubre TODA la provincia (Viedma, Alto Valle,
// Bariloche, etc.), no solo Río Colorado.
//
// Reemplaza al índice Flatbush self-hosted (`rioColoradoIndex.ts`), que solo
// cubría Río Colorado y era lento porque mandaba geometría vectorial y la
// renderizaba el cliente. Acá el server dibuja tiles PNG (rápido, igual que el
// GetMap de ARBA en Buenos Aires) y `identify` resuelve el click:
//
//   - Tiles de display: `export?bbox=...`      (equivalente al WMS GetMap)
//   - Click → parcela:  `identify?geometry=...` (equivalente al GetFeatureInfo)

const BASE =
  "https://mapasagencia.rionegro.gov.ar/server/rest/services/Hosted/PARCELARIO/MapServer";

// Render sin relleno + outline gris (#9ca3af = [156,163,175]) para que las
// parcelas queden como referencia catastral tenue sobre el satélite.
// `esriSFSNull` = sin relleno; requiere supportsDynamicLayers.
const HOLLOW_RENDERER = encodeURIComponent(
  JSON.stringify([
    {
      id: 0,
      source: { type: "mapLayer", mapLayerId: 0 },
      drawingInfo: {
        renderer: {
          type: "simple",
          symbol: {
            type: "esriSFS",
            style: "esriSFSNull",
            outline: {
              type: "esriSLS",
              style: "esriSLSSolid",
              color: [156, 163, 175, 255],
              width: 0.8,
            },
          },
        },
      },
    },
  ]),
);

const R = 6378137;
const ORIGIN = Math.PI * R; // 20037508.342789244

// bbox en Web Mercator (3857) de un tile XYZ estándar — el mismo esquema de
// teselas que usan tanto Google Maps como Leaflet.
function tileBBox3857(
  x: number,
  y: number,
  z: number,
): [number, number, number, number] {
  const res = (2 * ORIGIN) / (256 * 2 ** z);
  const xmin = x * 256 * res - ORIGIN;
  const xmax = (x + 1) * 256 * res - ORIGIN;
  const ymax = ORIGIN - y * 256 * res;
  const ymin = ORIGIN - (y + 1) * 256 * res;
  return [xmin, ymin, xmax, ymax];
}

export const PARCEL_MIN_ZOOM = 15;

// URL de tile PNG para un XYZ dado. ArcGIS trabaja nativo en 3857, que es
// justo la proyección de las teselas, así que pasamos el bbox directo (sin la
// conversión a 4326 + SLD que exige ARBA).
export function parcelTileUrl(
  x: number,
  y: number,
  z: number,
  size = 256,
): string {
  const [xmin, ymin, xmax, ymax] = tileBBox3857(x, y, z);
  return (
    `${BASE}/export?bbox=${xmin},${ymin},${xmax},${ymax}` +
    `&bboxSR=3857&imageSR=3857&size=${size},${size}` +
    `&format=png32&transparent=true&dynamicLayers=${HOLLOW_RENDERER}&f=image`
  );
}

export interface IdentifiedParcel {
  cca: string;
  geometry: { type: "Polygon"; coordinates: number[][][] };
}

// Resuelve la parcela que contiene un punto (lat/lng). Server-side: el
// certificado de mapasagencia es válido, así que `fetch` estándar alcanza.
export async function identifyParcel(
  lat: number,
  lng: number,
): Promise<IdentifiedParcel | null> {
  const d = 0.0015;
  const mapExtent = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  const url =
    `${BASE}/identify?geometry=${lng},${lat}` +
    `&geometryType=esriGeometryPoint&sr=4326&layers=all&tolerance=5` +
    `&mapExtent=${mapExtent}&imageDisplay=600,600,96&returnGeometry=true&f=json`;

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`ArcGIS identify ${res.status}`);

  const data = (await res.json()) as {
    results?: {
      value?: string;
      attributes?: Record<string, string>;
      geometry?: { rings?: number[][][] };
    }[];
  };
  const result = data.results?.[0];
  if (!result?.geometry?.rings?.length) return null;

  // Con `sr=4326` los rings ya vienen en lon/lat, y ArcGIS usa el mismo orden
  // [lon, lat] que GeoJSON (ring exterior primero, huecos después): no hay
  // reproyección ni reordenamiento que hacer.
  return {
    cca: result.value ?? result.attributes?.CCA ?? "",
    geometry: { type: "Polygon", coordinates: result.geometry.rings },
  };
}
