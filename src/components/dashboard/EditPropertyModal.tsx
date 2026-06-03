"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { getVisibleModules, type PropertyUploadFormData } from "./create-modal/schema";
import { ModuleShell } from "./create-modal/shared-ui";
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
import type { PropertySummary } from "@/app/(dashboard)/dashboard/page";
import ParcelPickerModal, { type SelectedParcel } from "./ParcelPickerModal";

type EditableProperty = Omit<PropertySummary, "type" | "description" | "propertySubtype" | "featureGroups" | "youtubeUrl" | "tour360Url"> & {
  type?: string;
  description: string;
  propertySubtype?: string;
  featureGroups?: Record<string, Record<string, boolean>>;
  youtubeUrl?: string;
  tour360Url?: string;
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
  }, [open, property]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const formData = rhf.watch();
  const visibleModules = getVisibleModules(formData.type);

  const handleModuleClick = (id: number) => {
    setActiveModuleId(id);
    document.getElementById(`module-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleParcelConfirm = (parcel: SelectedParcel) => {
    rhf.setValue("parcelCCA", parcel.cca);
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
          unitsPerFloor: data.unitsPerFloor,
          parcelCCA: data.parcelCCA || null,
          parcelPDA: data.parcelPDA || null,
          parcelGeom: data.parcelGeom || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
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
    <>
      <div className="fixed inset-0 z-50 flex">
        <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        <div className="w-full max-w-4xl bg-white flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-lg font-black text-urbik-black">Editar propiedad</h2>
              <p className="text-xs text-urbik-muted mt-0.5 truncate max-w-xs">{property.title}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-56 shrink-0 border-r border-gray-100 p-4 overflow-y-auto hidden md:flex flex-col">
              <CompletionIndicator
                modules={visibleModules}
                form={formData}
                activeModuleId={activeModuleId}
                onModuleClick={handleModuleClick}
              />
            </div>

            <form
              id="edit-property-form"
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

          <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 border border-gray-200 text-gray-600 font-medium py-3 rounded-full text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="edit-property-form"
              disabled={isSubmitting}
              className="flex-1 bg-urbik-cyan text-urbik-black font-black py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? "Guardando..." : "GUARDAR CAMBIOS"}
            </button>
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
