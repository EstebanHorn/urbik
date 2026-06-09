import { NextResponse } from "next/server";

const WFS_URL =
  "http://mapasagencia.rionegro.gov.ar/server/services/Hosted/PARCELARIO/MapServer/WFSServer";

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
    // Usar BBOX pequeño alrededor del punto — el WFS filtra features que intersectan
    const DELTA = 0.0001;
    const bbox = `${lng - DELTA},${lat - DELTA},${lng + DELTA},${lat + DELTA},EPSG:4326`;
    const url =
      `${WFS_URL}?service=wfs&version=2.0.0&request=getfeature` +
      `&typenames=PARCELARIO:PARCELARIO` +
      `&bbox=${bbox}` +
      `&outputFormat=geojson` +
      `&count=1`;

    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) {
        return NextResponse.json({ error: "WFS no disponible" }, { status: 502 });
      }

      const data = await res.json();
      const feature = data.features?.[0];

      if (!feature) {
        return NextResponse.json(
          { error: "No se encontró parcela en ese punto" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        cca: feature.properties?.CCA ?? "",
        geometry: feature.geometry ?? null,
      });
    } catch (err) {
      console.error("Error querying Rio Negro WFS:", err);
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
  }

  // Buenos Aires — ARBA WMS GetFeatureInfo
  try {
    const DELTA = 0.001;
    const west = lng - DELTA;
    const east = lng + DELTA;
    const south = lat - DELTA;
    const north = lat + DELTA;

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
      return NextResponse.json(
        { error: "No se encontró parcela en ese punto" },
        { status: 404 },
      );
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
