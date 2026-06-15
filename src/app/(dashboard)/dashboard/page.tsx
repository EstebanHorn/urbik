"use client";

export const dynamic = "force-dynamic";

import React, { useMemo, useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import DashboardRealestate from "@/components/dashboard/dashboardRealestate";
import DashboardUser from "@/components/dashboard/dashboardUser";

export type PropertySummary = {
  id: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  salePrice?: number;
  rentPrice?: number;
  saleCurrency?: string;
  rentCurrency?: string;
  expenses?: number;
  sale_price?: number;
  rent_price?: number;
  sale_currency?: string;
  rent_currency?: string;
  country?: string;
  city?: string;
  province?: string;
  district?: string;
  locality?: string;
  neighborhood?: string;
  address?: string;
  streetName?: string;
  streetNumber?: string;
  floor?: string;
  unitNumber?: string;
  displayAddress?: string;
  isAvailable?: boolean;
  status?: "AVAILABLE" | "RESERVED" | "SOLD" | "RENTED" | "PAUSED";
  operationType?: "SALE" | "RENT" | "SALE_RENT" | "TEMP_RENT";
  type?: string | null;
  unitType?: string;
  images?: string[];
  area?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  garages?: number;
  plants?: number;
  coveredArea?: number;
  semiCoveredArea?: number;
  uncoveredArea?: number;
  frontLength?: number;
  backLength?: number;
  hectares?: number;
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
  buildingCondition?: string | null;
  buildingFloors?: number | null;
  commercialActivity?: string;
  landUse?: string;
  extraData?: Record<string, unknown>;
};

export type ProfileData = {
  id?: string;
  role?: string;
  isActive?: boolean;
  email?: string;
  name?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  bio?: string | null;
  street?: string | null;
  city?: string | null;
  province?: string | null;
  address?: string | null;
  agencyData?: {
    name?: string | null;
    slug?: string | null;
    logoUrl?: string | null;
    bio?: string | null;
    phone?: string | null;
    street?: string | null;
    city?: string | null;
    province?: string | null;
    address?: string | null;
    properties?: PropertySummary[] | null;
    reviews?: any[] | null;
    reviewCount?: number;
    reviewAverage?: number;
  };
  properties?: PropertySummary[] | null;
  savedProperties?: PropertySummary[] | null;
};

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="animate-pulse text-gray-400 font-medium">Cargando perfil...</div>
        </div>
      }
    >
      <DashboardPageInner />
    </Suspense>
  );
}

function DashboardPageInner() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const autoOpenCreate = searchParams.get("nueva") === "1";

  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const cachedProfile = sessionStorage.getItem("urbik_profile_cache");
      if (cachedProfile) {
        setProfile(JSON.parse(cachedProfile));
      }

      const res = await fetch("/api/user");
      
      if (!res.ok) {
        const errorData = await res.text();
        console.error("🚨 El backend devolvió un error:", res.status, errorData);
        throw new Error(`Falló la API con estado ${res.status}`);
      }

      const data = await res.json();
      
      setProfile(data);
      sessionStorage.setItem("urbik_profile_cache", JSON.stringify(data));
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

  if (status === "loading" || (status === "authenticated" && !profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-pulse text-gray-400 font-medium">Cargando perfil...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="max-w-md rounded-md border border-gray-200 bg-gray-50 p-8 shadow-sm text-center">
          <h1 className="text-2xl font-black text-black">Iniciá sesión para ver tu panel</h1>
          <p className="mt-2 text-sm text-gray-500">Vas a poder ver estadísticas y gestionar tu cuenta.</p>
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
        {profile?.role === "REALESTATE" ? (
          <DashboardRealestate 
            profile={profile} 
            properties={properties} 
            onRefresh={fetchProfile} 
            autoOpenCreate={autoOpenCreate} 
          />
        ) : (
          <DashboardUser 
            profile={profile} 
            onRefresh={fetchProfile} 
          />
        )}
      </div>
    </div>
  );
}