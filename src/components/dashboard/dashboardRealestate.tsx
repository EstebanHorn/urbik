"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  Building2,
  CheckCheck,
  Inbox,
  BarChart3,
  Home,
  MessageSquare,
  Bell,
  MapPin,
  Camera,
  Edit2,
  X,
  Share2,
  Bookmark,
  Info,
  Settings,
  ChevronDown,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
} from "lucide-react";

import CreatePropertyModal from "@/components/dashboard/CreatePropertyModal";
import EditPropertyModal from "@/components/dashboard/EditPropertyModal";
import StatsPanel from "@/components/dashboard/stats/StatsPanel";
import ChatPanel from "@/components/chat/ChatPanel";
import { useChatThreads } from "@/hooks/useChatThreads";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import PriceFilterCard from "@/components/search/PriceFilterCard";
import RoomsFilterCard from "@/components/search/RoomsFilterCard";
import ClientsPanel from "@/components/dashboard/ClientsPanel";
import { Users } from "lucide-react"; 
import {
  SecuritySection,
  DangerZone,
  PauseAccountZone,
} from "@/components/dashboard/AccountActions";

import LocationSelectors from "@/components/ui/LocationSelectors";
import ImageUpload from "@/components/ui/ImageUpload";
import RealEstateReviews from "@/components/realestate/RealEstateReviews";
import { ProfileData, PropertySummary } from "@/app/(dashboard)/dashboard/page";

const glassCard =
  "md:rounded-[30px] rounded-3xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[30px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";

const PROPERTY_LABELS: Record<string, string> = {
  HOUSE: "Casa",
  APARTMENT: "Departamento",
  PH: "PH",
  COUNTRY: "Country",
  LAND: "Terreno",
  FIELD: "Campo",
  COMMERCIAL_PROPERTY: "Local Comercial",
  OFFICE: "Oficina",
};

const OPERATION_LABELS: Record<string, string> = {
  SALE: "Venta",
  RENT: "Alquiler",
  TEMP_RENT: "Temporal",
  SALE_RENT: "Venta y alquiler",
};

const getOperationLabel = (type: string) => {
  switch (type) {
    case "SALE":
      return "Venta";
    case "RENT":
      return "Alquiler";
    case "SALE_RENT":
      return "Venta y alquiler";
    default:
      return type;
  }
};

const getPropertyLabel = (type: string) => {
  switch (type) {
    case "HOUSE":
      return "CASA";
    case "APARTMENT":
      return "DPTO";
    case "LAND":
      return "TERRENO";
    case "COMMERCIAL_PROPERTY":
      return "LOCAL";
    case "OFFICE":
      return "OFICINA";
    default:
      return type;
  }
};

function formatPrice(price?: number | null, currency?: string | null): string {
  if (!price) return "Consultar";
  const symbol = currency === "ARS" ? "$" : "USD";
  return `${symbol} ${price.toLocaleString("es-AR")}`;
}

const deleteProperty = async (id: string | number) => {
  const res = await fetch(`/api/property/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Error al eliminar la propiedad");
  }
  return res.json();
};

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
}: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-geora-rose/10 rounded-full">
            <span className="text-geora-rose text-xl font-bold">!</span>
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-geora-black/70 hover:border-geora-white rounded-full hover:bg-geora-black/70 hover:text-geora-white disabled:opacity-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 cursor-pointer px-4 py-2 text-sm font-medium border border-geora-white text-white bg-geora-rose rounded-full hover:bg-geora-white hover:text-geora-rose hover:border-geora-rose disabled:opacity-50 flex justify-center items-center transition-all"
          >
            {isLoading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditAgencyProfileModal({
  isOpen,
  onClose,
  profile,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData | null;
  onSaved: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: profile?.agencyData?.name || profile?.name || "",
    bio: profile?.agencyData?.bio || profile?.bio || "",
    phone: profile?.phone || "",
    city: profile?.city || "",
    province: profile?.province || "",
    street: profile?.agencyData?.street || "",
    address: profile?.address || "",
    logoUrl: profile?.agencyData?.logoUrl || "",
  });

  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        name: profile.agencyData?.name || profile.name || "",
        bio: profile.agencyData?.bio || profile.bio || "",
        phone: profile.agencyData?.phone || profile.phone || "",
        city: profile.agencyData?.city || profile.city || "",
        province: profile.agencyData?.province || profile.province || "",
        street: profile?.agencyData?.street || profile.street || "",
        address: profile.agencyData?.address || profile.address || "",
        logoUrl: profile.agencyData?.logoUrl || "",
      });
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (urls: string[]) => {
    setFormData((prev) => ({
      ...prev,
      logoUrl: urls.length > 0 ? urls[0] : "",
    }));
  };

  const handleImageRemove = () => {
    setFormData((prev) => ({ ...prev, logoUrl: "" }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          phone: formData.phone,
          city: formData.city,
          province: formData.province,
          street: formData.street,
          address: formData.address,
          logoUrl: formData.logoUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al guardar");
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      setSaveError(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="max-w-lg w-full mt-20 overflow-hidden transform transition-all flex flex-col rounded-3xl bg-white/70 border border-white backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center bg-white/70 p-6">
          <h3 className="text-xl font-black text-geora-black/90">
            Editar Perfil Inmobiliaria
          </h3>
          <button
            onClick={onClose}
            className="p-2 transition hover:text-geora-black/70 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[65vh] custom-scrollbar">
          <div>
            <label className="block text-xs font-bold text-geora-black/90 uppercase -mb-3">
              Logo de la Inmobiliaria
            </label>
            <ImageUpload
              value={formData.logoUrl ? [formData.logoUrl] : []}
              onChange={handleImageChange}
              onRemove={handleImageRemove}
              maxFiles={1}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-geora-black/90 uppercase mb-1 ml-5">
              Nombre de la Inmobiliaria
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-white bg-white/30 rounded-full px-4 py-3 text-sm focus:outline-none shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-geora-black/90 uppercase mb-1 ml-5">
              Descripción / Biografía
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full border border-white bg-white/30 rounded-3xl px-4 py-3 text-sm focus:outline-none shadow-sm resize-none custom-scrollbar"
              placeholder="Contanos un poco sobre la inmobiliaria..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-geora-black/90 uppercase mb-1 ml-5">
              Teléfono
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-white bg-white/30 rounded-full px-4 py-3 text-sm focus:outline-none shadow-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-geora-black/90 uppercase mb-1 ml-5">
              Ubicación
            </label>
            <LocationSelectors
              provinceValue={formData.province}
              cityValue={formData.city}
              onChange={handleLocationChange}
              showLocality={false}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-geora-black/90 uppercase mb-1 ml-5">
              Calle
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="w-full border border-white bg-white/30 rounded-full px-4 py-3 text-sm focus:outline-none shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-geora-black/90 uppercase mb-1 ml-5">
              Número / Piso / Depto
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-white bg-white/30 rounded-full px-4 py-3 text-sm focus:outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="p-6 bg-white/30 border-t border-white/40 flex flex-col gap-3 backdrop-blur-md">
          {saveError && (
            <p className="text-xs font-bold text-red-500 text-center">
              {saveError}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5 cursor-pointer text-sm font-bold text-geora-black/70 transition hover:text-geora-black/50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 cursor-pointer rounded-full text-sm font-bold text-geora-black/70 hover:text-geora-black/50 bg-white/30 border border-black/10 transition shadow-md"
            >
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type FeedItem =
  | { kind: "INQUIRY"; createdAt: string; data: any }
  | { kind: "NOTIFICATION"; createdAt: string; data: any };

function NotificationsPanel({
  onRead,
  onChatStart,
}: {
  onRead?: () => void;
  onChatStart?: (threadId: string) => void;
}) {
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
      const res = await fetch(`/api/inquiries/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Error");
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: "READ" } : inq)),
      );
      onRead?.();
    } catch (err) {
      console.error(err);
    }
  }

  async function markNotificationAsRead(id: string) {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Error");
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n)),
      );
      onRead?.();
    } catch (err) {
      console.error(err);
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

  const unreadCount =
    inquiries.filter((i) => i.status === "UNREAD").length +
    notifications.filter((n) => n.status === "UNREAD").length;

  const feed: FeedItem[] = [
    ...inquiries.map(
      (i): FeedItem => ({ kind: "INQUIRY", createdAt: i.createdAt, data: i }),
    ),
    ...notifications.map(
      (n): FeedItem => ({
        kind: "NOTIFICATION",
        createdAt: n.createdAt,
        data: n,
      }),
    ),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (isLoading)
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

  if (feed.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center mt-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Inbox size={28} className="text-gray-400" />
        </div>
        <h3 className="text-base font-bold text-geora-black/60">
          No tenés notificaciones por el momento.
        </h3>
      </div>
    );

  return (
    <div className="mt-4">
      {unreadCount > 0 && (
        <p className="text-xs font-bold text-geora-muted mb-3 ml-1">
          {unreadCount} sin leer
        </p>
      )}
      <div className="space-y-2">
        {feed.map((item) => {
          if (item.kind === "NOTIFICATION") {
            const n = item.data;
            const isUnread = n.status === "UNREAD";
            const isExpanded = expandedId === n.id;
            return (
              <div
                key={`notif-${n.id}`}
                className={`rounded-xl border transition-all cursor-pointer ${isUnread ? "border-geora-rose/40 border-2 bg-white" : "border-white bg-white"} shadow-sm hover:scale-[1.01]`}
                onClick={() => {
                  setExpandedId(isExpanded ? null : n.id);
                  if (!isExpanded && isUnread) markNotificationAsRead(n.id);
                }}
              >
                <div className="p-4 flex items-start gap-4">
                  <div className="bg-geora-rose/10 p-2 rounded-full shrink-0">
                    <Bell size={16} className="text-geora-rose" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-geora-black">
                          {n.title}
                        </span>
                        {isUnread ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-geora-rose text-white">
                            Sistema
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-500">
                            <CheckCheck size={10} /> Leído
                          </span>
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-xs text-gray-600 mt-1.5 font-medium ${isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"}`}
                    >
                      {n.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          const inq = item.data;
          const isExpanded = expandedId === inq.id;
          const isUnread = inq.status === "UNREAD";
          return (
            <div
              key={`inq-${inq.id}`}
              className={`rounded-xl border transition-all cursor-pointer ${isUnread ? "border-geora-black/30 border-2 bg-white" : "border-white bg-white"} shadow-sm hover:scale-[1.01]`}
              onClick={() => {
                setExpandedId(isExpanded ? null : inq.id);
                if (!isExpanded && isUnread) markInquiryAsRead(inq.id);
              }}
            >
              <div className="p-4 flex items-start gap-4">
                <div className="bg-geora-cyan/15 p-2 rounded-full shrink-0">
                  <Mail size={16} className="text-geora-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-geora-black">
                        {inq.senderName}
                      </span>
                      {isUnread ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-geora-cyan text-geora-dark">
                          Consulta
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-500">
                          <CheckCheck size={10} /> Leído
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Building2
                      size={11}
                      className="text-geora-emerald shrink-0"
                    />
                    <span className="text-xs text-geora-muted font-medium truncate">
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
                    <div className="flex items-center gap-3 p-3">
                      <div className="bg-white p-1.5 rounded-full border border-gray-200">
                        <Mail size={14} className="text-geora-dark" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-geora-muted uppercase">
                          Email
                        </p>
                        <a
                          href={`mailto:${inq.senderEmail}`}
                          className="text-xs font-bold text-geora-black hover:text-geora-emerald transition-colors"
                        >
                          {inq.senderEmail}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3">
                      <div className="bg-white p-1.5 rounded-full border border-gray-200">
                        <Phone size={14} className="text-geora-dark" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-geora-muted uppercase">
                          Teléfono
                        </p>
                        <a
                          href={`tel:${inq.senderPhone}`}
                          className="text-xs font-bold text-geora-black hover:text-geora-emerald transition-colors"
                        >
                          {inq.senderPhone}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-geora-muted uppercase mb-2">
                      Mensaje original
                    </p>
                    <p className="text-sm text-geora-black leading-relaxed whitespace-pre-wrap">
                      {inq.message}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {inq.profileId ? (
                      replyingTo === inq.id ? (
                        <div className="flex flex-col gap-2 animate-fade-in">
                          <textarea
                            value={replyMsg}
                            onChange={(e) => setReplyMsg(e.target.value)}
                            placeholder="Escribí tu respuesta para enviarla por mensaje..."
                            className="w-full text-sm border border-gray-200 bg-white rounded-xl p-3 focus:outline-none focus:border-geora-black resize-none"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyMsg("");
                              }}
                              className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSendReply(inq)}
                              disabled={isSendingReply || !replyMsg.trim()}
                              className="px-4 py-2 bg-geora-black text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50 hover:bg-geora-black/90 transition-colors"
                            >
                              {isSendingReply
                                ? "Enviando..."
                                : "Enviar por chat"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(inq.id)}
                          className="flex items-center gap-2 text-sm font-bold text-geora-black hover:opacity-70 transition-opacity cursor-pointer"
                        >
                          <MessageSquare size={16} /> Responder por chat
                        </button>
                      )
                    ) : (
                      <div className="flex items-center gap-2 bg-gray-100 px-3 py-2.5 rounded-lg w-fit">
                        <Info size={14} className="text-gray-500" />
                        <p className="text-xs font-bold text-gray-500">
                          Usuario no registrado. Respondé vía Email o Teléfono.
                        </p>
                      </div>
                    )}
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

function HeaderFractionalStars({
  average,
  total,
}: {
  average: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const fillPercentage = Math.max(
            0,
            Math.min(100, (average - star + 1) * 100),
          );
          const gradientId = `dash-star-grad-${star}-${fillPercentage.toFixed(0)}`;

          return (
            <svg
              key={star}
              viewBox="0 0 24 24"
              className="w-5 h-5 stroke-1 text-red-500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={gradientId} x1="0" x2="100%" y1="0" y2="0">
                  <stop offset={`${fillPercentage}%`} stopColor="#000000" />
                  <stop offset={`${fillPercentage}%`} stopColor="#bfbfbf" />
                </linearGradient>
              </defs>
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill={`url(#${gradientId})`}
              />
            </svg>
          );
        })}
      </div>
      <span className="text-xs text-geora-muted font-medium">
        ({total} {total === 1 ? "reseña" : "reseñas"})
      </span>
    </div>
  );
}

type ActiveTab =
  | "properties"
  | "statistics"
  | "notifications"
  | "chat"
  | "saved"
  | "clients";

interface FavoriteProperty {
  id: string;
  title: string;
  description?: string;
  type: string;
  operationType: string;
  price: number | null;
  currency?: string | null;
  images: string[];
  city: string;
  area?: number;
  rooms?: number;
  bathrooms?: number;
  address?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
}

export default function DashboardRealestate({
  profile,
  properties,
  onRefresh,
  autoOpenCreate = false,
}: {
  profile: ProfileData | null;
  properties: PropertySummary[];
  onRefresh: () => void;
  autoOpenCreate?: boolean;
}) {
  const router = useRouter();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isProfileEditOpen, setProfileEditOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [editingProperty, setEditingProperty] =
    useState<PropertySummary | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("properties");
  const [targetThreadId, setTargetThreadId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
const [clients, setClients] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [filterOperation, setFilterOperation] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");

  const filterPanelRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<"price" | "rooms" | null>(
    null,
  );

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filterCurrency, setFilterCurrency] = useState<string | null>("");

  const [filterRooms, setFilterRooms] = useState<string[]>([]);
  const [filterBedrooms, setFilterBedrooms] = useState<string[]>([]);
  const [filterBathrooms, setFilterBathrooms] = useState<string[]>([]);

  type SortBy = "updatedAt" | "createdAt" | "price" | "area";
  const [sortBy, setSortBy] = useState<SortBy>("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const SORT_LABELS: Record<SortBy, string> = {
    updatedAt: "Últimas modificaciones",
    createdAt: "Fecha de publicación",
    price: "Precio",
    area: "Superficie",
  };

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error("Error al traer los clientes:", err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "clients") {
      fetchClients();
    }
  }, [activeTab, fetchClients]);

  const handleAddClient = async (clientData: any) => {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar el cliente");
      }
      const created = await res.json();
      fetchClients();
      return created;
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEditClient = async (id: string, clientData: any) => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      const updated = await res.json();
      fetchClients();
      return updated;
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      fetchClients();
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (!activeFilter) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(e.target as Node)
      ) {
        setActiveFilter(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [activeFilter]);

  const handleRoomsChange = (
    field: "rooms" | "bedrooms" | "bathrooms",
    value: string | null,
  ) => {
    if (field === "rooms") setFilterRooms(value ? [value] : []);
    if (field === "bedrooms") setFilterBedrooms(value ? [value] : []);
    if (field === "bathrooms") setFilterBathrooms(value ? [value] : []);
  };

  const filteredProperties = properties.filter((prop) => {
    let matches = true;

    if (filterOperation && prop.operationType !== filterOperation)
      matches = false;
    if (filterType && prop.type !== filterType) matches = false;

    const propPrice =
      prop.price ?? (prop as any).sale_price ?? (prop as any).rent_price ?? 0;
    const propCurrency =
      prop.currency ??
      (prop as any).sale_currency ??
      (prop as any).rent_currency ??
      "USD";

    if (minPrice && propPrice < Number(minPrice)) matches = false;
    if (maxPrice && propPrice > Number(maxPrice)) matches = false;
    if (filterCurrency && propCurrency !== filterCurrency) matches = false;

    if (filterRooms.length > 0) {
      const val = filterRooms[0];
      if (val.includes("+")) {
        if ((prop.rooms || 0) < parseInt(val)) matches = false;
      } else {
        if (String(prop.rooms || 0) !== val) matches = false;
      }
    }

    if (filterBathrooms.length > 0) {
      const val = filterBathrooms[0];
      if (val.includes("+")) {
        if ((prop.bathrooms || 0) < parseInt(val)) matches = false;
      } else {
        if (String(prop.bathrooms || 0) !== val) matches = false;
      }
    }

    return matches;
  });

  const getSortPrice = (prop: PropertySummary) =>
    prop.price ?? prop.sale_price ?? prop.rent_price ?? 0;

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    let cmp = 0;
    if (sortBy === "price") {
      cmp = getSortPrice(a) - getSortPrice(b);
    } else if (sortBy === "area") {
      cmp = (a.area || 0) - (b.area || 0);
    } else {
      const dateA = new Date(
        (sortBy === "updatedAt" ? a.updatedAt : a.createdAt) ?? a.createdAt ?? 0,
      ).getTime();
      const dateB = new Date(
        (sortBy === "updatedAt" ? b.updatedAt : b.createdAt) ?? b.createdAt ?? 0,
      ).getTime();
      cmp = dateA - dateB;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

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
    if (activeTab === "saved" && favorites.length === 0) {
      fetchFavorites();
    }
  }, [activeTab, favorites.length, fetchFavorites]);

  const handleShareProfile = async () => {
    if (!profile?.id) {
      console.error("🚨 Error: profile.id es undefined", profile);
      alert("No se pudo generar el enlace porque falta el ID del perfil.");
      return;
    }
    const url = `${window.location.origin}/realestate/${profile.id}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (!successful) throw new Error("Fallback: execCommand falló");
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("❌ Error al copiar al portapapeles:", err);
      alert(`Tu enlace es: ${url}`);
    }
  };

  useEffect(() => {
    if (autoOpenCreate) setCreateOpen(true);
  }, [autoOpenCreate]);
  useEffect(() => {
    Promise.all([
      fetch("/api/inquiries")
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch("/api/notifications")
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ]).then(([inq, notif]) => {
      const inqUnread = Array.isArray(inq)
        ? inq.filter((i: any) => i.status === "UNREAD").length
        : 0;
      const notifUnread = Array.isArray(notif)
        ? notif.filter((n: any) => n.status === "UNREAD").length
        : 0;
      setUnreadCount(inqUnread + notifUnread);
    });
  }, []);

  const { totalUnread: unreadChatCount } = useChatThreads();

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteProperty(deletingId);
      onRefresh();
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.message || "Error al eliminar");
    } finally {
      setDeletingId(null);
      setIsDeleting(false);
    }
  };

  const getTransformIndex = () => {
    switch (activeTab) {
      case "properties":
        return 0;
      case "statistics":
        return 1;
      case "notifications":
        return 2;
      case "chat":
        return 3;
      case "saved":
        return 4;
      case "clients":
        return 5;
      default:
        return 0;
    }
  };

  const agencyName =
    profile?.agencyData?.name || profile?.name || "Mi Inmobiliaria";
  const logoUrl = profile?.agencyData?.logoUrl;

  return (
    <div className="pb-28">
      {activeTab !== "properties" && (
        <div className="flex flex-col md:flex-row md:items-center ml-5 md:justify-between gap-4 mb-6 mt-0 sm:mt-5">
          <h1 className="text-2xl font-black text-geora-black">
            {activeTab === "statistics" && "Estadísticas"}
            {activeTab === "notifications" && "Notificaciones"}
            {activeTab === "chat" && "Mensajes"}
            {activeTab === "saved" && "Propiedades Guardadas"}
            {activeTab === "clients" && "Mis Clientes"}
          </h1>
        </div>
      )}

      <div className="w-full">
        {activeTab === "chat" && (
          <div className={activeTab === "chat" ? "block h-[70vh]" : "hidden"}>
            <ChatPanel />
          </div>
        )}

        <div className={activeTab === "notifications" ? "block" : "hidden"}>
          <NotificationsPanel
            onRead={() => setUnreadCount((n) => Math.max(0, n - 1))}
            onChatStart={(threadId) => {
              setTargetThreadId(threadId);
              setActiveTab("chat");
            }}
          />
        </div>

        <div className={activeTab === "statistics" ? "block" : "hidden"}>
          <StatsPanel
            properties={properties.map((p) => ({
              id: p.id,
              title: p.title,
              city: p.city,
              province: p.province,
            }))}
          />
        </div>

        <div className={activeTab === "saved" ? "block w-full" : "hidden"}>
          {loadingFavorites ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`bg-geora-g200 h-96 ${glassCard}`} />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-geora-g200 rounded-2xl mx-2 md:mx-6">
              <Bookmark size={32} className="mx-auto text-geora-g400 mb-4" />
              <p className="text-geora-muted font-bold text-lg">
                Aún no tenés propiedades guardadas en tus favoritos.
              </p>
              <Link
                href="/"
                className="text-geora-black font-bold underline mt-4 block"
              >
                Explorar propiedades
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((prop, index) => (
                <div
                  key={prop.id}
                  className={`group flex flex-col gap-4 p-4 cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] animate-fade-in-up relative h-full ${glassCard}`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <Link
                    href={`/property/${prop.id}`}
                    className="absolute inset-0 z-10"
                  />

                  <div className="absolute top-6 right-6 z-20">
                    <FavoriteButton
                      propertyId={prop.id}
                      initialIsFavorite={true}
                      small={true}
                    />
                  </div>

                  <div className="relative h-64 md:h-72 w-full overflow-hidden rounded-t-2xl bg-geora-g200">
                    <Image
                      src={prop.images[0] || "/placeholder-property.jpg"}
                      alt={prop.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105 [mask-image:linear-gradient(to_bottom,black_52%,transparent_95%)] [-webkit-mask-image:linear-gradient(to_bottom,black_52%,transparent_95%)]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between min-w-0 z-10">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/20 bg-geora-black/80 px-3 py-1 text-xs font-bold text-white uppercase shadow-sm z-1">
                          {getPropertyLabel(prop.type)}
                        </span>
                        <span className="rounded-full border border-white/20 bg-geora-black/80 px-3 py-1 text-xs font-bold text-white uppercase shadow-sm z-1">
                          {getOperationLabel(prop.operationType)}
                        </span>
                      </div>

                      <h3 className="line-clamp-2 text-base font-black tracking-tight text-geora-black uppercase">
                        {prop.title}
                      </h3>

                      <p className="mt-2 flex items-center gap-1 truncate text-xs font-semibold text-geora-black/80">
                        <MapPin
                          size={12}
                          className="shrink-0 text-geora-cyan"
                          strokeWidth={3}
                        />
                        {prop.address ? `${prop.address}, ` : ""}
                        {prop.city}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-white/60 pt-4">
                      <span className="text-base font-black tracking-tight text-geora-black/70 z-1">
                        {prop.currency === "USD" ? "USD" : "$"}{" "}
                        {prop.price?.toLocaleString("es-AR") ?? "Consultar"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
<div className={activeTab === "clients" ? "block w-full" : "hidden"}>
          <ClientsPanel 
            clients={clients} 
            properties={properties} 
            onAddClient={handleAddClient}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
            onStartChat={(id) => {
              setActiveTab("chat");
            }}
            onPublishSearch={(id) => {
              router.push(`/connections?clientId=${id}`);
            }}
          />
        </div>
        <div className={activeTab === "properties" ? "block w-full" : "hidden"}>
          <div className="relative overflow-hidden group mb-20 mt-4">
            <div className="relative z-20 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div
                className="flex items-center gap-8 min-w-0 w-full group/info cursor-pointer rounded-xl hover:opacity-80 transition-colors p-2 -ml-2"
                onClick={() => setProfileEditOpen(true)}
              >
                <div
                  className="w-28 h-28 shrink-0 rounded-full flex items-center justify-center bg-cover bg-center overflow-hidden bg-geora-g200 relative group/logo"
                  style={{
                    backgroundImage: logoUrl ? `url(${logoUrl})` : "none",
                  }}
                >
                  {!logoUrl && (
                    <Building2 size={40} className="text-geora-g400" />
                  )}

                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300">
                    <Camera className="text-white mb-1" size={24} />
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">
                      Cambiar
                    </span>
                  </div>
                </div>

                <div className="min-w-0 w-full flex flex-col items-start justify-center relative">
                  <h1 className="text-3xl md:text-4xl font-black text-geora-black/90 uppercase tracking-tighter mb-1 flex items-center gap-3">
                    {agencyName}
                  </h1>

                  <p className="flex items-center gap-2 text-geora-black/60 font-medium mb-3">
                    <MapPin size={16} />
                    {profile?.agencyData?.city ||
                      profile?.city ||
                      "Ciudad"},{" "}
                    {profile?.agencyData?.province ||
                      profile?.province ||
                      "Provincia"}
                    .
                    {profile?.agencyData?.street
                      ? ` ${profile.agencyData.street}`
                      : ""}{" "}
                    {profile?.agencyData?.address
                      ? ` ${profile.agencyData.address}`
                      : ""}
                  </p>

                  {(profile?.agencyData?.bio || profile?.bio) && (
                    <p className="text-sm font-medium text-geora-black/70 mb-3 max-w-2xl leading-relaxed">
                      {profile?.agencyData?.bio || profile?.bio}
                    </p>
                  )}

                  <div className="mb-3 mt-1">
                    {profile?.agencyData?.reviewCount ? (
                      <HeaderFractionalStars
                        average={profile.agencyData.reviewAverage || 0}
                        total={profile.agencyData.reviewCount}
                      />
                    ) : (
                      <div className="mb-3 mt-1">
                        <span className="text-sm font-medium text-geora-muted bg-geora-g100 px-2.5 py-1 rounded-md">
                          Sin reseñas todavía
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 justify-end md:mr-8 w-full md:w-1/4">
                <div className="flex items-center w-full justify-between gap-2">
                  <button
                    onClick={() => setProfileEditOpen(true)}
                    className="text-center flex-1 px-3 py-2 text-md font-bold text-geora-black/80 cursor-pointer hover:text-geora-black/50 transform transition duration-200"
                  >
                    Editar Perfil
                  </button>

                  <button
                    onClick={handleShareProfile}
                    title="Compartir perfil"
                    className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-md cursor-pointer border shadow-sm border-black/10 text-geora-black/80 hover:scale-105 hover:bg-white transition duration-200"
                  >
                    {isCopied ? (
                      <CheckCheck size={18} className="text-geora-emerald" />
                    ) : (
                      <Share2 size={18} />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setCreateOpen(true)}
                  className="text-center w-full rounded-full bg-white cursor-pointer border shadow-md border-black/10 px-5 py-2 text-sm font-bold text-geora-black/80 hover:scale-105 hover:text-geora-black/50 transform transition duration-200"
                >
                  Cargar Propiedad
                </button>
              </div>
            </div>
          </div>

          <div className="mb-5 flex items-baseline justify-between px-2 md:px-10">
            <h2 className="text-2xl font-black text-geora-black/90 uppercase tracking-tight">
              Cartera de Propiedades
            </h2>
            <span className="text-sm font-bold text-geora-muted hidden sm:block">
              {filteredProperties.length}{" "}
              {filteredProperties.length === 1 ? "propiedad" : "propiedades"}
            </span>
            <span className="text-sm font-bold text-geora-muted hidden sm:block">
              {properties.length}{" "}
              {properties.length === 1 ? "propiedad" : "propiedades"}
            </span>
          </div>
          <div
            className="flex flex-wrap items-center gap-2 mb-5"
            ref={filterPanelRef}
          >
            <CustomDropdown
              label={
                filterOperation
                  ? OPERATION_LABELS[filterOperation] || filterOperation
                  : "Operación"
              }
              value={filterOperation}
              options={[
                { label: "Todo", value: "" },
                { label: "Venta", value: "SALE" },
                { label: "Alquiler", value: "RENT" },
                { label: "Temporal", value: "TEMP_RENT" },
              ]}
              onChange={(val) => setFilterOperation(val)}
              variant="white1"
            />

            <CustomDropdown
              label={
                filterType ? PROPERTY_LABELS[filterType] || filterType : "Tipo"
              }
              value={filterType}
              options={[
                { label: "Todo", value: "" },
                { label: "Casa", value: "HOUSE" },
                { label: "Departamento", value: "APARTMENT" },
                { label: "PH", value: "PH" },
                { label: "Terreno", value: "LAND" },
                { label: "Local", value: "COMMERCIAL_PROPERTY" },
                { label: "Oficina", value: "OFFICE" },
              ]}
              onChange={(val) => setFilterType(val)}
              variant="white1"
            />

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveFilter((v) => (v === "price" ? null : "price"))
                }
                className={`h-10 cursor-pointer px-3 md:px-5 py-2 rounded-full tracking-wide transition-colors duration-200 flex items-center justify-center md:justify-between gap-2 min-w-10 md:min-w-[120px] font-bold ${
                  minPrice || maxPrice || filterCurrency
                    ? "bg-white/70 border border-white text-geora-black/70 shadow-md"
                    : activeFilter === "price"
                      ? "bg-white/70 border border-white text-geora-black/70 shadow-md"
                      : "bg-white/70 border border-white text-geora-black/70 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span className="text-sm md:text-md tracking-wider flex items-center justify-center">
                  {minPrice || maxPrice
                    ? `${filterCurrency || ""}${minPrice ? ` ≥${Number(minPrice).toLocaleString("es-AR")}` : ""}${maxPrice ? ` ≤${Number(maxPrice).toLocaleString("es-AR")}` : ""}`
                    : "Precio"}
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={3}
                  className={`hidden md:block w-4 h-4 transition-transform duration-200 ${activeFilter === "price" ? "rotate-180" : ""}`}
                />
              </button>

              {activeFilter === "price" && (
                <div className="absolute top-full left-0 md:right-0 md:left-auto mt-3 z-[999] w-80 rounded-2xl border border-gray-200 bg-white text-geora-black/70 shadow-xl p-5">
                  <PriceFilterCard
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    currency={filterCurrency || ""}
                    operationType={filterOperation}
                    propertyType={filterType}
                    onChangeMin={setMinPrice}
                    onChangeMax={setMaxPrice}
                    onChangeCurrency={setFilterCurrency}
                  />
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveFilter((v) => (v === "rooms" ? null : "rooms"))
                }
                className={`h-10 cursor-pointer px-3 md:px-5 py-2 rounded-full tracking-wide transition-colors duration-200 flex items-center justify-center md:justify-between gap-2 min-w-10 md:min-w-[120px] font-bold ${
                  filterRooms.length > 0 ||
                  filterBedrooms.length > 0 ||
                  filterBathrooms.length > 0
                    ? "bg-white/70 border border-white text-geora-black/70 shadow-md"
                    : activeFilter === "rooms"
                      ? "bg-white/70 border border-white text-geora-black/70 shadow-md"
                      : "bg-white/70 border border-white text-geora-black/70 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span className="text-sm md:text-md tracking-wider flex items-center justify-center">
                  {filterRooms[0]
                    ? `${filterRooms[0]} amb.`
                    : filterBedrooms[0]
                      ? `${filterBedrooms[0]} hab.`
                      : "Ambientes"}
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={3}
                  className={`hidden md:block w-4 h-4 transition-transform duration-200 ${activeFilter === "rooms" ? "rotate-180" : ""}`}
                />
              </button>

              {activeFilter === "rooms" && (
                <div className="absolute top-full right-0 mt-3 z-[999] w-80 rounded-2xl border border-gray-200 bg-white text-geora-black/70 shadow-xl p-5">
                  <RoomsFilterCard
                    rooms={filterRooms}
                    bedrooms={filterBedrooms}
                    bathrooms={filterBathrooms}
                    onChange={handleRoomsChange}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 md:ml-auto">
              <CustomDropdown
                label={`Ordenar: ${SORT_LABELS[sortBy]}`}
                value={sortBy}
                options={[
                  { label: "Últimas modificaciones", value: "updatedAt" },
                  { label: "Fecha de publicación", value: "createdAt" },
                  { label: "Precio", value: "price" },
                  { label: "Superficie", value: "area" },
                ]}
                onChange={(val) => setSortBy(val as SortBy)}
                variant="white1"
              />

              <button
                type="button"
                onClick={() =>
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                }
                title={
                  sortDir === "asc"
                    ? "Orden ascendente"
                    : "Orden descendente"
                }
                className="h-10 shrink-0 cursor-pointer px-3 py-2 rounded-full bg-white/70 border border-white text-geora-black/70 shadow-sm hover:bg-gray-50 transition-colors duration-200 flex items-center gap-1.5 font-bold"
              >
                {sortDir === "asc" ? (
                  <ArrowUpWideNarrow size={16} strokeWidth={2.5} />
                ) : (
                  <ArrowDownWideNarrow size={16} strokeWidth={2.5} />
                )}
                <span className="text-sm hidden md:inline">
                  {sortDir === "asc" ? "Asc." : "Desc."}
                </span>
              </button>
            </div>
          </div>
          {filteredProperties.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-geora-g200 rounded-2xl mx-2 md:mx-6">
              <p className="text-geora-muted font-bold text-lg">
                Aún no hay propiedades publicadas en tu cartera.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProperties.map((prop, index) => {
                return (
                  <div
                    key={prop.id}
                    onClick={() => router.push(`/property/${prop.id}`)}
                    className={`group flex flex-col gap-4 p-4 cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] animate-fade-in-up relative ${glassCard}`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    <div className="absolute top-6 right-6 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProperty(prop);
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-md border border-white text-geora-black shadow-sm transition-all hover:scale-110 hover:bg-white"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(prop.id);
                          setIsModalOpen(true);
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-md border border-white text-geora-rose shadow-sm transition-all hover:scale-110 hover:bg-white"
                        title="Eliminar"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="relative h-64 md:h-72 w-full overflow-hidden rounded-t-2xl bg-geora-g200">
                      {prop.images && prop.images.length > 0 ? (
                        <img
                          src={prop.images[0]}
                          alt={prop.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105 [mask-image:linear-gradient(to_bottom,black_52%,transparent_95%)] [-webkit-mask-image:linear-gradient(to_bottom,black_52%,transparent_95%)]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-white text-xs font-bold text-black/70">
                          <Building2 size={36} className="text-geora-g400" />
                        </div>
                      )}

                      {prop.status !== "AVAILABLE" && (
                        <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-100/90 backdrop-blur-sm text-gray-500 border border-gray-200 shadow-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          Pausada
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between min-w-0 z-10">
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/20 bg-geora-black/80 px-3 py-1 text-xs font-bold text-white uppercase shadow-sm z-1">
                            {prop.type
                              ? (PROPERTY_LABELS[prop.type] ?? prop.type)
                              : "Inmueble"}
                          </span>
                          <span className="rounded-full border border-white/20 bg-geora-black/80 px-3 py-1 text-xs font-bold text-white uppercase shadow-sm z-1">
                            {prop.operationType
                              ? (OPERATION_LABELS[prop.operationType] ??
                                prop.operationType)
                              : "Venta/Alq"}
                          </span>
                        </div>

                        <h3 className="line-clamp-2 text-base font-black tracking-tight text-geora-black">
                          {prop.title}
                        </h3>

                        <p className="mt-2 flex items-center gap-1 truncate text-xs font-semibold text-geora-black/80">
                          <MapPin
                            size={12}
                            className="shrink-0 text-geora-cyan"
                          />
                          {prop.address || "Sin dirección"}, {prop.city || "—"}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/60 pt-4">
                        <span className="text-xs font-bold text-geora-black/50 z-1">
                          {prop.rooms || 0} amb · {prop.area || 0} m²
                        </span>
                        <span className="text-base font-black tracking-tight text-geora-black/70 z-1">
                          {formatPrice(
                            prop.price ||
                              prop.sale_price ||
                              prop.rent_price ||
                              null,
                            prop.sale_currency || prop.rent_currency || null,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {profile?.id && (
            <div className="mt-20 border-t border-geora-black/10 pt-10 px-2 md:px-10">
              <RealEstateReviews
                realEstateId={profile.id}
                currentUserId={profile.id}
                isOwner={true}
              />
            </div>
          )}

          <div className="mt-20 border-t border-geora-black/10 pt-10 px-2 md:px-10 mb-10 w-full flex flex-col items-center justify-center">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/40 border border-black/10 backdrop-blur-md shadow-sm text-sm font-bold text-geora-black/80 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
            >
              <Settings
                size={16}
                className={`transition-transform duration-500 ${showSettings ? "rotate-90 text-geora-rose" : ""}`}
              />
              {showSettings
                ? "Ocultar Ajustes de Cuenta"
                : "Configuración de la Cuenta"}
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${showSettings ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`w-full max-w-3xl transition-all duration-500 overflow-hidden ${showSettings ? "max-h-[1200px] opacity-100 mt-10 space-y-8" : "max-h-0 opacity-0 pointer-events-none"}`}
            >
              <SecuritySection />

              {profile?.role === "REALESTATE" && profile?.id && (
                <div
                  className={
                    !(profile.isActive ?? true)
                      ? "opacity-50 transition-opacity"
                      : "transition-opacity"
                  }
                >
                  <PauseAccountZone
                    isPaused={!(profile.isActive ?? true)}
                    userId={profile.id}
                    onToggleSuccess={onRefresh}
                  />
                </div>
              )}

              {profile?.id && (
                <DangerZone itemName={agencyName} userId={profile.id} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 p-0.5 rounded-full backdrop-blur-xl bg-white/50 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] w-[95vw] sm:w-max">
        <div className="relative grid grid-cols-6 w-full h-full items-center">
          <div
            className="absolute top-0 bottom-0 left-0 w-1/6 bg-geora-white1/70 backdrop-blur-3xl rounded-full shadow-md transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${getTransformIndex() * 100}%)` }}
          />

          <button
            onClick={() => setActiveTab("properties")}
            className={`relative z-10 flex items-center justify-center py-3 sm:py-3 sm:px-6 rounded-full transition-colors duration-300 cursor-pointer ${activeTab === "properties" ? "text-geora-black/80" : "text-geora-black/50 hover:text-geora-black"}`}
          >
            <Home size={22} className="sm:hidden" />
            <span className="hidden sm:inline font-bold text-sm">
              Mi Perfil
            </span>
          </button>

          <button
            onClick={() => setActiveTab("statistics")}
            className={`relative z-10 flex items-center justify-center py-3 sm:py-2.5 sm:px-6 rounded-full transition-colors duration-300 cursor-pointer ${activeTab === "statistics" ? "text-geora-black/80" : "text-geora-black/50 hover:text-geora-black"}`}
          >
            <BarChart3 size={22} className="sm:hidden" />
            <span className="hidden sm:inline font-bold text-sm">
              Estadísticas
            </span>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`relative z-10 flex items-center justify-center py-3 sm:py-2.5 sm:px-6 rounded-full transition-colors duration-300 cursor-pointer ${activeTab === "notifications" ? "text-geora-black/80" : "text-geora-black/50 hover:text-geora-black"}`}
          >
            <div className="relative flex items-center justify-center">
              <Bell size={22} className="sm:hidden" />
              <span className="hidden sm:inline font-bold text-sm">
                Notificaciones
              </span>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 sm:-top-1 sm:-right-3 w-3 h-3 bg-red-500 rounded-full border-[2px] border-white shadow-sm" />
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`relative z-10 flex items-center justify-center py-3 sm:py-2.5 sm:px-6 rounded-full transition-colors duration-300 cursor-pointer ${activeTab === "chat" ? "text-geora-black/80" : "text-geora-black/50 hover:text-geora-black"}`}
          >
            <div className="relative flex items-center justify-center">
              <MessageSquare size={22} className="sm:hidden" />
              <span className="hidden sm:inline font-bold text-sm">
                Mensajes
              </span>
              {unreadChatCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 sm:-top-1 sm:-right-3 w-3 h-3 bg-geora-cyan rounded-full border-[2px] border-white shadow-sm" />
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`relative z-10 flex items-center justify-center py-3 sm:py-2.5 sm:px-6 rounded-full transition-colors duration-300 cursor-pointer ${activeTab === "saved" ? "text-geora-black/80" : "text-geora-black/50 hover:text-geora-black"}`}
          >
            <Bookmark size={22} className="sm:hidden" />
            <span className="hidden sm:inline font-bold text-sm">
              Guardados
            </span>
          </button>

          <button
            onClick={() => setActiveTab("clients")}
            className={`relative z-10 flex items-center justify-center py-3 sm:py-2.5 sm:px-6 rounded-full transition-colors duration-300 cursor-pointer ${activeTab === "clients" ? "text-geora-black/80" : "text-geora-black/50 hover:text-geora-black"}`}
          >
            <Users size={22} className="sm:hidden" />
            <span className="hidden sm:inline font-bold text-sm">
              Clientes
            </span>
          </button>
        </div>
      </div>

      <EditAgencyProfileModal
        isOpen={isProfileEditOpen}
        onClose={() => setProfileEditOpen(false)}
        profile={profile}
        onSaved={onRefresh}
      />

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setDeletingId(null);
          setIsDeleting(false);
        }}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar propiedad?"
        message="Esta acción es permanente y la propiedad dejará de estar visible."
        isLoading={isDeleting}
      />
      <CreatePropertyModal
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={onRefresh}
        defaultContactInfo={{
          contactName:
            profile?.agencyData?.name || profile?.name || undefined,
          contactPhone:
            profile?.agencyData?.phone || profile?.phone || undefined,
          contactEmail: profile?.email || undefined,
        }}
      />

      {editingProperty && (
        <EditPropertyModal
          open={true}
          property={{
            ...editingProperty,
            type: editingProperty.type || undefined,
            description: editingProperty.description || "",
            propertySubtype: editingProperty.propertySubtype || undefined,
            featureGroups: editingProperty.featureGroups || undefined,
            youtubeUrl: editingProperty.youtubeUrl || undefined,
            tour360Url: editingProperty.tour360Url || undefined,
          }}
          defaultContactInfo={{
            contactName:
              profile?.agencyData?.name || profile?.name || undefined,
            contactPhone:
              profile?.agencyData?.phone || profile?.phone || undefined,
            contactEmail: profile?.email || undefined,
          }}
          onClose={() => setEditingProperty(null)}
          onUpdated={onRefresh}
        />
      )}
    </div>
  );
}
