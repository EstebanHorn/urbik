"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import {
  getVisibleModules,
  type PropertyUploadFormData,
} from "./create-modal/schema";
import {
  Module01PropertyData,
  Module02Location,
  Module03Content,
  Module04Surfaces,
  Module05BasicCharacteristics,
  Module06Tags,
  Module10Multimedia,
  Module11ContactInfo,
} from "./create-modal/form-modules";
import ParcelPickerModal, { type SelectedParcel } from "./ParcelPickerModal";

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

export default function CreatePropertyModal({
  open,
  onClose,
  onCreated,
}: CreatePropertyModalProps) {
  const rhf = useForm<PropertyUploadFormData>({
    defaultValues: DEFAULT_VALUES,
  });
  const [activeModuleId, setActiveModuleId] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parcelPickerOpen, setParcelPickerOpen] = useState(false);

  const formData = rhf.watch();
  const visibleModules = getVisibleModules(formData.type);

  const currentIndex = visibleModules.findIndex((m) => m.id === activeModuleId);
  const safeCurrentIndex = currentIndex !== -1 ? currentIndex : 0;
  const isFirstStep = safeCurrentIndex === 0;
  const isLastStep = safeCurrentIndex === visibleModules.length - 1;
  const activeModule = visibleModules[safeCurrentIndex];

  useEffect(() => {
    if (currentIndex === -1 && visibleModules.length > 0) {
      setActiveModuleId(visibleModules[0].id);
    }
  }, [currentIndex, visibleModules]);

  const handleNext = () => {
    if (!isLastStep) {
      const nextId = visibleModules[safeCurrentIndex + 1].id;
      setActiveModuleId(nextId);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      const prevId = visibleModules[safeCurrentIndex - 1].id;
      setActiveModuleId(prevId);
    }
  };

  const statuses = visibleModules.map((m) => m.getStatus(formData));
  const completeCount = statuses.filter((s) => s === "complete").length;
  const percentage =
    visibleModules.length > 0
      ? Math.round((completeCount / visibleModules.length) * 100)
      : 0;

  const handleParcelConfirm = (parcel: SelectedParcel) => {
    rhf.setValue("parcelCCA", parcel.cca);
    rhf.setValue("parcelPDA", parcel.pda ?? "");
    rhf.setValue(
      "parcelGeom",
      parcel.geometry as unknown as Record<string, unknown>
    );
    rhf.setValue("latitude", parcel.lat);
    rhf.setValue("longitude", parcel.lon);
    setParcelPickerOpen(false);
  };

  const handleSubmit = rhf.handleSubmit(async (data) => {
    setError(null);
    if (!data.title) {
      setError("El título es obligatorio.");
      return;
    }
    if (!data.city) {
      setError("La ciudad es obligatoria.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/property/parcel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description || "",
          street: data.street || "",
          streetName: data.street || "",
          number: data.number || "",
          streetNumber: data.number || "",
          neighborhood: data.neighborhood || "",
          locality: data.locality || "",
          city: data.city || "",
          province: data.province || "",
          country: "Argentina",
          type: data.type || "HOUSE",
          unitType: data.unitType || null,
          propertySubtype: data.propertySubtype || null,
          operationType: data.operationType || "SALE",
          status: data.status || "AVAILABLE",
          isPriceHidden: data.isPriceHidden || false,
          salePrice: data.salePrice || null,
          saleCurrency: data.saleCurrency || "USD",
          rentPrice: data.rentPrice || null,
          rentCurrency: data.rentCurrency || "ARS",
          expenses: data.expenses || null,
          areaM2: data.areaM2 || null,
          coveredArea: data.coveredArea || null,
          semiCoveredArea: data.semiCoveredArea || null,
          uncoveredArea: data.uncoveredArea || null,
          frontLength: data.frontLength || null,
          backLength: data.backLength || null,
          rooms: data.rooms || null,
          bedrooms: data.bedrooms || null,
          bathrooms: data.bathrooms || null,
          toilets: data.toilets || null,
          garages: data.garages || null,
          plants: data.plants || null,
          floor: data.floor || null,
          unitNumber: data.unitNumber || null,
          images: data.images || [],
          youtubeUrl: data.youtubeUrl || null,
          tour360Url: data.tour360Url || null,
          featureGroups: data.featureGroups || {},
          amenities: data.amenities || {},
          laundryType: data.laundryType || null,
          parcelCCA: data.parcelCCA || null,
          parcelPDA: data.parcelPDA || null,
          parcelGeom: data.parcelGeom || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          
          // Enviamos los datos específicos que ahora se cargan en Module 1
          buildingCondition: data.buildingCondition || null,
          buildingFloors: data.buildingFloors || null,
          commercialActivity: data.commercialActivity || null,
          hectares: data.hectares || null,
          landUse: data.landUse || null,
        }),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || "Error al crear la propiedad");

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
    2: (
      <Module02Location
        rhf={rhf}
        onOpenMap={() => setParcelPickerOpen(true)}
        selectedParcelPDA={formData.parcelPDA || formData.parcelCCA}
      />
    ),
    3: <Module03Content rhf={rhf} />,
    4: <Module04Surfaces rhf={rhf} />,
    5: <Module05BasicCharacteristics rhf={rhf} />,
    6: <Module06Tags rhf={rhf} />,
    10: <Module10Multimedia rhf={rhf} />,
    11: <Module11ContactInfo rhf={rhf} />,
  };

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .step-transition {
          animation: fadeSlideIn 0.3s ease-out forwards;
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center pt-20 px-6 pb-6">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative w-full max-w-xl h-[80vh] bg-white/70 border border-white rounded-3xl flex flex-col shadow-2xl overflow-hidden">
          
          <div className="flex flex-col shrink-0 bg-white/70">
            <div className="flex items-center justify-between px-8 py-5">
              <h2 className="text-lg font-black text-urbik-black">
                Cargar propiedad
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-8 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase text-urbik-black/50">
                  Progreso de carga - Paso {safeCurrentIndex + 1} de {visibleModules.length}
                </span>
                <span className="text-sm font-bold">
                  {percentage}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <form
              id="create-property-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-8 py-6"
            >
              {activeModule && (
                <div 
                  key={activeModule.id} 
                  className="step-transition opacity-0"
                >
                  <h3 className="text-xl font-bold text-center text-urbik-black/80 mb-6">
                    {activeModule.label}
                  </h3>
                  {moduleContent[activeModule.id]}
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}
            </form>
          </div>

          <div className="px-8 flex items-center justify-between gap-4 bg-white/70">
            <button
              type="button"
              onClick={handleBack}
              disabled={isFirstStep || isSubmitting}
              className="px-6 py-3 text-urbik-black/80 font-bold hover:text-urbik-black transition-colors
              disabled:opacity-40 cursor-pointer w-32"
            >
              VOLVER
            </button>

            {!isLastStep ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 text-urbik-black/80 font-bold hover:text-urbik-black transition-colors
              disabled:opacity-40 cursor-pointer w-32"
              >
                SIGUIENTE
              </button>
            ) : (
              <button
                type="submit"
                form="create-property-form"
                disabled={isSubmitting}
                className="px-6 py-3 text-urbik-black/80 font-bold hover:text-urbik-black transition-colors
              disabled:opacity-40 cursor-pointer w-32"
              >
                {isSubmitting ? "GUARDANDO..." : "PUBLICAR PROPIEDAD"}
              </button>
            )}
          </div>
        </div>
      </div>

      <ParcelPickerModal
        open={parcelPickerOpen}
        province={formData.province ?? ""}
        city={formData.city}
        onClose={() => setParcelPickerOpen(false)}
        onConfirm={handleParcelConfirm}
      />
    </>
  );
}