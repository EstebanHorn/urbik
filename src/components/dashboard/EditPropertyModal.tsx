"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { getVisibleModules, getStepError, type PropertyUploadFormData } from "./create-modal/schema";
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
import type { Geometry } from "geojson";

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
  extraData?: Record<string, unknown>;
};

interface EditPropertyModalProps {
  open: boolean;
  property: EditableProperty;
  onClose: () => void;
  onUpdated: () => void;
  defaultContactInfo?: {
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
  };
}

function toDefaultValues(
  p: EditableProperty,
  fallbackContact?: {
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
  },
): PropertyUploadFormData {
  const op = p.operationType as string | undefined;

  // Prefer structured fields from the API when present; fall back to splitting `address` for legacy rows.
  const fallbackParts = (p.address || "").split(" ");
  const fallbackNumber = fallbackParts.at(-1) ?? "";
  const fallbackStreet =
    fallbackParts.slice(0, -1).join(" ") || p.address || "";
  const street = p.streetName ?? fallbackStreet;
  const number = p.streetNumber ?? fallbackNumber;

  const extra = (p.extraData ?? {}) as Record<string, unknown>;
  const str = (v: unknown): string | undefined =>
    typeof v === "string" && v !== "" ? v : undefined;
  const num = (v: unknown): number | undefined =>
    typeof v === "number" && !Number.isNaN(v) ? v : undefined;
  const bool = (v: unknown): boolean | undefined =>
    typeof v === "boolean" ? v : undefined;

  return {
    id: p.id,
    title: p.title,
    description: p.description,
    type: p.type ?? undefined,
    unitType: p.unitType ?? str(extra.unitType),
    operationType: op,
    status: p.status,
    country: p.country ?? "Argentina",
    province: p.province,
    city: p.city,
    district: p.district,
    locality: p.locality,
    neighborhood: p.neighborhood,
    street,
    number,
    displayAddress: p.displayAddress,
    floor: p.floor,
    unitNumber: p.unitNumber,
    areaM2: p.area,
    coveredArea: p.coveredArea,
    semiCoveredArea: p.semiCoveredArea,
    uncoveredArea: p.uncoveredArea,
    frontLength: p.frontLength,
    backLength: p.backLength,
    rooms: p.rooms,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    toilets: p.toilets,
    garages: p.garages,
    plants: p.plants,
    hectares: p.hectares ?? num(extra.hectares),
    expenses: p.expenses,
    images: p.images ?? [],
    propertySubtype: p.propertySubtype ?? undefined,
    youtubeUrl: p.youtubeUrl ?? undefined,
    tour360Url: p.tour360Url ?? undefined,
    isPriceHidden: p.isPriceHidden,
    featureGroups: p.featureGroups ?? {},
    amenities: (p.featureGroups?.amenities as Record<string, boolean>) ?? {},
    saleCurrency: (p.saleCurrency as "USD" | "ARS") || "USD",
    rentCurrency: (p.rentCurrency as "USD" | "ARS") || "ARS",
    salePrice:
      p.salePrice ?? ((op === "SALE" || op === "SALE_RENT") ? p.price : undefined),
    rentPrice:
      p.rentPrice ??
      ((op === "RENT" || op === "TEMP_RENT" || op === "SALE_RENT")
        ? p.price
        : undefined),
    parcelCCA: p.parcelCCA ?? undefined,
    parcelPDA: p.parcelPDA ?? undefined,
    parcelGeom: p.parcelGeom as Record<string, unknown> | undefined,
    latitude: p.latitude ?? undefined,
    longitude: p.longitude ?? undefined,
    buildingCondition: p.buildingCondition ?? undefined,
    buildingFloors: p.buildingFloors ?? undefined,
    commercialActivity: p.commercialActivity ?? undefined,
    landUse: p.landUse ?? str(extra.landUse),
    // Characteristics & extraData (subtipos)
    condition: str(extra.condition),
    orientation: str(extra.orientation),
    disposition: str(extra.disposition),
    constructionYear: num(extra.constructionYear),
    renovationYear: num(extra.renovationYear),
    garageType: str(extra.garageType),
    balconyType: str(extra.balconyType),
    viewType: str(extra.viewType),
    floorType: Array.isArray(extra.floorType)
      ? (extra.floorType as string[])
      : str(extra.floorType),
    roofType: str(extra.roofType),
    slope: str(extra.slope),
    coastType: str(extra.coastType),
    soilType: str(extra.soilType),
    buildabilityIndex: num(extra.buildabilityIndex),
    occupancyIndex: num(extra.occupancyIndex),
    hasConstruction: bool(extra.hasConstruction),
    hasIrrigation: bool(extra.hasIrrigation),
    hasFencing: bool(extra.hasFencing),
    hasWater: bool(extra.hasWater),
    hasElectricity: bool(extra.hasElectricity),
    contactName: str(extra.contactName) ?? fallbackContact?.contactName,
    contactPhone: str(extra.contactPhone) ?? fallbackContact?.contactPhone,
    contactEmail: str(extra.contactEmail) ?? fallbackContact?.contactEmail,
    contactWhatsapp: str(extra.contactWhatsapp),
    showAgencyContact: bool(extra.showAgencyContact) ?? true,
    extraData: extra,
  };
}

export default function EditPropertyModal({ open, property, onClose, onUpdated, defaultContactInfo }: EditPropertyModalProps) {
  const rhf = useForm<PropertyUploadFormData>({ defaultValues: toDefaultValues(property, defaultContactInfo) });
  const [activeModuleId, setActiveModuleId] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parcelPickerOpen, setParcelPickerOpen] = useState(false);
  const formScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    formScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeModuleId]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      rhf.reset(toDefaultValues(property, defaultContactInfo));
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
    if (isLastStep || !activeModule) return;
    const stepError = getStepError(activeModule.id, rhf.getValues());
    if (stepError) {
      setError(stepError);
      return;
    }
    setError(null);
    const nextId = visibleModules[safeCurrentIndex + 1].id;
    setActiveModuleId(nextId);
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setError(null);
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

  const initialParcel: SelectedParcel | null = useMemo(() => {
    const geom = formData.parcelGeom as Geometry | undefined;
    const lat = typeof formData.latitude === "number" ? formData.latitude : undefined;
    const lon = typeof formData.longitude === "number" ? formData.longitude : undefined;
    if (geom) {
      return {
        cca: formData.parcelCCA ?? null,
        pda: formData.parcelPDA ?? null,
        geometry: geom,
        lat: lat ?? 0,
        lon: lon ?? 0,
      };
    }
    if (lat != null && lon != null) {
      return { cca: null, pda: null, geometry: null, lat, lon, isManual: true };
    }
    return null;
  }, [
    formData.parcelGeom,
    formData.parcelCCA,
    formData.parcelPDA,
    formData.latitude,
    formData.longitude,
  ]);

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
      const mergedExtraData: Record<string, unknown> = {
        ...(data.extraData ?? {}),
        unitType: data.unitType ?? undefined,
        condition: data.condition ?? undefined,
        orientation: data.orientation ?? undefined,
        disposition: data.disposition ?? undefined,
        constructionYear: data.constructionYear ?? undefined,
        renovationYear: data.renovationYear ?? undefined,
        garageType: data.garageType ?? undefined,
        balconyType: data.balconyType ?? undefined,
        viewType: data.viewType ?? undefined,
        floorType: data.floorType ?? undefined,
        roofType: data.roofType ?? undefined,
        slope: data.slope ?? undefined,
        coastType: data.coastType ?? undefined,
        soilType: data.soilType ?? undefined,
        landUse: data.landUse ?? undefined,
        buildabilityIndex: data.buildabilityIndex ?? undefined,
        occupancyIndex: data.occupancyIndex ?? undefined,
        hasConstruction: data.hasConstruction,
        hasIrrigation: data.hasIrrigation,
        hasFencing: data.hasFencing,
        hasWater: data.hasWater,
        hasElectricity: data.hasElectricity,
        contactName: data.contactName ?? undefined,
        contactPhone: data.contactPhone ?? undefined,
        contactEmail: data.contactEmail ?? undefined,
        contactWhatsapp: data.contactWhatsapp ?? undefined,
        showAgencyContact: data.showAgencyContact,
        hectares: data.hectares ?? undefined,
      };
      Object.keys(mergedExtraData).forEach((k) => {
        if (mergedExtraData[k] === undefined) delete mergedExtraData[k];
      });

      const res = await fetch(`/api/property/${property.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description || "",
          street: data.street || "",
          streetName: data.street || "",
          number: data.number || "",
          streetNumber: data.number || "",
          country: data.country || "Argentina",
          province: data.province || "",
          city: data.city || "",
          district: data.district ?? null,
          locality: data.locality ?? null,
          neighborhood: data.neighborhood ?? null,
          displayAddress: data.displayAddress ?? null,
          floor: data.floor ?? null,
          unitNumber: data.unitNumber ?? null,
          type: data.type,
          unitType: data.unitType,
          operationType: data.operationType,
          status: data.status,
          salePrice: data.salePrice ?? null,
          saleCurrency: data.saleCurrency || "USD",
          rentPrice: data.rentPrice ?? null,
          rentCurrency: data.rentCurrency || "ARS",
          expenses: data.expenses ?? null,
          areaM2: data.areaM2 ?? null,
          rooms: data.rooms ?? null,
          bedrooms: data.bedrooms ?? null,
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
          featureGroups: {
            ...(data.featureGroups ?? {}),
            amenities: data.amenities || {},
          },
          amenities: data.amenities || {},
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
          extraData: mergedExtraData,
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

      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-0 md:pt-20 md:px-6 md:pb-6">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative w-full h-full max-w-none rounded-none md:max-w-xl md:h-[80vh] md:rounded-3xl bg-white/70 border border-white flex flex-col shadow-2xl overflow-hidden">

          <div className="flex flex-col shrink-0 bg-white/70">
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                <h2 className="text-lg font-black text-geora-black">Editar propiedad</h2>
                <p className="text-xs text-geora-black/40 mt-0.5 truncate max-w-xs">{property.title}</p>
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
                <span className="text-sm font-bold uppercase text-geora-black/50">
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

            {error && (
              <div className="mx-8 mb-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                <span className="text-red-500 font-bold leading-none">!</span>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div ref={formScrollRef} className="flex-1 overflow-y-auto px-8 py-6">
              {activeModule && (
                <div key={activeModule.id} className="step-transition">
                  <h3 className="text-xl font-bold text-center text-geora-black/80 mb-6">
                    {activeModule.label}
                  </h3>
                  {moduleContent[activeModule.id]}
                </div>
              )}
            </div>
          </div>

          <div className="px-8 py-4 shrink-0 flex items-center justify-between gap-4 bg-white/70 border-t border-white/40">
            <button
              type="button"
              onClick={handleBack}
              disabled={isFirstStep || isSubmitting}
              className="px-6 py-3 text-geora-black/80 font-bold hover:text-geora-black transition-colors disabled:opacity-40 cursor-pointer w-32"
            >
              VOLVER
            </button>

            {!isLastStep ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 text-geora-black/80 font-bold hover:text-geora-black transition-colors disabled:opacity-40 cursor-pointer w-32"
              >
                SIGUIENTE
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="px-6 py-3 text-geora-black/80 font-bold hover:text-geora-black transition-colors disabled:opacity-40 cursor-pointer w-32"
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
        locality={formData.locality}
        initialParcel={initialParcel}
        onClose={() => setParcelPickerOpen(false)}
        onConfirm={handleParcelConfirm}
      />
    </>
  );
}