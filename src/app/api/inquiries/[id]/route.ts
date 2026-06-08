import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse, NextRequest } from "next/server";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "No autenticado." },
        { status: 401 },
      );
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", authUser.id)
      .single();

    if (
      !profile ||
      (profile.role !== "REALESTATE" &&
        profile.role !== "ADMIN")
    ) {
      return NextResponse.json(
        { error: "Acceso denegado." },
        { status: 403 },
      );
    }

    const { id: rawId } = await params;
    const inquiryId = parseInt(rawId);

    if (isNaN(inquiryId)) {
      return NextResponse.json(
        { error: "ID inválido." },
        { status: 400 },
      );
    }

    const { data: inquiry } = await admin
      .from("inquiries")
      .select(`
        id,
        properties (
          real_estate_id
        )
      `)
      .eq("id", inquiryId)
      .single();

    if (!inquiry) {
      return NextResponse.json(
        { error: "Consulta no encontrada." },
        { status: 404 },
      );
    }

    const propertyData = Array.isArray(inquiry.properties)
      ? inquiry.properties[0]
      : inquiry.properties;

    if (
      profile.role !== "ADMIN" &&
      propertyData?.real_estate_id !== authUser.id
    ) {
      return NextResponse.json(
        { error: "Acceso denegado." },
        { status: 403 },
      );
    }

    const { data: updated, error } = await admin
      .from("inquiries")
      .update({ status: "READ" })
      .eq("id", inquiryId)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      id: updated.id,
    });
  } catch (err) {
    const error = err as Error;

    console.error("Error al actualizar consulta:", error);

    return NextResponse.json(
      {
        error: "Error interno del servidor.",
        detail: error.message,
      },
      { status: 500 },
    );
  }
}