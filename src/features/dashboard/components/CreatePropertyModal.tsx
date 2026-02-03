/*
Este componente de React, denominado CreatePropertyModal, implementa un modal interactivo para
la creación y edición de propiedades inmobiliarias en Next.js, estructurado en un proceso de
dos pasos. En la primera etapa, el usuario completa un formulario con metadatos esenciales como
ubicación, precio, descripción y carga de imágenes; en la segunda etapa, el sistema utiliza la
API de Nominatim para geolocalizar la ciudad y despliega un mapa interactivo (cargado
dinámicamente sin SSR) que permite al usuario seleccionar una parcela catastral específica
mediante el componente ClickToCreateProperty. El código gestiona estados complejos como la
navegación entre pasos, la validación de campos obligatorios, animaciones con Framer Motion y
la integración de proveedores de capas de mapas, culminando en la ejecución de la función
handleSave para persistir los datos de la propiedad.
*/

"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ImageUpload from "@/components/ImageUpload";
import { MapLayersProvider } from "@/features/map/components/MapLayersProvider";
import { ClickToCreateProperty } from "@/features/map/components/ClickToCreateProperty";
import { useCreateProperty } from "../hooks/useCreateProperty";
import { AmenitiesGrid } from "./create-modal/AmenitiesGrid";
import { PropertyFormFields } from "./create-modal/PropertyFormField";
import LocationSelectors from "././../../../components/LocationSelectors";
import SmartDescription from "../../../components/SmartZone/SmartDescription";


const InteractiveMap = dynamic(
  () => import("@/features/map/components/InteractiveMapClient").then((m) => m.InteractiveMapClient),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-urbik-black/60 font-bold">CARGANDO MAPA...</div>
  }
);

export default function CreatePropertyModal({ open, onClose, onCreated, initialData }: any) {
  const { 
    step, setStep, selectedParcel, setSelectedParcel, 
    form, setForm, saving, message, handleSave, isEditing 
  } = useCreateProperty(initialData, onCreated, onClose);

  const [cityCoords, setCityCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isSearchingCity, setIsSearchingCity] = useState(false);

  const isBuenosAires = form?.province?.toUpperCase().includes("BUENOS AIRES");
  const hasCity = form?.city && form.city !== "";
  const canSelectParcel = isBuenosAires && hasCity;

  const handleInputChange = (name: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [name]: value }));
    if (name === "city" || name === "province") {
      setCityCoords(null);
    }
  };

const isFormComplete = 
  !!form.title?.trim() &&
  !!form.operationType &&
  !!form.street?.trim() &&
  (form.operationType === "SALE" ? !!form.salePrice : 
   form.operationType === "RENT" ? !!form.rentPrice : 
   (!!form.salePrice && !!form.rentPrice)) &&
  !!form.areaM2 &&
  !!form.province &&
  !!form.city &&
  form.images && form.images.length > 0;

  const handleGoToMap = async () => {
    if (!form.city) return;
    
    setIsSearchingCity(true);
    try {
      const query = `${form.city}, ${form.province}, Argentina`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setCityCoords({
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        });
      }
    } catch (error) {
      console.error("Error obteniendo coordenadas de la ciudad:", error);
    } finally {
      setIsSearchingCity(false);
      setStep(2);
    }
  };


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
          className="relative w-[800px] h-[85vh] bg-white rounded-md shadow-2xl overflow-hidden flex flex-col"
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="shrink-0 py-5 px-10 flex items-center justify-between shadow-xl z-300">
            <img src="./Urbik_Logo_Mini.svg" alt="" className=" w-10 invert brightness-200"/>
            <div className="flex flex-col justify-center items-center">
              <span className="text-3xl font-black text-urbik-black italic">
                {isEditing ? "Editar Propiedad" : "Nueva Propiedad"}
              </span>
              <h2 className="text-md font-bold text-urbik-black/60 ">
                {step === 1 ? "Datos de la Propiedad" : "Seleccionar Parcela en Mapa"}
              </h2>
            </div>
            <button onClick={onClose} className="text-urbik-black cursor-pointer hover:text-black/60 transition font-black text-2xl">✕</button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {step === 1 ? (
              <div className="h-full overflow-y-auto p-8 ">
                <div className="max-w-5xl mx-auto">
                  <div className="flex flex-col gap-8">
                    <div className="flex-1 space-y-6">
                      <div className="p-12 space-y-8">
                        
                        <div className="space-y-4">
                          <label className="block text-md ml-5 font-bold text-urbik-black/50">Ubicación Geográfica</label>
                          
                          <LocationSelectors 
                             provinceValue={form.province || ""} 
                             cityValue={form.city || ""} 
                             onChange={handleInputChange} 
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="Calle (Obligatorio)"
                              value={form.street || ""}
                              onChange={(e) => handleInputChange("street", e.target.value)}
                              className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
                            />
                            <input
                              type="number"
                              placeholder="Número (Opcional)"
                              value={form.number || ""}
                              onChange={(e) => handleInputChange("number", e.target.value)}
                              className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
                            />
                          </div>
                          
                          <button
                             type="button"
                             disabled={!canSelectParcel || isSearchingCity}
                             onClick={handleGoToMap}
                             className={`w-full py-4 px-6 cursor-pointer rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-2 font-black uppercase tracking-wide
                               ${selectedParcel 
                                 ? "border-green-500 text-green-600 bg-green-50" 
                                 : "border-gray-300 text-gray-600 hover:border-black hover:text-black"
                               }
                               disabled:opacity-20 disabled:cursor-not-allowed`}
                          >
                             {isSearchingCity 
                               ? "Buscando ubicación..." 
                               : selectedParcel ? "Parcela Seleccionada" : "Seleccionar Parcela en el Mapa"}
                          </button>
                          {!canSelectParcel && (
                             <p className="text-[10px] text-urbik-black/60 font-medium italic text-center">
                               Habilitado momentaneamente para Provincia de Buenos Aires.
                             </p>
                          )}
                        </div>

                        <PropertyFormFields form={form} setForm={setForm} />

                        <div className="space-y-4 -mb-20">
                          <label className="block text-md ml-5 font-bold text-urbik-black/50">
                            Descripción de la Propiedad
                          </label>
                          <textarea
                            rows={7}
                            placeholder="Escribe una descripción detallada..."
                            value={form.description || ""}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-2 rounded-md focus:border-urbik-black outline-none transition-all"
                          />
                          
                          <SmartDescription 
                            description={form.description || ""} 
                            context={{
                              salePrice: form.salePrice,
                              rentPrice: form.rentPrice,
                              area: form.areaM2,
                              type: form.operationType,
                              city: form.city
                            }}
                          />
                        </div>
                      </div>

                      <div className="p-12">
                        <label className="block text-md ml-5 font-bold text-urbik-black/50 mb-3">Otras Características</label>
                        <AmenitiesGrid value={form.amenities} onChange={(val) => setForm({...form, amenities: val})} />
                      </div>

                      <div className="space-y-6 px-12">
                        <div className="">
                          <ImageUpload 
                            value={form.images} 
                            onChange={(urls) => setForm({...form, images: urls})}
                            onRemove={(url) => setForm({...form, images: form.images.filter((i:any) => i !== url)})}
                          />
                        </div>
                        <div className="flex justify-end">
                          <button 
                            onClick={handleSave} 
                            disabled={saving || !isFormComplete}
                            className="px-7 text-xs cursor-pointer bg-urbik-emerald border border-urbik-white text-urbik-dark py-4 rounded-full 
                            font-black uppercase tracking-wide hover:bg-urbik-emerald transition disabled:opacity-20"
                          >
                            {saving ? "Guardando..." : "Publicar Propiedad"}
                          </button>
                          {message && <p className="mt-4 text-center text-xs font-bold text-urbik-rose">{message}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* PASO 2: MAPA */
              <div key="step-map" className="h-full grid grid-cols-1 lg:grid-cols-[1fr_380px]">
                <div className="relative bg-slate-100 overflow-hidden">
                  <MapLayersProvider>
                    <InteractiveMap 
                      key={`map-${form.city}-${cityCoords?.lat || 'default'}`} 
                      lat={selectedParcel?.lat ?? cityCoords?.lat ?? -34.9214} 
                      lon={selectedParcel?.lon ?? cityCoords?.lon ?? -57.9545} 
                      height="100%" 
                      selectedParcel={selectedParcel}
                    >
                      <ClickToCreateProperty onParcelPicked={setSelectedParcel} />
                    </InteractiveMap>
                  </MapLayersProvider>
                </div>

                <div className="p-8 flex flex-col justify-between border-l border-gray-100 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.05)] z-10">
                  <div className="space-y-6">
                    <button 
                      onClick={() => setStep(1)} 
                      className="group cursor-pointer flex items-center gap-2 text-xs font-black text-urbik-black/60 hover:text-black transition-all"
                    >
                      <span className="text-lg">←</span> VOLVER AL FORMULARIO
                    </button>
                    
                    {!selectedParcel ? (
                      <div className="py-10">
                        <p className="text-lg font-black text-gray-900 leading-tight">Buscando en {form.city}</p>
                        <p className="text-urbik-black/60 font-medium text-sm mt-2 italic">Haz clic sobre la parcela catastral para seleccionarla.</p>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                           <p className="text-[10px] font-black text-urbik-black/60 uppercase mb-2">Parcela Detectada</p>
                           <p className="text-2xl font-black text-gray-900">{selectedParcel.PDA || "Sin Partida"}</p>
                           <div className="mt-4 pt-4 border-t border-gray-200">
                             <p className="text-xs font-bold text-urbik-black/60 uppercase">{form.city}, {form.province}</p>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    disabled={!selectedParcel}
                    onClick={() => setStep(1)}
                    className="w-full cursor-pointer bg-urbik-black text-white py-5 rounded-2xl font-black uppercase hover:bg-gray-800 transition-all shadow-lg disabled:opacity-30 disabled:scale-95"
                  >
                    Confirmar y Continuar
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