

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = "https://apis.datos.gob.ar/georef/api";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}

async function main() {
  console.log("Descargando provincias...");
  const provData = await fetchJson(`${BASE}/provincias?campos=id,nombre&max=100`);
  const provincias = provData.provincias.sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  );
  console.log(`  ${provincias.length} provincias encontradas`);

  const departamentos = {};

  for (const prov of provincias) {
    process.stdout.write(`  Departamentos de ${prov.nombre}... `);
    const url = `${BASE}/departamentos?provincia=${encodeURIComponent(prov.nombre)}&max=250&campos=id,nombre`;
    try {
      const data = await fetchJson(url);
      const items = (data.departamentos || []).sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      );
      departamentos[prov.nombre] = items;
      console.log(`${items.length}`);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      departamentos[prov.nombre] = [];
    }
    await new Promise((r) => setTimeout(r, 120));
  }

  const output = { provincias, departamentos };
  const outPath = join(__dirname, "../src/data/argentina-geo.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\nGuardado en ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
