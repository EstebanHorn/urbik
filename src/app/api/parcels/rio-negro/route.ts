import { NextResponse } from "next/server";

const FEATURE_SERVER =
  "https://mapasagencia.rionegro.gov.ar/server/rest/services/Hosted/PARCELARIO/FeatureServer/0/query";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const minLat = parseFloat(searchParams.get("minLat") ?? "");
  const maxLat = parseFloat(searchParams.get("maxLat") ?? "");
  const minLon = parseFloat(searchParams.get("minLon") ?? "");
  const maxLon = parseFloat(searchParams.get("maxLon") ?? "");
  const limit = Math.min(
    parseInt(searchParams.get("limit") ?? "3000", 10) || 3000,
    5000,
  );

  if ([minLat, maxLat, minLon, maxLon].some(Number.isNaN)) {
    return NextResponse.json({ error: "bbox inválido" }, { status: 400 });
  }

  const geometry = JSON.stringify({
    xmin: minLon,
    ymin: minLat,
    xmax: maxLon,
    ymax: maxLat,
    spatialReference: { wkid: 4326 },
  });

  const params = new URLSearchParams({
    geometry,
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "CCA,OBJECTID",
    returnGeometry: "true",
    resultRecordCount: String(limit),
    f: "geojson",
  });

  try {
    const res = await fetch(`${FEATURE_SERVER}?${params}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { type: "FeatureCollection", features: [] },
        { status: 502 },
      );
    }

    const data = await res.json();

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
        headers: { "Cache-Control": "public, max-age=600, s-maxage=3600" },
      },
    );
  } catch (error) {
    console.error("Error fetching Rio Negro parcels:", error);
    return NextResponse.json(
      { type: "FeatureCollection", features: [] },
      { status: 500 },
    );
  }
}
