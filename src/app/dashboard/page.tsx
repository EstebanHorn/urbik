/*
Este componente de React, denominado DashboardPage, gestiona la interfaz principal
del panel de control de una plataforma inmobiliaria utilizando Next.js y NextAuth
para la autenticación. Su función principal consiste en verificar el estado de la
sesión del usuario, obtener sus datos de perfil y propiedades desde una API interna
(/api/user) y organizar dicha información para mostrar estadísticas personalizadas y
un listado de inmuebles. El código adapta dinámicamente el contenido basándose en el
rol del usuario (como agencias o particulares), calculando métricas de disponibilidad
y tipos de operación (venta o alquiler) mediante useMemo para optimizar el rendimiento, 
mientras ofrece estados visuales para la carga de datos y el acceso restringido a usuarios
no autenticados.
*/

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";

import DashboardHeader from "../../features/dashboard/components/DashboardHeader";
import DashboardStats from "../../features/dashboard/components/DashboardStats";
import DashboardMain from "../../features/dashboard/components/DashboardMain";

import { Sparkles } from "lucide-react";

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
  agencyData?: { name?: string | null; properties?: PropertySummary[] | null };
  properties?: PropertySummary[] | null;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const fetchProfile = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/user");
      if (!res.ok) throw new Error("No se pudo cargar el perfil");
      const data = (await res.json()) as ProfileData;
      console.log(data)
      setProfile(data);
    } catch (error) {
      console.error(error);
    }
  }, [status]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const properties = useMemo(() => {
    if (!profile) return [] as PropertySummary[];
    if (profile.role === "REALESTATE") {
      return (
        profile.agencyData?.properties ??
        profile.properties ??
        ([] as PropertySummary[])
      );
    }
    return profile.properties ?? ([] as PropertySummary[]);
  }, [profile]);

  const isAgency =
    profile?.role === "REALESTATE" || session?.user?.role === "REALESTATE";

  const name =
    profile?.agencyData?.name ||
    profile?.name ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    session?.user?.name ||
    "Urbik";

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-pulse text-gray-400 font-medium">
          Cargando Urbik...
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="max-w-md rounded-md border border-gray-200 bg-gray-50 p-8 shadow-sm text-center">
          <h1 className="text-2xl font-black text-black">
            Iniciá sesión para ver tu panel
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Vas a poder ver estadísticas y cargar propiedades.
          </p>
          <button
            onClick={() => signIn()}
            className="mt-6 rounded-full cursor-pointer bg-urbik-black px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <DashboardHeader name={name} isAgency={isAgency} />

        <DashboardStats
          total={properties.length}
          active={properties.filter((p) => p.isAvailable !== false).length}
          sale={properties.filter((p) => p.operationType === "SALE").length}
          rent={properties.filter((p) => p.operationType === "RENT").length}
        />
              <div className="mt-4 flex items-center gap-2 text-xs font-bold  text-urbik-black/60 w-full px-3 py-1 rounded-full mb-5">
                <Sparkles className="w-4 h-4 text-urbik-emerald " />
                Tip: mantené tus propiedades “Disponibles” para mejorar
                visibilidad.
              </div>
        <DashboardMain properties={properties} onRefresh={fetchProfile} />
      </div>
    </div>
  );
}
