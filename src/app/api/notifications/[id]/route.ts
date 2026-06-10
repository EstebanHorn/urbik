import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "No autenticado." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("notifications")
      .update({ status: "READ" })
      .eq("id", id)
      .eq("recipient_id", authUser.id)
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Notificación no encontrada." },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, notification: data });
  } catch (err) {
    const error = err as Error;
    console.error("Error al marcar notificación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor.", detail: error.message },
      { status: 500 }
    );
  }
}
