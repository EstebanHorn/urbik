"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Mail, Phone, Building2, Clock, CheckCheck, Inbox } from "lucide-react";

interface InquiryProperty {
  id: number;
  title: string;
}

interface Inquiry {
  id: number;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  message: string;
  status: "UNREAD" | "READ" | string;
  createdAt: string;
  property: InquiryProperty;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function InquiriesPanel() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [markingId, setMarkingId] = useState<number | null>(null);

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/inquiries");
      if (!res.ok) throw new Error("Error al cargar consultas");
      const data = (await res.json()) as Inquiry[];
      setInquiries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  async function markAsRead(id: number) {
    setMarkingId(id);
    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Error al marcar como leída");
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === id ? { ...inq, status: "READ" } : inq,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingId(null);
    }
  }

  function handleExpand(id: number, status: string) {
    const isOpening = expandedId !== id;
    setExpandedId(isOpening ? id : null);
    if (isOpening && status === "UNREAD") {
      markAsRead(id);
    }
  }

  const unreadCount = inquiries.filter((i) => i.status === "UNREAD").length;

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-20 rounded-xl bg-gray-100 animate-pulse border border-gray-100"
          />
        ))}
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Inbox size={28} className="text-gray-400" />
        </div>
        <h3 className="text-base font-bold text-urbik-black/60">
          No tenés consultas por el momento.
        </h3>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">
          Cuando alguien consulte por una de tus propiedades, aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {unreadCount > 0 && (
        <p className="text-xs font-bold text-urbik-muted mb-3 ml-1">
          {unreadCount} consulta{unreadCount !== 1 ? "s" : ""} sin leer
        </p>
      )}

      <div className="space-y-2">
        {inquiries.map((inq) => {
          const isExpanded = expandedId === inq.id;
          const isUnread = inq.status === "UNREAD";

          return (
            <div
              key={inq.id}
              className={`rounded-xl border transition-all cursor-pointer ${
                isUnread
                  ? "border-urbik-cyan/40 bg-urbik-cyan/5"
                  : "border-gray-100 bg-white"
              } hover:shadow-sm`}
              onClick={() => handleExpand(inq.id, inq.status)}
            >
              <div className="p-4 flex items-start gap-4">
                <div
                  className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black text-sm ${
                    isUnread
                      ? "bg-urbik-black text-urbik-cyan"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {inq.senderName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-urbik-black">
                        {inq.senderName}
                      </span>
                      {isUnread ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-urbik-cyan text-urbik-dark">
                          Nuevo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-500">
                          <CheckCheck size={10} />
                          Leído
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-urbik-muted font-medium shrink-0">
                      <Clock size={10} />
                      {formatDate(inq.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-0.5">
                    <Building2 size={11} className="text-urbik-emerald shrink-0" />
                    <span className="text-xs text-urbik-muted font-medium truncate">
                      {inq.property.title}
                    </span>
                  </div>

                  {!isExpanded && (
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-1 font-medium">
                      {inq.message}
                    </p>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div
                  className="px-4 pb-5 space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="h-px bg-gray-100" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="bg-white p-1.5 rounded-full border border-gray-200">
                        <Mail size={14} className="text-urbik-dark" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-urbik-muted uppercase">
                          Email
                        </p>
                        <a
                          href={`mailto:${inq.senderEmail}`}
                          className="text-xs font-bold text-urbik-black hover:text-urbik-emerald transition-colors"
                        >
                          {inq.senderEmail}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="bg-white p-1.5 rounded-full border border-gray-200">
                        <Phone size={14} className="text-urbik-dark" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-urbik-muted uppercase">
                          Teléfono
                        </p>
                        <a
                          href={`tel:${inq.senderPhone}`}
                          className="text-xs font-bold text-urbik-black hover:text-urbik-emerald transition-colors"
                        >
                          {inq.senderPhone}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-bold text-urbik-muted uppercase mb-2">
                      Mensaje
                    </p>
                    <p className="text-sm text-urbik-black leading-relaxed whitespace-pre-wrap">
                      {inq.message}
                    </p>
                  </div>

                  {markingId === inq.id && (
                    <p className="text-xs text-urbik-muted font-medium text-center animate-pulse">
                      Marcando como leída...
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
