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

    const { data: existingFavorite, error: selectError } = await supabase
      .from("favorites")
      .select("id")
      .eq("profile_id", user.id) 
      .eq("property_id", propertyId)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existingFavorite) {
      const { error: deleteError } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existingFavorite.id);
        
      if (deleteError) throw deleteError;

      return NextResponse.json({
        message: "Eliminado de favoritos",
        isFavorite: false,
      });
    }

    const { error: insertError } = await supabase.from("favorites").insert({
      profile_id: user.id,
      property_id: propertyId,
    });

    if (insertError) throw insertError;

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