/*
Este componente de React representa el panel principal de administración de una plataforma
inmobiliaria, permitiendo al usuario visualizar, crear y editar publicaciones de propiedades
de manera interactiva. El código integra una lista de propiedades con funcionalidades de
edición y creación mediante modales, y complementa la interfaz con un área de análisis de
datos que incluye un gráfico de áreas (utilizando Recharts) para mostrar las vistas mensuales
y una tarjeta destacada con la propiedad más visitada. Mediante el uso de hooks como useState
para el manejo de estados de los formularios y useMemo para optimizar cálculos de rendimiento,
el componente ofrece una experiencia dinámica y visualmente organizada para la gestión de activos
inmobiliarios.
*/

"use client";

import React, { useMemo, useState, useEffect } from "react";
import type { PropertySummary } from "../../../app/dashboard/page";

import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";
import CreatePropertyModal from "./CreatePropertyModal";
import EditPropertyModal from "./EditPropertyModal";
import PropertiesList from "./PropertiesList";
import InquiriesPanel from "./InquiriesPanel";

const mockViews = [
  { name: "Ene", views: 200 },
  { name: "Feb", views: 250 },
  { name: "Mar", views: 180 },
  { name: "Abr", views: 220 },
  { name: "May", views: 190 },
  { name: "Jun", views: 240 },
  { name: "Jul", views: 280 },
];

type ActiveTab = "properties" | "inquiries";

export default function DashboardMain({
  properties,
  onRefresh,
  autoOpenCreate = false,
}: {
  properties: PropertySummary[];
  onRefresh: () => void;
  autoOpenCreate?: boolean;
}) {
  const [isCreateOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (autoOpenCreate) {
      setCreateOpen(true);
    }
  }, [autoOpenCreate]);
  const [editingProperty, setEditingProperty] =
    useState<PropertySummary | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("properties");

  const mostViewed = useMemo(() => properties[0] ?? null, [properties]);

  const lastMonthViews = useMemo(() => {
    return mockViews.reduce((acc, x) => acc + x.views, 0);
  }, []);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 mt-20">
        <div className="flex items-center gap-1 border border-gray-100 bg-gray-50 rounded-full p-1 w-fit">
          <button
            onClick={() => setActiveTab("properties")}
            className={`px-5 py-2 rounded-full text-sm font-black transition-all cursor-pointer ${
              activeTab === "properties"
                ? "bg-urbik-black text-white shadow-sm"
                : "text-urbik-black/50 hover:text-urbik-black"
            }`}
          >
            Propiedades
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`px-5 py-2 rounded-full text-sm font-black transition-all cursor-pointer ${
              activeTab === "inquiries"
                ? "bg-urbik-black text-white shadow-sm"
                : "text-urbik-black/50 hover:text-urbik-black"
            }`}
          >
            Consultas
          </button>
        </div>

        {activeTab === "properties" && (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setCreateOpen(true)}
              className="bg-urbik-cyan text-urbik-black/80 py-3 px-6 rounded-full border border-white font-black text-md hover:bg-urbik-white hover:border-urbik-cyan cursor-pointer hover:text-urbik-cyan transition-all shadow-cyan-500/20 transform active:scale-95"
            >
              Cargar propiedad
            </button>
          </div>
        )}
      </div>

      {activeTab === "inquiries" ? (
        <InquiriesPanel />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 md border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="p-2 sm:p-4">
            <PropertiesList
              properties={properties}
              onRefresh={onRefresh}
              onEdit={(prop) => setEditingProperty(prop)}
            />
          </div>
        </div>

        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="rounded-md border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="text-md font-bold text-urbik-black/60 ml-2">
                Rendimiento
              </div>
              <div className="text-3xl italic font-black text-urbik-black">
                Vistas
              </div>
            </div>

            <div className="p-4">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={mockViews}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#00F0FF"
                        stopOpacity={0.16}
                      />
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <Tooltip
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    }}
                    labelStyle={{ fontWeight: 800 }}
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    dy={10}
                  />

                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#00F0FF"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorViews)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-5 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">
                Último mes
              </span>
              <span className="text-xl font-black text-gray-900">
                {lastMonthViews}
              </span>
            </div>
          </div>

          <div className="rounded-md border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="text-md font-bold text-urbik-black/60 ml-2">
                Tendencia
              </div>
              <div className="text-2xl italic font-black text-urbik-black">
                Más vista
              </div>
            </div>

            <div className="h-40 bg-gray-100 relative">
              {mostViewed?.images?.[0] ? (
                <img
                  src={mostViewed.images[0]}
                  alt="Most viewed"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-50">
                  Sin imagen
                </div>
              )}
            </div>

            <div className="p-5">
              <h3 className="font-black text-base leading-tight text-gray-900 line-clamp-2">
                {mostViewed?.title ?? "Aún no hay datos"}
              </h3>
              <p className="text-gray-500 text-xs mt-1 font-medium">
                {mostViewed?.city ?? "—"}
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-lg font-black text-gray-900">
                  {/* Aquí deberías ajustar si usas salePrice/rentPrice en PropertySummary, 
                      por ahora mantengo .price para no romper lógica existente si no cambiaste PropertySummary */}
                  {typeof mostViewed?.price === "number"
                    ? `USD ${mostViewed.price.toLocaleString("es-AR")}`
                    : "—"}
                </div>
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                  {mostViewed?.operationType ?? ""}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      <CreatePropertyModal
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={onRefresh}
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
          onClose={() => setEditingProperty(null)}
          onUpdated={onRefresh}
        />
      )}
    </>
  );
}
