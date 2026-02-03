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

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import ImageUpload from "@/components/ImageUpload";
import { useEditProperty } from "../hooks/useEditProperty"; 
import { AmenitiesGrid } from "./create-modal/AmenitiesGrid";
import { PropertyFormFields } from "./create-modal/PropertyFormField";
import SmartDescription from "../../../components/SmartZone/SmartDescription";

export default function EditPropertyModal({ open, onClose, onUpdated, property }: any) {
  const { 
    form, 
    setForm, 
    saving, 
    message, 
    handleUpdate 
  } = useEditProperty(property, onUpdated, onClose);

  const isFormComplete = 
    !!form.title?.trim() &&
    !!form.operationType &&
    (!!form.areaM2 || !!form.area) &&
    form.images?.length > 0;

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
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 py-5 px-10 flex items-center justify-between shadow-xl z-30">
              <img src="/Urbik_Logo_Mini.svg" alt="Logo" className="w-10 invert brightness-200"/>
              <div className="flex flex-col justify-center items-center">
                <span className="text-3xl font-black text-urbik-black italic">Editar Propiedad</span>
                <h2 className="text-md font-bold text-urbik-black/60 ">Actualiza la información de tu publicación</h2>
              </div>
              <button onClick={onClose} className="text-urbik-black cursor-pointer hover:text-black/60 transition font-black text-2xl">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-5xl mx-auto space-y-8">
                
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <label className="block text-xs font-black text-urbik-black/40 uppercase ml-2">Ubicación Inamovible</label>
                  <p className="text-lg font-bold text-urbik-black px-2">
                    {form.address || form.street} {form.number}, {form.city}, {form.province}
                  </p>
                  <p className="text-[10px] text-urbik-black/50 italic px-2">
                    La ubicación y parcela catastral no pueden ser modificadas después de la creación.
                  </p>
                </div>

                <div className="px-4">
                  <PropertyFormFields form={form} setForm={setForm} />
                </div>

                <div className="space-y-4 px-4">
                  <label className="block text-md ml-5 font-bold text-urbik-black/50">
                    Descripción de la Propiedad
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Escribe una descripción detallada..."
                    value={form.description || ""}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-2xl focus:border-urbik-black outline-none transition-all"
                  />
                  
                  <SmartDescription 
                    description={form.description || ""} 
                    context={{
                      salePrice: form.salePrice,
                      rentPrice: form.rentPrice,
                      area: form.areaM2 || form.area,
                      type: form.operationType,
                      city: form.city
                    }}
                  />
                </div>

                <div className="p-4">
                  <label className="block text-md ml-5 font-bold text-urbik-black/50 mb-3">Otras Características</label>
                  <AmenitiesGrid 
                    value={form.amenities || []} 
                    onChange={(val) => setForm({...form, amenities: val})} 
                  />
                </div>

                <div className="space-y-6 px-4 pb-10">
                  <ImageUpload 
                    value={form.images || []} 
                    onChange={(urls) => setForm({...form, images: urls})}
                    onRemove={(url) => setForm({...form, images: form.images.filter((i:any) => i !== url)})}
                  />
                  
                  <div className="flex flex-col items-end gap-3">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleUpdate();
                      }} 
                      disabled={saving || !isFormComplete}
                      className="px-10 bg-urbik-dark cursor-pointer text-white py-4 rounded-full font-black uppercase tracking-wide hover:opacity-90 transition disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      {saving ? "Guardando cambios..." : "Actualizar Propiedad"}
                    </button>
                    {message && (
                      <p className={`text-sm font-bold ${message.includes("Error") ? "text-red-500" : "text-green-500"}`}>
                        {message}
                      </p>
                    )}
                    {!isFormComplete && !saving && (
                      <p className="text-[10px] text-gray-400 font-bold">Complete los campos obligatorios (Título, Tipo, Área e Imágenes)</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}