"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Pencil,
  Lock,
  Mail,
  Phone,
  MapPin,
  Tag,
  Home,
  DollarSign,
  Ruler,
  Bed,
  Bath,
  MessageCircle,
  MessageSquare,
  Loader2,
  Sparkles,
  Building2,
  Network,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import ClientModal from "@/components/dashboard/ClientModal";
import {
  type ClientData,
  type SearchParams,
  ROLE_LABELS,
  ROLE_BADGE_VARIANTS,
  PROPERTY_TYPE_LABELS,
  OPERATION_LABELS,
  hasSearchParams,
} from "@/components/dashboard/clientTypes";
import { propLabel, propPrice } from "@/lib/connections/searchUi";
import { shareProperty, sendPropertyViaChat } from "@/lib/connections/shareActions";

function spPriceRange(sp: SearchParams) {
  const cur = sp.currency || "USD";
  const min = sp.minPrice ? Number(sp.minPrice).toLocaleString("es-AR") : null;
  const max = sp.maxPrice ? Number(sp.maxPrice).toLocaleString("es-AR") : null;
  if (!min && !max) return "Indistinto";
  if (min && max) return `${cur} ${min} - ${max}`;
  if (min) return `Desde ${cur} ${min}`;
  return `Hasta ${cur} ${max}`;
}

function spAreaRange(sp: SearchParams) {
  if (!sp.minArea && !sp.maxArea) return "Indistinta";
  const unit = sp.areaUnit === "HA" ? "ha" : "m²";
  return `${sp.minArea || "—"} a ${sp.maxArea || "—"} ${unit}`;
}

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const contactId = params.id;

  const [contact, setContact] = useState<ClientData | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${contactId}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const d: ClientData = await res.json();
      setContact(d);
      setNotes(d.notes || "");
    } catch (e) {
      console.error(e);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    load();
    fetch("/api/property")
      .then(async (res) => {
        if (!res.ok) return [];
        const text = await res.text();
        return text ? JSON.parse(text) : [];
      })
      .then((data) => setProperties(data.properties || data || []))
      .catch(() => setProperties([]));
  }, [load]);

  const isSearcher = contact?.role === "BUYER" || contact?.role === "RENTER";
  const sp = contact?.searchParams;

  useEffect(() => {
    if (!contact || !isSearcher || !hasSearchParams(sp)) return;
    let active = true;
    setLoadingMatches(true);
    fetch("/api/clients/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchParams: sp }),
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (active) setMatches(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setMatches([]);
      })
      .finally(() => {
        if (active) setLoadingMatches(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact?.id]);

  const saveNotes = async () => {
    if (!contact) return;
    setSavingNotes(true);
    try {
      await fetch(`/api/clients/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contact, notes }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNotes(false);
    }
  };

  const startChat = async () => {
    if (!contact) return;
    setStartingChat(true);
    try {
      const res = await fetch(`/api/clients/${contact.id}/chat`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo abrir el chat");
      router.push(`/messages?thread=${data.threadId}`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setStartingChat(false);
    }
  };

  const shareStock = async (prop: any) => {
    if (!contact) return;
    setSharingId(prop.id);
    try {
      if (contact.georaStatus === "CONNECTED" && contact.linkedUserId) {
        const threadId = await sendPropertyViaChat(contact.id, {
          id: prop.id,
          title: prop.title,
          image: prop.images?.[0] || null,
          price: propPrice(prop),
          city: prop.city || null,
          typeLabel: propLabel(prop.type),
        });
        router.push(`/messages?thread=${threadId}`);
      } else {
        shareProperty(prop, "whatsapp", contact);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSharingId(null);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 min-h-screen flex justify-center">
        <Loader2 className="animate-spin text-geora-black/40" size={28} />
      </div>
    );
  }

  if (notFound || !contact) {
    return (
      <div className="pt-32 min-h-screen flex flex-col items-center text-center px-6">
        <p className="text-geora-black/60 font-bold text-lg">Contacto no encontrado.</p>
        <Link href="/dashboard?tab=clients" className="mt-4 text-geora-black font-bold underline">
          Volver a Contactos
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-28 min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 md:px-10">
        <Link
          href="/dashboard?tab=clients"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-geora-black/50 hover:text-geora-black transition-colors mb-4 group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Volver a Contactos
        </Link>

        {/* Bloque superior: identidad + notas */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="md:col-span-2  p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-black text-geora-black">{contact.name}</h1>
                  <div className="mt-1.5 text-xs text-geora-black/70">
                    {ROLE_LABELS[contact.role]}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditOpen(true)}
                title="Editar contacto"
                className="w-10 h-10 flex items-center justify-center cursor-pointer shrink-0"
              >
                <Pencil size={16} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-5 text-sm">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-geora-black/70 hover:text-geora-black transition-colors">
                  <Mail size={14} className="text-geora-black/40" /> {contact.email}
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-geora-black/70 hover:text-geora-black transition-colors">
                  <Phone size={14} className="text-geora-black/40" /> {contact.phone}
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 mt-5">
              {contact.phone && (
                <a
                  href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-geora-emerald/10 text-geora-emerald text-sm font-bold hover:bg-geora-emerald/20 transition-all cursor-pointer"
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
              )}
              <div className=" w-full flex justify-end">
<div className="flex flex-col gap-1">
  <button
    onClick={startChat}
    disabled={contact.georaStatus !== "CONNECTED" || startingChat}
    title={contact.georaStatus !== "CONNECTED" ? "Cliente no conectado a Geora" : undefined}
    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full shadow-sm text-sm font-bold text-geora-black transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
  >
    {startingChat ? <Loader2 size={15} className="animate-spin" /> : <MessageSquare size={15} />}
    Chat interno
  </button>

  {contact.georaStatus !== "CONNECTED" && (
    <p className="text-xs text-red-500 text-center">
      El cliente no está conectado a Geora
    </p>
  )}
</div>
              </div>

            </div>
          </div>

          <div className=" flex flex-col">
            <div className="flex items-center gap-2 mb-3 ml-3">
              <Lock size={14} className="text-geora-black/60" />
              <p className="text-xs font-bold text-geora-black/60 uppercase tracking-wide">Notas privadas</p>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              rows={6}
              placeholder="Preferencias, disponibilidad, seguimiento..."
              className="flex-1 w-full shadow-sm rounded-2xl px-3 py-2.5 text-sm focus:outline-none resize-none custom-scrollbar"
            />
            {savingNotes && <p className="text-[10px] text-amber-700/60 font-bold mt-1.5">Guardando...</p>}
          </div>
        </div>

        {/* Bloque medio */}
        <div className="bg-white rounded-[24px]  shadow-sm p-6 md:p-8 mb-6">
          {isSearcher ? (
            <>
              <p className="text-xs font-bold text-geora-black/50 uppercase tracking-wider mb-4">
                Lo que busca
              </p>
              {hasSearchParams(sp) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ParamItem icon={Tag} label="Operación" value={OPERATION_LABELS[sp?.operationType || ""] || sp?.operationType || "Indistinta"} />
                  <ParamItem icon={Home} label="Tipo de propiedad" value={PROPERTY_TYPE_LABELS[sp?.propertyType || ""] || sp?.propertyType || "Indistinto"} />
                  <ParamItem icon={MapPin} label="Zona" value={[sp?.locality || sp?.city, sp?.province].filter(Boolean).join(", ") || "Indistinta"} />
                  <ParamItem icon={Ruler} label="Superficie" value={sp ? spAreaRange(sp) : "Indistinta"} />
                  <ParamItem icon={DollarSign} label="Rango de precio" value={sp ? spPriceRange(sp) : "Indistinto"} />
                  {sp?.minBedrooms && <ParamItem icon={Bed} label="Dormitorios (mín.)" value={`${sp.minBedrooms}+`} />}
                  {sp?.minBathrooms && <ParamItem icon={Bath} label="Baños (mín.)" value={`${sp.minBathrooms}+`} />}
                </div>
              ) : (
                <p className="text-sm text-geora-black/50 font-medium">Todavía no cargaste parámetros de búsqueda para este contacto.</p>
              )}
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-geora-black/50 uppercase tracking-wider mb-4">
                Propiedad asociada
              </p>
              {contact.linkedPropertyTitle ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50/60">
                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <Building2 size={18} className="text-geora-black/50" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-geora-black truncate">{contact.linkedPropertyTitle}</p>
                    {contact.linkedPropertyCity && (
                      <p className="text-xs text-geora-black/50 mt-0.5">{contact.linkedPropertyCity}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-geora-black/50 font-medium">Sin propiedad asociada todavía.</p>
              )}
            </>
          )}
        </div>

        {/* Bloque inferior: stock propio */}
        {isSearcher && hasSearchParams(sp) && (
          <div className="bg-white rounded-[24px] border border-geora-black/10 shadow-sm p-6 md:p-8 mb-6">
            <p className="flex items-center gap-1.5 text-xs font-bold text-geora-black/50 uppercase tracking-wider mb-4">
              <Sparkles size={13} className="text-geora-emerald" /> Tu stock para este contacto
            </p>
            {loadingMatches ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-geora-black/30" size={20} />
              </div>
            ) : matches.length === 0 ? (
              <p className="text-sm text-geora-black/50 font-medium">
                No tenés propiedades en tu stock que coincidan todavía.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
                    <div className="h-32 bg-gray-100 flex items-center justify-center">
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={22} className="text-gray-300" />
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col gap-1">
                      <h4 className="font-bold text-sm truncate">{p.title}</h4>
                      <p className="text-xs text-geora-black/50 truncate">
                        {propLabel(p.type)} · {p.city}
                      </p>
                      <p className="text-sm font-bold text-geora-black/70">{propPrice(p)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <a
                          href={`/property/${p.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 text-center py-2 rounded-lg border border-gray-200 text-xs font-bold text-geora-black/70 hover:border-geora-black/30 transition-all"
                        >
                          Ver ficha
                        </a>
                        <button
                          onClick={() => shareStock(p)}
                          disabled={sharingId === p.id}
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-geora-black text-white text-xs font-bold hover:bg-geora-black/80 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {sharingId === p.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            "Compartir"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Banner CTA */}
        {isSearcher && (
          <div className="bg-geora-black rounded-full p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-3 text-white">
              <Network size={22} className="text-geora-emerald shrink-0" />
              <p className="text-sm font-bold">
                ¿Querés llegar a más oportunidades? Publicá esta búsqueda en la Bolsa de Conexiones.
              </p>
            </div>
            <button
              onClick={() => router.push(`/connections/new?clientId=${contact.id}`)}
              className="shrink-0 px-6 py-3 rounded-full bg-white text-geora-black text-sm font-bold hover:bg-gray-100 transition-all cursor-pointer"
            >
              Publicar en la Bolsa
            </button>
          </div>
        )}
      </div>

      <ClientModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        client={contact}
        properties={properties}
        onSave={async (data: Partial<ClientData>) => {
          await fetch(`/api/clients/${contact.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          setEditOpen(false);
          load();
        }}
      />
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
        <p className="text-[10px] font-bold text-geora-black/40 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-bold text-geora-black break-words">{value}</p>
      </div>
    </div>
  );
}
