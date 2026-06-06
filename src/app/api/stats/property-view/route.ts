import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT_RE = /bot|crawl|spider|preview|facebookexternalhit|slurp|bingpreview/i;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const propertyId = body?.propertyId;
    const sessionId = body?.sessionId;

    if (typeof propertyId !== "string" || !UUID_RE.test(propertyId)) {
      return NextResponse.json({ error: "propertyId inválido" }, { status: 400 });
    }
    if (typeof sessionId !== "string" || sessionId.length < 8 || sessionId.length > 64) {
      return NextResponse.json({ error: "sessionId inválido" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") ?? "";
    if (BOT_RE.test(userAgent)) {
      return new NextResponse(null, { status: 204 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const admin = createAdminClient();

    const { data: property } = await admin
      .from("properties")
      .select("id, real_estate_id")
      .eq("id", propertyId)
      .single();

    if (!property) {
      return NextResponse.json({ error: "Propiedad inexistente" }, { status: 404 });
    }

    if (user && property.real_estate_id === user.id) {
      return new NextResponse(null, { status: 204 });
    }

    const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: existing } = await admin
      .from("property_views")
      .select("id")
      .eq("property_id", propertyId)
      .eq("session_id", sessionId)
      .gte("created_at", since)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return new NextResponse(null, { status: 204 });
    }

    const { error } = await admin.from("property_views").insert({
      property_id: propertyId,
      session_id: sessionId,
      viewer_user_id: user?.id ?? null,
      referer: req.headers.get("referer"),
      user_agent: userAgent || null,
    });

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error en POST property-view:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
