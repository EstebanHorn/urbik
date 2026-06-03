import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ threadId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { threadId } = await params;
  const admin = createAdminClient();

  const { data: thread } = await admin
    .from("chat_threads")
    .select("id, user_id, real_estate_id")
    .eq("id", threadId)
    .single();

  if (!thread || (thread.user_id !== user.id && thread.real_estate_id !== user.id)) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const { data: messages, error } = await admin
    .from("chat_messages")
    .select("id, thread_id, sender_id, body, created_at, read_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Error al cargar mensajes" }, { status: 500 });
  }

  const unreadIds = (messages ?? [])
    .filter((m) => m.sender_id !== user.id && !m.read_at)
    .map((m) => m.id);

  if (unreadIds.length > 0) {
    await admin
      .from("chat_messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds);
  }

  return NextResponse.json(messages ?? []);
}

export async function POST(req: Request, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { threadId } = await params;
  const { body: msgBody } = await req.json() as { body: string };

  if (!msgBody?.trim()) {
    return NextResponse.json({ error: "El mensaje no puede estar vacío" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: thread } = await admin
    .from("chat_threads")
    .select("id, user_id, real_estate_id")
    .eq("id", threadId)
    .single();

  if (!thread || (thread.user_id !== user.id && thread.real_estate_id !== user.id)) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const { data: msg, error } = await admin
    .from("chat_messages")
    .insert({ thread_id: threadId, sender_id: user.id, body: msgBody.trim() })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 });
  }

  return NextResponse.json(msg);
}
