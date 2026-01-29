/*
Este código define un componente de React para Next.js llamado EditPropertyModal que gestiona
una interfaz modal animada con Framer Motion para la edición de propiedades. Utiliza un hook
personalizado (useEditProperty) para controlar la lógica de estado y acciones, permitiendo al
usuario modificar datos a través de un formulario, gestionar archivos multimedia con un componente
de carga de imágenes y actualizar la ubicación geográfica mediante un mapa interactivo cargado
dinámicamente (ssr: false) para optimizar el rendimiento. La interfaz implementa un diseño de
pantalla dividida y estados condicionales que permiten alternar entre la vista de edición general
y una vista de mapa a pantalla completa dentro del mismo modal, asegurando la persistencia de los
cambios y mostrando indicadores visuales durante el proceso de guardado.
*/

"use client";

import dynamic from "next/dynamic";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import ImageUpload from "@/components/ImageUpload";
import { MapLayersProvider } from "@/features/map/components/MapLayersProvider";
import { ClickToCreateProperty } from "@/features/map/components/ClickToCreateProperty";
import { useEditProperty } from "../hooks/useEditProperty";
import { EditPropertyForm } from "./EditPropertyForm";

const InteractiveMap = dynamic(() => import("@/features/map/components/InteractiveMap").then((m) => m.InteractiveMap), { ssr: false });

export default function EditPropertyModal({ open, onClose, onUpdated, property }: any) {
  const { state, actions } = useEditProperty(property, onUpdated, onClose);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="bg-white w-[1100px] h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-xl font-black text-gray-900">Editar Propiedad</h2>
              <p className="text-xs text-gray-500 font-medium">Editando: {property.title}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-black">✕</button>
          </div>

          <div className="flex-1 overflow-hidden flex relative">
            {state.viewMap && (
              <div className="absolute inset-0 z-20 bg-slate-100 flex flex-col">
                <div className="flex-1 relative">
                  <MapLayersProvider>
                    <InteractiveMap lat={state.selectedParcel.lat} lon={state.selectedParcel.lon} height="100%" query="edition">
                      <ClickToCreateProperty onParcelPicked={(p) => actions.setSelectedParcel(p)} />
                    </InteractiveMap>
                  </MapLayersProvider>
                </div>
                <div className="p-4 bg-white border-t flex justify-between items-center">
                  <span className="text-xs text-gray-500">Seleccioná la nueva ubicación.</span>
                  <button onClick={() => actions.setViewMap(false)} className="bg-black text-white px-6 py-2 rounded-full font-bold text-sm">Confirmar</button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-8 bg-white">
              <div className="max-w-4xl mx-auto flex gap-8">
                <EditPropertyForm state={state} actions={actions} />
                
                <div className="w-[320px] space-y-6">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <ImageUpload value={state.images} onChange={actions.setImages} onRemove={(url) => actions.setImages(state.images.filter((i: string) => i !== url))} />
                  </div>
                  <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Ubicación</span>
                    <button onClick={() => actions.setViewMap(true)} className="text-xs font-bold text-sky-500 hover:underline">Editar en mapa</button>
                  </div>
                  <button onClick={actions.handleUpdate} disabled={state.saving} className="w-full bg-[#00F0FF] py-4 rounded-xl font-black text-sm uppercase hover:bg-cyan-300 transition shadow-lg shadow-cyan-500/20">
                    {state.saving ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}