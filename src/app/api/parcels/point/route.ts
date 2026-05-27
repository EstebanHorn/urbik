import { NextResponse } from "next/server";
import { loadIndex, type LonLatGeometry } from "@/lib/rioNegroIndex";

function pointInRing(px: number, py: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (((yi > py) !== (yj > py)) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInGeometry(lng: number, lat: number, geometry: LonLatGeometry): boolean {
  if (geometry.type === "Polygon") {
    return pointInRing(lng, lat, (geometry.coordinates as number[][][])[0]);
  }
  for (const poly of geometry.coordinates as number[][][][]) {
    if (pointInRing(lng, lat, poly[0])) return true;
  }
  return false;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const province = searchParams.get("province") ?? "";

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "lat/lng inválido" }, { status: 400 });
  }

  const isRioNegro = /r[íi]o\s*negro/i.test(province);

  if (isRioNegro) {
    const DELTA = 0.002;
    try {
      const { features, spatial } = await loadIndex();
      const ids = spatial.search(lng - DELTA, lat - DELTA, lng + DELTA, lat + DELTA);

      for (const i of ids) {
        const f = features[i];
        if (pointInGeometry(lng, lat, f.geometry)) {
          return NextResponse.json({ cca: f.cca, geometry: f.geometry });
        }
      }
      return NextResponse.json({ error: "No se encontró parcela en ese punto" }, { status: 404 });
    } catch (err) {
      console.error("Error querying Rio Negro parcels:", err);
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
  }

  // Buenos Aires / other provinces: proxy ARBA WMS GetFeatureInfo
  // (WFS returns XML regardless of OUTPUTFORMAT; WMS GetFeatureInfo works with JSON)
  try {
    const DELTA = 0.001;
    const west = lng - DELTA;
    const east = lng + DELTA;
    const south = lat - DELTA;
    const north = lat + DELTA;

    // Virtual 256x256 tile centered on the click point; pixel (128,128) = the click
    const featureInfoUrl =
      `https://geo.arba.gov.ar/geoserver/idera/ows` +
      `?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo` +
      `&LAYERS=idera:Parcela&QUERY_LAYERS=idera:Parcela` +
      `&INFO_FORMAT=application%2Fjson` +
      `&FEATURE_COUNT=1` +
      `&X=128&Y=128&WIDTH=256&HEIGHT=256` +
      `&BBOX=${west},${south},${east},${north}` +
      `&SRS=EPSG:4326`;

    const response = await fetch(featureInfoUrl, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "ARBA no disponible" }, { status: 502 });
    }

    const text = await response.text();
    if (text.trimStart().startsWith("<")) {
      return NextResponse.json({ error: "ARBA no disponible" }, { status: 502 });
    }

    const data = JSON.parse(text);
    const feature = data.features?.[0];

    if (!feature) {
      return NextResponse.json({ error: "No se encontró parcela en ese punto" }, { status: 404 });
    }

    return NextResponse.json({
      cca: feature.properties?.cca ?? feature.properties?.CCA ?? "",
      pda: feature.properties?.pda ?? feature.properties?.PDA ?? "",
      geometry: feature.geometry ?? null,
    });
  } catch (err) {
    console.error("Error querying ARBA:", err);
    return NextResponse.json({ error: "Error consultando ARBA" }, { status: 502 });
  }
}
