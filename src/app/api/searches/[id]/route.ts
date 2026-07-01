import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enrichResponders } from "@/lib/connections/responders";

const AGENCY_ROLES = ["REALESTATE", "AGENT"];

// GET — detalle de una búsqueda. El contacto interno sólo se devuelve al dueño.
export async function GET(
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
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || !AGENCY_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
    }

    const { data: search, error } = await admin
      .from("property_searches")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !search) {
      return NextResponse.json({ error: "Búsqueda no encontrada." }, { status: 404 });
    }

    const isOwner = search.real_estate_id === user.id;

    // Otra inmobiliaria sólo puede ver búsquedas ACTIVAS, y nunca el contacto.
    if (!isOwner && search.status !== "ACTIVE") {
      return NextResponse.json({ error: "Búsqueda no disponible." }, { status: 404 });
    }

    let result: Record<string, unknown> = { ...search, isOwner };

    if (isOwner) {
      // adjuntar contacto + respuestas recibidas con datos de la propiedad y la inmobiliaria
      const { data: client } = await admin
        .from("clients")
        .select("id, name, phone, email")
        .eq("id", search.client_id)
        .maybeSingle();

      const { data: responses } = await admin
        .from("search_responses")
        .select(
          "*, properties ( id, title, type, operation_type, city, sale_price, rent_price, sale_currency, rent_currency, images )"
        )
        .eq("search_id", id)
        .order("created_at", { ascending: false });

      const enriched = await enrichResponders(admin, responses ?? []);
      result = { ...result, client, responses: enriched };
    } else {
      // ocultar contacto para la red
      delete result.client_id;
    }

    return NextResponse.json(result);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — actualizar estado (PAUSED / ACTIVE / CLOSED). Sólo el dueño.
export async function PATCH(
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
    const status = body.status as string | undefined;
    if (!status || !["ACTIVE", "PAUSED", "CLOSED"].includes(status)) {
      return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("property_searches")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("real_estate_id", user.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Búsqueda no encontrada o sin permisos." },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — eliminar una búsqueda propia.
export async function DELETE(
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
    const { error } = await admin
      .from("property_searches")
      .delete()
      .eq("id", id)
      .eq("real_estate_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
