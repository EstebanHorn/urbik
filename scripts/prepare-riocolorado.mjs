// Regenera el artefacto comprimido de parcelas de Río Colorado.
//
// Baja el geojson crudo (`riocolorado.geojson`, coordenadas Web Mercator) del
// bucket `geojson` de Supabase, lo reproyecta a lon/lat redondeado a 6 decimales,
// lo deja en una estructura compacta `{ features: [{ fid, cca, geometry }] }`,
// lo comprime con gzip y lo sube de vuelta como `riocolorado.min.json.gz`.
//
// Correr cuando cambie el geojson fuente:
//   node scripts/prepare-riocolorado.mjs
//
// Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.

import { createClient } from "@supabase/supabase-js";
import { gzipSync } from "zlib";
import { readFileSync } from "fs";

const BUCKET = "geojson";
const SOURCE = "riocolorado.geojson";
const TARGET = "riocolorado.min.json.gz";

const ORIGIN = 20037508.342789244;
function mercatorToLonLat(x, y) {
  const lon = (x / ORIGIN) * 180;
  const lat =
    (180 / Math.PI) *
    (2 * Math.atan(Math.exp((y / ORIGIN) * Math.PI)) - Math.PI / 2);
  return [Math.round(lon * 1e6) / 1e6, Math.round(lat * 1e6) / 1e6];
}
const reprojectRing = (ring) =>
  ring.map((c) => mercatorToLonLat(c[0], c[1]));

function loadEnv() {
  const env = Object.fromEntries(
    readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      }),
  );
  return env;
}

async function main() {
  const env = loadEnv();
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } },
  );

  console.log(`Descargando ${SOURCE}...`);
  const { data: blob, error: dlErr } = await supabase.storage
    .from(BUCKET)
    .download(SOURCE);
  if (dlErr || !blob) throw new Error(`download: ${dlErr?.message ?? "vacío"}`);

  const data = JSON.parse(await blob.text());
  console.log(`  ${data.features.length} features`);

  const features = data.features.map((f) => {
    const g = f.geometry;
    const geometry =
      g.type === "Polygon"
        ? { type: "Polygon", coordinates: g.coordinates.map(reprojectRing) }
        : {
            type: "MultiPolygon",
            coordinates: g.coordinates.map((poly) => poly.map(reprojectRing)),
          };
    return { fid: f.properties.fid, cca: f.properties.cca, geometry };
  });

  const json = JSON.stringify({ features });
  const gz = gzipSync(Buffer.from(json, "utf8"), { level: 9 });
  console.log(
    `  compacto: ${(json.length / 1e6).toFixed(2)} MB → gzip: ${(gz.length / 1e6).toFixed(2)} MB`,
  );

  console.log(`Subiendo ${TARGET}...`);
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(TARGET, gz, {
      contentType: "application/gzip",
      upsert: true,
    });
  if (upErr) throw new Error(`upload: ${upErr.message}`);

  console.log("Listo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
