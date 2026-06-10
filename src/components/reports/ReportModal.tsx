"use client";

import { useState } from "react";
import { Loader2, X, Check, ShieldAlert } from "lucide-react";
import {
  REPORT_REASON_LABELS,
  type ReportReason,
  type ReportTargetType,
} from "@/lib/types";

interface ReportModalProps {
  targetType: ReportTargetType;
  targetId: string;
  contextLabel?: string;
  onClose: () => void;
}

const REASON_OPTIONS: ReportReason[] = [
  "SPAM",
  "FRAUD",
  "OFFENSIVE",
  "INCORRECT_INFO",
  "DUPLICATE",
  "OTHER",
];

const TARGET_LABELS: Record<ReportTargetType, string> = {
  AGENCY: "inmobiliaria",
  PROPERTY: "propiedad",
  REVIEW: "reseña",
  PARCEL: "parcela",
};

export default function ReportModal({
  targetType,
  targetId,
  contextLabel,
  onClose,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>("SPAM");
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const targetLabel = TARGET_LABELS[targetType];

  const submit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "No se pudo enviar el reporte.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
      setTimeout(onClose, 1600);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 border-b border-urbik-black/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-urbik-rose/10 text-urbik-rose rounded-full">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-urbik-black">
                Reportar {targetLabel}
              </h2>
              {contextLabel && (
                <p className="text-xs text-urbik-black/60 line-clamp-1">
                  {contextLabel}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-1 rounded-full text-urbik-black/60 hover:bg-urbik-black/5"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="p-8 flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-urbik-emerald/10 text-urbik-emerald rounded-full">
              <Check size={28} />
            </div>
            <p className="font-bold text-urbik-black">Reporte enviado</p>
            <p className="text-sm text-urbik-black/60">
              Lo revisaremos y tomaremos acción si corresponde. Gracias.
            </p>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-urbik-black/60">
                Motivo
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-2xl border border-urbik-black/15 bg-white text-sm font-medium text-urbik-black focus:outline-none focus:border-urbik-cyan"
              >
                {REASON_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {REPORT_REASON_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-urbik-black/60">
                Comentario (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 1000))}
                disabled={isLoading}
                rows={4}
                placeholder="Contanos más detalles si querés..."
                className="w-full px-4 py-2.5 rounded-2xl border border-urbik-black/15 bg-white text-sm text-urbik-black placeholder:text-urbik-black/40 focus:outline-none focus:border-urbik-cyan resize-none"
              />
              <span className="text-[10px] text-urbik-black/40 self-end">
                {comment.length}/1000
              </span>
            </div>

            {error && (
              <div className="px-3 py-2 rounded-xl bg-urbik-rose/10 border border-urbik-rose/30 text-xs font-medium text-urbik-rose">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="cursor-pointer px-5 py-2.5 bg-white border border-urbik-black/15 text-urbik-black/70 rounded-full text-sm font-bold hover:bg-urbik-black/5 transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={submit}
                disabled={isLoading}
                className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-urbik-rose text-white rounded-full text-sm font-bold hover:opacity-80 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                Enviar reporte
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
