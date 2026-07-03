import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const admin = createAdminClient();

    const { data: client } = await admin
      .from("clients")
      .select("id, real_estate_id, linked_user_id, name")
      .eq("id", id)
      .single();

    if (!client || client.real_estate_id !== user.id) {
      return NextResponse.json({ error: "Contacto no encontrado." }, { status: 404 });
    }

    if (!client.linked_user_id) {
      return NextResponse.json(
        {
          error:
            "Este contacto no tiene una cuenta de Geora vinculada. Solo podés chatear con clientes registrados en Geora.",
        },
        { status: 409 }
      );
    }

    const { data: existing } = await admin
      .from("chat_threads")
      .select("id")
      .eq("user_id", client.linked_user_id)
      .eq("real_estate_id", user.id)
      .is("property_id", null)
      .maybeSingle();

    let threadId = existing?.id;

    if (!threadId) {
      const { data: created, error } = await admin
        .from("chat_threads")
        .insert({
          user_id: client.linked_user_id,
          real_estate_id: user.id,
          property_id: null,
        })
        .select("id")
        .single();
      if (error || !created) throw error ?? new Error("No se pudo crear el hilo");
      threadId = created.id;
    }

    return NextResponse.json({ threadId });
  } catch (err) {
    const error = err as Error;
    console.error("Error en POST /api/clients/[id]/chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
