import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findMatchingProperties } from "@/lib/connections/matching";

const AGENCY_ROLES = ["REALESTATE", "AGENT"];

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
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || !AGENCY_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
    }

    const body = await req.json();
    const searchParams = body.searchParams;
    if (!searchParams) return NextResponse.json([]);

    const matches = await findMatchingProperties(admin, searchParams, {
      ownerId: user.id,
    });

    return NextResponse.json(matches);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
