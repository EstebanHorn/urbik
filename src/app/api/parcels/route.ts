import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: properties, error } = await supabase
      .from("properties")
      .select(`
        parcel_geom,
        parcel_cca,
        parcel_pda
      `)
      .eq("status", "AVAILABLE")
      .not("parcel_geom", "is", null);

    if (error) {
      throw error;
    }

    const features = (properties || [])
      .filter(
        (p) =>
          p.parcel_geom &&
          typeof p.parcel_geom === "object",
      )
      .map((p) => ({
        type: "Feature",
        geometry: p.parcel_geom,
        properties: {
          CCA: p.parcel_cca,
          PDA: p.parcel_pda,
        },
      }));

    return NextResponse.json({
      type: "FeatureCollection",
      features,
    });
  } catch (error) {
    console.error("Error en /api/parcels:", error);

    return NextResponse.json(
      { type: "FeatureCollection", features: [] },
      { status: 500 },
    );
  }
}