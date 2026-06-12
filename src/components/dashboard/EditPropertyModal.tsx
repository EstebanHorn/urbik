"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { getVisibleModules, type PropertyUploadFormData } from "./create-modal/schema";
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
import type { PropertySummary } from "@/app/(dashboard)/dashboard/page";
import ParcelPickerModal, { type SelectedParcel } from "./ParcelPickerModal";

const MODAL_ANIMATION_STYLES = `
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .step-transition {
    animation: fadeSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

type EditableProperty = Omit<PropertySummary, "type" | "description" | "propertySubtype" | "featureGroups" | "youtubeUrl" | "tour360Url"> & {
  type?: string;
  description: string;
  propertySubtype?: string;
  featureGroups?: Record<string, Record<string, boolean>>;
  youtubeUrl?: string;
  tour360Url?: string;
  commercialActivity?: string;
  hectares?: number;
  landUse?: string;
  buildingCondition?: string | null;
  buildingFloors?: number | null;
};

interface EditPropertyModalProps {
  open: boolean;
  property: EditableProperty;
  onClose: () => void;
  onUpdated: () => void;
}

function toDefaultValues(p: EditableProperty): PropertyUploadFormData {
  const parts = (p.address || "").split(" ");
  const number = parts.at(-1) ?? "";
  const street = parts.slice(0, -1).join(" ") || p.address || "";
  const op = p.operationType as string | undefined;

  return {
    id: p.id,
    title: p.title,
    description: p.description,
    type: p.type ?? undefined,
    operationType: op,
    status: p.status,
    city: p.city,
    province: p.province,
    street,
    number,
    areaM2: p.area,
    rooms: p.rooms,
    bathrooms: p.bathrooms,
    images: p.images ?? [],
    propertySubtype: p.propertySubtype ?? undefined,
    youtubeUrl: p.youtubeUrl ?? undefined,
    tour360Url: p.tour360Url ?? undefined,
    isPriceHidden: p.isPriceHidden,
    featureGroups: p.featureGroups ?? {},
    amenities: (p.featureGroups?.amenities as Record<string, boolean>) ?? {},
    saleCurrency: "USD",
    rentCurrency: "ARS",
    salePrice: (op === "SALE" || op === "SALE_RENT") ? p.price : undefined,
    rentPrice: (op === "RENT" || op === "TEMP_RENT" || op === "SALE_RENT") ? p.price : undefined,
    parcelCCA: p.parcelCCA ?? undefined,
    parcelPDA: p.parcelPDA ?? undefined,
    parcelGeom: p.parcelGeom as Record<string, unknown> | undefined,
    latitude: p.latitude ?? undefined,
    longitude: p.longitude ?? undefined,
    buildingCondition: p.buildingCondition ?? undefined,
    buildingFloors: p.buildingFloors ?? undefined,
    commercialActivity: p.commercialActivity ?? undefined,
    hectares: p.hectares ?? undefined,
    landUse: p.landUse ?? undefined,
  };
}

export default function EditPropertyModal({ open, property, onClose, onUpdated }: EditPropertyModalProps) {
  const rhf = useForm<PropertyUploadFormData>({ defaultValues: toDefaultValues(property) });
  const [activeModuleId, setActiveModuleId] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parcelPickerOpen, setParcelPickerOpen] = useState(false);

  useEffect(() => {
    if (open) {
      rhf.reset(toDefaultValues(property));
      setActiveModuleId(1);
      setError(null);
    }
    // Solo resetea cuando el modal se (re)abre o cambia a otra propiedad.
    // No depender de `property` por referencia: el padre puede construir un
    // objeto nuevo con cada render y eso reseteaba el step al paso 1.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, property.id]);

  const formData = rhf.watch();
  const propertyType = formData.type;
  const visibleModules = useMemo(() => getVisibleModules(propertyType), [propertyType]);

  const currentIndex = visibleModules.findIndex((m) => m.id === activeModuleId);
  const safeCurrentIndex = currentIndex !== -1 ? currentIndex : 0;
  const isFirstStep = safeCurrentIndex === 0;
  const isLastStep = currentIndex !== -1 && safeCurrentIndex === visibleModules.length - 1;
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
    rhf.setValue("parcelCCA", parcel.cca ?? "");
    rhf.setValue("parcelPDA", parcel.pda ?? "");
    rhf.setValue("parcelGeom", parcel.geometry as unknown as Record<string, unknown>);
    rhf.setValue("latitude", parcel.lat);
    rhf.setValue("longitude", parcel.lon);
    setParcelPickerOpen(false);
  };

  const handleSubmit = rhf.handleSubmit(async (data) => {
    setError(null);
    if (!data.title) { setError("El título es obligatorio."); return; }
    if (!data.city) { setError("La ciudad es obligatoria."); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/property/${property.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description || "",
          street: data.street || "",
          number: data.number || "",
          city: data.city || "",
          province: data.province || "",
          country: "Argentina",
          type: data.type,
          unitType: data.unitType,
          operationType: data.operationType,
          status: data.status,
          salePrice: data.salePrice ?? null,
          saleCurrency: data.saleCurrency || "USD",
          rentPrice: data.rentPrice ?? null,
          rentCurrency: data.rentCurrency || "ARS",
          areaM2: data.areaM2 ?? null,
          rooms: data.rooms ?? null,
          bathrooms: data.bathrooms ?? null,
          toilets: data.toilets ?? null,
          garages: data.garages ?? null,
          plants: data.plants ?? null,
          coveredArea: data.coveredArea ?? null,
          semiCoveredArea: data.semiCoveredArea ?? null,
          uncoveredArea: data.uncoveredArea ?? null,
          frontLength: data.frontLength ?? null,
          backLength: data.backLength ?? null,
          images: data.images || [],
          propertySubtype: data.propertySubtype || null,
          youtubeUrl: data.youtubeUrl || null,
          tour360Url: data.tour360Url || null,
          isPriceHidden: data.isPriceHidden || false,
          featureGroups: { amenities: data.amenities || {} },
          condition: data.condition,
          orientation: data.orientation,
          constructionYear: data.constructionYear,
          renovationYear: data.renovationYear,
          buildingCondition: data.buildingCondition,
          buildingFloors: data.buildingFloors,
          parcelCCA: data.parcelCCA || null,
          parcelPDA: data.parcelPDA || null,
          parcelGeom: data.parcelGeom || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          commercialActivity: data.commercialActivity || null,
          hectares: data.hectares || null,
          landUse: data.landUse || null,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error al actualizar");

      onUpdated();
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
      <style dangerouslySetInnerHTML={{ __html: MODAL_ANIMATION_STYLES }} />

      <div className="fixed inset-0 z-50 flex items-center justify-center pt-20 px-6 pb-6">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative w-full max-w-xl h-[80vh] bg-white/70 border border-white rounded-3xl flex flex-col shadow-2xl overflow-hidden">

          <div className="flex flex-col shrink-0 bg-white/70">
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                <h2 className="text-lg font-black text-urbik-black">Editar propiedad</h2>
                <p className="text-xs text-urbik-black/40 mt-0.5 truncate max-w-xs">{property.title}</p>
              </div>
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
                  Paso {safeCurrentIndex + 1} de {visibleModules.length}
                </span>
                <span className="text-sm font-bold">{percentage}%</span>
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
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {activeModule && (
                <div key={activeModule.id} className="step-transition">
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
            </div>
          </div>

          <div className="px-8 flex items-center justify-between gap-4 bg-white/70">
            <button
              type="button"
              onClick={handleBack}
              disabled={isFirstStep || isSubmitting}
              className="px-6 py-3 text-urbik-black/80 font-bold hover:text-urbik-black transition-colors disabled:opacity-40 cursor-pointer w-32"
            >
              VOLVER
            </button>

            {!isLastStep ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 text-urbik-black/80 font-bold hover:text-urbik-black transition-colors disabled:opacity-40 cursor-pointer w-32"
              >
                SIGUIENTE
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="px-6 py-3 text-urbik-black/80 font-bold hover:text-urbik-black transition-colors disabled:opacity-40 cursor-pointer w-32"
              >
                {isSubmitting ? "GUARDANDO..." : "GUARDAR"}
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