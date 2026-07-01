import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Notification,
  NotificationType,
  NotificationRelatedType,
} from "@/lib/types";

interface NotificationRow {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  related_type: NotificationRelatedType | null;
  related_id: string | null;
  status: "UNREAD" | "READ";
  created_at: string;
}

function mapNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    relatedType: row.related_type,
    relatedId: row.related_id,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "No autenticado." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("notifications")
      .select("*")
      .eq("recipient_id", authUser.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const mapped = ((data ?? []) as NotificationRow[]).map(mapNotification);
    return NextResponse.json(mapped);
  } catch (err) {
    const error = err as Error;
    console.error("Error al obtener notificaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor.", detail: error.message },
      { status: 500 }
    );
  }
}
