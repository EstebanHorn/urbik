import { NextResponse } from "next/server";

const ARCGIS_BASE_URL = "http://mapasagencia.rionegro.gov.ar/server/rest/services/Hosted/PARCELARIO/FeatureServer/0/query";

interface ArcGISFeature {
  geometry?: {
    x?: number;
    y?: number;
    rings?: number[][][];
  };
  attributes?: Record<string, unknown>;
}

interface ArcGISResponse {
  features?: ArcGISFeature[];
  error?: { message: string };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get("province");

    const params = new URLSearchParams({
      where: "1=1",
      outFields: "*",
      f: "json",
      returnGeometry: "true",
    });

    if (province) {
      params.set("where", `provincia='${province}'`);
    }

    const url = `${ARCGIS_BASE_URL}?${params}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Urbik/1.0" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { type: "FeatureCollection", features: [], error: "ArcGIS service unavailable" },
        { status: response.status }
      );
    }

    const data: ArcGISResponse = await response.json();

    if (data.error) {
      return NextResponse.json(
        { type: "FeatureCollection", features: [], error: data.error.message },
        { status: 400 }
      );
    }

    const features = (data.features || [])
      .filter((feat) => feat.geometry)
      .map((feat) => {
        let geometry: unknown;

        if (feat.geometry?.rings) {
          geometry = {
            type: "Polygon",
            coordinates: feat.geometry.rings,
          };
        } else if (feat.geometry?.x !== undefined && feat.geometry?.y !== undefined) {
          geometry = {
            type: "Point",
            coordinates: [feat.geometry.x, feat.geometry.y],
          };
        }

        return {
          type: "Feature",
          geometry,
          properties: {
            province: "Río Negro",
            ...feat.attributes,
          },
        };
      });

    return NextResponse.json({
      type: "FeatureCollection",
      features,
    });
  } catch (error) {
    console.error("Error fetching Río Negro parcels:", error);
    return NextResponse.json(
      { type: "FeatureCollection", features: [], error: "Internal server error" },
      { status: 500 }
    );
  }
}
