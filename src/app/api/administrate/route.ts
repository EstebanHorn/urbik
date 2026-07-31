import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAgencyApprovedEmail, sendAgencyRejectedEmail } from "@/lib/mail";

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
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
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

  const { data: profile } = await admin
    .from("profiles")
    .select("email, real_estates ( agency_name )")
    .eq("id", userId)
    .single();

  const agencyEmail = profile?.email;
  const agencyName =
    (profile as { real_estates?: { agency_name: string | null }[] } | null)
      ?.real_estates?.[0]?.agency_name || "tu inmobiliaria";

  if (action === "APPROVE") {
    await admin
      .from("profiles")
      .update({ status: "APPROVED", role: "REALESTATE" })
      .eq("id", userId);

    if (agencyEmail) await sendAgencyApprovedEmail(agencyEmail, agencyName);
  } else if (action === "DELETE") {
    await admin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (agencyEmail) await sendAgencyRejectedEmail(agencyEmail, agencyName);
  }

  return NextResponse.json({ success: true });
}