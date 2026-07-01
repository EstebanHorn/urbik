import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findMatchingProperties } from "@/lib/connections/matching";

const AGENCY_ROLES = ["REALESTATE", "AGENT"];

// GET — propiedades del stock PROPIO de la inmobiliaria que coinciden con una búsqueda.
// Usado en el flujo "Tengo una propiedad para esto" (Flujo 2).
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

    // Cruza sólo contra el stock propio (nunca contra el de otras inmobiliarias)
    const matches = await findMatchingProperties(admin, search, {
      ownerId: user.id,
    });

    // Marcar las que ya fueron enviadas como respuesta a esta búsqueda
    const { data: existing } = await admin
      .from("search_responses")
      .select("property_id")
      .eq("search_id", id)
      .eq("responding_agency_id", user.id);
    const alreadySent = new Set((existing ?? []).map((r) => r.property_id));

    const result = matches.map((m) => ({
      ...m,
      alreadySent: alreadySent.has(m.id),
    }));

    return NextResponse.json(result);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
