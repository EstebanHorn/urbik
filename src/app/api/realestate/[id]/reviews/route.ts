import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse, NextRequest } from "next/server";

interface ReviewRow {
  id: string;
  rating: number;
  comment: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface UserProfileRow {
  profile_id: string;
  first_name: string | null;
  last_name: string | null;
}

interface RealEstateRow {
  profile_id: string;
  agency_name: string | null;
}

function buildDisplayName(
  profile?: UserProfileRow | null,
  agency?: RealEstateRow | null
): string {
  const fn = profile?.first_name?.trim() ?? "";
  const ln = profile?.last_name?.trim() ?? "";
  const userName = `${fn} ${ln}`.trim();
  if (userName) return userName;
  if (agency?.agency_name) return agency.agency_name;
  return "Usuario";
}

function mapReview(
  row: ReviewRow,
  profile?: UserProfileRow | null,
  agency?: RealEstateRow | null
) {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    user: {
      id: row.user_id,
      name: buildDisplayName(profile, agency),
    },
  };
}

function validatePayload(body: { rating?: unknown; comment?: unknown }) {
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "El puntaje debe ser un entero entre 1 y 5." } as const;
  }
  if (typeof body.comment !== "string") {
    return { error: "El comentario es requerido." } as const;
  }
  const comment = body.comment.trim();
  if (comment.length < 5 || comment.length > 1000) {
    return {
      error: "El comentario debe tener entre 5 y 1000 caracteres.",
    } as const;
  }
  return { rating, comment } as const;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: realEstateId } = await params;
    const supabase = await createClient();
    const admin = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: rows, error } = await supabase
      .from("real_estate_reviews")
      .select("id, rating, comment, user_id, created_at, updated_at")
      .eq("real_estate_id", realEstateId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const reviewRows = (rows ?? []) as ReviewRow[];
    const userIds = Array.from(new Set(reviewRows.map((r) => r.user_id)));

    const profilesMap = new Map<string, UserProfileRow>();
    const agenciesMap = new Map<string, RealEstateRow>();

    if (userIds.length > 0) {
      const [{ data: ups }, { data: ags }] = await Promise.all([
        admin
          .from("user_profiles")
          .select("profile_id, first_name, last_name")
          .in("profile_id", userIds),
        admin
          .from("real_estates")
          .select("profile_id, agency_name")
          .in("profile_id", userIds),
      ]);
      for (const u of (ups ?? []) as UserProfileRow[]) {
        profilesMap.set(u.profile_id, u);
      }
      for (const a of (ags ?? []) as RealEstateRow[]) {
        agenciesMap.set(a.profile_id, a);
      }
    }

    const reviews = reviewRows.map((r) =>
      mapReview(r, profilesMap.get(r.user_id), agenciesMap.get(r.user_id))
    );

    const total = reviews.length;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    for (const r of reviewRows) {
      sum += r.rating;
      const key = r.rating as 1 | 2 | 3 | 4 | 5;
      distribution[key]++;
    }
    const average =
      total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

    const myReview = user
      ? reviews.find((r) => r.user.id === user.id) ?? null
      : null;

    return NextResponse.json({
      summary: { average, total, distribution },
      reviews,
      myReview,
    });
  } catch (err) {
    const error = err as Error;
    console.error("Error al obtener reseñas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor.", detail: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: realEstateId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "No autenticado." },
        { status: 401 }
      );
    }
    if (user.id === realEstateId) {
      return NextResponse.json(
        { error: "No podés calificar tu propia inmobiliaria." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = validatePayload(body);
    if ("error" in validated) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("real_estate_reviews")
      .insert({
        real_estate_id: realEstateId,
        user_id: user.id,
        rating: validated.rating,
        comment: validated.comment,
      })
      .select("id, rating, comment, user_id, created_at, updated_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ya dejaste una reseña. Editala o eliminala." },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(mapReview(data as ReviewRow), {
      status: 201,
    });
  } catch (err) {
    const error = err as Error;
    console.error("Error al crear reseña:", error);
    return NextResponse.json(
      { error: "Error interno del servidor.", detail: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: realEstateId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "No autenticado." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = validatePayload(body);
    if ("error" in validated) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("real_estate_reviews")
      .update({
        rating: validated.rating,
        comment: validated.comment,
      })
      .eq("real_estate_id", realEstateId)
      .eq("user_id", user.id)
      .select("id, rating, comment, user_id, created_at, updated_at")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Reseña no encontrada." },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(mapReview(data as ReviewRow));
  } catch (err) {
    const error = err as Error;
    console.error("Error al actualizar reseña:", error);
    return NextResponse.json(
      { error: "Error interno del servidor.", detail: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: realEstateId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "No autenticado." },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const reviewId = url.searchParams.get("reviewId");

    if (reviewId) {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Acceso denegado." },
          { status: 403 }
        );
      }
      const { error } = await admin
        .from("real_estate_reviews")
        .delete()
        .eq("id", reviewId)
        .eq("real_estate_id", realEstateId);
      if (error) throw error;
      return new NextResponse(null, { status: 204 });
    }

    const { error } = await supabase
      .from("real_estate_reviews")
      .delete()
      .eq("real_estate_id", realEstateId)
      .eq("user_id", user.id);
    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const error = err as Error;
    console.error("Error al eliminar reseña:", error);
    return NextResponse.json(
      { error: "Error interno del servidor.", detail: error.message },
      { status: 500 }
    );
  }
}
