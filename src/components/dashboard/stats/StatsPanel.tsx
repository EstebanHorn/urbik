"use client";

import { useEffect, useState } from "react";
import { Eye, Heart, Mail, MessageSquare, Building2, TrendingUp } from "lucide-react";
import KpiCard from "./KpiCard";
import ViewsAreaChart from "./ViewsAreaChart";
import EngagementBarChart from "./EngagementBarChart";
import TopPropertiesTable from "./TopPropertiesTable";
import PricePanel from "./PricePanel";

type DashboardStats = {
  kpis: {
    views7d: number;
    views30d: number;
    viewsAll: number;
    favorites: number;
    inquiries: number;
    chats: number;
    agencyViews30d: number;
    activeListings: number;
    totalListings: number;
  };
  viewsTimeSeries: { day: string; views: number }[];
  agencyViewsTimeSeries: { day: string; views: number }[];
  topProperties: {
    id: string;
    title: string | null;
    image: string | null;
    views: number;
    favorites: number;
    inquiries: number;
    chats: number;
  }[];
};

type PropertyLite = {
  id: string;
  title?: string;
  city?: string;
  province?: string;
};

export default function StatsPanel({ properties }: { properties: PropertyLite[] }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/dashboard")
      .then(async (r) => {
        if (!r.ok) throw new Error("Error cargando estadísticas");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="h-28 animate-pulse=" />
        ))}
      </div>
    );
  }

  const { kpis, viewsTimeSeries, agencyViewsTimeSeries, topProperties } = stats;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Vistas (30d)" value={kpis.views30d} icon={<Eye size={14} />} accent="cyan" hint={`${kpis.views7d} esta semana`} />
        <KpiCard label="Vistas totales" value={kpis.viewsAll} icon={<TrendingUp size={14} />} accent="cyan" />
        <KpiCard label="Favoritos" value={kpis.favorites} icon={<Heart size={14} />} accent="rose" />
        <KpiCard label="Consultas" value={kpis.inquiries} icon={<Mail size={14} />} accent="emerald" />
        <KpiCard label="Chats" value={kpis.chats} icon={<MessageSquare size={14} />} accent="cyan" />
        <KpiCard label="Propiedades activas" value={kpis.activeListings} icon={<Building2 size={14} />} accent="neutral" hint={`${kpis.totalListings} en total`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl overflow-hidden">
          <div className="p-5">
            <div className="text-md font-bold text-urbik-black/60 ml-2">Rendimiento</div>
            <div className="text-3xl italic font-black text-urbik-black">Vistas a tus propiedades</div>
            <p className="text-xs text-gray-500 ml-2 mt-1">Últimos 30 días</p>
          </div>
          <div className="p-4">
            <ViewsAreaChart data={viewsTimeSeries} />
          </div>
        </div>

        <div className="rounded-xl  overflow-hidden flex flex-col">
          <div className="p-5">
            <div className="text-md font-bold text-urbik-black/60 ml-2">Perfil de agencia</div>
            <div className="text-2xl italic font-black text-urbik-black">Visitas</div>
            <p className="text-xs text-gray-500 ml-2 mt-1">Últimos 30 días · {kpis.agencyViews30d} totales</p>
          </div>
          <div className="p-4 flex-1">
            <ViewsAreaChart data={agencyViewsTimeSeries} color="#10B981" gradientId="colorAgencyViews" height={220} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 overflow-hidden">
          <div className="p-5">
            <div className="text-md font-bold text-urbik-black/60 ml-2">Ranking</div>
            <div className="text-2xl italic font-black text-urbik-black">Top 5 más vistas</div>
          </div>
          <div className="p-2">
            <TopPropertiesTable properties={topProperties} />
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="p-5">
            <div className="text-md font-bold text-urbik-black/60 ml-2">Engagement</div>
            <div className="text-2xl italic font-black text-urbik-black">Por propiedad</div>
          </div>
          <div className="p-4">
            <EngagementBarChart data={topProperties} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="p-5">
          <div className="text-md font-bold text-urbik-black/60 ml-2">Precios</div>
          <div className="text-2xl italic font-black text-urbik-black">Historial por propiedad</div>
          <p className="text-xs text-gray-500 ml-2 mt-1">Hacé clic en una propiedad para ver su evolución de precio</p>
        </div>
        <div className="p-4">
          <PricePanel properties={properties} />
        </div>
      </div>
    </div>
  );
}
