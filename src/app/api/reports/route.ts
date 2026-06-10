import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Report,
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from "@/lib/types";

const VALID_TARGETS: ReportTargetType[] = [
  "AGENCY",
  "PROPERTY",
  "REVIEW",
  "PARCEL",
];
const VALID_REASONS: ReportReason[] = [
  "SPAM",
  "FRAUD",
  "OFFENSIVE",
  "INCORRECT_INFO",
  "DUPLICATE",
  "OTHER",
];
const VALID_STATUS: ReportStatus[] = ["PENDING", "RESOLVED", "DISMISSED"];

interface ReportRow {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  reporter_id: string | null;
  reason: ReportReason;
  comment: string | null;
  status: ReportStatus;
  admin_action: "DELETED" | "UNLINKED" | "DISMISSED" | null;
  admin_id: string | null;
  resolved_at: string | null;
  created_at: string;
}

function mapBase(row: ReportRow): Report {
  return {
    id: row.id,
    targetType: row.target_type,
    targetId: row.target_id,
    reason: row.reason,
    comment: row.comment,
    status: row.status,
    adminAction: row.admin_action,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "Necesitas iniciar sesión para reportar." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const targetType = body.targetType as ReportTargetType;
    const targetId = String(body.targetId ?? "").trim();
    const reason = body.reason as ReportReason;
    const comment =
      typeof body.comment === "string" ? body.comment.trim() : "";

    if (!VALID_TARGETS.includes(targetType)) {
      return NextResponse.json(
        { error: "Tipo de reporte inválido." },
        { status: 400 }
      );
    }
    if (!targetId) {
      return NextResponse.json(
        { error: "Falta el objeto a reportar." },
        { status: 400 }
      );
    }
    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: "Motivo inválido." },
        { status: 400 }
      );
    }
    if (comment.length > 1000) {
      return NextResponse.json(
        { error: "El comentario no puede superar 1000 caracteres." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Validar existencia del objeto reportado
    if (targetType === "PROPERTY" || targetType === "PARCEL") {
      const { data: prop } = await admin
        .from("properties")
        .select("id, real_estate_id, parcel_cca")
        .eq("id", targetId)
        .single();
      if (!prop) {
        return NextResponse.json(
          { error: "La propiedad no existe." },
          { status: 404 }
        );
      }
      if (targetType === "PARCEL" && !prop.parcel_cca) {
        return NextResponse.json(
          { error: "Esta propiedad no tiene parcela vinculada." },
          { status: 400 }
        );
      }
      if (prop.real_estate_id === authUser.id) {
        return NextResponse.json(
          { error: "No podés reportar tu propio contenido." },
          { status: 403 }
        );
      }
    } else if (targetType === "AGENCY") {
      const { data: agency } = await admin
        .from("real_estates")
        .select("profile_id")
        .eq("profile_id", targetId)
        .single();
      if (!agency) {
        return NextResponse.json(
          { error: "La inmobiliaria no existe." },
          { status: 404 }
        );
      }
      if (agency.profile_id === authUser.id) {
        return NextResponse.json(
          { error: "No podés reportar tu propia inmobiliaria." },
          { status: 403 }
        );
      }
    } else if (targetType === "REVIEW") {
      const { data: review } = await admin
        .from("real_estate_reviews")
        .select("id, user_id")
        .eq("id", targetId)
        .single();
      if (!review) {
        return NextResponse.json(
          { error: "La reseña no existe." },
          { status: 404 }
        );
      }
      if (review.user_id === authUser.id) {
        return NextResponse.json(
          { error: "No podés reportar tu propia reseña." },
          { status: 403 }
        );
      }
    }

    const { data, error } = await admin
      .from("reports")
      .insert({
        target_type: targetType,
        target_id: targetId,
        reporter_id: authUser.id,
        reason,
        comment: comment || null,
        status: "PENDING",
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ya enviaste un reporte sobre este contenido." },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(mapBase(data as ReportRow), { status: 201 });
  } catch (err) {
    const error = err as Error;
    console.error("Error al crear reporte:", error);
    return NextResponse.json(
      { error: "Error interno del servidor.", detail: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
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

    const url = new URL(req.url);
    const status = (url.searchParams.get("status") ?? "PENDING") as ReportStatus;
    const targetTypeParam = url.searchParams.get("targetType");
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = Math.min(
      100,
      Math.max(1, Number(url.searchParams.get("pageSize") ?? 20))
    );

    if (!VALID_STATUS.includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido." },
        { status: 400 }
      );
    }

    let query = admin
      .from("reports")
      .select("*", { count: "exact" })
      .eq("status", status);

    if (
      targetTypeParam &&
      VALID_TARGETS.includes(targetTypeParam as ReportTargetType)
    ) {
      query = query.eq("target_type", targetTypeParam);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const {
      data: rows,
      error,
      count,
    } = await query.order("created_at", { ascending: false }).range(from, to);

    if (error) throw error;

    const reports = (rows ?? []) as ReportRow[];

    // Enriquecer target + reporter
    const reporterIds = Array.from(
      new Set(reports.map((r) => r.reporter_id).filter(Boolean))
    ) as string[];
    const propertyIds = Array.from(
      new Set(
        reports
          .filter((r) => r.target_type === "PROPERTY" || r.target_type === "PARCEL")
          .map((r) => r.target_id)
      )
    );
    const agencyIds = Array.from(
      new Set(
        reports
          .filter((r) => r.target_type === "AGENCY")
          .map((r) => r.target_id)
      )
    );
    const reviewIds = Array.from(
      new Set(
        reports
          .filter((r) => r.target_type === "REVIEW")
          .map((r) => r.target_id)
      )
    );

    const [
      { data: profiles },
      { data: userProfiles },
      { data: properties },
      { data: agencies },
      { data: reviews },
    ] = await Promise.all([
      reporterIds.length
        ? admin
            .from("profiles")
            .select("id, email")
            .in("id", reporterIds)
        : Promise.resolve({ data: [] as { id: string; email: string }[] }),
      reporterIds.length
        ? admin
            .from("user_profiles")
            .select("profile_id, first_name, last_name")
            .in("profile_id", reporterIds)
        : Promise.resolve({
            data: [] as {
              profile_id: string;
              first_name: string | null;
              last_name: string | null;
            }[],
          }),
      propertyIds.length
        ? admin
            .from("properties")
            .select("id, title, real_estate_id, parcel_cca, parcel_pda")
            .in("id", propertyIds)
        : Promise.resolve({
            data: [] as {
              id: string;
              title: string;
              real_estate_id: string;
              parcel_cca: string | null;
              parcel_pda: string | null;
            }[],
          }),
      agencyIds.length
        ? admin
            .from("real_estates")
            .select("profile_id, agency_name")
            .in("profile_id", agencyIds)
        : Promise.resolve({
            data: [] as { profile_id: string; agency_name: string | null }[],
          }),
      reviewIds.length
        ? admin
            .from("real_estate_reviews")
            .select("id, comment, real_estate_id")
            .in("id", reviewIds)
        : Promise.resolve({
            data: [] as {
              id: string;
              comment: string;
              real_estate_id: string;
            }[],
          }),
    ]);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p])
    );
    const userProfileMap = new Map(
      (userProfiles ?? []).map((u) => [u.profile_id, u])
    );
    const propertyMap = new Map(
      (properties ?? []).map((p) => [p.id, p])
    );
    const agencyMap = new Map(
      (agencies ?? []).map((a) => [a.profile_id, a])
    );
    const reviewMap = new Map((reviews ?? []).map((r) => [r.id, r]));

    const items: Report[] = reports.map((row) => {
      const base = mapBase(row);
      let target: Report["target"];

      if (row.target_type === "PROPERTY") {
        const p = propertyMap.get(row.target_id);
        target = {
          label: p?.title ?? "Propiedad eliminada",
          href: `/property/${row.target_id}`,
          ownerId: p?.real_estate_id ?? null,
        };
      } else if (row.target_type === "PARCEL") {
        const p = propertyMap.get(row.target_id);
        target = {
          label: p
            ? `Parcela en "${p.title}"`
            : "Parcela (propiedad eliminada)",
          href: `/property/${row.target_id}`,
          ownerId: p?.real_estate_id ?? null,
          extra: {
            cca: p?.parcel_cca ?? null,
            pda: p?.parcel_pda ?? null,
          },
        };
      } else if (row.target_type === "AGENCY") {
        const a = agencyMap.get(row.target_id);
        target = {
          label: a?.agency_name ?? "Inmobiliaria eliminada",
          href: `/realestate/${row.target_id}`,
          ownerId: row.target_id,
        };
      } else if (row.target_type === "REVIEW") {
        const r = reviewMap.get(row.target_id);
        const snippet = r?.comment
          ? r.comment.length > 80
            ? r.comment.slice(0, 80) + "…"
            : r.comment
          : "Reseña eliminada";
        target = {
          label: `Reseña: "${snippet}"`,
          href: r?.real_estate_id
            ? `/realestate/${r.real_estate_id}`
            : undefined,
          ownerId: r?.real_estate_id ?? null,
        };
      }

      let reporter: Report["reporter"];
      if (row.reporter_id) {
        const prof = profileMap.get(row.reporter_id);
        const up = userProfileMap.get(row.reporter_id);
        const fullName = [up?.first_name, up?.last_name]
          .filter(Boolean)
          .join(" ")
          .trim();
        reporter = {
          id: row.reporter_id,
          name: fullName || null,
          email: prof?.email ?? null,
        };
      } else {
        reporter = { id: null, name: null, email: null };
      }

      return { ...base, target, reporter };
    });

    const total = count ?? items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({ items, total, page, pageSize, totalPages });
  } catch (err) {
    const error = err as Error;
    console.error("Error al listar reportes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor.", detail: error.message },
      { status: 500 }
    );
  }
}
