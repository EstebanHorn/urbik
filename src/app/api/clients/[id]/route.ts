import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const admin = createAdminClient();
    const { data: c, error } = await admin
      .from("clients")
      .select(
        `*, properties ( title, city ), property_searches ( id, status )`
      )
      .eq("id", id)
      .eq("real_estate_id", user.id)
      .single();

    if (error || !c) {
      return NextResponse.json({ error: "Contacto no encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      notes: c.notes,
      role: c.role,
      georaStatus: c.geora_status,
      linkedUserId: c.linked_user_id,
      searchParams: c.search_params,
      linkedPropertyId: c.linked_property_id,
      linkedPropertyTitle: c.properties?.title || "",
      linkedPropertyCity: c.properties?.city || "",
      hasActiveSearch:
        c.property_searches?.some((s: { status: string }) => s.status === "ACTIVE") || false,
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("clients")
      .select("id, real_estate_id, email, linked_user_id, geora_status")
      .eq("id", id)
      .single();

    if (!existing || existing.real_estate_id !== user.id) {
      return NextResponse.json(
        { error: "Contacto no encontrado." },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (body.name !== undefined) updates.name = body.name;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.role !== undefined) updates.role = body.role;
    if (body.searchParams !== undefined) updates.search_params = body.searchParams;
    if (body.linkedPropertyId !== undefined)
      updates.linked_property_id = body.linkedPropertyId || null;

    if (body.email !== undefined) {
      const newEmail = body.email?.trim().toLowerCase() || null;
      updates.email = newEmail;
      if (newEmail && newEmail !== existing.email) {
        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("email", newEmail)
          .maybeSingle();
        if (profile) {
          updates.geora_status = "PENDING";
          updates.linked_user_id = profile.id;
        } else {
          updates.geora_status = "NONE";
          updates.linked_user_id = null;
        }
      }
    }

    const { data, error } = await admin
      .from("clients")
      .update(updates)
      .eq("id", id)
      .eq("real_estate_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    const error = err as Error;
    console.error("Error en PUT /api/clients/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const admin = createAdminClient();
    const { error } = await admin
      .from("clients")
      .delete()
      .eq("id", id)
      .eq("real_estate_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
