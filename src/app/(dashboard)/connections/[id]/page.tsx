"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  Pencil,
  MapPin,
  Tag,
  Home,
  Ruler,
  DollarSign,
  FileText,
  Inbox,
  Building2,
  CheckSquare,
  Square,
  Loader2,
  Send,
  MessageSquare,
  MessageCircle,
  Mail,
  Share2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Badge from "@/components/ui/Badge";
import CreateSearchModal from "@/components/dashboard/connections/CreateSearchModal";
import {
  STATUS_LABELS,
  propLabel,
  opLabel,
  priceRange,
  propPrice,
} from "@/lib/connections/searchUi";
import { shareProperty, sendPropertyViaChat } from "@/lib/connections/shareActions";

export default function SearchDetailPage() {
  const params = useParams<{ id: string }>();
  const searchId = params.id;

  const [data, setData] = useState<any | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/searches/${searchId}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const d = await res.json();
      setData(d);
      if (!d.isOwner) {
        const mRes = await fetch(`/api/searches/${searchId}/matches`);
        const m = await mRes.json();
        setMatches(Array.isArray(m) ? m : []);
      }
    } catch (e) {
      console.error(e);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [searchId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => (res.ok ? res.json() : []))
      .then((d) => setClients(Array.isArray(d) ? d : []))
      .catch(() => setClients([]));
  }, []);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const send = async () => {
    if (selected.length === 0) return;
    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchId, propertyIds: selected }),
      });
      const r = await res.json();
      if (!res.ok) throw new Error(r.error || "Error al enviar");
      setFeedback("¡Propiedades enviadas! La inmobiliaria fue notificada.");
      setSelected([]);
      const mRes = await fetch(`/api/searches/${searchId}/matches`);
      setMatches(await mRes.json());
    } catch (e: any) {
      setFeedback(e.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 min-h-screen flex justify-center">
        <Loader2 className="animate-spin text-geora-black/40" size={28} />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="pt-32 min-h-screen flex flex-col items-center text-center px-6">
        <p className="text-geora-black/60 font-bold text-lg">
          Búsqueda no encontrada.
        </p>
        <Link
          href="/connections"
          className="mt-4 text-geora-black font-bold underline"
        >
          Volver a la Bolsa
        </Link>
      </div>
    );
  }

  const isOwner = !!data.isOwner;

  return (
    <div className="pt-24 pb-28 min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 md:px-10">
        <Link
          href="/connections"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-geora-black/50 hover:text-geora-black transition-colors mb-4 group"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Volver a la Bolsa
        </Link>

        {/* Bloque superior */}
        <div className="bg-white rounded-[24px] border border-geora-black/10 shadow-sm p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="neutral">
                  {opLabel(data.operation_type)} · {propLabel(data.property_type)}
                </Badge>
                <Badge
                  variant={
                    data.status === "ACTIVE"
                      ? "emerald"
                      : data.status === "PAUSED"
                        ? "amber"
                        : "neutral"
                  }
                >
                  {STATUS_LABELS[data.status] || data.status}
                </Badge>
              </div>
              <h1 className="text-2xl font-black text-geora-black flex items-center gap-2">
                <MapPin size={20} className="text-geora-black/40 shrink-0" />
                {data.city || data.province || "Zona a definir"}
              </h1>
              {data.province && data.city && (
                <p className="text-sm text-geora-black/50 font-medium mt-1 ml-7">
                  {data.province}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {data.publisher?.name && (
                <div className="text-right">
                  <p className="text-[10px] font-bold text-geora-black/40 uppercase tracking-wide">
                    Publicado por
                  </p>
                  <p className="text-sm font-bold text-geora-black">
                    {data.publisher.name}
                  </p>
                </div>
              )}
              {isOwner && (
                <button
                  onClick={() => setEditOpen(true)}
                  title="Editar búsqueda"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bloque medio: parámetros */}
        <div className="bg-white rounded-[24px] border border-geora-black/10 shadow-sm p-6 md:p-8 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ParamItem icon={Tag} label="Operación" value={opLabel(data.operation_type)} />
            <ParamItem
              icon={Home}
              label="Tipo de propiedad"
              value={propLabel(data.property_type)}
            />
            <ParamItem
              icon={MapPin}
              label="Zona"
              value={[data.city, data.province].filter(Boolean).join(", ") || "Indistinta"}
            />
            <ParamItem
              icon={Ruler}
              label="Superficie"
              value={
                data.min_area || data.max_area
                  ? `${data.min_area || "—"} a ${data.max_area || "—"} ${
                      data.area_unit === "HA" ? "ha" : "m²"
                    }`
                  : "Indistinta"
              }
            />
            <ParamItem icon={DollarSign} label="Rango de precio" value={priceRange(data)} />
            {data.additional_conditions && (
              <ParamItem
                icon={FileText}
                label="Condiciones adicionales"
                value={data.additional_conditions}
              />
            )}
          </div>
        </div>

        {/* Bloque inferior */}
        <div className="bg-white rounded-[24px] border border-geora-black/10 shadow-sm p-6 md:p-8">
          {isOwner ? (
            <OwnerResponsesBlock data={data} />
          ) : (
            <ResponderMatchesBlock matches={matches} selected={selected} toggle={toggle} />
          )}
        </div>

        {!isOwner && (
          <div className="sticky bottom-4 mt-4 bg-white rounded-2xl border border-geora-black/10 shadow-lg p-4 flex items-center justify-between gap-4">
            {feedback ? (
              <p className="text-sm font-bold text-geora-emerald">{feedback}</p>
            ) : (
              <span className="text-sm text-geora-black/50 font-medium">
                {selected.length} seleccionada{selected.length === 1 ? "" : "s"}
              </span>
            )}
            <button
              onClick={send}
              disabled={selected.length === 0 || sending}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-geora-black text-white text-sm font-bold disabled:opacity-40 hover:bg-geora-black/80 transition-all cursor-pointer"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Enviar propiedades
            </button>
          </div>
        )}
      </div>

      {isOwner && (
        <CreateSearchModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          clients={clients}
          initialClientId=""
          editingSearch={data}
          onPublished={() => {
            setEditOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function ParamItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-geora-black/60" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-geora-black/40 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-sm font-bold text-geora-black break-words">{value}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bloque inferior — dueño: respuestas recibidas
// ---------------------------------------------------------------------------
function OwnerResponsesBlock({ data }: { data: any }) {
  const responses: any[] = data.responses || [];
  const client = data.client;
  const isGeoraClient = client?.geora_status === "CONNECTED" && !!client?.linked_user_id;
  const [sendingChatId, setSendingChatId] = useState<string | null>(null);

  const sendViaChat = async (prop: any) => {
    if (!client?.id) return;
    setSendingChatId(prop.id);
    try {
      const threadId = await sendPropertyViaChat(client.id, {
        id: prop.id,
        title: prop.title,
        image: prop.images?.[0] || null,
        price: propPrice(prop),
        city: prop.city || null,
        typeLabel: propLabel(prop.type),
      });
      window.location.href = `/messages?thread=${threadId}`;
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSendingChatId(null);
    }
  };

  if (responses.length === 0) {
    return (
      <div className="text-center py-12">
        <Inbox size={28} className="mx-auto text-geora-black/30 mb-3" />
        <p className="text-geora-black/60 font-bold">
          Todavía no recibiste respuestas para esta búsqueda.
        </p>
        {client && (
          <p className="text-sm text-geora-black/40 mt-2">
            Cliente asociado: {client.name}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-bold text-geora-black/50 uppercase tracking-wider mb-3">
        Propiedades recibidas ({responses.length})
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {responses.map((r) => {
          const p = r.properties;
          if (!p) return null;
          return (
            <div
              key={r.id}
              className="flex flex-col gap-3 p-4 rounded-2xl border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {p.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{p.title}</h4>
                  <p className="text-xs text-geora-black/50">
                    {propLabel(p.type)} · {p.city}
                  </p>
                  <p className="text-sm font-bold text-geora-black/70">{propPrice(p)}</p>
                  {r.responder?.name && (
                    <p className="text-[11px] text-geora-black/40 mt-0.5 truncate">
                      Ofrecida por {r.responder.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                <button
                  onClick={() => shareProperty(p, "whatsapp", client)}
                  title="WhatsApp"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-geora-black/70 hover:border-geora-emerald hover:text-geora-emerald text-xs font-bold transition-all cursor-pointer"
                >
                  <MessageSquare size={13} /> WhatsApp
                </button>
                <button
                  onClick={() => sendViaChat(p)}
                  disabled={!isGeoraClient || sendingChatId === p.id}
                  title={
                    isGeoraClient
                      ? "Enviar por chat de Geora"
                      : "Cliente no conectado a Geora"
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-geora-black/70 hover:border-geora-emerald hover:text-geora-emerald text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-geora-black/70 cursor-pointer"
                >
                  {sendingChatId === p.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <MessageCircle size={13} />
                  )}
                  Chat
                </button>
                <button
                  onClick={() => shareProperty(p, "email", client)}
                  title="Email"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-geora-black/70 hover:border-geora-emerald hover:text-geora-emerald text-xs font-bold transition-all cursor-pointer"
                >
                  <Mail size={13} /> Mail
                </button>
                <button
                  onClick={() => shareProperty(p, "copy", client)}
                  title="Copiar enlace"
                  className="p-2 rounded-lg border border-gray-200 text-geora-black/50 hover:border-geora-black/30 hover:text-geora-black transition-all cursor-pointer shrink-0"
                >
                  <Share2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bloque inferior — no dueño: propiedades del stock que matchean
// ---------------------------------------------------------------------------
function ResponderMatchesBlock({
  matches,
  selected,
  toggle,
}: {
  matches: any[];
  selected: string[];
  toggle: (id: string) => void;
}) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 size={28} className="mx-auto text-geora-black/30 mb-3" />
        <p className="text-geora-black/60 font-bold">
          No tenés propiedades en tu stock que coincidan con esta búsqueda.
        </p>
        <a
          href="/dashboard?nueva=1"
          className="inline-block mt-4 text-geora-black font-bold underline"
        >
          Cargar una nueva propiedad
        </a>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-bold text-geora-black/50 uppercase tracking-wider mb-3">
        Tus propiedades que coinciden
      </p>
      <div className="space-y-3">
        {matches.map((p) => {
          const isSel = selected.includes(p.id);
          return (
            <button
              key={p.id}
              disabled={p.alreadySent}
              onClick={() => toggle(p.id)}
              className={`w-full text-left flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer ${
                p.alreadySent
                  ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                  : isSel
                    ? "border-geora-emerald bg-geora-emerald/5"
                    : "border-gray-200 hover:border-geora-black/30"
              }`}
            >
              <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                {p.images?.[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate">{p.title}</h4>
                <p className="text-xs text-geora-black/50">
                  {propLabel(p.type)} · {p.city}
                </p>
                <p className="text-sm font-bold text-geora-black/70">{propPrice(p)}</p>
              </div>
              {p.alreadySent ? (
                <span className="text-[10px] font-bold text-geora-emerald uppercase shrink-0">
                  Enviada
                </span>
              ) : isSel ? (
                <CheckSquare className="text-geora-emerald shrink-0" size={20} />
              ) : (
                <Square className="text-geora-black/30 shrink-0" size={20} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
