import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: clients, error } = await supabase
      .from("clients")
      .select(`
    *,
    properties ( title ),
    property_searches (
        id,
        status
    )
`)
      .eq("real_estate_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedClients = clients.map((c: any) => ({
  id: c.id,
  name: c.name,
  phone: c.phone,
  email: c.email,
  notes: c.notes,
  role: c.role,
  georaStatus: c.geora_status,
  searchParams: c.search_params,
  linkedPropertyId: c.linked_property_id,
  linkedPropertyTitle: c.properties?.title || "",
  hasActiveSearch:
    c.property_searches?.some((s: any) => s.status === "ACTIVE") || false,
}));

    return NextResponse.json(formattedClients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const admin = createAdminClient();
    const body = await req.json();
    const { name, phone, email, notes, role, searchParams, linkedPropertyId } = body;

    let georaStatus = "NONE";
    let linkedUserId = null;

    if (email && email.trim() !== "") {
      // Lectura con admin: RLS de profiles impide ver perfiles ajenos por email.
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (existingProfile && existingProfile.id !== session.user.id) {
        georaStatus = "PENDING";
        linkedUserId = existingProfile.id;
      }
    }

    const { data: newClient, error: insertError } = await supabase
      .from("clients")
      .insert({
        real_estate_id: session.user.id,
        name,
        phone,
        email: email?.trim().toLowerCase() || null,
        notes,
        role,
        geora_status: georaStatus,
        linked_user_id: linkedUserId,
        search_params: searchParams || null,
        linked_property_id: linkedPropertyId || null,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    if (georaStatus === "PENDING" && linkedUserId) {
      // Nombre de la inmobiliaria para personalizar el aviso.
      const { data: agency } = await admin
        .from("real_estates")
        .select("agency_name")
        .eq("profile_id", session.user.id)
        .maybeSingle();
      const agencyName = agency?.agency_name || "Una inmobiliaria";

      // Insert con admin: notifications tiene RLS sin policy de INSERT.
      const { error: notifError } = await admin.from("notifications").insert({
        recipient_id: linkedUserId,
        type: "CONNECTION_REQUEST",
        title: "Nueva solicitud de conexión",
        body: `${agencyName} quiere vincularte como su cliente en Geora.`,
        related_type: "AGENCY",
        related_id: session.user.id,
        status: "UNREAD",
      });
      if (notifError) {
        console.error("Error al crear notificación de conexión:", notifError);
      }
    }

    return NextResponse.json(newClient);
  } catch (error: any) {
    console.error("Error en POST /api/clients:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}