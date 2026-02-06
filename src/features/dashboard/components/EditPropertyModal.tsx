"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import ImageUpload from "@/components/ImageUpload";
import {
  useEditProperty,
  EditPropertyFormState,
} from "../hooks/useEditProperty";
import { AmenitiesGrid } from "./create-modal/AmenitiesGrid";
import {
  PropertyFormFields,
  PropertyFormData,
} from "./create-modal/PropertyFormField";
import SmartDescription from "../../../components/SmartZone/SmartDescription";

// Interfaz local para satisfacer los requisitos estrictos de AmenitiesGrid
interface UiAmenities {
  agua: boolean;
  luz: boolean;
  gas: boolean;
  internet: boolean;
  cochera: boolean;
  pileta: boolean;
  [key: string]: boolean;
}

interface EditPropertyModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  property: PropertyFormData & { id: number | string };
}

export default function EditPropertyModal({
  open,
  onClose,
  onUpdated,
  property,
}: EditPropertyModalProps) {
  // Corrección 1: Usar 'unknown' como paso intermedio en lugar de 'any' para evitar el error de lint
  const { form, setForm, saving, message, handleUpdate } = useEditProperty(
    property as unknown as EditPropertyFormState & { id: number | string },
    onUpdated,
    onClose,
  );

  // Castings seguros para cumplir con la interfaz que esperan los componentes hijos
  const safeForm = form as unknown as PropertyFormData;

  // Wrapper para setForm que asegura compatibilidad de tipos
  const handleSetForm = (value: React.SetStateAction<PropertyFormData>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setForm(value as any);
  };

  const isFormComplete =
    !!safeForm.title?.trim() &&
    !!safeForm.operationType &&
    (!!safeForm.areaM2 || !!safeForm.area) &&
    (safeForm.images?.length ?? 0) > 0;

  // Preparar amenities para el Grid asegurando que tenga las propiedades requeridas
  const currentAmenities: UiAmenities = {
    agua: safeForm.amenities?.agua ?? false,
    luz: safeForm.amenities?.luz ?? false,
    gas: safeForm.amenities?.gas ?? false,
    internet: safeForm.amenities?.internet ?? false,
    cochera: safeForm.amenities?.cochera ?? false,
    pileta: safeForm.amenities?.pileta ?? false,
    ...safeForm.amenities,
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
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 py-5 px-10 flex items-center justify-between shadow-xl z-30">
              <div className="relative w-10 h-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Urbik_Logo_Mini.svg"
                  alt="Logo"
                  className="invert brightness-200 object-contain"
                />
              </div>
              <div className="flex flex-col justify-center items-center">
                <span className="text-3xl font-black text-urbik-black italic">
                  Editar Propiedad
                </span>
                <h2 className="text-md font-bold text-urbik-black/60 ">
                  Actualiza la información de tu publicación
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-urbik-black cursor-pointer hover:text-black/60 transition font-black text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-5xl mx-auto space-y-8">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <label className="block text-xs font-black text-urbik-black/40 uppercase ml-2">
                    Ubicación Inamovible
                  </label>
                  <p className="text-lg font-bold text-urbik-black px-2">
                    {safeForm.address || safeForm.street} {safeForm.number},{" "}
                    {safeForm.city}, {safeForm.province}
                  </p>
                  <p className="text-[10px] text-urbik-black/50 italic px-2">
                    La ubicación y parcela catastral no pueden ser modificadas
                    después de la creación.
                  </p>
                </div>

                <div className="px-4">
                  <PropertyFormFields form={safeForm} setForm={handleSetForm} />
                </div>

                <div className="space-y-4 px-4">
                  <label className="block text-md ml-5 font-bold text-urbik-black/50">
                    Descripción de la Propiedad
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Escribe una descripción detallada..."
                    value={safeForm.description || ""}
                    onChange={(e) =>
                      handleSetForm((prev: PropertyFormData) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-2xl focus:border-urbik-black outline-none transition-all"
                  />

                  <SmartDescription
                    description={safeForm.description || ""}
                    context={{
                      salePrice: safeForm.salePrice,
                      rentPrice: safeForm.rentPrice,
                      area: safeForm.areaM2 || safeForm.area,
                      type: safeForm.operationType,
                      city: safeForm.city,
                    }}
                  />
                </div>

                <div className="p-4">
                  <label className="block text-md ml-5 font-bold text-urbik-black/50 mb-3">
                    Otras Características
                  </label>
                  {/* Corrección 2: Uso de la variable con tipo explícito y cast en el onChange */}
                  <AmenitiesGrid
                    value={currentAmenities}
                    onChange={(val) =>
                      handleSetForm((prev: PropertyFormData) => ({
                        ...prev,
                        amenities: val as unknown as Record<string, boolean>,
                      }))
                    }
                  />
                </div>

                <div className="space-y-6 px-4 pb-10">
                  <ImageUpload
                    value={safeForm.images || []}
                    onChange={(urls) =>
                      handleSetForm((prev: PropertyFormData) => ({
                        ...prev,
                        images: urls,
                      }))
                    }
                    onRemove={(url) =>
                      handleSetForm((prev: PropertyFormData) => ({
                        ...prev,
                        images: (prev.images || []).filter(
                          (i: string) => i !== url,
                        ),
                      }))
                    }
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
                      <p
                        className={`text-sm font-bold ${
                          message.includes("Error")
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {message}
                      </p>
                    )}
                    {!isFormComplete && !saving && (
                      <p className="text-[10px] text-gray-400 font-bold">
                        Complete los campos obligatorios (Título, Tipo, Área e
                        Imágenes)
                      </p>
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
