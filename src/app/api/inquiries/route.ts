import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse, NextRequest } from "next/server";

interface InquiryRequestBody {
  propertyId: string;
  message: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
}

interface SupabaseProperty {
  id: string;
  title: string;
  real_estate_id: string;
}

interface SupabaseInquiry {
  id: number | string;
  message: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  status: string;
  created_at: string;
  profile_id: string | null;
  properties: SupabaseProperty | SupabaseProperty[] | null;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    const body: InquiryRequestBody = await req.json();
    const { propertyId, message, senderName, senderEmail, senderPhone } = body;

    if (!propertyId || !message?.trim() || !senderName?.trim() || !senderEmail?.trim() || !senderPhone?.trim()) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: property } = await admin
      .from("properties")
      .select("id, real_estate_id")
      .eq("id", propertyId)
      .single();

    if (!property) return NextResponse.json({ error: "Propiedad no encontrada." }, { status: 404 });

    const { data: inquiry, error } = await admin
      .from("inquiries")
      .insert({
        property_id: property.id,
        message: message.trim(),
        sender_name: senderName.trim(),
        sender_email: senderEmail.trim(),
        sender_phone: senderPhone.trim(),
        status: "UNREAD",
        profile_id: authUser?.id || null,
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, id: inquiry.id }, { status: 201 });
  } catch (err: any) {
    console.error("Error al crear consulta:", err);
    return NextResponse.json({ error: "Error interno del servidor.", detail: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", authUser.id)
      .single();

    if (!profile || (profile.role !== "REALESTATE" && profile.role !== "ADMIN")) {
      return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 0, 1), 100) : null;

    let query = admin
      .from("inquiries")
      .select(`
        id,
        message,
        sender_name,
        sender_email,
        sender_phone,
        status,
        created_at,
        profile_id,
        properties!inner (
          id,
          title,
          real_estate_id
        )
      `)
      .eq("properties.real_estate_id", authUser.id)
      .order("created_at", { ascending: false });

    if (propertyId) query = query.eq("property_id", propertyId);
    if (limit) query = query.limit(limit);

    const { data: inquiries, error } = await query;

    if (error) throw error;

    const mapped = ((inquiries as unknown as SupabaseInquiry[]) || []).map((inq) => {
      const prop = Array.isArray(inq.properties) ? inq.properties[0] : inq.properties;
      return {
        id: inq.id,
        profileId: inq.profile_id,
        message: inq.message,
        senderName: inq.sender_name,
        senderEmail: inq.sender_email,
        senderPhone: inq.sender_phone,
        status: inq.status,
        createdAt: inq.created_at,
        property: {
          id: prop?.id,
          title: prop?.title,
        },
      };
    });

    return NextResponse.json(mapped);
  } catch (err: any) {
    console.error("Error al obtener consultas:", err);
    return NextResponse.json({ error: "Error interno del servidor.", detail: err.message }, { status: 500 });
  }
}