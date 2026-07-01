"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Network,
  Plus,
  Search,
  CheckSquare,
  Square,
  X,
  MapPin,
  Send,
  Inbox,
  Pause,
  Play,
  XCircle,
  MessageSquare,
  Mail,
  Share2,
  Loader2,
  Building2,
} from "lucide-react";
import LocationSelectors from "@/components/ui/LocationSelectors";

// ---------------------------------------------------------------------------
// Labels y helpers
// ---------------------------------------------------------------------------
const PROPERTY_LABELS: Record<string, string> = {
  HOUSE: "Casa",
  APARTMENT: "Departamento",
  PH: "PH",
  LAND: "Terreno",
  FIELD: "Campo",
  COMMERCIAL_PROPERTY: "Local Comercial",
  OFFICE: "Oficina",
  WAREHOUSE: "Galpón",
  COUNTRY: "Country",
};

// Opciones del formulario de publicación (orden y etiquetas del spec)
const OPERATION_OPTIONS = [
  { value: "SALE", label: "Compra" },
  { value: "RENT", label: "Alquiler" },
  { value: "TEMP_RENT", label: "Temporal" },
];

const PROPERTY_TYPE_OPTIONS = [
  { value: "FIELD", label: "Campo" },
  { value: "HOUSE", label: "Casa" },
  { value: "APARTMENT", label: "Departamento" },
  { value: "COMMERCIAL_PROPERTY", label: "Local" },
  { value: "LAND", label: "Terreno" },
  { value: "WAREHOUSE", label: "Galpón" },
  { value: "OFFICE", label: "Oficina" },
];

// Tipos rurales → muestran radio de búsqueda y superficie por defecto en hectáreas
const RURAL_TYPES = ["FIELD", "LAND"];

const RADIUS_OPTIONS = [
  { value: "", label: "Indistinto" },
  { value: "10", label: "Hasta 10 km" },
  { value: "25", label: "Hasta 25 km" },
  { value: "50", label: "Hasta 50 km" },
  { value: "100", label: "Más de 50 km" },
];

const OPERATION_LABELS: Record<string, string> = {
  SALE: "Compra",
  RENT: "Alquiler",
  TEMP_RENT: "Alquiler temporal",
};

const propLabel = (t?: string) => (t ? PROPERTY_LABELS[t] || t : "");
const opLabel = (t?: string) => (t ? OPERATION_LABELS[t] || t : "");

function priceRange(s: any) {
  const cur = s.currency || "USD";
  const fmt = (n?: number | null) =>
    n != null ? Number(n).toLocaleString("es-AR") : null;
  const min = fmt(s.min_price);
  const max = fmt(s.max_price);
  if (!min && !max) return "Precio a consultar";
  if (min && max) return `${cur} ${min} - ${max}`;
  if (min) return `Desde ${cur} ${min}`;
  return `Hasta ${cur} ${max}`;
}

function propPrice(p: any) {
  const isRent =
    p.operation_type === "RENT" || p.operation_type === "TEMP_RENT";
  const price = isRent ? p.rent_price : p.sale_price;
  const cur = (isRent ? p.rent_currency : p.sale_currency) || "USD";
  if (price == null) return "Consultar";
  return `${cur === "USD" ? "USD" : "$"} ${Number(price).toLocaleString("es-AR")}`;
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------
export default function ConnectionsPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-24 min-h-screen text-center">Cargando...</div>
      }
    >
      <ConnectionsInner />
    </Suspense>
  );
}

function ConnectionsInner() {
  const searchParams = useSearchParams();
  const urlClientId = searchParams.get("clientId");

  const [activeTab, setActiveTab] = useState<"network" | "my-searches">(
    "network"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [initialClientId, setInitialClientId] = useState<string>("");

  const [mySearches, setMySearches] = useState<any[]>([]);
  const [networkSearches, setNetworkSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const [detailSearch, setDetailSearch] = useState<any | null>(null);

  const loadSearches = useCallback(async () => {
    try {
      const res = await fetch("/api/searches");
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      const data = await res.json();
      setMySearches(data.mySearches || []);
      setNetworkSearches(data.networkSearches || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSearches();

    fetch("/api/clients")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch("/api/property")
      .then(async (res) => {
        if (!res.ok) return [];
        const text = await res.text();
        return text ? JSON.parse(text) : [];
      })
      .then((data) => setMyProperties(data.properties || data || []))
      .catch((err) => console.error("Error fetching properties:", err));
  }, [loadSearches]);

  useEffect(() => {
    if (urlClientId) {
      setInitialClientId(urlClientId);
      setIsModalOpen(true);
    }
  }, [urlClientId]);

  if (forbidden) {
    return (
      <div className="pt-32 min-h-screen flex flex-col items-center text-center px-6">
        <Network size={40} className="text-geora-black/30 mb-4" />
        <h1 className="text-2xl font-black text-geora-black">
          Acceso exclusivo para inmobiliarias
        </h1>
        <p className="text-geora-black/60 font-medium mt-2 max-w-md">
          La Bolsa de Conexiones es una red cerrada entre inmobiliarias
          verificadas de Geora.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-28 min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-geora-black flex items-center gap-3">
              <Network size={32} className="text-geora-black/80" /> Bolsa de
              Conexiones
            </h1>
            <p className="text-sm font-medium text-geora-black/60 mt-1">
              Publicá búsquedas para tus clientes o respondé a colegas.
            </p>
          </div>
          <button
            onClick={() => {
              setInitialClientId("");
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-geora-black text-white text-sm font-bold shadow-lg hover:bg-geora-black/80 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus size={18} /> Publicar Búsqueda
          </button>
        </div>

        <div className="flex gap-2 mb-8 p-1 bg-geora-black/5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("network")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "network"
                ? "bg-white text-geora-black shadow-sm"
                : "text-geora-black/50 hover:text-geora-black/80"
            }`}
          >
            Red Geora
          </button>
          <button
            onClick={() => setActiveTab("my-searches")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "my-searches"
                ? "bg-white text-geora-black shadow-sm"
                : "text-geora-black/50 hover:text-geora-black/80"
            }`}
          >
            Mis Búsquedas
            {mySearches.length > 0 && (
              <span className="ml-2 text-xs bg-geora-black/10 px-2 py-0.5 rounded-full">
                {mySearches.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-[24px] bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : activeTab === "network" ? (
          <NetworkGrid
            searches={networkSearches}
            onOpen={(s) => setDetailSearch(s)}
          />
        ) : (
          <MySearchesGrid
            searches={mySearches}
            onOpen={(s) => setDetailSearch(s)}
            onChanged={loadSearches}
          />
        )}
      </div>

      <CreateSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clients={clients}
        myProperties={myProperties}
        initialClientId={initialClientId}
        onPublished={() => {
          loadSearches();
          setActiveTab("my-searches");
        }}
      />

      {detailSearch && (
        <SearchDetailModal
          searchId={detailSearch.id}
          isOwner={detailSearch.__owner}
          onClose={() => setDetailSearch(null)}
          onChanged={loadSearches}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grids
// ---------------------------------------------------------------------------
function SearchCard({
  search,
  onClick,
  footer,
}: {
  search: any;
  onClick: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white p-6 rounded-[24px] shadow-sm border border-geora-black/10 flex flex-col gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start gap-2">
        <span className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-full uppercase">
          {opLabel(search.operation_type)}
        </span>
        <span className="text-sm font-bold text-geora-black/60 text-right">
          {priceRange(search)}
        </span>
      </div>
      <h3 className="font-bold text-lg mt-2">
        {propLabel(search.property_type)}
        {search.city ? ` en ${search.city}` : ""}
      </h3>
      {(search.province || search.city) && (
        <p className="flex items-center gap-1 text-xs font-medium text-geora-black/50">
          <MapPin size={12} /> {[search.city, search.province]
            .filter(Boolean)
            .join(", ")}
        </p>
      )}
      {footer}
    </button>
  );
}

function NetworkGrid({
  searches,
  onOpen,
}: {
  searches: any[];
  onOpen: (s: any) => void;
}) {
  if (searches.length === 0) {
    return (
      <div className="text-center py-24 border-2 border-dashed border-geora-black/10 rounded-[30px] bg-white/30 backdrop-blur-sm">
        <Search size={32} className="mx-auto text-geora-black/30 mb-4" />
        <p className="text-geora-black/60 font-bold text-lg">
          No hay búsquedas activas en la red.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {searches.map((s) => (
        <SearchCard
          key={s.id}
          search={s}
          onClick={() => onOpen({ ...s, __owner: false })}
          footer={
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-geora-emerald">
              <Send size={14} /> Tengo una propiedad para esto
            </span>
          }
        />
      ))}
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activa",
  PAUSED: "Pausada",
  CLOSED: "Cerrada",
};

function MySearchesGrid({
  searches,
  onOpen,
  onChanged,
}: {
  searches: any[];
  onOpen: (s: any) => void;
  onChanged: () => void;
}) {
  if (searches.length === 0) {
    return (
      <div className="text-center py-24 border-2 border-dashed border-geora-black/10 rounded-[30px] bg-white/30 backdrop-blur-sm">
        <Network size={32} className="mx-auto text-geora-black/30 mb-4" />
        <p className="text-geora-black/60 font-bold text-lg">
          Aún no publicaste ninguna búsqueda.
        </p>
      </div>
    );
  }

  const setStatus = async (id: string, status: string) => {
    await fetch(`/api/searches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onChanged();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {searches.map((s) => (
        <SearchCard
          key={s.id}
          search={s}
          onClick={() => onOpen({ ...s, __owner: true })}
          footer={
            <div className="border-t border-gray-100 pt-3 mt-2 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-geora-black/50 font-medium">
                  Cliente: {s.clients?.name || "—"}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    s.status === "ACTIVE"
                      ? "bg-geora-emerald/10 text-geora-emerald"
                      : s.status === "PAUSED"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {STATUS_LABELS[s.status] || s.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-geora-black">
                  <Inbox size={14} /> {s.responseCount || 0}{" "}
                  {s.responseCount === 1 ? "respuesta" : "respuestas"}
                </span>
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {s.status === "ACTIVE" && (
                    <button
                      onClick={() => setStatus(s.id, "PAUSED")}
                      title="Pausar"
                      className="p-1.5 text-geora-black/40 hover:text-amber-600"
                    >
                      <Pause size={15} />
                    </button>
                  )}
                  {s.status === "PAUSED" && (
                    <button
                      onClick={() => setStatus(s.id, "ACTIVE")}
                      title="Reactivar"
                      className="p-1.5 text-geora-black/40 hover:text-geora-emerald"
                    >
                      <Play size={15} />
                    </button>
                  )}
                  {s.status !== "CLOSED" && (
                    <button
                      onClick={() => setStatus(s.id, "CLOSED")}
                      title="Cerrar"
                      className="p-1.5 text-geora-black/40 hover:text-geora-rose"
                    >
                      <XCircle size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          }
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detalle de búsqueda (respond flow + respuestas recibidas)
// ---------------------------------------------------------------------------
function SearchDetailModal({
  searchId,
  isOwner,
  onClose,
  onChanged,
}: {
  searchId: string;
  isOwner: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [data, setData] = useState<any | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/searches/${searchId}`);
        const d = await res.json();
        if (!active) return;
        setData(d);
        if (!d.isOwner) {
          const mRes = await fetch(`/api/searches/${searchId}/matches`);
          const m = await mRes.json();
          if (active) setMatches(Array.isArray(m) ? m : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [searchId]);

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
      // refrescar matches para marcar enviados
      const mRes = await fetch(`/api/searches/${searchId}/matches`);
      setMatches(await mRes.json());
      onChanged();
    } catch (e: any) {
      setFeedback(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-0 md:pt-20 md:px-6 md:pb-6 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full h-full max-w-none rounded-none md:max-w-2xl md:h-[82vh] md:rounded-3xl bg-white flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-black text-geora-black">
            {isOwner ? "Detalle de tu búsqueda" : "Responder a una búsqueda"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          {loading || !data ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-geora-black/40" />
            </div>
          ) : (
            <>
              {/* Resumen de la búsqueda */}
              <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs font-bold px-3 py-1 bg-white rounded-full uppercase shadow-sm">
                    {opLabel(data.operation_type)}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 bg-white rounded-full uppercase shadow-sm">
                    {propLabel(data.property_type)}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 bg-white rounded-full shadow-sm">
                    {priceRange(data)}
                  </span>
                </div>
                {(data.city || data.province) && (
                  <p className="flex items-center gap-1 text-sm font-medium text-geora-black/70">
                    <MapPin size={14} />{" "}
                    {[data.city, data.province].filter(Boolean).join(", ")}
                  </p>
                )}
                {(data.min_area || data.max_area) && (
                  <p className="text-sm font-medium text-geora-black/60 mt-1">
                    Superficie: {data.min_area || "—"} a {data.max_area || "—"}{" "}
                    {data.area_unit === "HA" ? "ha" : "m²"}
                  </p>
                )}
                {data.additional_conditions && (
                  <p className="text-sm text-geora-black/60 mt-2 italic">
                    “{data.additional_conditions}”
                  </p>
                )}
              </div>

              {isOwner ? (
                <OwnerResponses data={data} />
              ) : (
                <ResponderMatches
                  matches={matches}
                  selected={selected}
                  toggle={toggle}
                />
              )}
            </>
          )}
        </div>

        {!isOwner && !loading && data && (
          <div className="px-8 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between gap-4">
            {feedback ? (
              <p className="text-sm font-bold text-geora-emerald">{feedback}</p>
            ) : (
              <span className="text-sm text-geora-black/50 font-medium">
                {selected.length} seleccionada
                {selected.length === 1 ? "" : "s"}
              </span>
            )}
            <button
              onClick={send}
              disabled={selected.length === 0 || sending}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-geora-black text-white text-sm font-bold disabled:opacity-40 hover:bg-geora-black/80 transition-all"
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
    </div>
  );
}

function ResponderMatches({
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
    <div className="space-y-3">
      <p className="text-xs font-bold text-geora-black/50 uppercase tracking-wider">
        Tus propiedades que coinciden
      </p>
      {matches.map((p) => {
        const isSel = selected.includes(p.id);
        return (
          <button
            key={p.id}
            disabled={p.alreadySent}
            onClick={() => toggle(p.id)}
            className={`w-full text-left flex items-center gap-4 p-3 rounded-2xl border transition-all ${
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
              <p className="text-sm font-bold text-geora-black/70">
                {propPrice(p)}
              </p>
            </div>
            {p.alreadySent ? (
              <span className="text-[10px] font-bold text-geora-emerald uppercase">
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
  );
}

function OwnerResponses({ data }: { data: any }) {
  const responses: any[] = data.responses || [];
  const client = data.client;

  const share = (prop: any, channel: "whatsapp" | "email" | "copy") => {
    const url = `${window.location.origin}/property/${prop.id}`;
    const text = `Te comparto esta propiedad que puede interesarte: ${prop.title} - ${url}`;
    if (channel === "whatsapp") {
      const phone = client?.phone ? client.phone.replace(/\D/g, "") : "";
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
        "_blank"
      );
    } else if (channel === "email") {
      const to = client?.email || "";
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(
        "Propiedad para vos"
      )}&body=${encodeURIComponent(text)}`;
    } else {
      navigator.clipboard?.writeText(url);
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
    <div className="space-y-3">
      <p className="text-xs font-bold text-geora-black/50 uppercase tracking-wider">
        Propiedades recibidas ({responses.length})
      </p>
      {responses.map((r) => {
        const p = r.properties;
        if (!p) return null;
        return (
          <div
            key={r.id}
            className="flex flex-col gap-3 p-4 rounded-2xl border border-gray-200"
          >
            <div className="flex items-center gap-4">
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
                <p className="text-sm font-bold text-geora-black/70">
                  {propPrice(p)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
              <span className="text-[11px] font-bold text-geora-black/40 mr-auto">
                Compartir con el cliente
              </span>
              <button
                onClick={() => share(p, "whatsapp")}
                title="WhatsApp"
                className="p-2 rounded-lg bg-geora-emerald/10 text-geora-emerald hover:bg-geora-emerald/20"
              >
                <MessageSquare size={15} />
              </button>
              <button
                onClick={() => share(p, "email")}
                title="Email"
                className="p-2 rounded-lg bg-geora-black/5 text-geora-black/70 hover:bg-geora-black/10"
              >
                <Mail size={15} />
              </button>
              <button
                onClick={() => share(p, "copy")}
                title="Copiar enlace"
                className="p-2 rounded-lg bg-geora-black/5 text-geora-black/70 hover:bg-geora-black/10"
              >
                <Share2 size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal de publicación
// ---------------------------------------------------------------------------
const modalStyles = `
  @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .step-transition { animation: fadeSlideIn 0.3s ease-out forwards; }
`;

function PillGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
            value === o.value
              ? "bg-geora-black text-white border-geora-black shadow-sm"
              : "bg-white text-geora-black/70 border-gray-200 hover:border-geora-black/40"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function CreateSearchModal({
  isOpen,
  onClose,
  clients,
  initialClientId,
  onPublished,
}: any) {
  const emptyForm = {
    clientId: initialClientId || "",
    operationType: "SALE",
    propertyType: "FIELD",
    province: "",
    department: "",
    locality: "",
    radius: "",
    minArea: "",
    maxArea: "",
    areaUnit: "HA",
    minPrice: "",
    maxPrice: "",
    currency: "USD",
    conditions: "",
  };
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRural = RURAL_TYPES.includes(formData.propertyType);

  useEffect(() => {
    if (initialClientId)
      setFormData((prev) => ({ ...prev, clientId: initialClientId }));
  }, [initialClientId]);

  // Ajustar unidad de superficie por defecto según el tipo (rural -> ha).
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      areaUnit: RURAL_TYPES.includes(prev.propertyType) ? "HA" : "M2",
      radius: RURAL_TYPES.includes(prev.propertyType) ? prev.radius : "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.propertyType]);

  // Pre-completar con los parámetros del contacto si los tiene.
  useEffect(() => {
    if (!formData.clientId) return;
    const c = clients.find((x: any) => x.id === formData.clientId);
    const sp = c?.searchParams;
    if (sp) {
      setFormData((prev) => ({
        ...prev,
        operationType: sp.operationType || prev.operationType,
        propertyType: sp.propertyType || prev.propertyType,
        province: sp.province || prev.province,
        department: sp.department || prev.department,
        locality: sp.locality || sp.city || prev.locality,
        minPrice: sp.minPrice ?? prev.minPrice,
        maxPrice: sp.maxPrice ?? prev.maxPrice,
        currency: sp.currency || prev.currency,
        minArea: sp.minArea ?? prev.minArea,
        maxArea: sp.maxArea ?? prev.maxArea,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.clientId]);

  if (!isOpen) return null;

  const setField = (name: string, value: string) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  // LocationSelectors emite los nombres province / city (=departamento) / locality
  const handleLocation = (name: string, value: string) => {
    if (name === "province")
      setFormData((p) => ({ ...p, province: value, department: "", locality: "" }));
    else if (name === "city")
      setFormData((p) => ({ ...p, department: value, locality: "" }));
    else if (name === "locality")
      setFormData((p) => ({ ...p, locality: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!formData.clientId) {
      setError("Debés seleccionar un contacto interno.");
      return;
    }
    if (!formData.province) {
      setError("Seleccioná al menos la provincia de búsqueda.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        clientId: formData.clientId,
        operationType: formData.operationType,
        propertyType: formData.propertyType,
        province: formData.province,
        city: formData.locality || formData.department || "",
        radiusKm: isRural && formData.radius ? Number(formData.radius) : null,
        minArea: formData.minArea,
        maxArea: formData.maxArea,
        areaUnit: formData.areaUnit,
        minPrice: formData.minPrice,
        maxPrice: formData.maxPrice,
        currency: formData.currency,
        conditions: formData.conditions,
      };
      const res = await fetch("/api/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al publicar la búsqueda");

      const n = data.matchCount || 0;
      onPublished?.();
      setFormData(emptyForm);
      onClose();
      alert(
        n > 0
          ? `¡Búsqueda publicada! Encontramos ${n} ${
              n === 1 ? "propiedad" : "propiedades"
            } en la red y notificamos a sus inmobiliarias.`
          : "¡Búsqueda publicada en la bolsa!"
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const areaLabel = formData.areaUnit === "HA" ? "hectáreas (ha)" : "m²";

  return (
    <>
      <style>{modalStyles}</style>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-0 md:pt-20 md:px-6 md:pb-6 animate-fade-in">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative w-full h-full max-w-none rounded-none md:max-w-xl md:h-[85vh] md:rounded-3xl bg-white flex flex-col shadow-2xl overflow-hidden">
          <div className="flex flex-col shrink-0 border-b border-gray-100">
            <div className="flex items-center justify-between px-8 py-5">
              <h2 className="text-lg font-black text-geora-black">
                Publicar Búsqueda
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            {error && (
              <div className="mx-8 mb-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                <span className="text-red-500 font-bold leading-none">!</span>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
            <div className="space-y-7 step-transition">
              {/* 1. Tipo de operación */}
              <section>
                <label className="block text-xs font-bold text-geora-black/80 uppercase tracking-wider mb-2">
                  1. Tipo de operación
                </label>
                <PillGroup
                  options={OPERATION_OPTIONS}
                  value={formData.operationType}
                  onChange={(v) => setField("operationType", v)}
                />
              </section>

              {/* 2. Tipo de propiedad */}
              <section>
                <label className="block text-xs font-bold text-geora-black/80 uppercase tracking-wider mb-2">
                  2. Tipo de propiedad
                </label>
                <PillGroup
                  options={PROPERTY_TYPE_OPTIONS}
                  value={formData.propertyType}
                  onChange={(v) => setField("propertyType", v)}
                />
              </section>

              {/* 3. Zona de búsqueda */}
              <section>
                <label className="block text-xs font-bold text-geora-black/80 uppercase tracking-wider mb-3">
                  3. Zona de búsqueda
                </label>
                <LocationSelectors
                  provinceValue={formData.province}
                  cityValue={formData.department}
                  localityValue={formData.locality}
                  onChange={handleLocation}
                  showLocality
                  provinceLabel="Provincia"
                  cityLabel="Departamento"
                  localityLabel="Ciudad / Localidad"
                />
                {isRural && (
                  <div className="mt-4">
                    <label className="block text-[10px] font-bold text-geora-black/60 uppercase mb-2">
                      Radio de búsqueda (rural)
                    </label>
                    <PillGroup
                      options={RADIUS_OPTIONS}
                      value={formData.radius}
                      onChange={(v) => setField("radius", v)}
                    />
                  </div>
                )}
              </section>

              {/* 4. Superficie buscada */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-geora-black/80 uppercase tracking-wider">
                    4. Superficie buscada ({areaLabel})
                  </label>
                  <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg">
                    {["M2", "HA"].map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setField("areaUnit", u)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          formData.areaUnit === u
                            ? "bg-white shadow-sm text-geora-black"
                            : "text-geora-black/50"
                        }`}
                      >
                        {u === "HA" ? "ha" : "m²"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Desde"
                    value={formData.minArea}
                    onChange={(e) => setField("minArea", e.target.value)}
                    className="w-1/2 border border-gray-200 bg-white rounded-xl px-3 py-3 text-sm focus:outline-none shadow-sm"
                  />
                  <input
                    type="number"
                    placeholder="Hasta"
                    value={formData.maxArea}
                    onChange={(e) => setField("maxArea", e.target.value)}
                    className="w-1/2 border border-gray-200 bg-white rounded-xl px-3 py-3 text-sm focus:outline-none shadow-sm"
                  />
                </div>
              </section>

              {/* 5. Rango de precio */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-geora-black/80 uppercase tracking-wider">
                    5. Rango de precio
                  </label>
                  <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg">
                    {["USD", "ARS"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setField("currency", c)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          formData.currency === c
                            ? "bg-white shadow-sm text-geora-black"
                            : "text-geora-black/50"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Desde"
                    value={formData.minPrice}
                    onChange={(e) => setField("minPrice", e.target.value)}
                    className="w-1/2 border border-gray-200 bg-white rounded-xl px-3 py-3 text-sm focus:outline-none shadow-sm"
                  />
                  <input
                    type="number"
                    placeholder="Hasta"
                    value={formData.maxPrice}
                    onChange={(e) => setField("maxPrice", e.target.value)}
                    className="w-1/2 border border-gray-200 bg-white rounded-xl px-3 py-3 text-sm focus:outline-none shadow-sm"
                  />
                </div>
              </section>

              {/* 6. Condiciones adicionales */}
              <section>
                <label className="block text-xs font-bold text-geora-black/80 uppercase tracking-wider mb-2">
                  6. Condiciones adicionales (opcional)
                </label>
                <textarea
                  rows={3}
                  value={formData.conditions}
                  onChange={(e) => setField("conditions", e.target.value)}
                  placeholder="Ej. Buscamos campos agrícolas mixtos. Preferentemente con mejoras y buena accesibilidad."
                  className="w-full border border-gray-200 bg-white rounded-2xl px-4 py-3 text-sm focus:outline-none shadow-sm resize-none custom-scrollbar"
                />
              </section>

              {/* 7. Contacto interno */}
              <section>
                <label className="block text-xs font-bold text-geora-black/80 uppercase tracking-wider mb-2">
                  7. Contacto interno{" "}
                  <span className="normal-case text-geora-black/40">
                    (oculto en la red)
                  </span>
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setField("clientId", e.target.value)}
                  className="w-full border border-gray-200 bg-white rounded-2xl px-4 py-3 text-sm focus:outline-none shadow-sm"
                >
                  <option value="">Seleccionar contacto...</option>
                  {clients
                    .filter((c: any) => c.role !== "OWNER")
                    .map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </section>

              <p className="text-[10px] font-bold text-geora-black/50 text-center">
                Estará activa por 60 días.
              </p>
            </div>
          </div>

          <div className="px-8 py-4 shrink-0 flex items-center justify-between gap-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-geora-black/80 font-bold hover:text-geora-black"
            >
              CANCELAR
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-geora-black text-white font-bold disabled:opacity-40 hover:bg-geora-black/80 transition-all"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              PUBLICAR BÚSQUEDA
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
