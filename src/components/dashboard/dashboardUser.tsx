"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Bookmark, MapPin, Phone, Mail, Settings, ChevronDown } from "lucide-react";
import { ProfileData } from "@/app/(dashboard)/dashboard/page";
import { SecuritySection, PauseAccountZone, DangerZone } from "@/components/dashboard/AccountActions";
import FavoriteButton from "@/components/ui/FavoriteButton";

type UserTab = "profile" | "saved";

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
    case "SALE_RENT": return "Venta y Alquiler";
    default: return type;
  }
};

const getPropertyLabel = (type: string) => {
  switch (type) {
    case "HOUSE": return "CASA";
    case "APARTMENT": return "DPTO";
    case "LAND": return "TERRENO";
    case "COMMERCIAL_PROPERTY": return "LOCAL";
    case "OFFICE": return "OFICINA";
    default: return type;
  }
};

export default function DashboardUser({ profile, onRefresh }: { profile: ProfileData | null; onRefresh: () => void; }) {
  const [activeTab, setActiveTab] = useState<UserTab>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showSettings, setShowSettings] = useState(false);

  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

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
    if (activeTab === "saved" && favorites.length === 0) {
      fetchFavorites();
    }
  }, [activeTab, favorites.length, fetchFavorites]);

  return (
    <div className="pb-28">
      <div className="flex items-center gap-6 mb-10 ml-2 md:ml-6">
        <div className="w-20 h-20 bg-urbik-black text-white rounded-full flex items-center justify-center text-2xl font-black">
          {formData.firstName.charAt(0).toUpperCase() || <User size={32} />}
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-urbik-black/90 uppercase tracking-tighter">
            Hola, {formData.firstName || "Usuario"}
          </h1>
          <p className="flex items-center gap-2 text-urbik-black/60 font-medium">
            <Mail size={14} /> {profile?.email}
          </p>
        </div>
      </div>

      <div className="w-full">
        <div className={activeTab === "profile" ? "block w-full mx-auto" : "hidden"}>
          <div className="mb-20">
            <h2 className="text-xl font-black text-urbik-black/90 mb-6 uppercase tracking-tight border-b border-black/10 pb-4">
              Información Básica
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-urbik-black/90 uppercase mb-2 ml-2">Nombre</label>
                <input 
                  type="text" name="firstName" value={formData.firstName} onChange={handleChange} 
                  className="w-full border border-white bg-white/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-urbik-black/20 shadow-sm transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-urbik-black/90 uppercase mb-2 ml-2">Apellido</label>
                <input 
                  type="text" name="lastName" value={formData.lastName} onChange={handleChange} 
                  className="w-full border border-white bg-white/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-urbik-black/20 shadow-sm transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-urbik-black/90 uppercase mb-2 ml-2 flex items-center gap-1"><Phone size={12}/> Teléfono</label>
                <input 
                  type="text" name="phone" value={formData.phone} onChange={handleChange} 
                  className="w-full border border-white bg-white/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-urbik-black/20 shadow-sm transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-urbik-black/90 uppercase mb-2 ml-2 flex items-center gap-1"><MapPin size={12}/> Ciudad</label>
                <input 
                  type="text" name="city" value={formData.city} onChange={handleChange} 
                  className="w-full border border-white bg-white/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-urbik-black/20 shadow-sm transition-all" 
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
                className="px-8 py-3 cursor-pointer rounded-full text-sm font-bold text-white bg-urbik-black hover:opacity-90 transition shadow-md disabled:opacity-50"
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>

          {profile?.id && (
            <div className="mt-6 flex flex-col items-center w-full">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/40 border border-black/10 backdrop-blur-md shadow-sm text-sm font-bold text-urbik-black/80 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
              >
                <Settings size={16} className={`transition-transform duration-500 ${showSettings ? "rotate-90 text-urbik-rose" : ""}`} />
                {showSettings ? "Ocultar Ajustes Avanzados" : "Configuración Avanzada de Cuenta"}
                <ChevronDown size={16} className={`transition-transform duration-300 ${showSettings ? "rotate-180" : ""}`} />
              </button>

              <div className={`w-full transition-all duration-500 overflow-hidden ${showSettings ? "max-h-[1000px] opacity-100 mt-8 space-y-6" : "max-h-0 opacity-0 pointer-events-none"}`}>
                <SecuritySection />
                <PauseAccountZone
                  isPaused={profile.isActive === false}
                  userId={profile.id}
                  onToggleSuccess={onRefresh}
                />
                <DangerZone itemName="tu cuenta" userId={profile.id} />
              </div>
            </div>
          )}
        </div>

        <div className={activeTab === "saved" ? "block w-full" : "hidden"}>
          <div className="mb-6 flex items-baseline justify-between px-2">
            <h2 className="text-2xl font-black text-urbik-black/90 uppercase tracking-tight">
              Tus Propiedades Guardadas
            </h2>
          </div>

          {loadingFavorites ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className={`bg-urbik-g200 h-96 ${glassCard}`} />)}
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-urbik-g200 rounded-3xl mx-2">
              <Bookmark size={40} className="mx-auto text-urbik-g400 mb-4" />
              <p className="text-urbik-muted font-bold text-lg">
                Todavía no guardaste ninguna propiedad.
              </p>
              <Link href="/" className="text-urbik-black font-bold underline mt-4 block">Explorar propiedades</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-15">
              {favorites.map((prop, index) => (
                <div 
                  key={prop.id} 
                  className={`group flex flex-col gap-4 p-4 cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] animate-fade-in-up relative h-full ${glassCard}`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "both"
                  }}
                >
                  <Link href={`/property/${prop.id}`} className="absolute inset-0 z-10" />
                  
                  <div className="absolute top-6 right-6 z-20">
                    <FavoriteButton propertyId={prop.id} initialIsFavorite={true} small={true} />
                  </div>

                  <div className="relative h-64 md:h-72 w-full overflow-hidden rounded-t-2xl bg-urbik-g200">
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
                        <span className="rounded-full border border-white/20 bg-urbik-black/80 px-3 py-1 text-xs font-bold text-white uppercase shadow-sm z-1">
                          {getPropertyLabel(prop.type)}
                        </span>
                        <span className="rounded-full border border-white/20 bg-urbik-black/80 px-3 py-1 text-xs font-bold text-white uppercase shadow-sm z-1">
                          {getOperationLabel(prop.operationType)}
                        </span>
                      </div>

                      <h3 className="line-clamp-2 text-base font-black tracking-tight text-urbik-black uppercase">
                        {prop.title}
                      </h3>

                      <p className="mt-2 flex items-center gap-1 truncate text-xs font-semibold text-urbik-black/80">
                        <MapPin size={12} className="shrink-0 text-urbik-cyan" strokeWidth={3} />
                        {prop.address ? `${prop.address}, ` : ''}{prop.city}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-white/60 pt-4">
                      <span className="text-base font-black tracking-tight text-urbik-black/70 z-1">
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

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 p-0.5 rounded-full backdrop-blur-xl bg-white/50 border border-white/60 shadow-[0_10px_40px_rgba(0,0,0,0.1)] w-max">
        <div className="relative flex items-center">
          <div 
            className="absolute top-0 bottom-0 left-0 w-1/2 bg-white/50 rounded-full shadow-sm transition-transform duration-300 ease-out "
            style={{ transform: `translateX(${activeTab === "profile" ? "0%" : "100%"})` }}
          />
          <button onClick={() => setActiveTab("profile")} className={`relative z-10 flex items-center justify-center py-3 px-8 rounded-full transition-colors duration-300 cursor-pointer font-bold ${activeTab === "profile" ? "text-urbik-black" : "text-urbik-black/50 hover:text-urbik-black"}`}>
            <span className="text-sm">Mi Perfil</span>
          </button>
          <button onClick={() => setActiveTab("saved")} className={`relative z-10 flex items-center justify-center py-3 px-8 rounded-full transition-colors duration-300 cursor-pointer font-bold ${activeTab === "saved" ? "text-urbik-black" : "text-urbik-black/50 hover:text-urbik-black"}`}>
            <span className="text-sm">Guardados</span>
          </button>
        </div>
      </div>
    </div>
  );
}