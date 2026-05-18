import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 },
      );
    }

    const { propertyId } = await req.json();

    if (!propertyId) {
      return NextResponse.json(
        { error: "Falta el ID de la propiedad" },
        { status: 400 },
      );
    }

    const { data: existingFavorite } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("property_id", Number(propertyId))
      .maybeSingle();

    if (existingFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("id", existingFavorite.id);

      return NextResponse.json({
        message: "Eliminado de favoritos",
        isFavorite: false,
      });
    }

    await supabase.from("favorites").insert({
      user_id: user.id,
      property_id: Number(propertyId),
    });

    return NextResponse.json({
      message: "Guardado en favoritos",
      isFavorite: true,
    });
  } catch (error) {
    console.error("ERROR EN API FAVORITE:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}