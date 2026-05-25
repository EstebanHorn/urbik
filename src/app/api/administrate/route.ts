import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface ProfileWithRealEstate {
  id: string;
  email: string;
  real_estates: {
    agency_name: string | null;
    license: string | null;
  }[] | null;
}

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      real_estates (
        agency_name,
        license
      )
    `)
    .eq("role", "REALESTATE")
    .eq("status", "PENDING");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pendingRealEstates = data?.map((user: ProfileWithRealEstate) => ({
    id: user.id,
    email: user.email,
    realEstate: {
      agencyName: user.real_estates?.[0]?.agency_name || "Sin nombre",
      license: user.real_estates?.[0]?.license || "Sin matrícula",
    },
  })) || [];

  return NextResponse.json(pendingRealEstates);
}

export async function PATCH(req: Request) {
  const admin = createAdminClient();
  const { userId, action } = await req.json();

  if (action === "APPROVE") {
    await admin
      .from("profiles")
      .update({ status: "APPROVED", role: "REALESTATE" })
      .eq("id", userId);
  } else if (action === "DELETE") {
    await admin
      .from("profiles")
      .delete()
      .eq("id", userId);
  }

  return NextResponse.json({ success: true });
}