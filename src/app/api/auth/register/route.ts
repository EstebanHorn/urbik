import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateUniqueSlug } from "@/lib/utils";

const ALLOWED_DOMAINS = [
  "gmail.com", "outlook.com", "hotmail.com", "yahoo.com",
  "icloud.com", "protonmail.com", "live.com", "msn.com", "me.com", "aol.com",
];

interface LicensePayload {
  licenseNumber: string;
  province: string;
  jurisdiction?: string;
  responsibleName: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const data = await req.json();
    const email = data.email?.toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const domain = email.split("@")[1];
    if (!ALLOWED_DOMAINS.includes(domain)) {
      return NextResponse.json({ error: "El dominio de correo no está permitido." }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || "Error al crear usuario" }, { status: 400 });
    }

    const userId = authData.user.id;
    const role = data.role as "USER" | "REALESTATE";
    const status = role === "REALESTATE" ? "PENDING" : "APPROVED";

    const { error: profileError } = await admin
      .from("profiles")
      .upsert({ id: userId, email: data.email, role, status });
    if (profileError) console.error("Profile upsert error:", profileError);

    if (role === "USER") {
      await admin.from("user_profiles").insert({
        profile_id: userId,
        first_name: data.name || email.split("@")[0],
        last_name: data.lastName || "",
      });
    } else if (role === "REALESTATE") {
      const agencyName = data.name || "Nueva Inmobiliaria";
      const slug = await generateUniqueSlug(agencyName);

      await admin.from("real_estates").insert({
        profile_id: userId,
        agency_name: agencyName,
        slug: slug,
        license: data.licenses?.[0]?.licenseNumber || `MAT-${userId.substring(0, 5)}`,
        phone: data.phone,
        province: data.licenses?.[0]?.province || "",
        city: data.city || "",
        street: data.street || "",
        address: data.address || "",
      });

      if (data.licenses?.length > 0) {
        const licensesToInsert = data.licenses.map((lic: LicensePayload, idx: number) => ({
          real_estate_id: userId,
          license_number: lic.licenseNumber,
          province: lic.province,
          jurisdiction: lic.jurisdiction || null,
          responsible_name: lic.responsibleName,
          is_primary: idx === 0,
        }));
        await admin.from("real_estate_licenses").insert(licensesToInsert);
      }

      await admin.from("real_estate_offices").insert({
        real_estate_id: userId,
        name: "Casa central",
        province: data.licenses?.[0]?.province || "",
        city: data.city || "",
        street: data.street || "",
        number: data.address || "S/N",
        phone: data.phone || "",
      });
    }

    return NextResponse.json({ success: true, userId }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Error interno al registrar." }, { status: 500 });
  }
}