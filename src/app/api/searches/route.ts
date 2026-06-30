import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: mySearches, error: myError } = await supabase
    .from("property_searches")
    .select(`
      *,
      clients (
        id,
        name
      )
    `)
    .eq("real_estate_id", session.user.id)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false });

  if (myError) {
    return NextResponse.json({ error: myError.message }, { status: 500 });
  }

  const { data: networkSearches, error: networkError } = await supabase
    .from("property_searches")
    .select(`
      *,
      clients (
        id,
        name
      )
    `)
    .neq("real_estate_id", session.user.id)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false });

  if (networkError) {
    return NextResponse.json({ error: networkError.message }, { status: 500 });
  }

  return NextResponse.json({
    mySearches,
    networkSearches,
  });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    
    const { data, error } = await supabase
      .from("property_searches")
      .insert({
        real_estate_id: session.user.id,
        client_id: body.clientId,
        operation_type: body.operationType,
        property_type: body.propertyType,
        province: body.province || "Buenos Aires",
        city: body.city,
        min_price: body.minPrice ? Number(body.minPrice) : null,
        max_price: body.maxPrice ? Number(body.maxPrice) : null,
        currency: body.currency,
        additional_conditions: body.conditions,
        mandatory_fields: body.mandatoryFields
      })
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}