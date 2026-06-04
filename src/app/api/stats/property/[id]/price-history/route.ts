import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    const { data: property } = await admin
      .from("properties")
      .select("id, real_estate_id")
      .eq("id", id)
      .single();

    if (!property) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("role, user_id")
      .eq("id", authUser.id)
      .single();

    const isOwner =
      property.real_estate_id === authUser.id ||
      (profile?.user_id != null && property.real_estate_id === profile.user_id);
    const isAdmin = profile?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Prohibido" }, { status: 403 });
    }

    const { data, error } = await admin
      .from("property_price_history")
      .select("id, sale_price, sale_currency, rent_price, rent_currency, changed_at")
      .eq("property_id", id)
      .order("changed_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ history: data ?? [] });
  } catch (error) {
    console.error("Error en GET price-history:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
