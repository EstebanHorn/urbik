import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { propertyId, realEstateId, firstMessage } = body as {
    propertyId?: number | null;
    realEstateId: string;
    firstMessage?: string;
  };

  if (!realEstateId) {
    return NextResponse.json({ error: "realEstateId es requerido" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (propertyId) {
    const { data: prop } = await admin
      .from("properties")
      .select("real_estate_id")
      .eq("id", propertyId)
      .single();

    if (!prop || prop.real_estate_id !== realEstateId) {
      return NextResponse.json({ error: "Propiedad no encontrada o inmobiliaria incorrecta" }, { status: 404 });
    }
  }

  let thread: { id: string } | null = null;
  let threadError = null;

  if (propertyId) {
    const res = await admin
      .from("chat_threads")
      .upsert(
        { user_id: user.id, real_estate_id: realEstateId, property_id: propertyId },
        { onConflict: "user_id,real_estate_id,property_id", ignoreDuplicates: false }
      )
      .select("id")
      .single();
    thread = res.data;
    threadError = res.error;
  } else {
    const { data: existing } = await admin
      .from("chat_threads")
      .select("id")
      .eq("user_id", user.id)
      .eq("real_estate_id", realEstateId)
      .is("property_id", null)
      .single();

    if (existing) {
      thread = existing;
    } else {
      const res = await admin
        .from("chat_threads")
        .insert({ user_id: user.id, real_estate_id: realEstateId, property_id: null })
        .select("id")
        .single();
      thread = res.data;
      threadError = res.error;
    }
  }

  if (threadError || !thread) {
    console.error("Error creating thread:", threadError);
    return NextResponse.json({ error: "Error al crear conversación" }, { status: 500 });
  }

  if (firstMessage?.trim()) {
    await admin.from("chat_messages").insert({
      thread_id: thread.id,
      sender_id: user.id,
      body: firstMessage.trim(),
    });
  }

  return NextResponse.json({ threadId: thread.id });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "USER";
  const isAgency = role === "REALESTATE" || role === "ADMIN";

  const { data: rawThreads } = await admin
    .from("chat_threads")
    .select("id, created_at, last_message_at, property_id, user_id, real_estate_id")
    .eq(isAgency ? "real_estate_id" : "user_id", user.id)
    .order("last_message_at", { ascending: false });

  if (!rawThreads?.length) return NextResponse.json([]);

  const enriched = await Promise.all(
    rawThreads.map(async (t) => {
      const otherId = isAgency ? t.user_id : t.real_estate_id;

      const [{ data: prop }, otherPartyResult, unreadResult] = await Promise.all([
        admin.from("properties").select("id, title, images").eq("id", t.property_id).single(),
        isAgency
          ? admin.from("user_profiles").select("first_name, last_name").eq("profile_id", otherId).single()
          : admin.from("real_estates").select("agency_name").eq("profile_id", otherId).single(),
        admin
          .from("chat_messages")
          .select("id", { count: "exact", head: true })
          .eq("thread_id", t.id)
          .is("read_at", null)
          .neq("sender_id", user.id),
      ]);

      const otherParty = isAgency
        ? (() => {
            const up = (otherPartyResult.data as { first_name?: string; last_name?: string } | null);
            return up ? `${up.first_name ?? ""} ${up.last_name ?? ""}`.trim() || "Usuario" : "Usuario";
          })()
        : ((otherPartyResult.data as { agency_name?: string } | null)?.agency_name ?? "Inmobiliaria");

      return {
        id: t.id,
        createdAt: t.created_at,
        lastMessageAt: t.last_message_at,
        property: prop ? { id: prop.id, title: prop.title, image: prop.images?.[0] ?? null } : null,
        otherParty,
        unreadCount: (unreadResult as unknown as { count: number } | null)?.count ?? 0,
      };
    })
  );

  return NextResponse.json(enriched);
}
