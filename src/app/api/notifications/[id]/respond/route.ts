import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const action = body.action as string;
    if (action !== "ACCEPT" && action !== "REJECT") {
      return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: notif } = await admin
      .from("notifications")
      .select("id, recipient_id, type, related_id")
      .eq("id", id)
      .single();

    if (!notif || notif.recipient_id !== user.id || notif.type !== "CONNECTION_REQUEST") {
      return NextResponse.json({ error: "Notificación no encontrada." }, { status: 404 });
    }

    const agencyId = notif.related_id;

    const { data: agency } = await admin
      .from("real_estates")
      .select("agency_name")
      .eq("profile_id", agencyId)
      .maybeSingle();
    const agencyName = agency?.agency_name || "la inmobiliaria";

    if (agencyId) {
      if (action === "ACCEPT") {
        await admin
          .from("clients")
          .update({ geora_status: "CONNECTED" })
          .eq("real_estate_id", agencyId)
          .eq("linked_user_id", user.id);
      } else {
        await admin
          .from("clients")
          .update({ geora_status: "NONE", linked_user_id: null })
          .eq("real_estate_id", agencyId)
          .eq("linked_user_id", user.id);
      }
    }

    const resolved =
      action === "ACCEPT"
        ? {
            title: "Conexión aceptada",
            body: `Te vinculaste como cliente de ${agencyName} en Geora.`,
          }
        : {
            title: "Solicitud rechazada",
            body: `Rechazaste la solicitud de ${agencyName}.`,
          };

    await admin
      .from("notifications")
      .update({ ...resolved, status: "READ" })
      .eq("id", id)
      .eq("recipient_id", user.id);

    return NextResponse.json({ success: true, action });
  } catch (err) {
    const error = err as Error;
    console.error("Error en POST /api/notifications/[id]/respond:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
