"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Heart,
  Mail,
  MessageSquare,
  ArrowUpRight,
  Sparkles,
  Clock,
} from "lucide-react";

interface Stats {
  viewsCount: number;
  favoritesCount: number;
  inquiriesCount: number;
  chatsCount: number;
}

interface Inquiry {
  id: string | number;
  senderName: string;
  message: string;
  status: string;
  createdAt: string;
}

interface OwnerPropertyPanelProps {
  propertyId: string;
}

const glassCard =
  "relative md:rounded-[30px] rounded-3xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[30px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";

const kpiCard =
  "relative rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]";

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

const formatRelative = (iso: string) => {
  try {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "ahora";
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `hace ${days} d`;
    return date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  } catch {
    return "";
  }
};

export default function OwnerPropertyPanel({ propertyId }: OwnerPropertyPanelProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, inqRes] = await Promise.all([
          fetch(`/api/stats/property-view?id=${propertyId}&summary=1`),
          fetch(`/api/inquiries?propertyId=${propertyId}&limit=5`),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          if (!cancelled) {
            setStats({
              viewsCount: data?.viewsCount ?? 0,
              favoritesCount: data?.favoritesCount ?? 0,
              inquiriesCount: data?.inquiriesCount ?? 0,
              chatsCount: data?.chatsCount ?? 0,
            });
          }
        }

        if (inqRes.ok) {
          const data = await inqRes.json();
          if (!cancelled) setInquiries(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const unreadCount = inquiries.filter((i) => i.status === "UNREAD").length;

  return (
    <div className={`${glassCard} mt-6 overflow-hidden animate-fade-in-up`}>
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-urbik-black via-urbik-black/80 to-urbik-black/60" />

      <div className="relative z-10 p-6 md:p-7">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-urbik-black/10 blur-md" />
              <div className="relative w-10 h-10 rounded-full bg-urbik-black flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-urbik-black px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white">
                Tu propiedad
              </span>
              <h3 className="mt-1.5 text-xl font-black tracking-tighter text-urbik-black">
                Panel de actividad
              </h3>
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="flex flex-col items-end">
              <span className="rounded-full bg-rose-100 text-rose-700 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                {unreadCount} {unreadCount === 1 ? "nueva" : "nuevas"}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <KpiBox
            label="Vistas"
            value={stats?.viewsCount ?? 0}
            icon={<Eye className="w-4 h-4" />}
            loading={loading}
          />
          <KpiBox
            label="Favoritos"
            value={stats?.favoritesCount ?? 0}
            icon={<Heart className="w-4 h-4" />}
            loading={loading}
          />
          <KpiBox
            label="Consultas"
            value={stats?.inquiriesCount ?? 0}
            icon={<Mail className="w-4 h-4" />}
            loading={loading}
            highlight={unreadCount > 0}
          />
          <KpiBox
            label="Chats"
            value={stats?.chatsCount ?? 0}
            icon={<MessageSquare className="w-4 h-4" />}
            loading={loading}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-urbik-black/60" />
              <h4 className="text-xs font-black uppercase tracking-widest text-urbik-black/70">
                Últimas consultas
              </h4>
            </div>
            <Link
              href="/dashboard?tab=inquiries"
              className="text-[10px] font-bold text-urbik-black/60 hover:text-urbik-black underline decoration-dashed underline-offset-2"
            >
              Ver todas
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-2xl bg-white/40 border border-white/60 animate-pulse"
                />
              ))}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-urbik-black/15 bg-white/30 p-5 text-center">
              <Mail className="w-5 h-5 text-urbik-black/30 mx-auto mb-2" />
              <p className="text-xs font-semibold text-urbik-black/50">
                Todavía no recibiste consultas en esta propiedad.
              </p>
              <p className="text-[10px] text-urbik-black/40 mt-1">
                Cuando lleguen, las vas a ver acá.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {inquiries.map((inq) => {
                const isUnread = inq.status === "UNREAD";
                return (
                  <li
                    key={inq.id}
                    className={`relative rounded-2xl border p-3 transition-all duration-200 ${
                      isUnread
                        ? "border-urbik-black/20 bg-white/70 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
                        : "border-white/60 bg-white/40"
                    }`}
                  >
                    {isUnread && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                      </span>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-9 h-9 rounded-full bg-urbik-black/85 flex items-center justify-center text-[10px] font-black text-white">
                        {initials(inq.senderName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-xs font-black text-urbik-black truncate">
                            {inq.senderName}
                          </span>
                          <span className="text-[10px] text-urbik-black/50 whitespace-nowrap">
                            {formatRelative(inq.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-urbik-black/70 line-clamp-2 leading-snug">
                          {inq.message}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Link
          href="/dashboard?tab=inquiries"
          className="mt-5 group/cta flex items-center justify-between gap-2 rounded-full bg-urbik-black px-5 py-3 text-white transition-all duration-300 hover:bg-urbik-black/85"
        >
          <span className="text-xs font-black uppercase tracking-widest">
            Gestionar en el dashboard
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}

function KpiBox({
  icon,
  label,
  value,
  loading,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  loading: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`${kpiCard} ${
        highlight ? "ring-1 ring-urbik-black/15 bg-white/75" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-urbik-black/50">
          {label}
        </span>
        <div className="text-urbik-black/50">{icon}</div>
      </div>
      <div className="text-3xl font-black text-urbik-black tracking-tighter leading-none">
        {loading ? (
          <span className="inline-block h-7 w-10 rounded bg-urbik-black/10 animate-pulse" />
        ) : (
          value.toLocaleString("es-AR")
        )}
      </div>
    </div>
  );
}
