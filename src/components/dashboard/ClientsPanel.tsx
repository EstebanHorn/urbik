"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  MapPin,
  Phone,
  MessageSquare,
  Edit2,
  X,
  CheckCircle2,
  Clock,
  Network,
  Search,
  Trash2,
  UserCircle2,
  Sparkles,
  Building2,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import KebabMenu from "@/components/ui/KebabMenu";
import Pagination from "@/components/ui/Pagination";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import ClientModal from "@/components/dashboard/ClientModal";
import {
  type ClientData,
  type ClientRole,
  type SearchParams,
  ROLE_LABELS,
  ROLE_DOT_COLORS,
  ROLE_BADGE_VARIANTS,
  PROPERTY_TYPE_LABELS,
  hasSearchParams,
  propMatchPrice,
} from "@/components/dashboard/clientTypes";

export type { ClientRole, GeoraStatus, SearchParams, ClientData } from "@/components/dashboard/clientTypes";

interface ClientsPanelProps {
  clients: ClientData[];
  properties: any[];
  onAddClient: (data: Partial<ClientData>) => Promise<any> | void;
  onEditClient: (id: string, data: Partial<ClientData>) => Promise<any> | void;
  onDeleteClient: (id: string) => void;
  onStartChat: (clientId: string) => void;
  onPublishSearch: (clientId: string) => void;
}

const ROLE_FILTERS: { value: "ALL" | ClientRole; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "BUYER", label: "Compradores" },
  { value: "OWNER", label: "Propietarios" },
  { value: "RENTER", label: "Arrendadores" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Más recientes" },
  { value: "name", label: "Nombre" },
];

const PAGE_SIZE = 10;

function locationFor(c: ClientData) {
  if (c.role === "OWNER") return c.linkedPropertyCity || "";
  const sp = c.searchParams;
  return sp?.locality || sp?.city || sp?.department || sp?.province || "";
}

function summaryFor(c: ClientData) {
  if (c.role === "OWNER") {
    return c.linkedPropertyTitle ? `Publicó: ${c.linkedPropertyTitle}` : "Sin propiedad asociada";
  }
  const sp = c.searchParams;
  if (!hasSearchParams(sp)) return "Sin parámetros de búsqueda";
  const typeLabel = sp?.propertyType ? PROPERTY_TYPE_LABELS[sp.propertyType] || sp.propertyType : "";
  const loc = locationFor(c);
  const parts = [typeLabel, loc ? `en ${loc}` : ""].filter(Boolean);
  return parts.join(" ") || "—";
}

function StatusCell({ client }: { client: ClientData }) {
  if (client.hasActiveSearch) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-geora-emerald">
        <CheckCircle2 size={13} /> Búsqueda activa
      </span>
    );
  }
  if (client.georaStatus === "CONNECTED") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-geora-emerald">
        <CheckCircle2 size={13} /> Conectado
      </span>
    );
  }
  if (client.georaStatus === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
        <Clock size={13} /> Pendiente
      </span>
    );
  }
  return <span className="text-xs font-medium text-geora-black/30">—</span>;
}

export default function ClientsPanel({ clients, properties, onAddClient, onEditClient, onDeleteClient, onStartChat, onPublishSearch }: ClientsPanelProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [matchesContact, setMatchesContact] = useState<{
    id?: string;
    name: string;
    searchParams: SearchParams;
  } | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | ClientRole>("ALL");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, sortBy]);

  const filtered = useMemo(() => {
    let list = clients;
    if (roleFilter !== "ALL") list = list.filter((c) => c.role === roleFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q)
      );
    }
    if (sortBy === "name") {
      list = [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    return list;
  }, [clients, roleFilter, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageClients = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openNewModal = () => { setEditingClient(null); setIsModalOpen(true); };
  const openEditModal = (client: ClientData) => { setEditingClient(client); setIsModalOpen(true); };

  // Al guardar un comprador/arrendador con parámetros, corremos el match interno.
  const handleSave = async (data: Partial<ClientData>) => {
    const saved = editingClient
      ? await onEditClient(editingClient.id, data)
      : await onAddClient(data);
    setIsModalOpen(false);

    const isSearcher = data.role === "BUYER" || data.role === "RENTER";
    if (isSearcher && hasSearchParams(data.searchParams)) {
      setMatchesContact({
        id: saved?.id || editingClient?.id,
        name: data.name || "Contacto",
        searchParams: data.searchParams as SearchParams,
      });
    }
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-2 md:px-6">
        <div className="flex items-center gap-3">
          <div className="bg-geora-black/5 p-2.5 rounded-2xl">
            <Users size={24} className="text-geora-black/80" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-geora-black/90 tracking-tight">Mis Clientes</h2>
            <p className="text-sm font-medium text-geora-black/50">Gestioná tu cartera y publicá búsquedas</p>
          </div>
        </div>
        <button onClick={openNewModal} className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-geora-black text-white text-sm font-bold shadow-lg hover:bg-geora-black/80 transition-all hover:-translate-y-0.5 cursor-pointer">
          <Plus size={18} /> Agregar Cliente
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-geora-black/10 rounded-[30px] mx-2 md:mx-6 bg-white/30 backdrop-blur-sm">
          <Users size={32} className="mx-auto text-geora-black/30 mb-4" />
          <p className="text-geora-black/60 font-bold text-lg">Aún no tenés clientes registrados.</p>
        </div>
      ) : (
        <div className="px-2 md:px-6">
          {/* Barra de búsqueda + orden */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-geora-black/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, email o teléfono..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-geora-black/30 shadow-sm"
              />
            </div>
            <CustomDropdown
              label={SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Ordenar"}
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={(v) => setSortBy(v as "recent" | "name")}
              variant="white"
            />
          </div>

          {/* Tabs de filtro por rol */}
          <div className="flex flex-wrap gap-2 mb-5">
            {ROLE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setRoleFilter(f.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  roleFilter === f.value
                    ? "bg-geora-black text-white border-geora-black shadow-sm"
                    : "bg-white text-geora-black/70 border-gray-200 hover:border-geora-black/40"
                }`}
              >
                {f.value !== "ALL" && (
                  <span className={`w-2 h-2 rounded-full ${ROLE_DOT_COLORS[f.value]}`} />
                )}
                {f.label}
              </button>
            ))}
          </div>

          {/* Tabla */}
          {pageClients.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-geora-black/10 rounded-[24px] bg-white/30">
              <p className="text-geora-black/50 font-bold">No se encontraron contactos con ese filtro.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-visible">
              {pageClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => router.push(`/contacts/${client.id}`)}
                  className="flex items-center gap-4 px-4 sm:px-5 py-4 hover:bg-gray-50/80 transition-colors cursor-pointer border-b border-gray-100 last:border-0 first:rounded-t-[24px] last:rounded-b-[24px]"
                >
                  <Avatar name={client.name} />

                  <div className="w-36 sm:w-44 shrink-0 min-w-0">
                    <p className="font-bold text-sm text-geora-black truncate">{client.name}</p>
                    <Badge variant={ROLE_BADGE_VARIANTS[client.role]} className="mt-1">
                      {ROLE_LABELS[client.role]}
                    </Badge>
                  </div>

                  <div className="w-40 shrink-0 min-w-0 hidden md:block">
                    {locationFor(client) && (
                      <p className="flex items-center gap-1 text-xs text-geora-black/60 truncate">
                        <MapPin size={11} className="shrink-0" /> {locationFor(client)}
                      </p>
                    )}
                    {client.phone && (
                      <p className="flex items-center gap-1 text-xs text-geora-black/60 truncate mt-0.5">
                        <Phone size={11} className="shrink-0" /> {client.phone}
                      </p>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 hidden lg:block">
                    <p className="text-xs text-geora-black/50 truncate">{summaryFor(client)}</p>
                  </div>

                  <div className="w-32 shrink-0 hidden sm:block">
                    <StatusCell client={client} />
                  </div>

                  <div onClick={(e) => e.stopPropagation()} className="shrink-0 ml-auto">
                    <KebabMenu
                      items={[
                        {
                          label: "Ver perfil",
                          icon: UserCircle2,
                          onClick: () => router.push(`/contacts/${client.id}`),
                        },
                        {
                          label: "Editar",
                          icon: Edit2,
                          onClick: () => openEditModal(client),
                        },
                        {
                          label: "Chat interno",
                          icon: MessageSquare,
                          disabled: client.georaStatus !== "CONNECTED",
                          onClick: () => onStartChat(client.id),
                        },
                        ...(client.role === "BUYER" || client.role === "RENTER"
                          ? [
                              {
                                label: "Publicar búsqueda",
                                icon: Network,
                                onClick: () => onPublishSearch(client.id),
                              },
                            ]
                          : []),
                        {
                          label: "Eliminar",
                          icon: Trash2,
                          danger: true,
                          onClick: () => onDeleteClient(client.id),
                        },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-6" />
        </div>
      )}

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        client={editingClient}
        properties={properties}
        onSave={handleSave}
      />

      {matchesContact && (
        <MatchesModal
          contact={matchesContact}
          onClose={() => setMatchesContact(null)}
          onPublish={(id) => {
            setMatchesContact(null);
            if (id) onPublishSearch(id);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Coincidencias del contacto contra el stock propio (Flujo 4)
// ---------------------------------------------------------------------------
function MatchesModal({
  contact,
  onClose,
  onPublish,
}: {
  contact: { id?: string; name: string; searchParams: SearchParams };
  onClose: () => void;
  onPublish: (id?: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/clients/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ searchParams: contact.searchParams }),
        });
        const data = await res.json();
        if (active) setMatches(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        if (active) setMatches([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [contact]);

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-0 md:pt-20 md:px-6 md:pb-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full h-full max-w-none rounded-none md:max-w-lg md:h-[78vh] md:rounded-3xl bg-white flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-black text-geora-black flex items-center gap-2">
              <Sparkles size={18} className="text-geora-emerald" /> Coincidencias
            </h2>
            <p className="text-xs font-medium text-geora-black/50">
              En tu stock, para {contact.name}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-geora-black/20 border-t-geora-black rounded-full animate-spin" />
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-bold text-geora-black/50 uppercase tracking-wider">
                {matches.length} {matches.length === 1 ? "propiedad tuya coincide" : "propiedades tuyas coinciden"}
              </p>
              {matches.map((p) => (
                <a
                  key={p.id}
                  href={`/property/${p.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-3 rounded-2xl border border-gray-200 hover:border-geora-black/30 transition-all"
                >
                  <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    {p.images?.[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{p.title}</h4>
                    <p className="flex items-center gap-1 text-xs text-geora-black/50">
                      <MapPin size={11} /> {PROPERTY_TYPE_LABELS[p.type] || p.type} · {p.city}
                    </p>
                    <p className="text-sm font-bold text-geora-black/70">{propMatchPrice(p)}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 size={28} className="mx-auto text-geora-black/30 mb-3" />
              <p className="text-geora-black/60 font-bold">
                No tenés propiedades en tu stock que coincidan.
              </p>
              <p className="text-sm text-geora-black/40 mt-2 mb-6">
                Publicá esta búsqueda en la Bolsa de Conexiones para que otras inmobiliarias respondan.
              </p>
              <button
                onClick={() => onPublish(contact.id)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-geora-black text-white text-sm font-bold hover:bg-geora-black/80 transition-all cursor-pointer"
              >
                <Network size={16} /> Publicar en Bolsa de Conexiones
              </button>
            </div>
          )}
        </div>

        {!loading && matches.length > 0 && (
          <div className="px-8 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between gap-3">
            <span className="text-xs text-geora-black/50 font-medium">
              ¿No alcanza con tu stock?
            </span>
            <button
              onClick={() => onPublish(contact.id)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-geora-black/10 text-geora-black text-sm font-bold hover:bg-gray-50 transition-all cursor-pointer"
            >
              <Network size={15} /> Publicar en la Bolsa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
