import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findMatchingProperties } from "@/lib/connections/matching";

const AGENCY_ROLES = ["REALESTATE", "AGENT"];

async function getAgencyRole(adminClient: ReturnType<typeof createAdminClient>, userId: string) {
  const { data } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role ?? null;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();
  const role = await getAgencyRole(admin, user.id);
  if (!role || !AGENCY_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "La Bolsa de Conexiones es exclusiva para inmobiliarias." },
      { status: 403 }
    );
  }

  const nowIso = new Date().toISOString();

  // Mis búsquedas: incluyen el contacto interno (visible sólo para el dueño)
  const { data: mySearches, error: myError } = await admin
    .from("property_searches")
    .select(`*, clients ( id, name )`)
    .eq("real_estate_id", user.id)
    .neq("status", "CLOSED")
    .order("created_at", { ascending: false });

  if (myError) {
    return NextResponse.json({ error: myError.message }, { status: 500 });
  }

  // Adjuntar conteo de respuestas recibidas a cada búsqueda propia
  const myIds = (mySearches ?? []).map((s) => s.id);
  let responseCounts: Record<string, number> = {};
  if (myIds.length > 0) {
    const { data: resp } = await admin
      .from("search_responses")
      .select("search_id")
      .in("search_id", myIds);
    responseCounts = (resp ?? []).reduce((acc: Record<string, number>, r) => {
      acc[r.search_id] = (acc[r.search_id] ?? 0) + 1;
      return acc;
    }, {});
  }
  const mySearchesWithCounts = (mySearches ?? []).map((s) => ({
    ...s,
    responseCount: responseCounts[s.id] ?? 0,
  }));

  // Búsquedas de la red: NUNCA exponen el contacto interno (client_id/clients)
  const { data: networkRaw, error: networkError } = await admin
    .from("property_searches")
    .select(`*`)
    .neq("real_estate_id", user.id)
    .eq("status", "ACTIVE")
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false });

  if (networkError) {
    return NextResponse.json({ error: networkError.message }, { status: 500 });
  }

  // Datos de la inmobiliaria publicante (credibilidad en la tarjeta de red).
  const agencyIds = Array.from(
    new Set((networkRaw ?? []).map((row) => row.real_estate_id).filter(Boolean))
  );
  let agencyById: Record<string, { agencyName: string | null; agencyLogo: string | null }> = {};
  if (agencyIds.length > 0) {
    const { data: agencies } = await admin
      .from("real_estates")
      .select("profile_id, agency_name, logo_url")
      .in("profile_id", agencyIds);
    agencyById = (agencies ?? []).reduce(
      (acc: typeof agencyById, a) => {
        acc[a.profile_id] = { agencyName: a.agency_name, agencyLogo: a.logo_url };
        return acc;
      },
      {}
    );
  }

  // Ocultar el contacto interno (client_id) en las búsquedas de la red.
  const networkSearches = (networkRaw ?? []).map((row) => {
    const rest = { ...row };
    delete rest.client_id;
    return {
      ...rest,
      agencyName: agencyById[row.real_estate_id]?.agencyName ?? null,
      agencyLogo: agencyById[row.real_estate_id]?.agencyLogo ?? null,
    };
  });

  return NextResponse.json({
    mySearches: mySearchesWithCounts,
    networkSearches,
  });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const admin = createAdminClient();
  const role = await getAgencyRole(admin, user.id);
  if (!role || !AGENCY_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "Sólo las inmobiliarias pueden publicar búsquedas." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    // client_id y province son NOT NULL en la DB
    if (!body.clientId) {
      return NextResponse.json(
        { error: "Debés seleccionar un cliente interno." },
        { status: 400 }
      );
    }

    const { data: search, error } = await admin
      .from("property_searches")
      .insert({
        real_estate_id: user.id,
        client_id: body.clientId,
        operation_type: body.operationType,
        property_type: body.propertyType,
        province: body.province || "",
        city: body.city || null,
        neighborhoods: body.neighborhoods || null,
        radius_km: body.radiusKm ? Number(body.radiusKm) : null,
        min_area: body.minArea ? Number(body.minArea) : null,
        max_area: body.maxArea ? Number(body.maxArea) : null,
        area_unit: body.areaUnit || "M2",
        min_price: body.minPrice ? Number(body.minPrice) : null,
        max_price: body.maxPrice ? Number(body.maxPrice) : null,
        currency: body.currency || "USD",
        additional_conditions: body.conditions || null,
        mandatory_fields: body.mandatoryFields || [],
      })
      .select()
      .single();

    if (error) throw error;

    // --- Matching automático contra el stock de la red (excluye al publicante) ---
    let matchCount = 0;
    try {
      const matches = await findMatchingProperties(admin, search, {
        excludeOwnerId: user.id,
      });
      matchCount = matches.length;

      // Notificar a cada inmobiliaria dueña de una propiedad que matchea (una por dueño)
      const ownerIds = Array.from(
        new Set(matches.map((m) => m.real_estate_id).filter(Boolean))
      );
      if (ownerIds.length > 0) {
        const notifications = ownerIds.map((ownerId) => ({
          recipient_id: ownerId,
          type: "SEARCH_MATCH",
          title: "Tu propiedad coincide con una nueva búsqueda",
          body: "Una inmobiliaria publicó una búsqueda que coincide con una de tus propiedades. Entrá a la Bolsa de Conexiones para responder.",
          related_type: "SEARCH",
          related_id: search.id,
          status: "UNREAD",
        }));
        await admin.from("notifications").insert(notifications);
      }
    } catch (matchErr) {
      console.error("Error en matching de búsqueda:", matchErr);
    }

    return NextResponse.json({ ...search, matchCount });
  } catch (error) {
    const e = error as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
