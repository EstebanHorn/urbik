import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enrichResponders } from "@/lib/connections/responders";

const AGENCY_ROLES = ["REALESTATE", "AGENT"];

// POST — responder a una búsqueda con una o más propiedades del stock propio (Flujo 2).
// body: { searchId, propertyIds: string[], message? }
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();
    if (!profile || !AGENCY_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
    }
    if (profile.role === "REALESTATE" && profile.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Tu inmobiliaria todavía no fue aprobada. Vas a poder usar la Bolsa de Conexiones apenas sea habilitada." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const searchId = body.searchId as string;
    const propertyIds: string[] = Array.isArray(body.propertyIds)
      ? body.propertyIds
      : [];
    const message = (body.message as string) || null;

    if (!searchId || propertyIds.length === 0) {
      return NextResponse.json(
        { error: "Faltan datos: búsqueda o propiedades." },
        { status: 400 }
      );
    }

    // La búsqueda debe existir, estar activa y no ser propia
    const { data: search } = await admin
      .from("property_searches")
      .select("id, real_estate_id, status")
      .eq("id", searchId)
      .single();

    if (!search) {
      return NextResponse.json({ error: "Búsqueda no encontrada." }, { status: 404 });
    }
    if (search.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "La búsqueda ya no está activa." },
        { status: 409 }
      );
    }
    if (search.real_estate_id === user.id) {
      return NextResponse.json(
        { error: "No podés responder a tu propia búsqueda." },
        { status: 400 }
      );
    }

    // Las propiedades deben pertenecer al que responde (sólo stock cargado en Geora)
    const { data: ownProps } = await admin
      .from("properties")
      .select("id")
      .eq("real_estate_id", user.id)
      .in("id", propertyIds);
    const validIds = new Set((ownProps ?? []).map((p) => p.id));
    const toInsert = propertyIds.filter((pid) => validIds.has(pid));

    if (toInsert.length === 0) {
      return NextResponse.json(
        { error: "Ninguna propiedad válida de tu stock." },
        { status: 400 }
      );
    }

    const rows = toInsert.map((property_id) => ({
      search_id: searchId,
      property_id,
      responding_agency_id: user.id,
      message,
    }));

    // upsert para ignorar duplicados (unique search_id+property_id)
    const { data: inserted, error } = await admin
      .from("search_responses")
      .upsert(rows, { onConflict: "search_id,property_id", ignoreDuplicates: true })
      .select();

    if (error) throw error;

    // Notificar al dueño de la búsqueda
    await admin.from("notifications").insert({
      recipient_id: search.real_estate_id,
      type: "SEARCH_RESPONSE",
      title: "Recibiste propiedades para una búsqueda",
      body: `Una inmobiliaria respondió con ${toInsert.length} ${
        toInsert.length === 1 ? "propiedad" : "propiedades"
      } a una de tus búsquedas. Mirá las respuestas en "Mis Búsquedas".`,
      related_type: "SEARCH",
      related_id: searchId,
      status: "UNREAD",
    });

    return NextResponse.json({ success: true, count: inserted?.length ?? 0 });
  } catch (err) {
    const error = err as Error;
    console.error("Error al responder búsqueda:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET — respuestas. ?searchId= devuelve las de una búsqueda (dueño o respondedor).
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const searchId = searchParams.get("searchId");

    const admin = createAdminClient();

    let query = admin
      .from("search_responses")
      .select(
        "*, properties ( id, title, type, operation_type, city, sale_price, rent_price, sale_currency, rent_currency, images )"
      )
      .order("created_at", { ascending: false });

    if (searchId) {
      // verificar permiso: dueño de la búsqueda o respondedor
      const { data: search } = await admin
        .from("property_searches")
        .select("real_estate_id")
        .eq("id", searchId)
        .single();
      if (!search) {
        return NextResponse.json({ error: "Búsqueda no encontrada." }, { status: 404 });
      }
      const isOwner = search.real_estate_id === user.id;
      query = query.eq("search_id", searchId);
      if (!isOwner) query = query.eq("responding_agency_id", user.id);
    } else {
      // sin searchId: las respuestas que yo envié
      query = query.eq("responding_agency_id", user.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    const enriched = await enrichResponders(admin, data ?? []);
    return NextResponse.json(enriched);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
