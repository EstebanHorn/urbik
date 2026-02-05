"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
// No importamos next/image para usar img nativo
import ImageUpload from "@/components/ImageUpload";
import { MapLayersProvider } from "@/features/map/components/MapLayersProvider";
import { ClickToCreateProperty } from "@/features/map/components/ClickToCreateProperty";
import { useCreateProperty } from "../hooks/useCreateProperty";
import { AmenitiesGrid } from "./create-modal/AmenitiesGrid";
import {
  PropertyFormFields,
  PropertyFormData,
} from "./create-modal/PropertyFormField";
import LocationSelectors from "@/components/LocationSelectors";
import SmartDescription from "@/components/SmartZone/SmartDescription";
import { SelectedParcel } from "@/features/map/types/types";

// Carga dinámica del mapa
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
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <p className="text-xs font-bold text-urbik-black/40 uppercase tracking-widest">
            Cargando Mapa...
          </p>
        </div>
      </div>
    ),
  },
);

interface CreatePropertyModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialData?: Partial<PropertyFormData>;
}

interface ExtendedSelectedParcel extends SelectedParcel {
  nomenclatura?: string;
}

export default function CreatePropertyModal({
  open,
  onClose,
  onCreated,
  initialData,
}: CreatePropertyModalProps) {
  const {
    step,
    setStep,
    selectedParcel,
    setSelectedParcel,
    form,
    setForm,
    saving,
    message,
    handleSave,
    isEditing,
  } = useCreateProperty(initialData, onCreated, onClose);

  // Casting seguro para asegurar compatibilidad con la interfaz UI
  const safeForm = form as unknown as PropertyFormData;

  // Wrapper para setForm
  const handleSetForm = setForm as React.Dispatch<
    React.SetStateAction<PropertyFormData>
  >;

  const [cityCoords, setCityCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isSearchingCity, setIsSearchingCity] = useState(false);

  const isBuenosAires = form?.province?.toUpperCase().includes("BUENOS AIRES");
  const hasCity = !!form?.city;
  const canSelectParcel = isBuenosAires && hasCity;

  const handleInputChange = (name: string, value: string) => {
    // Casting a any temporal en prev para flexibilidad en actualización dinámica
    // Esto es seguro aquí porque sabemos que 'name' es una key válida
    setForm((prev: any) => ({ ...prev, [name]: value }));
    if (name === "city" || name === "province") {
      setCityCoords(null);
    }
  };

  const isFormComplete =
    !!form.title?.trim() &&
    !!form.operationType &&
    !!form.street?.trim() &&
    (form.operationType === "SALE"
      ? !!form.salePrice
      : form.operationType === "RENT"
        ? !!form.rentPrice
        : !!form.salePrice && !!form.rentPrice) &&
    !!form.areaM2 &&
    !!form.province &&
    !!form.city &&
    (form.images?.length ?? 0) > 0;

  const handleGoToMap = async () => {
    if (!form.city) return;

    setIsSearchingCity(true);
    try {
      const query = `${form.city}, ${form.province}, Argentina`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setCityCoords({
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        });
      }
    } catch (error) {
      console.error("Error obteniendo coordenadas:", error);
    } finally {
      setIsSearchingCity(false);
      setStep(2);
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
            className="relative w-[900px] h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="shrink-0 py-5 px-8 flex items-center justify-between border-b border-gray-100 bg-white z-20">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Urbik_Logo_Mini.svg"
                  alt="Urbik"
                  className="w-8 h-8 opacity-80"
                />
                <div>
                  <h2 className="text-xl font-black text-urbik-black tracking-tight">
                    {isEditing ? "Editar Propiedad" : "Nueva Propiedad"}
                  </h2>
                  <p className="text-xs font-bold text-urbik-black/40 uppercase tracking-widest">
                    {step === 1
                      ? "Paso 1: Información"
                      : "Paso 2: Ubicación Catastral"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all font-black text-sm"
              >
                ✕
              </button>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative bg-white">
              {step === 1 ? (
                <div className="h-full overflow-y-auto custom-scrollbar">
                  <div className="max-w-4xl mx-auto p-8 lg:p-12">
                    <div className="flex flex-col gap-12">
                      {/* SECCIÓN 1 */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-6 h-6 rounded-full bg-urbik-black text-white flex items-center justify-center text-xs font-black">
                            1
                          </span>
                          <h3 className="text-sm font-bold text-urbik-black uppercase tracking-widest">
                            Ubicación Geográfica
                          </h3>
                        </div>

                        <div className="pl-9 space-y-4">
                          <LocationSelectors
                            provinceValue={form.province || ""}
                            cityValue={form.city || ""}
                            onChange={handleInputChange}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
                            <input
                              type="text"
                              placeholder="Calle / Dirección"
                              value={form.street || ""}
                              onChange={(e) =>
                                handleInputChange("street", e.target.value)
                              }
                              className="input-urbik w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-urbik-black outline-none transition-all text-sm font-medium"
                            />
                            <input
                              type="number"
                              placeholder="Altura (Opcional)"
                              value={form.number || ""}
                              onChange={(e) =>
                                handleInputChange("number", e.target.value)
                              }
                              className="input-urbik w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-urbik-black outline-none transition-all text-sm font-medium"
                            />
                          </div>

                          <button
                            type="button"
                            disabled={!canSelectParcel || isSearchingCity}
                            onClick={handleGoToMap}
                            className={`w-full py-4 px-6 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-3 font-bold uppercase text-xs tracking-widest
                                 ${
                                   selectedParcel
                                     ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                                     : "border-gray-300 text-gray-500 hover:border-urbik-black hover:text-urbik-black hover:bg-gray-50"
                                 }
                                 disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isSearchingCity ? (
                              <>
                                <span className="animate-spin">⏳</span>{" "}
                                Buscando zona...
                              </>
                            ) : selectedParcel ? (
                              <>
                                <span>✅</span> Parcela Vinculada (PDA:{" "}
                                {selectedParcel.PDA})
                              </>
                            ) : (
                              <>
                                <span>🗺️</span> Seleccionar Parcela en el Mapa
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <hr className="border-gray-100" />

                      {/* SECCIÓN 2 */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-6 h-6 rounded-full bg-urbik-black text-white flex items-center justify-center text-xs font-black">
                            2
                          </span>
                          <h3 className="text-sm font-bold text-urbik-black uppercase tracking-widest">
                            Detalles de la Propiedad
                          </h3>
                        </div>

                        <div className="pl-9 space-y-8">
                          <PropertyFormFields
                            form={safeForm}
                            setForm={handleSetForm}
                          />

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-urbik-black/50 uppercase tracking-widest ml-1">
                              Descripción
                            </label>
                            <textarea
                              rows={5}
                              placeholder="Describí los puntos fuertes de la propiedad..."
                              value={form.description || ""}
                              onChange={(e) =>
                                handleInputChange("description", e.target.value)
                              }
                              className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-urbik-black outline-none transition-all text-sm font-serif bg-gray-50 focus:bg-white resize-none"
                            />

                            <SmartDescription
                              description={form.description || ""}
                              context={{
                                salePrice: form.salePrice,
                                rentPrice: form.rentPrice,
                                area: form.areaM2,
                                type: form.operationType,
                                city: form.city,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <hr className="border-gray-100" />

                      {/* SECCIÓN 3 */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-6 h-6 rounded-full bg-urbik-black text-white flex items-center justify-center text-xs font-black">
                            3
                          </span>
                          <h3 className="text-sm font-bold text-urbik-black uppercase tracking-widest">
                            Multimedia y Extras
                          </h3>
                        </div>

                        <div className="pl-9 space-y-8">
                          <AmenitiesGrid
                            value={form.amenities || {}}
                            // Fix TS2345: Tipado explícito de prev en setForm
                            onChange={(val) =>
                              setForm((prev: any) => ({
                                ...prev,
                                amenities: val,
                              }))
                            }
                          />

                          <ImageUpload
                            value={form.images || []}
                            onChange={(urls) =>
                              setForm((prev: any) => ({
                                ...prev,
                                images: urls,
                              }))
                            }
                            onRemove={(url) =>
                              setForm((prev: any) => ({
                                ...prev,
                                images: (prev.images || []).filter(
                                  (i: string) => i !== url,
                                ),
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* FOOTER */}
                      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm py-6 border-t border-gray-100 flex justify-between items-center z-10">
                        <span className="text-xs font-bold text-gray-400">
                          {isFormComplete
                            ? "✨ Todo listo para publicar"
                            : "* Completá los campos obligatorios"}
                        </span>
                        <button
                          onClick={handleSave}
                          type="button"
                          disabled={saving || !isFormComplete}
                          className="px-10 py-4 rounded-full bg-urbik-black text-white text-xs font-black uppercase tracking-widest shadow-xl hover:bg-gray-800 hover:shadow-2xl transition-all disabled:opacity-30 disabled:shadow-none transform active:scale-95"
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
                </div>
              ) : (
                /* PASO 2: MAPA */
                <div
                  key="step-map"
                  className="h-full grid grid-cols-1 lg:grid-cols-[1fr_350px]"
                >
                  <div className="relative bg-slate-100 overflow-hidden">
                    <MapLayersProvider>
                      <InteractiveMap
                        key={`map-${form.city}-${cityCoords?.lat || "default"}`}
                        lat={selectedParcel?.lat ?? cityCoords?.lat ?? -34.9214}
                        lon={selectedParcel?.lon ?? cityCoords?.lon ?? -57.9545}
                        height="100%"
                        selectedParcel={selectedParcel}
                      >
                        <ClickToCreateProperty
                          onParcelPicked={setSelectedParcel}
                        />
                      </InteractiveMap>
                    </MapLayersProvider>

                    {!selectedParcel && (
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-urbik-black/10 z-10 pointer-events-none">
                        <p className="text-xs font-bold text-urbik-black animate-pulse">
                          👇 Hacé clic sobre una parcela para seleccionarla
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-8 flex flex-col justify-between border-l border-gray-100 bg-white shadow-xl z-20">
                    <div className="space-y-8">
                      <button
                        onClick={() => setStep(1)}
                        type="button"
                        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-urbik-black transition-colors"
                      >
                        <span className="text-lg group-hover:-translate-x-1 transition-transform">
                          ←
                        </span>{" "}
                        Volver
                      </button>

                      {!selectedParcel ? (
                        <div className="mt-10 text-center opacity-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/Urbik_Logo_Smart_Zone.svg"
                            alt="Select"
                            width={80}
                            height={80}
                            className="mx-auto mb-4 grayscale"
                          />
                          <p className="text-sm font-bold text-gray-900">
                            Esperando selección...
                          </p>
                        </div>
                      ) : (
                        <div className="animate-in slide-in-from-right-4 duration-500">
                          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                              <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
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
                              <span className="text-gray-400 font-medium">
                                Ciudad
                              </span>
                              <span className="font-bold text-gray-800">
                                {form.city}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs border-b border-gray-100 pb-2">
                              <span className="text-gray-400 font-medium">
                                Nomenclatura
                              </span>
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
                      onClick={() => setStep(1)}
                      type="button"
                      className="w-full bg-urbik-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-30 disabled:transform-none transform active:scale-95"
                    >
                      Confirmar Selección
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
