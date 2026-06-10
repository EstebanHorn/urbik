"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Flag,
  ExternalLink,
  Trash2,
  Unlink,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import {
  REPORT_REASON_LABELS,
  type Report,
  type ReportAction,
  type ReportStatus,
  type ReportTargetType,
} from "@/lib/types";

const TARGET_LABELS: Record<ReportTargetType, string> = {
  AGENCY: "Inmobiliaria",
  PROPERTY: "Propiedad",
  REVIEW: "Reseña",
  PARCEL: "Parcela",
};

const TARGET_COLORS: Record<ReportTargetType, string> = {
  AGENCY: "bg-urbik-cyan/15 text-urbik-cyan border-urbik-cyan/30",
  PROPERTY: "bg-urbik-emerald/15 text-urbik-emerald border-urbik-emerald/30",
  REVIEW: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  PARCEL: "bg-purple-500/15 text-purple-600 border-purple-500/30",
};

function ActionButtons({
  report,
  busy,
  onAct,
}: {
  report: Report;
  busy: boolean;
  onAct: (action: ReportAction) => void;
}) {
  const primaryAction: ReportAction =
    report.targetType === "PARCEL" ? "UNLINK" : "DELETE";

  const primaryLabel =
    report.targetType === "PARCEL"
      ? "Desvincular parcela"
      : report.targetType === "PROPERTY"
        ? "Eliminar propiedad"
        : report.targetType === "AGENCY"
          ? "Eliminar inmobiliaria"
          : "Eliminar reseña";

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      <button
        onClick={() => onAct(primaryAction)}
        disabled={busy}
        className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-urbik-rose text-white text-xs font-bold hover:opacity-80 transition-all active:scale-95 disabled:opacity-50"
      >
        {primaryAction === "UNLINK" ? (
          <Unlink size={14} />
        ) : (
          <Trash2 size={14} />
        )}
        {primaryLabel}
      </button>
      <button
        onClick={() => onAct("DISMISS")}
        disabled={busy}
        className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-urbik-black/15 text-urbik-black/70 text-xs font-bold hover:bg-urbik-black/5 transition-all active:scale-95 disabled:opacity-50"
      >
        <XCircle size={14} /> Desestimar
      </button>
    </div>
  );
}

export default function ReportsPanel() {
  const [tab, setTab] = useState<ReportStatus>("PENDING");
  const [items, setItems] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: ReportAction;
  } | null>(null);

  const fetchReports = useCallback(async (status: ReportStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?status=${status}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err) {
      console.error("Error al cargar reportes:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(tab);
  }, [tab, fetchReports]);

  const handleAction = async (reportId: string, action: ReportAction) => {
    setBusyId(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data?.error ?? "No se pudo procesar la acción.");
        return;
      }
      await fetchReports(tab);
    } catch (err) {
      console.error(err);
      alert("Error de conexión.");
    } finally {
      setBusyId(null);
      setConfirmAction(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {(
          [
            { v: "PENDING" as ReportStatus, label: "Pendientes" },
            { v: "RESOLVED" as ReportStatus, label: "Resueltos" },
            { v: "DISMISSED" as ReportStatus, label: "Desestimados" },
          ] as const
        ).map((t) => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className={`cursor-pointer px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
              tab === t.v
                ? "bg-urbik-black text-white"
                : "bg-white border border-urbik-black/15 text-urbik-black/60 hover:bg-urbik-black/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="animate-spin text-urbik-black" size={28} />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Flag className="text-urbik-muted" size={24} />
          </div>
          <p className="font-bold text-urbik-black">
            {tab === "PENDING"
              ? "No hay reportes pendientes"
              : "Sin reportes en esta categoría"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {items.map((r) => {
              const isBusy = busyId === r.id;
              const isConfirming = confirmAction?.id === r.id;
              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="bg-white rounded-3xl border border-urbik-black/10 p-5 flex flex-col gap-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${TARGET_COLORS[r.targetType]}`}
                      >
                        {TARGET_LABELS[r.targetType]}
                      </span>
                      <span className="text-xs font-bold text-urbik-black/70 uppercase tracking-wider">
                        {REPORT_REASON_LABELS[r.reason]}
                      </span>
                      <span className="text-[11px] text-urbik-black/40">
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
                    {r.status !== "PENDING" && r.adminAction && (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-urbik-emerald">
                        <CheckCircle2 size={12} />
                        {r.adminAction === "DELETED"
                          ? "Eliminado"
                          : r.adminAction === "UNLINKED"
                            ? "Desvinculado"
                            : "Desestimado"}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-urbik-black line-clamp-1">
                        {r.target?.label ?? r.targetId}
                      </span>
                      {r.target?.href && (
                        <a
                          href={r.target.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-urbik-cyan hover:opacity-70"
                          aria-label="Abrir objeto reportado"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                    {r.target?.extra?.cca && (
                      <p className="text-[11px] text-urbik-black/50 font-medium">
                        CCA {r.target.extra.cca}
                        {r.target.extra.pda ? ` · PDA ${r.target.extra.pda}` : ""}
                      </p>
                    )}
                    {r.comment && (
                      <p className="text-sm text-urbik-black/70 mt-2 italic">
                        "{r.comment}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-3 pt-2 border-t border-urbik-black/5">
                    <div className="text-[11px] text-urbik-black/50">
                      <span className="font-bold">Reportado por:</span>{" "}
                      {r.reporter?.name ||
                        r.reporter?.email ||
                        "Usuario desconocido"}
                    </div>
                    {r.status === "PENDING" && (
                      <>
                        {isConfirming ? (
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            <span className="text-xs font-bold text-urbik-black">
                              {isBusy ? "Procesando..." : "¿Confirmar?"}
                            </span>
                            <button
                              onClick={() => setConfirmAction(null)}
                              disabled={isBusy}
                              className="cursor-pointer px-3 py-1.5 rounded-full bg-white border border-urbik-black/15 text-urbik-black/60 text-xs font-bold hover:bg-urbik-black/5"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() =>
                                handleAction(r.id, confirmAction!.action)
                              }
                              disabled={isBusy}
                              className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full bg-urbik-black text-white text-xs font-bold hover:opacity-80 disabled:opacity-50"
                            >
                              {isBusy && (
                                <Loader2 size={12} className="animate-spin" />
                              )}
                              Confirmar
                            </button>
                          </div>
                        ) : (
                          <ActionButtons
                            report={r}
                            busy={isBusy}
                            onAct={(action) =>
                              setConfirmAction({ id: r.id, action })
                            }
                          />
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
