"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  User, Bookmark, MapPin, Phone, Mail, Settings, ChevronDown, 
  Bell, MessageSquare, Inbox, CheckCheck, Building2 
} from "lucide-react";
import { ProfileData } from "@/app/(dashboard)/dashboard/page";
import { SecuritySection, PauseAccountZone, DangerZone } from "@/components/dashboard/AccountActions";
import FavoriteButton from "@/components/ui/FavoriteButton";
import ChatPanel from "@/components/chat/ChatPanel";
import { useChatThreads } from "@/hooks/useChatThreads";

type UserTab = "profile" | "saved" | "notifications" | "chat";

interface FavoriteProperty {
  id: string; title: string; type: string; operationType: string;
  price: number | null; currency?: string | null; images: string[];
  city: string; area?: number; rooms?: number; bathrooms?: number;
  address?: string; province?: string; latitude?: number; longitude?: number;
}

const glassCard = "md:rounded-[30px] rounded-3xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[30px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";

const getOperationLabel = (type: string) => {
  switch (type) {
    case "SALE": return "Venta";
    case "RENT": return "Alquiler";
    case "SALE_RENT": return "Venta y alquiler";
    case "TEMP_RENT": return "Temporal";
    default: return type;
  }
};

const getPropertyLabel = (type: string) => {
  switch (type) {
    case "HOUSE": return "CASA";
    case "APARTMENT": return "DPTO";
    case "PH": return "PH";
    case "LAND": return "TERRENO";
    case "COMMERCIAL_PROPERTY": return "LOCAL";
    case "OFFICE": return "OFICINA";
    case "FIELD": return "CAMPO";
    default: return type;
  }
};

type FeedItem =
  | { kind: "INQUIRY"; createdAt: string; data: any }
  | { kind: "NOTIFICATION"; createdAt: string; data: any };

function NotificationsPanel({ onRead, onChatStart }: { onRead?: () => void; onChatStart?: (threadId: string) => void; }) {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [inqRes, notifRes] = await Promise.all([
        fetch("/api/inquiries"),
        fetch("/api/notifications"),
      ]);
      const inqData = inqRes.ok ? await inqRes.json() : [];
      const notifData = notifRes.ok ? await notifRes.json() : [];
      setInquiries(Array.isArray(inqData) ? inqData : []);
      setNotifications(Array.isArray(notifData) ? notifData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function markInquiryAsRead(id: number) {
    try {
      await fetch(`/api/inquiries/${id}`, { method: "PATCH" });
      setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status: "READ" } : inq)));
      onRead?.();
    } catch (err) {
      console.error(err);
    }
  }

  async function markNotificationAsRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n)));
      onRead?.();
    } catch (err) {
      console.error(err);
    }
  }

  const [respondingId, setRespondingId] = useState<string | null>(null);
  async function respondConnection(id: string, action: "ACCEPT" | "REJECT") {
    setRespondingId(id);
    try {
      const res = await fetch(`/api/notifications/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo procesar");
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                status: "READ",
                title: action === "ACCEPT" ? "Conexión aceptada" : "Solicitud rechazada",
              }
            : n
        )
      );
      onRead?.();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRespondingId(null);
    }
  }

  const handleSendReply = async (inq: any) => {
    if (!replyMsg.trim()) return;
    setIsSendingReply(true);
    try {
      const res = await fetch(`/api/inquiries/${inq.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyMessage: replyMsg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReplyMsg("");
      setReplyingTo(null);
      onChatStart?.(data.threadId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSendingReply(false);
    }
  };

  const unreadCount = inquiries.filter((i) => i.status === "UNREAD").length + notifications.filter((n) => n.status === "UNREAD").length;

  const feed: FeedItem[] = [
    ...inquiries.map((i): FeedItem => ({ kind: "INQUIRY", createdAt: i.createdAt, data: i })),
    ...notifications.map((n): FeedItem => ({ kind: "NOTIFICATION", createdAt: n.createdAt, data: n })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading) return (
    <div className="space-y-3 mt-4">
      {[1, 2, 3].map((n) => <div key={n} className="h-20 rounded-xl bg-gray-100 animate-pulse border border-gray-100" />)}
    </div>
  );

  if (feed.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center mt-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Inbox size={28} className="text-gray-400" />
      </div>
      <h3 className="text-base font-bold text-geora-black/60">No tenés notificaciones por el momento.</h3>
    </div>
  );

  return (
    <div className="mt-4">
      {unreadCount > 0 && <p className="text-xs font-bold text-geora-muted mb-3 ml-1">{unreadCount} sin leer</p>}
      <div className="space-y-2">
        {feed.map((item) => {
          if (item.kind === "NOTIFICATION") {
            const n = item.data;
            const isUnread = n.status === "UNREAD";
            const isExpanded = expandedId === n.id;
            const isConnectionReq = n.type === "CONNECTION_REQUEST";
            const showActions = isConnectionReq && isUnread;
            return (
              <div key={`notif-${n.id}`} className={`rounded-xl border transition-all cursor-pointer ${isUnread ? "border-geora-rose/40 border-2 bg-white" : "border-white bg-white"} shadow-sm hover:scale-[1.01]`} onClick={() => { setExpandedId(isExpanded ? null : n.id); if (!isExpanded && isUnread && !isConnectionReq) markNotificationAsRead(n.id); }}>
                <div className="p-4 flex items-start gap-4">
                  <div className="bg-geora-rose/10 p-2 rounded-full shrink-0"><Bell size={16} className="text-geora-rose" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-geora-black">{n.title}</span>
                        {isUnread ? <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-geora-rose text-white">Sistema</span> : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-500"><CheckCheck size={10} /> Leído</span>}
                      </div>
                    </div>
                    <p className={`text-xs text-gray-600 mt-1.5 font-medium ${isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"}`}>{n.body}</p>

                    {showActions && (
                      <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          disabled={respondingId === n.id}
                          onClick={() => respondConnection(n.id, "ACCEPT")}
                          className="px-4 py-1.5 rounded-full bg-geora-black text-white text-xs font-bold hover:bg-geora-black/80 transition-all disabled:opacity-50"
                        >
                          Aceptar
                        </button>
                        <button
                          disabled={respondingId === n.id}
                          onClick={() => respondConnection(n.id, "REJECT")}
                          className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-geora-black/70 text-xs font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          const inq = item.data;
          const isExpanded = expandedId === inq.id;
          const isUnread = inq.status === "UNREAD";
          return (
            <div key={`inq-${inq.id}`} className={`rounded-xl border transition-all cursor-pointer ${isUnread ? "border-geora-black/30 border-2 bg-white" : "border-white bg-white"} shadow-sm hover:scale-[1.01]`} onClick={() => { setExpandedId(isExpanded ? null : inq.id); if (!isExpanded && isUnread) markInquiryAsRead(inq.id); }}>
              <div className="p-4 flex items-start gap-4">
                <div className="bg-geora-cyan/15 p-2 rounded-full shrink-0"><Mail size={16} className="text-geora-cyan" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-geora-black">{inq.senderName}</span>
                      {isUnread ? <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-geora-cyan text-geora-dark">Consulta</span> : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-500"><CheckCheck size={10} /> Leído</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Building2 size={11} className="text-geora-emerald shrink-0" />
                    <span className="text-xs text-geora-muted font-medium truncate">{inq.property.title}</span>
                  </div>
                  {!isExpanded && <p className="text-xs text-gray-500 mt-1.5 line-clamp-1 font-medium">{inq.message}</p>}
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 pb-5 space-y-4" onClick={(e) => e.stopPropagation()}>
                  <div className="h-px bg-gray-100" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3">
                      <div className="bg-white p-1.5 rounded-full border border-gray-200"><Mail size={14} className="text-geora-dark" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-geora-muted uppercase">Email</p>
                        <a href={`mailto:${inq.senderEmail}`} className="text-xs font-bold text-geora-black hover:text-geora-emerald transition-colors">{inq.senderEmail}</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3">
                      <div className="bg-white p-1.5 rounded-full border border-gray-200"><Phone size={14} className="text-geora-dark" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-geora-muted uppercase">Teléfono</p>
                        <a href={`tel:${inq.senderPhone}`} className="text-xs font-bold text-geora-black hover:text-geora-emerald transition-colors">{inq.senderPhone}</a>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-geora-muted uppercase mb-2">Mensaje original</p>
                    <p className="text-sm text-geora-black leading-relaxed whitespace-pre-wrap">{inq.message}</p>
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

export default function DashboardUser({ profile, onRefresh }: { profile: ProfileData | null; onRefresh: () => void; }) {
  const [activeTab, setActiveTab] = useState<UserTab>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [targetThreadId, setTargetThreadId] = useState<string | null>(null);

  const { totalUnread: unreadChatCount } = useChatThreads();

  const [formData, setFormData] = useState({
    firstName: profile?.firstName || profile?.name || "",
    lastName: profile?.lastName || "",
    phone: profile?.phone || "",
    city: profile?.city || "",
    province: profile?.province || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          city: formData.city,
          province: formData.province,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }
      setSaveMessage({ type: "success", text: "¡Cambios guardados!" });
      onRefresh();
    } catch (err) {
      setSaveMessage({ type: "error", text: err instanceof Error ? err.message : "Error al guardar" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3500);
    }
  };

  const fetchFavorites = useCallback(async () => {
    try {
      setLoadingFavorites(true);
      const res = await fetch("/api/properties/favorites");
      if (res.ok) setFavorites(await res.json());
    } catch {
      console.error("Error cargando favoritos");
    } finally {
      setLoadingFavorites(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "saved" && favorites.length === 0) fetchFavorites();
  }, [activeTab, favorites.length, fetchFavorites]);

  useEffect(() => {
    Promise.all([
      fetch("/api/inquiries").then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch("/api/notifications").then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([inq, notif]) => {
      const inqUnread = Array.isArray(inq) ? inq.filter((i: any) => i.status === "UNREAD").length : 0;
      const notifUnread = Array.isArray(notif) ? notif.filter((n: any) => n.status === "UNREAD").length : 0;
      setUnreadCount(inqUnread + notifUnread);
    });
  }, []);

  const getTransformIndex = () => {
    switch (activeTab) {
      case "profile": return 0;
      case "saved": return 1;
      case "notifications": return 2;
      case "chat": return 3;
      default: return 0;
    }
  };

  return (
    <div className="pb-28">
      {activeTab === "profile" ? (
        <div className="flex items-center gap-6 mb-10 ml-2 md:ml-6 mt-0 sm:mt-5 animate-fade-in">
          <div className="w-20 h-20 bg-geora-black text-white rounded-full flex items-center justify-center text-2xl font-black">
            {formData.firstName.charAt(0).toUpperCase() || <User size={32} />}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-geora-black/90 uppercase tracking-tighter">
              Hola, {formData.firstName || "Usuario"}
            </h1>
            <p className="flex items-center gap-2 text-geora-black/60 font-medium mt-1">
              <Mail size={14} /> {profile?.email}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row md:items-center ml-2 md:ml-6 md:justify-between gap-4 mb-6 mt-0 sm:mt-5 animate-fade-in">
          <h1 className="text-2xl font-black text-geora-black uppercase tracking-tight">
            {activeTab === "saved" && "Tus Propiedades Guardadas"}
            {activeTab === "notifications" && "Notificaciones"}
            {activeTab === "chat" && "Tus Mensajes"}
          </h1>
        </div>
      )}

      <div className="w-full">
        <div className={activeTab === "chat" ? "block h-[70vh]" : "hidden"}>
          <ChatPanel />
        </div>

        <div className={activeTab === "notifications" ? "block" : "hidden"}>
          <NotificationsPanel
            onRead={() => setUnreadCount((n) => Math.max(0, n - 1))}
            onChatStart={(threadId) => {
              setTargetThreadId(threadId);
              setActiveTab("chat");
            }}
          />
        </div>

        <div className={activeTab === "profile" ? "block w-full mx-auto" : "hidden"}>
          <div className="mb-20">
            <h2 className="text-xl font-black text-geora-black/90 mb-6 uppercase tracking-tight border-b border-black/10 pb-4">
              Información Básica
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-geora-black/90 uppercase mb-2 ml-2">Nombre</label>
                <input 
                  type="text" name="firstName" value={formData.firstName} onChange={handleChange} 
                  className="w-full border border-white bg-white/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-geora-black/20 shadow-sm transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-geora-black/90 uppercase mb-2 ml-2">Apellido</label>
                <input 
                  type="text" name="lastName" value={formData.lastName} onChange={handleChange} 
                  className="w-full border border-white bg-white/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-geora-black/20 shadow-sm transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-geora-black/90 uppercase mb-2 ml-2 flex items-center gap-1"><Phone size={12}/> Teléfono</label>
                <input 
                  type="text" name="phone" value={formData.phone} onChange={handleChange} 
                  className="w-full border border-white bg-white/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-geora-black/20 shadow-sm transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-geora-black/90 uppercase mb-2 ml-2 flex items-center gap-1"><MapPin size={12}/> Ciudad</label>
                <input 
                  type="text" name="city" value={formData.city} onChange={handleChange} 
                  className="w-full border border-white bg-white/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-geora-black/20 shadow-sm transition-all" 
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col items-end gap-2">
              {saveMessage && (
                <p className={`text-xs font-bold ${saveMessage.type === "success" ? "text-green-600" : "text-red-500"}`}>
                  {saveMessage.text}
                </p>
              )}
              <button
                onClick={handleSaveProfile} disabled={isSaving}
                className="px-8 py-3 cursor-pointer rounded-full text-sm font-bold text-white bg-geora-black hover:opacity-90 transition shadow-md disabled:opacity-50"
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>

          {profile?.id && (
            <div className="mt-6 flex flex-col items-center w-full">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/40 border border-black/10 backdrop-blur-md shadow-sm text-sm font-bold text-geora-black/80 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
              >
                <Settings size={16} className={`transition-transform duration-500 ${showSettings ? "rotate-90 text-geora-rose" : ""}`} />
                {showSettings ? "Ocultar Ajustes Avanzados" : "Configuración Avanzada de Cuenta"}
                <ChevronDown size={16} className={`transition-transform duration-300 ${showSettings ? "rotate-180" : ""}`} />
              </button>

              <div className={`w-full transition-all duration-500 overflow-hidden ${showSettings ? "max-h-[1000px] opacity-100 mt-8 space-y-6" : "max-h-0 opacity-0 pointer-events-none"}`}>
                <SecuritySection />
                <PauseAccountZone isPaused={profile.isActive === false} userId={profile.id} onToggleSuccess={onRefresh} />
                <DangerZone itemName="tu cuenta" userId={profile.id} />
              </div>
            </div>
          )}
        </div>

        <div className={activeTab === "saved" ? "block w-full" : "hidden"}>
          {loadingFavorites ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className={`bg-geora-g200 h-96 ${glassCard}`} />)}
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-geora-g200 rounded-3xl mx-2">
              <Bookmark size={40} className="mx-auto text-geora-g400 mb-4" />
              <p className="text-geora-muted font-bold text-lg">Todavía no guardaste ninguna propiedad.</p>
              <Link href="/" className="text-geora-black font-bold underline mt-4 block">Explorar propiedades</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-15">
              {favorites.map((prop, index) => (
                <div key={prop.id} className={`group flex flex-col gap-4 p-4 cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] animate-fade-in-up relative h-full ${glassCard}`} style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}>
                  <Link href={`/property/${prop.id}`} className="absolute inset-0 z-10" />
                  <div className="absolute top-6 right-6 z-20">
                    <FavoriteButton propertyId={prop.id} initialIsFavorite={true} small={true} />
                  </div>
                  <div className="relative h-64 md:h-72 w-full overflow-hidden rounded-t-2xl bg-geora-g200">
                    <Image src={prop.images[0] || "/placeholder-property.jpg"} alt={prop.title} fill className="object-cover transition duration-700 group-hover:scale-105 [mask-image:linear-gradient(to_bottom,black_52%,transparent_95%)] [-webkit-mask-image:linear-gradient(to_bottom,black_52%,transparent_95%)]" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between min-w-0 z-10">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/20 bg-geora-black/80 px-3 py-1 text-xs font-bold text-white uppercase shadow-sm z-1">{getPropertyLabel(prop.type)}</span>
                        <span className="rounded-full border border-white/20 bg-geora-black/80 px-3 py-1 text-xs font-bold text-white uppercase shadow-sm z-1">{getOperationLabel(prop.operationType)}</span>
                      </div>
                      <h3 className="line-clamp-2 text-base font-black tracking-tight text-geora-black uppercase">{prop.title}</h3>
                      <p className="mt-2 flex items-center gap-1 truncate text-xs font-semibold text-geora-black/80">
                        <MapPin size={12} className="shrink-0 text-geora-cyan" strokeWidth={3} /> {prop.address ? `${prop.address}, ` : ''}{prop.city}
                      </p>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-white/60 pt-4">
                      <span className="text-base font-black tracking-tight text-geora-black/70 z-1">
                        {prop.currency === 'USD' ? 'USD' : '$'} {prop.price?.toLocaleString("es-AR") ?? "Consultar"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 p-0.5 rounded-full backdrop-blur-xl bg-white/50 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] w-[95vw] sm:w-max">
        <div className="relative grid grid-cols-4 w-full h-full items-center">
          <div
            className="absolute top-0 bottom-0 left-0 w-1/4 bg-geora-white1/70 backdrop-blur-3xl rounded-full shadow-md transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${getTransformIndex() * 100}%)` }}
          />

          <button onClick={() => setActiveTab("profile")} className={`relative z-10 flex items-center justify-center py-3 sm:py-3 sm:px-6 rounded-full transition-colors duration-300 cursor-pointer ${activeTab === "profile" ? "text-geora-black/80" : "text-geora-black/50 hover:text-geora-black"}`}>
            <User size={22} className="sm:hidden" />
            <span className="hidden sm:inline font-bold text-sm">Mi Perfil</span>
          </button>

          <button onClick={() => setActiveTab("saved")} className={`relative z-10 flex items-center justify-center py-3 sm:py-2.5 sm:px-6 rounded-full transition-colors duration-300 cursor-pointer ${activeTab === "saved" ? "text-geora-black/80" : "text-geora-black/50 hover:text-geora-black"}`}>
            <Bookmark size={22} className="sm:hidden" />
            <span className="hidden sm:inline font-bold text-sm">Guardados</span>
          </button>

          <button onClick={() => setActiveTab("notifications")} className={`relative z-10 flex items-center justify-center py-3 sm:py-2.5 sm:px-6 rounded-full transition-colors duration-300 cursor-pointer ${activeTab === "notifications" ? "text-geora-black/80" : "text-geora-black/50 hover:text-geora-black"}`}>
            <div className="relative flex items-center justify-center">
              <Bell size={22} className="sm:hidden" />
              <span className="hidden sm:inline font-bold text-sm">Notificaciones</span>
              {unreadCount > 0 && <span className="absolute -top-1.5 -right-2.5 sm:-top-1 sm:-right-3 w-3 h-3 bg-red-500 rounded-full border-[2px] border-white shadow-sm" />}
            </div>
          </button>

          <button onClick={() => setActiveTab("chat")} className={`relative z-10 flex items-center justify-center py-3 sm:py-2.5 sm:px-6 rounded-full transition-colors duration-300 cursor-pointer ${activeTab === "chat" ? "text-geora-black/80" : "text-geora-black/50 hover:text-geora-black"}`}>
            <div className="relative flex items-center justify-center">
              <MessageSquare size={22} className="sm:hidden" />
              <span className="hidden sm:inline font-bold text-sm">Mensajes</span>
              {unreadChatCount > 0 && <span className="absolute -top-1.5 -right-2.5 sm:-top-1 sm:-right-3 w-3 h-3 bg-geora-cyan rounded-full border-[2px] border-white shadow-sm" />}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}