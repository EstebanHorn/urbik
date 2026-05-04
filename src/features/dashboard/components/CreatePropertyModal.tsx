"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapLayersProvider } from "@/features/map/components/MapLayersProvider";
import { ClickToCreateProperty } from "@/features/map/components/ClickToCreateProperty";
import { usePropertyUploadForm } from "../hooks/usePropertyUploadForm";
import { CompletionIndicator } from "./create-modal/CompletionIndicator";
import { ModuleShell } from "./create-modal/ModuleShell";
import { Module01PropertyData } from "./create-modal/Module01PropertyData";
import { Module02Location } from "./create-modal/Module02Location";
import { Module03Content } from "./create-modal/Module03Content";
import { Module04Surfaces } from "./create-modal/Module04Surfaces";
import { Module05Environments } from "./create-modal/Module05Environments";
import { Module06BasicCharacteristics } from "./create-modal/Module06BasicCharacteristics";
import { Module07Tags } from "./create-modal/Module07Tags";
import { Module08BuildingInfo } from "./create-modal/Module08BuildingInfo";
import { Module09CommercialInfo } from "./create-modal/Module09CommercialInfo";
import { Module10FieldInfo } from "./create-modal/Module10FieldInfo";
import { Module11LandInfo } from "./create-modal/Module11LandInfo";
import { Module12Multimedia } from "./create-modal/Module12Multimedia";
import { Module13ContactInfo } from "./create-modal/Module13ContactInfo";
import { MODULE_DEFINITIONS, getVisibleModules } from "./create-modal/moduleDefinitions";
import type { PropertyInitialData } from "../hooks/useCreateProperty";
import type { SelectedParcel } from "@/features/map/types/types";
import type { PropertyUploadFormData } from "./create-modal/types";

const InteractiveMap = dynamic(
  () =>
    import("@/features/map/components/InteractiveMapClient").then(
      (m) => m.InteractiveMapClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <p className="text-xs font-bold text-urbik-black/40 tracking-widest">
            Cargando Mapa...
          </p>
        </div>
      </div>
    ),
  },
);

interface ExtendedSelectedParcel extends SelectedParcel {
  nomenclatura?: string;
}

interface CreatePropertyModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialData?: Partial<PropertyInitialData>;
}

const ALL_MODULE_IDS = MODULE_DEFINITIONS.map((m) => m.id);

export default function CreatePropertyModal({
  open,
  onClose,
  onCreated,
  initialData,
}: CreatePropertyModalProps) {
  const {
    rhf,
    saving,
    message,
    selectedParcel,
    setSelectedParcel,
    handleSave,
    isEditing,
    isFormComplete,
  } = usePropertyUploadForm(
    (initialData as PropertyInitialData) ?? null,
    onCreated,
    onClose,
  );

  const [step, setStep] = useState<"form" | "map">("form");
  const [cityCoords, setCityCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isSearchingCity, setIsSearchingCity] = useState(false);

  const [openModules, setOpenModules] = useState<Set<number>>(new Set(ALL_MODULE_IDS));
  const [activeModuleId, setActiveModuleId] = useState<number | null>(1);

  const formScrollRef = useRef<HTMLDivElement>(null);

  const formValues = rhf.watch() as PropertyUploadFormData;
  const visibleModules = getVisibleModules(formValues.type);

  const toggleModule = useCallback((id: number) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setActiveModuleId(id);
  }, []);

  const scrollToModule = useCallback((id: number) => {
    setActiveModuleId(id);
    setOpenModules((prev) => new Set(prev).add(id));
    setTimeout(() => {
      const el = document.getElementById(`module-${id}`);
      if (el && formScrollRef.current) {
        const top = el.offsetTop - formScrollRef.current.offsetTop - 16;
        formScrollRef.current.scrollTo({ top, behavior: "smooth" });
      }
    }, 50);
  }, []);

  const handleOpenMap = async () => {
    const city = rhf.getValues("city");
    const province = rhf.getValues("province");
    if (!city) return;
    setIsSearchingCity(true);
    try {
      const query = `${city}, ${province}, Argentina`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      );
      const data = await res.json();
      if (data?.length > 0) {
        setCityCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
      }
    } catch {
      /* no-op */
    } finally {
      setIsSearchingCity(false);
      setStep("map");
    }
  };

  const parcelDisplay = selectedParcel as ExtendedSelectedParcel | null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-urbik-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            className="relative w-[1100px] max-w-[98vw] h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="shrink-0 py-4 px-8 flex items-center justify-between border-b border-gray-100 bg-white z-20">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Urbik_Logo_Mini.svg" alt="Urbik" className="w-8 h-8 opacity-80" />
                <div>
                  <h2 className="text-xl font-black text-urbik-black tracking-tight">
                    {isEditing ? "Editar Propiedad" : "Nueva Propiedad"}
                  </h2>
                  <p className="text-xs font-bold text-urbik-black/40 tracking-widest">
                    {step === "map" ? "Ubicacion Catastral" : "Modulos del aviso"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all font-black text-sm"
              >
                x
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-hidden">
              {step === "form" ? (
                <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_240px]">
                  {/* Form scroll area */}
                  <div ref={formScrollRef} className="h-full overflow-y-auto custom-scrollbar">
                    <div className="max-w-3xl mx-auto p-6 lg:p-10 flex flex-col gap-4">

                      {visibleModules.map((mod) => {
                        const isOpen = openModules.has(mod.id);

                        return (
                          <ModuleShell
                            key={mod.id}
                            id={mod.id}
                            label={mod.label}
                            status={mod.getStatus(formValues)}
                            isOpen={isOpen}
                            onToggle={() => toggleModule(mod.id)}
                          >
                            {mod.id === 1 && <Module01PropertyData rhf={rhf} />}
                            {mod.id === 2 && (
                              <Module02Location
                                rhf={rhf}
                                onOpenMap={handleOpenMap}
                                selectedParcelPDA={selectedParcel?.PDA ?? null}
                                isSearchingCity={isSearchingCity}
                              />
                            )}
                            {mod.id === 3 && <Module03Content rhf={rhf} />}
                            {mod.id === 4 && <Module04Surfaces rhf={rhf} />}
                            {mod.id === 5 && <Module05Environments rhf={rhf} />}
                            {mod.id === 6 && <Module06BasicCharacteristics rhf={rhf} />}
                            {mod.id === 7 && <Module07Tags rhf={rhf} />}
                            {mod.id === 8 && <Module08BuildingInfo rhf={rhf} />}
                            {mod.id === 9 && <Module09CommercialInfo rhf={rhf} />}
                            {mod.id === 10 && <Module10FieldInfo rhf={rhf} />}
                            {mod.id === 11 && <Module11LandInfo rhf={rhf} />}
                            {mod.id === 12 && <Module12Multimedia rhf={rhf} />}
                            {mod.id === 13 && <Module13ContactInfo rhf={rhf} />}
                          </ModuleShell>
                        );
                      })}

                      {/* Footer */}
                      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm py-5 border-t border-gray-100 flex justify-between items-center z-10 -mx-6 lg:-mx-10 px-6 lg:px-10 mt-2">
                        <span className="text-xs font-bold text-gray-400">
                          {isFormComplete()
                            ? "Todo listo para publicar"
                            : "* Completa los campos obligatorios"}
                        </span>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving || !isFormComplete()}
                          className="px-10 py-4 rounded-full bg-urbik-black text-white text-xs font-black tracking-widest shadow-xl hover:bg-gray-800 hover:shadow-2xl transition-all disabled:opacity-30 disabled:shadow-none transform active:scale-95"
                        >
                          {saving
                            ? "Publicando..."
                            : isEditing
                              ? "Guardar Cambios"
                              : "Publicar Propiedad"}
                        </button>
                      </div>

                      {message && (
                        <div className="p-4 bg-red-50 text-red-600 text-xs font-bold text-center rounded-lg border border-red-100">
                          {message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Completion indicator sidebar */}
                  <div className="hidden lg:flex flex-col border-l border-gray-100 bg-gray-50/80 p-4 overflow-hidden">
                    <CompletionIndicator
                      modules={visibleModules}
                      form={formValues}
                      activeModuleId={activeModuleId}
                      onModuleClick={scrollToModule}
                    />
                  </div>
                </div>
              ) : (
                /* MAP STEP */
                <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_350px]">
                  <div className="relative bg-slate-100 overflow-hidden">
                    <MapLayersProvider>
                      <InteractiveMap
                        key={`map-${rhf.getValues("city")}-${cityCoords?.lat ?? "default"}`}
                        lat={selectedParcel?.lat ?? cityCoords?.lat ?? -34.9214}
                        lon={selectedParcel?.lon ?? cityCoords?.lon ?? -57.9545}
                        height="100%"
                        selectedParcel={selectedParcel}
                      >
                        <ClickToCreateProperty onParcelPicked={setSelectedParcel} />
                      </InteractiveMap>
                    </MapLayersProvider>

                    {!selectedParcel && (
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-urbik-black/10 z-10 pointer-events-none">
                        <p className="text-xs font-bold text-urbik-black animate-pulse">
                          Hace clic sobre una parcela para seleccionarla
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-8 flex flex-col justify-between border-l border-gray-100 bg-white shadow-xl z-20">
                    <div className="space-y-8">
                      <button
                        onClick={() => setStep("form")}
                        type="button"
                        className="group flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 hover:text-urbik-black transition-colors"
                      >
                        <span className="text-lg group-hover:-translate-x-1 transition-transform">
                          {"<"}
                        </span>
                        Volver al formulario
                      </button>

                      {!selectedParcel ? (
                        <div className="mt-10 text-center opacity-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/Urbik_Logo_Smart_Zone.svg"
                            alt="Seleccionar parcela"
                            width={80}
                            height={80}
                            className="mx-auto mb-4 grayscale"
                          />
                        </div>
                      ) : (
                        <div className="animate-in slide-in-from-right-4 duration-500">
                          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <p className="text-[10px] font-black text-emerald-700 tracking-widest">
                                Parcela Detectada
                              </p>
                            </div>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">
                              {selectedParcel.PDA || "S/D"}
                            </p>
                            <p className="text-xs text-gray-500 font-medium mt-1">
                              Partida Inmobiliaria
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between text-xs border-b border-gray-100 pb-2">
                              <span className="text-gray-400 font-medium">Ciudad</span>
                              <span className="font-bold text-gray-800">
                                {rhf.getValues("city")}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs border-b border-gray-100 pb-2">
                              <span className="text-gray-400 font-medium">Nomenclatura</span>
                              <span className="font-bold text-gray-800 truncate max-w-[150px]">
                                {parcelDisplay?.nomenclatura || "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      disabled={!selectedParcel}
                      onClick={() => setStep("form")}
                      type="button"
                      className="w-full bg-urbik-black text-white py-4 rounded-xl font-black text-xs tracking-widest hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-30 transform active:scale-95"
                    >
                      Confirmar Seleccion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
