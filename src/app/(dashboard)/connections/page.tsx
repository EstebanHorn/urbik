"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Network,
  Plus,
  Search,
  MapPin,
  Send,
  Inbox,
  Pause,
  Play,
  XCircle,
  Pencil,
  Building2,
  BadgeCheck,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import CreateSearchModal from "@/components/dashboard/connections/CreateSearchModal";
import {
  STATUS_LABELS,
  propLabel,
  opLabel,
  priceRange,
} from "@/lib/connections/searchUi";
export const glassCard =
  "relative overflow-hidden md:rounded-[30px] rounded-3xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[30px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";

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
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"network" | "my-searches">(
    "network"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [editingSearch, setEditingSearch] = useState<any | null>(null);

  const [mySearches, setMySearches] = useState<any[]>([]);
  const [networkSearches, setNetworkSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

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
  }, [loadSearches]);

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
            onClick={() => router.push("/connections/new")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-geora-black text-white text-sm font-bold shadow-lg hover:bg-geora-black/80 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus size={18} /> Publicar Búsqueda
          </button>
        </div>

        <div className="flex gap-2 mb-8 p-1 w-fit">
          <button
            onClick={() => setActiveTab("network")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === "network"
                ? "bg-white text-geora-black shadow-sm"
                : "text-geora-black/50 hover:text-geora-black/80"
            }`}
          >
            Red Geora
          </button>
          <button
            onClick={() => setActiveTab("my-searches")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === "my-searches"
                ? "bg-white text-geora-black shadow-sm"
                : "text-geora-black/50 hover:text-geora-black/80"
            }`}
          >
            Mis Búsquedas
            {mySearches.length > 0 && (
              <span className="ml-2 text-xs bg-geora-black/5 px-2 py-0.5 rounded-full">
                {mySearches.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 rounded-[24px] bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : activeTab === "network" ? (
          <NetworkGrid searches={networkSearches} />
        ) : (
          <MySearchesGrid
            searches={mySearches}
            onChanged={loadSearches}
            onEdit={(s) => {
              setEditingSearch(s);
              setIsModalOpen(true);
            }}
          />
        )}
      </div>

      <CreateSearchModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSearch(null);
        }}
        clients={clients}
        editingSearch={editingSearch}
        onPublished={() => {
          loadSearches();
          setActiveTab("my-searches");
          setEditingSearch(null);
        }}
      />
    </div>
  );
}


function SearchCardShell({
  search,
  children,
}: {
  search: any;
  children?: React.ReactNode;
}) {
  return (
    <div className={`group flex flex-col p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] ${glassCard}`}>
      
      {/* Wrapper z-10 para asegurar que el contenido no quede tapado por los gradientes del glass */}
      <div className="relative z-10 flex flex-col gap-4 h-full">
        <Badge variant="neutral" className="self-start shadow-sm z-1">
          {opLabel(search.operation_type)} · {propLabel(search.property_type)}
        </Badge>

        <div>
          <h3 className="font-bold text-lg flex items-center gap-1.5 text-geora-black">
            <MapPin size={16} className="text-geora-black/40 shrink-0" />
            {search.city || search.province || "Zona a definir"}
          </h3>
          {search.province && search.city && (
            <p className="text-xs font-medium text-geora-black/50 mt-0.5 ml-[22px]">
              {search.province}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-white/60">
          <div>
            <p className="text-[10px] font-bold text-geora-black/40 uppercase tracking-wide mb-1">
              Superficie
            </p>
            <p className="text-sm font-bold text-geora-black">
              {search.min_area || search.max_area
                ? `${search.min_area || "—"} a ${search.max_area || "—"} ${
                    search.area_unit === "HA" ? "ha" : "m²"
                  }`
                : "Indistinto"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-geora-black/40 uppercase tracking-wide mb-1">
              Rango de precio
            </p>
            <p className="text-sm font-bold text-geora-black">
              {priceRange(search)}
            </p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

function NetworkGrid({ searches }: { searches: any[] }) {
  const router = useRouter();

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {searches.map((s) => (
        <SearchCardShell key={s.id} search={s}>
          <div className="flex items-center gap-1.5 text-sm font-bold text-geora-black/70">
            <Building2 size={14} className="text-geora-black/40 shrink-0" />
            <span className="truncate">
              {s.agencyName || "Inmobiliaria de Geora"}
            </span>
            <BadgeCheck size={14} className="text-geora-emerald shrink-0" />
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push(`/connections/${s.id}`)}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-geora-black text-white text-sm font-bold hover:bg-geora-black/80 transition-all cursor-pointer"
            >
              Ofrecer Propiedad
            </button>
            <button
              onClick={() => router.push(`/connections/${s.id}`)}
              className="py-2.5 rounded-xl shadow-sm text-urbik-black/70 text-sm font-bold hover:bg-geora-emerald/5 transition-all cursor-pointer"
            >
              Ver detalles
            </button>
          </div>
        </SearchCardShell>
      ))}
    </div>
  );
}

function MySearchesGrid({
  searches,
  onChanged,
  onEdit,
}: {
  searches: any[];
  onChanged: () => void;
  onEdit: (s: any) => void;
}) {
  const router = useRouter();

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {searches.map((s) => (
        <div
          key={s.id}
          role="button"
          tabIndex={0}
          onClick={() => router.push(`/connections/${s.id}`)}
          onKeyDown={(e) => {
            if (e.key === "Enter") router.push(`/connections/${s.id}`);
          }}
          className="cursor-pointer"
        >
          <SearchCardShell search={s}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-geora-black/50 font-medium truncate">
                Cliente: {s.clients?.name || "—"}
              </span>
              <Badge
                variant={
                  s.status === "ACTIVE"
                    ? "emerald"
                    : s.status === "PAUSED"
                      ? "amber"
                      : "neutral"
                }
              >
                {STATUS_LABELS[s.status] || s.status}
              </Badge>
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
                <button
                  onClick={() => onEdit(s)}
                  title="Editar búsqueda"
                  className="p-1.5 text-geora-black/40 hover:text-geora-black cursor-pointer"
                >
                  <Pencil size={15} />
                </button>
                {s.status === "ACTIVE" && (
                  <button
                    onClick={() => setStatus(s.id, "PAUSED")}
                    title="Pausar"
                    className="p-1.5 text-geora-black/40 hover:text-amber-600 cursor-pointer"
                  >
                    <Pause size={15} />
                  </button>
                )}
                {s.status === "PAUSED" && (
                  <button
                    onClick={() => setStatus(s.id, "ACTIVE")}
                    title="Reactivar"
                    className="p-1.5 text-geora-black/40 hover:text-geora-emerald cursor-pointer"
                  >
                    <Play size={15} />
                  </button>
                )}
                {s.status !== "CLOSED" && (
                  <button
                    onClick={() => setStatus(s.id, "CLOSED")}
                    title="Cerrar"
                    className="p-1.5 text-geora-black/40 hover:text-geora-rose cursor-pointer"
                  >
                    <XCircle size={15} />
                  </button>
                )}
              </div>
            </div>
          </SearchCardShell>
        </div>
      ))}
    </div>
  );
}
