import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: "No se pudo parsear el formulario" }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop() ?? "jpg";
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const folder = (formData.get("folder") as string | null) || "images";
    const filePath = `${folder}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const admin = createAdminClient();
    const { error } = await admin.storage
      .from("imagenes")
      .upload(filePath, buffer, { contentType: file.type || "image/jpeg" });

    if (error) {
      console.error("Supabase Storage error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = admin.storage.from("imagenes").getPublicUrl(filePath);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    console.error("Upload route unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error inesperado" },
      { status: 500 }
    );
  }
}
