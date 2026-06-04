import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ViewRow = { created_at: string };
type PropertyRow = {
  id: string;
  title: string | null;
  images: string[] | null;
  status: string | null;
  views_count: number | null;
  favorites_count: number | null;
  inquiries_count: number | null;
  chats_count: number | null;
  sale_price: number | null;
  rent_price: number | null;
  sale_currency: string | null;
  rent_currency: string | null;
};

function buildDailySeries(rows: ViewRow[], days: number) {
  const bucket = new Map<string, number>();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    bucket.set(d.toISOString().slice(0, 10), 0);
  }

  for (const row of rows) {
    const day = row.created_at.slice(0, 10);
    if (bucket.has(day)) {
      bucket.set(day, (bucket.get(day) ?? 0) + 1);
    }
  }

  return Array.from(bucket.entries()).map(([day, views]) => ({ day, views }));
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    // Owner ambiguity fallback: algunas filas legacy pueden tener
    // real_estate_id apuntando a profiles.user_id en vez de auth.uid()
    const { data: profile } = await admin
      .from("profiles")
      .select("user_id")
      .eq("id", authUser.id)
      .single();

    const ownerIds = [authUser.id];
    if (profile?.user_id && profile.user_id !== authUser.id) {
      ownerIds.push(profile.user_id);
    }

    const { data: propertiesRaw, error: propsErr } = await admin
      .from("properties")
      .select(
        "id, title, images, status, views_count, favorites_count, inquiries_count, chats_count, sale_price, rent_price, sale_currency, rent_currency"
      )
      .in("real_estate_id", ownerIds);

    if (propsErr) throw propsErr;

    const properties: PropertyRow[] = propertiesRaw ?? [];
    const propertyIds = properties.map((p) => p.id);

    const now = Date.now();
    const days30Iso = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    const days7Iso = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Vistas a propiedades (últimas 30d para serie + KPIs derivados)
    let propertyViewRows: ViewRow[] = [];
    if (propertyIds.length > 0) {
      const { data, error } = await admin
        .from("property_views")
        .select("created_at")
        .in("property_id", propertyIds)
        .gte("created_at", days30Iso)
        .order("created_at", { ascending: true });
      if (error) throw error;
      propertyViewRows = (data ?? []) as ViewRow[];
    }

    // Vistas a la agencia
    const { data: agencyViewsRaw, error: avErr } = await admin
      .from("real_estate_views")
      .select("created_at")
      .eq("real_estate_id", authUser.id)
      .gte("created_at", days30Iso)
      .order("created_at", { ascending: true });
    if (avErr) throw avErr;
    const agencyViewRows: ViewRow[] = (agencyViewsRaw ?? []) as ViewRow[];

    const views7d = propertyViewRows.filter((r) => r.created_at >= days7Iso).length;
    const views30d = propertyViewRows.length;
    const agencyViews30d = agencyViewRows.length;

    const totals = properties.reduce(
      (acc, p) => {
        acc.viewsAll += p.views_count ?? 0;
        acc.favorites += p.favorites_count ?? 0;
        acc.inquiries += p.inquiries_count ?? 0;
        acc.chats += p.chats_count ?? 0;
        if ((p.status ?? "").toUpperCase() === "AVAILABLE") acc.active += 1;
        return acc;
      },
      { viewsAll: 0, favorites: 0, inquiries: 0, chats: 0, active: 0 }
    );

    const topProperties = [...properties]
      .sort((a, b) => (b.views_count ?? 0) - (a.views_count ?? 0))
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.title,
        image: p.images?.[0] ?? null,
        views: p.views_count ?? 0,
        favorites: p.favorites_count ?? 0,
        inquiries: p.inquiries_count ?? 0,
        chats: p.chats_count ?? 0,
      }));

    return NextResponse.json({
      kpis: {
        views7d,
        views30d,
        viewsAll: totals.viewsAll,
        favorites: totals.favorites,
        inquiries: totals.inquiries,
        chats: totals.chats,
        agencyViews30d,
        activeListings: totals.active,
        totalListings: properties.length,
      },
      viewsTimeSeries: buildDailySeries(propertyViewRows, 30),
      agencyViewsTimeSeries: buildDailySeries(agencyViewRows, 30),
      topProperties,
    });
  } catch (error) {
    console.error("Error en GET /api/stats/dashboard:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
