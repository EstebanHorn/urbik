import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  REPORT_REASON_LABELS,
  type ReportAction,
  type ReportReason,
  type ReportTargetType,
} from "@/lib/types";

interface ReportRow {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  reporter_id: string | null;
  reason: ReportReason;
  comment: string | null;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  admin_action: "DELETED" | "UNLINKED" | "DISMISSED" | null;
  admin_id: string | null;
  resolved_at: string | null;
  created_at: string;
}

const VALID_ACTIONS: ReportAction[] = ["DELETE", "UNLINK", "DISMISS"];

function buildNotification(
  targetType: ReportTargetType,
  action: ReportAction,
  reason: ReportReason,
  extra: { propertyTitle?: string | null } = {}
): { title: string; body: string } | null {
  if (action === "DISMISS") return null;

  const reasonLabel = REPORT_REASON_LABELS[reason] ?? reason;

  if (action === "DELETE") {
    if (targetType === "PROPERTY") {
      return {
        title: "Una propiedad tuya fue eliminada",
        body: `Un administrador eliminó la propiedad${
          extra.propertyTitle ? ` "${extra.propertyTitle}"` : ""
        } tras un reporte. Motivo: ${reasonLabel}.`,
      };
    }
    if (targetType === "AGENCY") {
      return {
        title: "Tu inmobiliaria fue eliminada",
        body: `Un administrador eliminó tu inmobiliaria tras un reporte. Motivo: ${reasonLabel}.`,
      };
    }
    if (targetType === "REVIEW") {
      return {
        title: "Una reseña sobre tu inmobiliaria fue eliminada",
        body: `Un administrador eliminó una reseña tras un reporte. Motivo: ${reasonLabel}.`,
      };
    }
  }

  if (action === "UNLINK" && targetType === "PARCEL") {
    return {
      title: "Se desvinculó una parcela de tu propiedad",
      body: `Un administrador desvinculó la parcela de la propiedad${
        extra.propertyTitle ? ` "${extra.propertyTitle}"` : ""
      } tras un reporte. Motivo: ${reasonLabel}.`,
    };
  }

  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
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
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", authUser.id)
      .single();

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acceso denegado." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const action = body.action as ReportAction;

    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: "Acción inválida." },
        { status: 400 }
      );
    }

    const { data: report } = await admin
      .from("reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (!report) {
      return NextResponse.json(
        { error: "Reporte no encontrado." },
        { status: 404 }
      );
    }

    const r = report as ReportRow;

    if (r.status !== "PENDING") {
      return NextResponse.json(
        { error: "Este reporte ya fue resuelto." },
        { status: 409 }
      );
    }

    // Validar combinación targetType / action
    if (r.target_type === "PARCEL" && action !== "UNLINK" && action !== "DISMISS") {
      return NextResponse.json(
        { error: "Sobre una parcela solo se puede desvincular o desestimar." },
        { status: 400 }
      );
    }
    if (r.target_type !== "PARCEL" && action === "UNLINK") {
      return NextResponse.json(
        { error: "UNLINK solo aplica a parcelas." },
        { status: 400 }
      );
    }

    // Ejecutar la acción + identificar a quién notificar
    let recipientId: string | null = null;
    let propertyTitle: string | null = null;
    let adminActionTaken: "DELETED" | "UNLINKED" | "DISMISSED" = "DISMISSED";

    if (action === "DISMISS") {
      adminActionTaken = "DISMISSED";
    } else if (action === "DELETE") {
      if (r.target_type === "PROPERTY") {
        const { data: prop } = await admin
          .from("properties")
          .select("id, title, real_estate_id")
          .eq("id", r.target_id)
          .single();
        if (prop) {
          recipientId = prop.real_estate_id;
          propertyTitle = prop.title;
          const { error: delErr } = await admin
            .from("properties")
            .delete()
            .eq("id", r.target_id);
          if (delErr) throw delErr;
        }
        adminActionTaken = "DELETED";
      } else if (r.target_type === "AGENCY") {
        // El owner de una agency es su propio profile_id en este modelo
        recipientId = r.target_id;
        const { error: delErr } = await admin
          .from("profiles")
          .delete()
          .eq("id", r.target_id);
        if (delErr) throw delErr;
        adminActionTaken = "DELETED";
      } else if (r.target_type === "REVIEW") {
        const { data: rev } = await admin
          .from("real_estate_reviews")
          .select("id, real_estate_id")
          .eq("id", r.target_id)
          .single();
        if (rev) {
          recipientId = rev.real_estate_id;
          const { error: delErr } = await admin
            .from("real_estate_reviews")
            .delete()
            .eq("id", r.target_id);
          if (delErr) throw delErr;
        }
        adminActionTaken = "DELETED";
      }
    } else if (action === "UNLINK") {
      // r.target_type === "PARCEL", target_id = property.id
      const { data: prop } = await admin
        .from("properties")
        .select("id, title, real_estate_id")
        .eq("id", r.target_id)
        .single();
      if (prop) {
        recipientId = prop.real_estate_id;
        propertyTitle = prop.title;
        const { error: updErr } = await admin
          .from("properties")
          .update({
            parcel_cca: null,
            parcel_pda: null,
            parcel_geom: null,
          })
          .eq("id", r.target_id);
        if (updErr) throw updErr;
      }
      adminActionTaken = "UNLINKED";
    }

    const resolvedAt = new Date().toISOString();

    // Marcar este reporte como resuelto
    const { data: updated, error: updErr } = await admin
      .from("reports")
      .update({
        status: action === "DISMISS" ? "DISMISSED" : "RESOLVED",
        admin_action: adminActionTaken,
        admin_id: authUser.id,
        resolved_at: resolvedAt,
      })
      .eq("id", reportId)
      .select("*")
      .single();
    if (updErr) throw updErr;

    // Cerrar otros reportes pendientes sobre el mismo objeto
    if (action !== "DISMISS") {
      await admin
        .from("reports")
        .update({
          status: "RESOLVED",
          admin_action: adminActionTaken,
          admin_id: authUser.id,
          resolved_at: resolvedAt,
        })
        .eq("target_type", r.target_type)
        .eq("target_id", r.target_id)
        .eq("status", "PENDING")
        .neq("id", reportId);
    }

    // Crear notificación al afectado (si aplica)
    if (recipientId) {
      const notif = buildNotification(r.target_type, action, r.reason, {
        propertyTitle,
      });
      if (notif) {
        await admin.from("notifications").insert({
          recipient_id: recipientId,
          type: "REPORT_ACTION",
          title: notif.title,
          body: notif.body,
          related_type: r.target_type,
          related_id: r.target_id,
          status: "UNREAD",
        });
      }
    }

    return NextResponse.json({ success: true, report: updated });
  } catch (err) {
    const error = err as Error;
    console.error("Error al resolver reporte:", error);
    return NextResponse.json(
      { error: "Error interno del servidor.", detail: error.message },
      { status: 500 }
    );
  }
}
