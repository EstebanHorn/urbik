import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse, NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { id: rawId } = await params;
    const inquiryId = parseInt(rawId);
    const body = await req.json();
    const replyMessage = body.replyMessage;

    if (isNaN(inquiryId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    if (!replyMessage?.trim()) return NextResponse.json({ error: "El mensaje no puede estar vacío." }, { status: 400 });

    const admin = createAdminClient();

    const { data: inquiry } = await admin
      .from("inquiries")
      .select(`id, message, profile_id, properties ( id, title, real_estate_id )`)
      .eq("id", inquiryId)
      .single();

    if (!inquiry) return NextResponse.json({ error: "Consulta no encontrada." }, { status: 404 });

    const prop = Array.isArray(inquiry.properties) ? inquiry.properties[0] : inquiry.properties;
    if (prop?.real_estate_id !== authUser.id) return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });

    if (!inquiry.profile_id) {
      return NextResponse.json({ error: "El usuario no está registrado. Respondé vía Email o Teléfono." }, { status: 400 });
    }

    let threadId;
    const { data: existingThread } = await admin
      .from("chat_threads")
      .select("id")
      .eq("user_id", inquiry.profile_id)
      .eq("real_estate_id", authUser.id)
      .eq("property_id", prop.id)
      .maybeSingle();

    if (existingThread) {
      threadId = existingThread.id;
    } else {
      const { data: newThread, error: threadErr } = await admin
        .from("chat_threads")
        .insert({
          user_id: inquiry.profile_id,
          real_estate_id: authUser.id,
          property_id: prop.id
        })
        .select("id")
        .single();

      if (threadErr) throw threadErr;
      threadId = newThread.id;

      await admin.from("chat_messages").insert({
        thread_id: threadId,
        sender_id: inquiry.profile_id,
        body: `[Consulta vía web]\n\n"${inquiry.message}"`
      });
    }

    await admin.from("chat_messages").insert({
      thread_id: threadId,
      sender_id: authUser.id,
      body: replyMessage.trim()
    });

    await admin.from("inquiries").update({ status: "READ" }).eq("id", inquiryId);
    await admin.from("chat_threads").update({ last_message_at: new Date().toISOString() }).eq("id", threadId);

    return NextResponse.json({ success: true, threadId });
  } catch (err: any) {
    console.error("Error convirtiendo consulta a chat:", err);
    return NextResponse.json({ error: "Error interno del servidor.", detail: err.message }, { status: 500 });
  }
}