import { NextResponse } from "next/server";
import { loadIndex } from "@/lib/rioColoradoIndex";

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
    console.error("Error loading rio-colorado parcels:", error);
    return NextResponse.json(
      { type: "FeatureCollection", features: [] },
      { status: 500 },
    );
  }
}
