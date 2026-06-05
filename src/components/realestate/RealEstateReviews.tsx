"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, MessageSquare } from "lucide-react";

import StarRating from "@/components/ui/StarRating";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  reviewService,
  type Review,
  type ReviewSummary,
} from "@/services/reviews";

interface RealEstateReviewsProps {
  realEstateId: string;
  currentUserId: string | null;
  isOwner: boolean;
}

const EMPTY_SUMMARY: ReviewSummary = {
  average: 0,
  total: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

const COMMENT_MIN = 5;
const COMMENT_MAX = 1000;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default function RealEstateReviews({
  realEstateId,
  currentUserId,
  isOwner,
}: RealEstateReviewsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>(EMPTY_SUMMARY);
  const [myReview, setMyReview] = useState<Review | null>(null);

  const [editing, setEditing] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await reviewService.getReviews(realEstateId);
      setReviews(data.reviews);
      setSummary(data.summary);
      setMyReview(data.myReview);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [realEstateId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (editing && myReview) {
      setFormRating(myReview.rating);
      setFormComment(myReview.comment);
    }
  }, [editing, myReview]);

  const otherReviews = useMemo(
    () =>
      currentUserId
        ? reviews.filter((r) => r.user.id !== currentUserId)
        : reviews,
    [reviews, currentUserId]
  );

  const showForm = !isOwner && currentUserId && (!myReview || editing);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (formRating < 1 || formRating > 5) {
      alert("Elegí un puntaje de 1 a 5 estrellas.");
      return;
    }
    const trimmed = formComment.trim();
    if (trimmed.length < COMMENT_MIN || trimmed.length > COMMENT_MAX) {
      alert(
        `El comentario debe tener entre ${COMMENT_MIN} y ${COMMENT_MAX} caracteres.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const action = myReview
        ? reviewService.updateReview
        : reviewService.createReview;
      await action(realEstateId, { rating: formRating, comment: trimmed });
      await load();
      setEditing(false);
      setFormRating(0);
      setFormComment("");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myReview) return;
    if (!confirm("¿Eliminar tu reseña? Esta acción no se puede deshacer."))
      return;
    setSubmitting(true);
    try {
      await reviewService.deleteReview(realEstateId);
      await load();
      setEditing(false);
      setFormRating(0);
      setFormComment("");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setFormRating(0);
    setFormComment("");
  };

  if (loading) {
    return (
      <section className="py-12">
        <LoadingSpinner />
      </section>
    );
  }

  return (
    <section className="pb-12">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="text-2xl font-black text-urbik-black/90 uppercase tracking-tight">
          Reseñas
        </h2>
        {summary.total > 0 && (
          <span className="text-sm font-bold text-urbik-muted">
            {summary.total}{" "}
            {summary.total === 1 ? "reseña" : "reseñas"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard summary={summary} />
        <div className="md:col-span-2">
          {error && (
            <div className="mb-4 rounded-xl border border-urbik-rose/30 bg-urbik-rose/10 px-4 py-3 text-sm font-medium text-urbik-rose">
              {error}
            </div>
          )}

          {isOwner ? (
            <div className=" p-6 text-sm text-urbik-muted font-medium">
              Esta es la página pública de tu inmobiliaria. Las reseñas que
              dejen los usuarios aparecerán acá.
            </div>
          ) : !currentUserId ? (
            <div className=" p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-bold text-urbik-black">
                  ¿Querés dejar tu opinión?
                </p>
                <p className="text-sm text-urbik-muted font-medium">
                  Iniciá sesión para calificar a esta inmobiliaria.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="shrink-0 rounded-full bg-urbik-black hover:bg-urbik-dark2 transition-colors px-5 py-2.5 text-sm font-bold text-white text-center"
              >
                Iniciar sesión
              </Link>
            </div>
          ) : myReview && !editing ? (
            <MyReviewCard
              review={myReview}
              onEdit={() => setEditing(true)}
              onDelete={handleDelete}
              busy={submitting}
            />
          ) : showForm ? (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl shadow-sm bg-white p-6"
            >
              <h3 className="font-bold text-urbik-black mb-3">
                {myReview ? "Editar tu reseña" : "Dejá tu reseña"}
              </h3>

              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-wide text-urbik-muted mb-2">
                  Puntuación
                </label>
                <StarRating
                  value={formRating}
                  onChange={setFormRating}
                  size={28}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="review-comment"
                  className="block text-xs font-bold uppercase tracking-wide text-urbik-muted mb-2"
                >
                  Comentario
                </label>
                <textarea
                  id="review-comment"
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  maxLength={COMMENT_MAX}
                  rows={4}
                  placeholder="Contá cómo fue tu experiencia con esta inmobiliaria…"
                  className="w-full rounded-xl border border-urbik-g200 bg-white px-4 py-3 text-sm font-medium text-urbik-black focus:border-urbik-cyan focus:outline-none resize-none"
                />
                <div className="mt-1 text-right text-xs text-urbik-muted">
                  {formComment.length}/{COMMENT_MAX}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                {myReview && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={submitting}
                    className="rounded-full px-5 py-2.5 text-sm font-bold text-urbik-black border border-urbik-g200 hover:bg-urbik-g100 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-urbik-black hover:bg-urbik-dark2 transition-colors px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {submitting
                    ? "Enviando…"
                    : myReview
                    ? "Guardar cambios"
                    : "Publicar reseña"}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>

      <ReviewsList
        currentUserReview={myReview}
        currentUserId={currentUserId}
        otherReviews={otherReviews}
      />
    </section>
  );
}

function SummaryCard({ summary }: { summary: ReviewSummary }) {
  const maxBar = Math.max(1, ...Object.values(summary.distribution));
  return (
    <div className=" p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl font-black text-urbik-black leading-none">
          {summary.total > 0 ? summary.average.toFixed(1) : "—"}
        </div>
        <div>
          <StarRating value={Math.round(summary.average)} readonly size={18} />
          <p className="text-xs text-urbik-muted font-medium mt-1">
            {summary.total === 0
              ? "Sin reseñas todavía"
              : `${summary.total} ${
                  summary.total === 1 ? "reseña" : "reseñas"
                }`}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const n =
            summary.distribution[star as 1 | 2 | 3 | 4 | 5] ?? 0;
          const pct = (n / maxBar) * 100;
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-3 font-bold text-urbik-muted">{star}</span>
              <div className="flex-1 h-2 rounded-full bg-urbik-g100 overflow-hidden">
                <div
                  className="h-full bg-amber-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-6 text-right text-urbik-muted font-medium">
                {n}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MyReviewCard({
  review,
  onEdit,
  onDelete,
  busy,
}: {
  review: Review;
  onEdit: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  return (
    <div className=" p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-urbik-muted mb-2">
            Tu reseña
          </p>
          <StarRating value={review.rating} readonly size={18} />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            disabled={busy}
            className="rounded-full p-2 border border-urbik-g200 hover:bg-urbik-g100 transition-colors disabled:opacity-50"
            aria-label="Editar"
          >
            <Pencil size={14} className="text-urbik-black" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="rounded-full p-2 border border-urbik-g200 hover:bg-urbik-rose/10 hover:border-urbik-rose/30 transition-colors disabled:opacity-50"
            aria-label="Eliminar"
          >
            <Trash2 size={14} className="text-urbik-rose" />
          </button>
        </div>
      </div>
      <p className="text-sm text-urbik-black font-medium whitespace-pre-wrap">
        {review.comment}
      </p>
      <p className="text-xs text-urbik-muted font-medium mt-3">
        {formatDate(review.createdAt)}
        {review.updatedAt !== review.createdAt && " · editada"}
      </p>
    </div>
  );
}

function ReviewsList({
  currentUserReview,
  currentUserId,
  otherReviews,
}: {
  currentUserReview: Review | null;
  currentUserId: string | null;
  otherReviews: Review[];
}) {
  const hasMine = !!currentUserReview && !!currentUserId;

  if (otherReviews.length === 0) {
    return (
      <div className="py-12 text-center border-2 border-dashed border-urbik-g200 rounded-2xl">
        <MessageSquare
          size={28}
          className="mx-auto mb-3 text-urbik-g400"
        />
        <p className="text-urbik-muted font-bold text-sm">
          {hasMine
            ? "Aún no hay otras reseñas."
            : "Sé el primero en dejar una reseña."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {otherReviews.map((r) => (
        <ReviewCard key={r.id} review={r} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className=" p-5">
      <header className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-urbik-black text-white font-black text-sm flex items-center justify-center shrink-0">
          {getInitials(review.user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-urbik-black text-sm truncate">
            {review.user.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRating value={review.rating} readonly size={14} />
            <span className="text-xs text-urbik-muted font-medium">
              {formatDate(review.createdAt)}
              {review.updatedAt !== review.createdAt && " · editada"}
            </span>
          </div>
        </div>
      </header>
      <p className="text-sm text-urbik-black font-medium whitespace-pre-wrap">
        {review.comment}
      </p>
    </article>
  );
}
