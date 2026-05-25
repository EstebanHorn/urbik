"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { getVisibleModules, type PropertyUploadFormData } from "./create-modal/schema";
import { CompletionIndicator, ModuleShell } from "./create-modal/shared-ui";
import {
  Module01PropertyData,
  Module02Location,
  Module03Content,
  Module04Surfaces,
  Module05Environments,
  Module06BasicCharacteristics,
  Module07Tags,
  Module08BuildingInfo,
  Module09CommercialInfo,
  Module10FieldInfo,
  Module11LandInfo,
  Module12Multimedia,
  Module13ContactInfo,
} from "./create-modal/form-modules";

interface CreatePropertyModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const DEFAULT_VALUES: PropertyUploadFormData = {
  type: "HOUSE",
  operationType: "SALE",
  status: "AVAILABLE",
  saleCurrency: "USD",
  rentCurrency: "ARS",
  images: [],
  amenities: {},
  featureGroups: {},
};

export default function CreatePropertyModal({ open, onClose, onCreated }: CreatePropertyModalProps) {
  const rhf = useForm<PropertyUploadFormData>({ defaultValues: DEFAULT_VALUES });
  const [activeModuleId, setActiveModuleId] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const formData = rhf.watch();
  const visibleModules = getVisibleModules(formData.type);

  const handleModuleClick = (id: number) => {
    setActiveModuleId(id);
    document.getElementById(`module-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = rhf.handleSubmit(async (data) => {
    setError(null);
    if (!data.title) { setError("El título es obligatorio."); return; }
    if (!data.city) { setError("La ciudad es obligatoria."); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description || "",
          address: [data.street, data.number].filter(Boolean).join(" ") || "",
          city: data.city || "",
          province: data.province || "",
          country: "Argentina",
          type: data.type || "HOUSE",
          operationType: data.operationType || "SALE",
          status: data.status || "AVAILABLE",
          salePrice: data.salePrice || null,
          saleCurrency: data.saleCurrency || "USD",
          rentPrice: data.rentPrice || null,
          rentCurrency: data.rentCurrency || "ARS",
          areaM2: data.areaM2 || null,
          rooms: data.rooms || null,
          bathrooms: data.bathrooms || null,
          images: data.images || [],
          propertySubtype: data.propertySubtype || null,
          youtubeUrl: data.youtubeUrl || null,
          tour360Url: data.tour360Url || null,
          isPriceHidden: data.isPriceHidden || false,
          featureGroups: { amenities: data.amenities || {} },
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error al crear la propiedad");

      rhf.reset(DEFAULT_VALUES);
      setActiveModuleId(1);
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  });

  const moduleContent: Record<number, React.ReactNode> = {
    1: <Module01PropertyData rhf={rhf} />,
    2: <Module02Location rhf={rhf} />,
    3: <Module03Content rhf={rhf} />,
    4: <Module04Surfaces rhf={rhf} />,
    5: <Module05Environments rhf={rhf} />,
    6: <Module06BasicCharacteristics rhf={rhf} />,
    7: <Module07Tags rhf={rhf} />,
    8: <Module08BuildingInfo rhf={rhf} />,
    9: <Module09CommercialInfo rhf={rhf} />,
    10: <Module10FieldInfo rhf={rhf} />,
    11: <Module11LandInfo rhf={rhf} />,
    12: <Module12Multimedia rhf={rhf} />,
    13: <Module13ContactInfo rhf={rhf} />,
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="w-full max-w-4xl bg-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-black text-urbik-black">Cargar propiedad</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar: completitud */}
          <div className="w-56 shrink-0 border-r border-gray-100 p-4 overflow-y-auto hidden md:flex flex-col">
            <CompletionIndicator
              modules={visibleModules}
              form={formData}
              activeModuleId={activeModuleId}
              onModuleClick={handleModuleClick}
            />
          </div>

          {/* Módulos */}
          <form
            id="create-property-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-5 space-y-3"
          >
            {visibleModules.map((mod) => (
              <ModuleShell
                key={mod.id}
                id={mod.id}
                label={mod.label}
                status={mod.getStatus(formData)}
                isOpen={activeModuleId === mod.id}
                onToggle={() =>
                  setActiveModuleId(activeModuleId === mod.id ? 0 : mod.id)
                }
              >
                {moduleContent[mod.id]}
              </ModuleShell>
            ))}

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            type="submit"
            form="create-property-form"
            disabled={isSubmitting}
            className="w-full bg-urbik-cyan text-urbik-black font-black py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? "Guardando..." : "PUBLICAR PROPIEDAD"}
          </button>
        </div>
      </div>
    </div>
  );
}
