import { NextResponse } from "next/server";

const WFS_URL =
  "http://mapasagencia.rionegro.gov.ar/server/services/Hosted/PARCELARIO/MapServer/WFSServer";

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

  const bbox = `${minLon},${minLat},${maxLon},${maxLat},EPSG:4326`;
  const url =
    `${WFS_URL}?service=wfs&version=2.0.0&request=getfeature` +
    `&typenames=PARCELARIO:PARCELARIO` +
    `&bbox=${bbox}` +
    `&outputFormat=geojson` +
    `&count=${limit}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      return NextResponse.json(
        { type: "FeatureCollection", features: [] },
        { status: 502 },
      );
    }

    const data = await res.json();

    // Normalizar propiedades para mantener compatibilidad con el resto del sistema
    const features = (data.features ?? []).map(
      (f: { properties: Record<string, unknown>; geometry: unknown }) => ({
        type: "Feature",
        properties: {
          fid: f.properties.OBJECTID,
          cca: f.properties.CCA,
        },
        geometry: f.geometry,
      }),
    );

    return NextResponse.json(
      { type: "FeatureCollection", features, total: features.length },
      {
        headers: {
          "Cache-Control": "public, max-age=600, s-maxage=3600",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching Rio Negro WFS:", error);
    return NextResponse.json(
      { type: "FeatureCollection", features: [] },
      { status: 500 },
    );
  }
}
