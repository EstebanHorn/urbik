"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardMain from "@/components/dashboard/DashboardMain";
import ShareButton from "@/components/ui/ShareButton";
import Link from "next/link";
import { Sparkles, Home, TrendingUp, BadgeDollarSign, KeyRound } from "lucide-react";
import bgImage from "@/assets/login_bg.png";

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
  name?: string;
  firstName?: string | null;
  lastName?: string | null;
  agencyData?: { name?: string | null; slug?: string | null; properties?: PropertySummary[] | null };
  properties?: PropertySummary[] | null;
};

function DashboardHeader({ name, isAgency, slug }: { name: string; isAgency: boolean; slug?: string | null; }) {
  const initials = (name ?? "Urbik").split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");

  return (
    <div className="mb-8">
      <div className="relative overflow-hidden rounded-full border border-gray-100 p-5 shadow-sm group">
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage.src})` }} />
        <div className="absolute inset-0 z-10 bg-linear-to-l from-urbik-black via-urbik-black/90 to-transparent" />
        <div className="relative z-20 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-6 min-w-0 w-full">
            <div className="w-24 h-24 shrink-0 rounded-full bg-black text-[#00F0FF] flex items-center justify-center font-black text-2xl shadow-lg">
              {initials || "U"}
            </div>
            <div className="min-w-0 w-full flex flex-col items-center ml-15">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-4xl font-black text-urbik-white italic">{name}</h1>
              </div>
              <p className="mt-2 text-base text-urbik-white font-medium max-w-sm text-center">
                {isAgency ? "Gestioná publicaciones, medí rendimiento y mantené tus propiedades al día." : "Gestioná tus propiedades y revisá tu actividad."}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 justify-end md:mr-8 mt-2 w-1/6">
            <div className="text-md font-bold text-urbik-white/80">Estado: <span className="text-urbik-emerald">Activo</span></div>
            <Link href={`/profile`} className="w-full">
              <button className="rounded-full bg-urbik-white1 w-full px-5 py-2 text-md font-bold text-urbik-black hover:text-urbik-black/60 cursor-pointer hover:bg-urbik-dark2 transition-colors shadow-lg">
                Editar Perfil
              </button>
            </Link>
            {isAgency && slug && (
              <ShareButton slug={slug} className="flex items-center justify-center gap-2 rounded-full w-full px-5 py-2 text-md font-bold border border-urbik-cyan text-urbik-cyan hover:bg-urbik-cyan hover:text-urbik-black cursor-pointer transition-colors shadow-lg" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode; }) {
  return (
    <div>
      <div className="text-sm font-bold tracking-wider text-urbik-black/60 italic ml-7">{label}</div>
      <div className="rounded-full border border-urbik-black/10 bg-urbik-white px-8 py-2 flex items-center justify-between gap-3">
        <div className="min-w-0"><div className="mt-1 text-2xl font-black text-urbik-black/80">{value}</div></div>
        <div className="w-13 h-13 rounded-full bg-urbik-black border flex items-center justify-center text-urbik-white -mr-5">{icon}</div>
      </div>
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
      if (!res.ok) throw new Error("No se pudo cargar el perfil");
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error(error);
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

  const isAgency = profile?.role === "REALESTATE";
  const name = profile?.agencyData?.name || profile?.name || [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "Urbik";

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
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <DashboardHeader name={name} isAgency={isAgency} slug={profile?.agencyData?.slug ?? null} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
          <Chip label="Propiedades" value={properties.length} icon={<Home className="w-5 h-5" />} />
          <Chip label="Disponibles" value={properties.filter((p) => p.isAvailable !== false).length} icon={<TrendingUp className="w-5 h-5" />} />
          <Chip label="Ventas" value={properties.filter((p) => p.operationType === "SALE").length} icon={<BadgeDollarSign className="w-5 h-5" />} />
          <Chip label="Alquileres" value={properties.filter((p) => p.operationType === "RENT").length} icon={<KeyRound className="w-5 h-5" />} />
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-urbik-black/60 w-full px-3 py-1 rounded-full mb-5">
          <Sparkles className="w-4 h-4 text-urbik-emerald" />
          Tip: mantené tus propiedades “Disponibles” para mejorar visibilidad.
        </div>

        <DashboardMain properties={properties} onRefresh={fetchProfile} autoOpenCreate={autoOpenCreate} />
      </div>
    </div>
  );
}