"use client";

export const dynamic = "force-dynamic";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { Mail, Phone, Building2, Clock, CheckCheck, Inbox, BarChart3, Home, MessageSquare, Bell } from "lucide-react";

import CreatePropertyModal from "@/components/dashboard/CreatePropertyModal";
import EditPropertyModal from "@/components/dashboard/EditPropertyModal";
import ChatPanel from "@/components/chat/ChatPanel";
import { useChatThreads } from "@/hooks/useChatThreads";

export type PropertySummary = {
  id: number;
  title: string;
  description?: string;
  price?: number;
  city?: string;
  province?: string;
  address?: string;
  isAvailable?: boolean;
  status?: "AVAILABLE" | "RESERVED" | "SOLD" | "RENTED" | "PAUSED";
  operationType?: "SALE" | "RENT" | "SALE_RENT";
  type?: string | null;
  images?: string[];
  area?: number;
  rooms?: number;
  bathrooms?: number;
  propertySubtype?: string | null;
  youtubeUrl?: string | null;
  tour360Url?: string | null;
  isPriceHidden?: boolean;
  featureGroups?: Record<string, Record<string, boolean>> | null;
  RealEstateAgency?: { name: string; phone?: string };
  latitude?: number | null;
  longitude?: number | null;
  parcelCCA?: string | null;
  parcelPDA?: string | null;
  parcelGeom?: unknown;
};

type ProfileData = {
  role?: string;
  email?: string;
  name?: string;
  firstName?: string | null;
  lastName?: string | null;
  agencyData?: { 
    name?: string | null; 
    slug?: string | null; 
    logoUrl?: string | null; 
    properties?: PropertySummary[] | null 
  };
  properties?: PropertySummary[] | null;
};

type ActiveTab = "properties" | "statistics" | "inquiries" | "chat";

const deleteProperty = async (id: string | number) => {
  const res = await fetch(`/api/property/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Error al eliminar la propiedad");
  }
  return res.json();
};

const mockViews = [
  { name: "Ene", views: 200 }, { name: "Feb", views: 250 }, { name: "Mar", views: 180 },
  { name: "Abr", views: 220 }, { name: "May", views: 190 }, { name: "Jun", views: 240 },
  { name: "Jul", views: 280 },
];

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, isLoading }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-urbik-rose/10 rounded-full">
            <span className="text-urbik-rose text-xl font-bold">!</span>
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-gray-50">
          <button onClick={onClose} disabled={isLoading} className="flex-1 cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-urbik-black/70 hover:border-urbik-white rounded-full hover:bg-urbik-black/70 hover:text-urbik-white disabled:opacity-50 transition-all">Cancelar</button>
          <button onClick={onConfirm} disabled={isLoading} className="flex-1 cursor-pointer px-4 py-2 text-sm font-medium border border-urbik-white text-white bg-urbik-rose rounded-full hover:bg-urbik-white hover:text-urbik-rose hover:border-urbik-rose disabled:opacity-50 flex justify-center items-center transition-all">
            {isLoading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InquiriesPanel({ onRead }: { onRead?: () => void }) {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [markingId, setMarkingId] = useState<number | null>(null);

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/inquiries");
      if (!res.ok) throw new Error("Error al cargar consultas");
      setInquiries(await res.json());
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  async function markAsRead(id: number) {
    setMarkingId(id);
    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Error");
      setInquiries((prev) => prev.map((inq) => inq.id === id ? { ...inq, status: "READ" } : inq));
      onRead?.();
    } catch (err) { console.error(err); } finally { setMarkingId(null); }
  }

  const unreadCount = inquiries.filter((i) => i.status === "UNREAD").length;

  if (isLoading) return <div className="space-y-3 mt-4">{[1, 2, 3].map((n) => <div key={n} className="h-20 rounded-xl bg-gray-100 animate-pulse border border-gray-100" />)}</div>;

  if (inquiries.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm mt-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Inbox size={28} className="text-gray-400" /></div>
      <h3 className="text-base font-bold text-urbik-black/60">No tenés consultas por el momento.</h3>
    </div>
  );

  return (
    <div className="mt-4">
      {unreadCount > 0 && <p className="text-xs font-bold text-urbik-muted mb-3 ml-1">{unreadCount} consulta(s) sin leer</p>}
      <div className="space-y-2">
        {inquiries.map((inq) => {
          const isExpanded = expandedId === inq.id;
          const isUnread = inq.status === "UNREAD";
          return (
            <div key={inq.id} className={`rounded-xl border transition-all cursor-pointer ${isUnread ? "border-urbik-cyan/40 bg-urbik-cyan/5" : "border-gray-100 bg-white"} hover:shadow-sm`} onClick={() => { setExpandedId(isExpanded ? null : inq.id); if (!isExpanded && isUnread) markAsRead(inq.id); }}>
              <div className="p-4 flex items-start gap-4">
                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black text-sm ${isUnread ? "bg-urbik-black text-urbik-cyan" : "bg-gray-100 text-gray-500"}`}>{inq.senderName.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-urbik-black">{inq.senderName}</span>
                      {isUnread ? <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-urbik-cyan text-urbik-dark">Nuevo</span> : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-500"><CheckCheck size={10} /> Leído</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Building2 size={11} className="text-urbik-emerald shrink-0" />
                    <span className="text-xs text-urbik-muted font-medium truncate">{inq.property.title}</span>
                  </div>
                  {!isExpanded && <p className="text-xs text-gray-500 mt-1.5 line-clamp-1 font-medium">{inq.message}</p>}
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 pb-5 space-y-4" onClick={(e) => e.stopPropagation()}>
                  <div className="h-px bg-gray-100" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="bg-white p-1.5 rounded-full border border-gray-200"><Mail size={14} className="text-urbik-dark" /></div>
                      <div><p className="text-[10px] font-bold text-urbik-muted uppercase">Email</p><a href={`mailto:${inq.senderEmail}`} className="text-xs font-bold text-urbik-black hover:text-urbik-emerald transition-colors">{inq.senderEmail}</a></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="bg-white p-1.5 rounded-full border border-gray-200"><Phone size={14} className="text-urbik-dark" /></div>
                      <div><p className="text-[10px] font-bold text-urbik-muted uppercase">Teléfono</p><a href={`tel:${inq.senderPhone}`} className="text-xs font-bold text-urbik-black hover:text-urbik-emerald transition-colors">{inq.senderPhone}</a></div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-bold text-urbik-muted uppercase mb-2">Mensaje</p>
                    <p className="text-sm text-urbik-black leading-relaxed whitespace-pre-wrap">{inq.message}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardMain({ properties, onRefresh, autoOpenCreate = false }: { properties: PropertySummary[]; onRefresh: () => void; autoOpenCreate?: boolean; }) {
  const router = useRouter();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [editingProperty, setEditingProperty] = useState<PropertySummary | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("properties");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { if (autoOpenCreate) setCreateOpen(true); }, [autoOpenCreate]);
  useEffect(() => { fetch("/api/inquiries").then((r) => r.json()).then((data) => { if (Array.isArray(data)) setUnreadCount(data.filter((i) => i.status === "UNREAD").length); }).catch(() => {}); }, []);

  const { totalUnread: unreadChatCount } = useChatThreads();
  const mostViewed = useMemo(() => properties[0] ?? null, [properties]);
  const lastMonthViews = useMemo(() => mockViews.reduce((acc, x) => acc + x.views, 0), []);

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteProperty(deletingId);
      onRefresh();
      setIsModalOpen(false);
    } catch (error: any) { alert(error.message || "Error al eliminar"); } finally { setDeletingId(null); }
  };

  const tabs: ActiveTab[] = ["properties", "statistics", "inquiries", "chat"];
  const activeIndex = tabs.indexOf(activeTab);

  return (
    <div className="pb-28">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 mt-0 sm:mt-5">
        <h1 className="text-2xl font-black text-urbik-black">
          {activeTab === "properties" && "Mis Propiedades"}
          {activeTab === "statistics" && "Estadísticas"}
          {activeTab === "inquiries" && "Consultas Recibidas"}
          {activeTab === "chat" && "Mensajes"}
        </h1>
        {activeTab === "properties" && (
          <div className="flex items-center gap-2 justify-end">
            <button onClick={() => setCreateOpen(true)} className="bg-urbik-cyan text-urbik-black/80 py-3 px-6 rounded-full border border-white font-black text-md hover:bg-urbik-white hover:border-urbik-cyan cursor-pointer hover:text-urbik-cyan transition-all shadow-cyan-500/20 transform active:scale-95">Cargar propiedad</button>
          </div>
        )}
      </div>

      <div className="w-full">
        {activeTab === "chat" && (
          <div className="h-[70vh]">
            <ChatPanel />
          </div>
        )}

        {activeTab === "inquiries" && (
          <InquiriesPanel onRead={() => setUnreadCount((n) => Math.max(0, n - 1))} />
        )}

        {activeTab === "properties" && (
          <div className=" overflow-hidden rounded-xl">
            <div className="p-2 sm:p-4">
              {properties.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center">
                  <h3 className="text-lg font-bold text-gray-900">Aún no hay propiedades</h3>
                  <p className="text-gray-500 max-w-sm mt-2">Cargá tu primera propiedad usando el botón de arriba.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-md text-urbik-black/50 font-bold tracking-wider border-b border-gray-200">
                        <th className="px-7 py-5">Propiedad</th>
                        <th className="px-7 py-5">Precio</th>
                        <th className="px-10 py-5">Estado</th>
                        <th className="px-6 py-5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                      {properties.map((prop) => (
                        <tr key={prop.id} onClick={() => router.push(`/property/${prop.id}`)} className="group hover:bg-gray-50 transition-colors cursor-pointer">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 rounded-sm bg-gray-200 overflow-hidden shrink-0 border border-gray-200">
                                {prop.images && prop.images.length > 0 ? <img src={prop.images[0]} alt={prop.title} className="object-cover w-full h-full" /> : <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs font-bold">URBIK</div>}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 truncate max-w-[220px]"><Link href={`/property/${prop.id}`}>{prop.title}</Link></div>
                                <div className="text-xs text-gray-500 mt-0.5">{prop.city ?? "—"}, {prop.province ?? "—"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">{prop.price ? `USD ${prop.price.toLocaleString("es-AR")}` : <span className="text-gray-400">—</span>}</td>
                          <td className="px-6 py-4">
                            {prop.status === "AVAILABLE" ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-urbik-emerald border border-emerald-100"><span className="w-1.5 h-1.5 rounded-full bg-urbik-emerald"></span>Activa</span> : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-500 border border-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>Pausada</span>}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                              <Link href={`/property/${prop.id}`} target="_blank" onClick={(e) => e.stopPropagation()} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-urbik-cyan text-urbik-cyan hover:text-white hover:border-white hover:bg-urbik-cyan transition-colors" title="Ver publicación">↗</Link>
                              <button onClick={(e) => { e.stopPropagation(); setEditingProperty(prop); }} className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full bg-white border border-urbik-emerald text-urbik-emerald hover:text-white hover:bg-urbik-emerald transition-colors" title="Editar">✎</button>
                              <button onClick={(e) => { e.stopPropagation(); setDeletingId(prop.id); setIsModalOpen(true); }} className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full bg-white border border-urbik-rose text-urbik-rose hover:text-white hover:bg-urbik-rose transition-colors" title="Eliminar">✕</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "statistics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="text-md font-bold text-urbik-black/60 ml-2">Rendimiento</div>
                <div className="text-3xl italic font-black text-urbik-black">Vistas</div>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={mockViews}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.16} />
                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip contentStyle={{ borderRadius: "14px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }} labelStyle={{ fontWeight: 800 }} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} dy={10} />
                    <Area type="monotone" dataKey="views" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="p-5 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">Total del último mes</span>
                <span className="text-2xl font-black text-gray-900">{lastMonthViews}</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100">
                <div className="text-md font-bold text-urbik-black/60 ml-2">Tendencia</div>
                <div className="text-2xl italic font-black text-urbik-black">Más vista</div>
              </div>
              <div className="flex-1 bg-gray-100 relative min-h-[200px]">
                {mostViewed?.images?.[0] ? <img src={mostViewed.images[0]} alt="Most viewed" className="object-cover w-full h-full absolute inset-0" /> : <div className="w-full h-full absolute inset-0 flex items-center justify-center text-gray-400 font-bold bg-gray-50">Sin imagen</div>}
              </div>
              <div className="p-5">
                <h3 className="font-black text-base leading-tight text-gray-900 line-clamp-2">{mostViewed?.title ?? "Aún no hay datos"}</h3>
                <p className="text-gray-500 text-xs mt-1 font-medium">{mostViewed?.city ?? "—"}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-lg font-black text-gray-900">{typeof mostViewed?.price === "number" ? `USD ${mostViewed.price.toLocaleString("es-AR")}` : "—"}</div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{mostViewed?.operationType ?? ""}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 p-0.5 rounded-full backdrop-blur-xl bg-white/50 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] w-[90vw] sm:w-max">
        <div className="relative grid grid-cols-4 w-full h-full items-center">
          <div 
            className="absolute top-0 bottom-0 left-0 w-1/4 bg-urbik-white1/70 backdrop-blur-3xl rounded-full shadow-md transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />

          <button 
            onClick={() => setActiveTab("properties")} 
            className={`relative z-10 flex items-center justify-center py-3 sm:py-3 sm:px-6 rounded-full transition-colors duration-300 cursor-pointer ${activeTab === "properties" ? "text-urbik-black/80" : "text-urbik-black/50 hover:text-urbik-black"}`}
          >
            <Home size={22} className="sm:hidden" />
            <span className="hidden sm:inline font-bold text-sm">Propiedades</span>
          </button>

          <button 
            onClick={() => setActiveTab("statistics")} 
            className={`relative z-10 flex items-center justify-center py-3 sm:py-2.5 sm:px-6 rounded-full transition-colors duration-300 cursor-pointer ${activeTab === "statistics" ? "text-urbik-black/80" : "text-urbik-black/50 hover:text-urbik-black"}`}
          >
            <BarChart3 size={22} className="sm:hidden" />
            <span className="hidden sm:inline font-bold text-sm">Estadísticas</span>
          </button>

          <button 
            onClick={() => setActiveTab("inquiries")} 
            className={`relative z-10 flex items-center justify-center py-3 sm:py-2.5 sm:px-6 rounded-full transition-colors duration-300 cursor-pointer ${activeTab === "inquiries" ? "text-urbik-black/80" : "text-urbik-black/50 hover:text-urbik-black"}`}
          >
            <div className="relative flex items-center justify-center">
              <Bell size={22} className="sm:hidden" />
              <span className="hidden sm:inline font-bold text-sm">Consultas</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 sm:-top-1 sm:-right-3 w-3 h-3 bg-red-500 rounded-full border-[2px] border-white shadow-sm" />
              )}
            </div>
          </button>

          <button 
            onClick={() => setActiveTab("chat")} 
            className={`relative z-10 flex items-center justify-center py-3 sm:py-2.5 sm:px-6 rounded-full transition-colors duration-300 cursor-pointer ${activeTab === "chat" ? "text-urbik-black/80" : "text-urbik-black/50 hover:text-urbik-black"}`}
          >
            <div className="relative flex items-center justify-center">
              <MessageSquare size={22} className="sm:hidden" />
              <span className="hidden sm:inline font-bold text-sm">Mensajes</span>
              {unreadChatCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 sm:-top-1 sm:-right-3 w-3 h-3 bg-urbik-cyan rounded-full border-[2px] border-white shadow-sm" />
              )}
            </div>
          </button>
        </div>
      </div>

      <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmDelete} title="¿Eliminar propiedad?" message="Esta acción es permanente y la propiedad dejará de estar visible." isLoading={deletingId !== null} />
      <CreatePropertyModal open={isCreateOpen} onClose={() => setCreateOpen(false)} onCreated={onRefresh} />

      {editingProperty && (
        <EditPropertyModal open={true} property={{ ...editingProperty, type: editingProperty.type || undefined, description: editingProperty.description || "", propertySubtype: editingProperty.propertySubtype || undefined, featureGroups: editingProperty.featureGroups || undefined, youtubeUrl: editingProperty.youtubeUrl || undefined, tour360Url: editingProperty.tour360Url || undefined }} onClose={() => setEditingProperty(null)} onUpdated={onRefresh} />
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const autoOpenCreate = searchParams.get("nueva") === "1";

  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user");
      
      if (!res.ok) {
        const errorData = await res.text();
        console.error("🚨 El backend devolvió un error:", res.status, errorData);
        throw new Error(`Falló la API con estado ${res.status}`);
      }

      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error("❌ Fallo en fetchProfile:", error);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus("authenticated");
        fetchProfile();
      } else {
        setStatus("unauthenticated");
      }
    });
  }, [supabase, fetchProfile]);

  const properties = useMemo(() => {
    if (!profile) return [] as PropertySummary[];
    if (profile.role === "REALESTATE") return profile.agencyData?.properties ?? profile.properties ?? [];
    return profile.properties ?? [];
  }, [profile]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-pulse text-gray-400 font-medium">Cargando Urbik...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="max-w-md rounded-md border border-gray-200 bg-gray-50 p-8 shadow-sm text-center">
          <h1 className="text-2xl font-black text-black">Iniciá sesión para ver tu panel</h1>
          <p className="mt-2 text-sm text-gray-500">Vas a poder ver estadísticas y cargar propiedades.</p>
          <button onClick={() => router.push("/auth/login")} className="mt-6 rounded-full cursor-pointer bg-urbik-black px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition">
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-0 sm:pt-15">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <DashboardMain properties={properties} onRefresh={fetchProfile} autoOpenCreate={autoOpenCreate} />
      </div>
    </div>
  );
}