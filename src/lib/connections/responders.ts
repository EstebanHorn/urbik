import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Adjunta a cada respuesta (search_responses) los datos públicos de la
 * inmobiliaria que respondió (nombre + logo), leídos de real_estates
 * (keyed por profile_id = responding_agency_id).
 */
export async function enrichResponders<T extends { responding_agency_id: string }>(
  supabase: SupabaseClient,
  responses: T[]
): Promise<
  (T & { responder: { id: string; name: string | null; logoUrl: string | null } })[]
> {
  if (responses.length === 0) return [];

  const ids = Array.from(new Set(responses.map((r) => r.responding_agency_id)));
  const { data } = await supabase
    .from("real_estates")
    .select("profile_id, agency_name, logo_url")
    .in("profile_id", ids);

  const byId = new Map(
    (data ?? []).map(
      (a: {
        profile_id: string;
        agency_name: string | null;
        logo_url: string | null;
      }) => [a.profile_id, { name: a.agency_name, logoUrl: a.logo_url }]
    )
  );

  return responses.map((r) => ({
    ...r,
    responder: {
      id: r.responding_agency_id,
      name: byId.get(r.responding_agency_id)?.name ?? null,
      logoUrl: byId.get(r.responding_agency_id)?.logoUrl ?? null,
    },
  }));
}
