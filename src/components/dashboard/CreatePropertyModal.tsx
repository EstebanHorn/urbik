"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import type { Geometry } from "geojson";
import { useForm, UseFormReturn } from "react-hook-form";
import { X } from "lucide-react";
import {
  getVisibleModules,
  getStepError,
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
  defaultContactInfo?: {
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
  };
}

const BASE_DEFAULT_VALUES: PropertyUploadFormData = {
  type: "HOUSE",
  operationType: "SALE",
  status: "AVAILABLE",
  saleCurrency: "USD",
  rentCurrency: "ARS",
  images: [],
  amenities: {},
  featureGroups: {},
};

const modalStyles = `
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .step-transition {
    animation: fadeSlideIn 0.3s ease-out forwards;
  }
`;

function CreateProgressBar({
  rhf,
  visibleModules,
  currentIndex,
}: {
  rhf: UseFormReturn<PropertyUploadFormData>;
  visibleModules: ReturnType<typeof getVisibleModules>;
  currentIndex: number;
}) {
  const formData = rhf.watch();
  const statuses = visibleModules.map((m) => m.getStatus(formData));
  const completeCount = statuses.filter((s) => s === "complete").length;
  const percentage =
    visibleModules.length > 0
      ? Math.round((completeCount / visibleModules.length) * 100)
      : 0;

  return (
    <div className="px-8 pb-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold uppercase text-geora-black/50">
          Progreso de carga - Paso {currentIndex + 1} de {visibleModules.length}
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
  );
}

export default function CreatePropertyModal({
  open,
  onClose,
  onCreated,
  defaultContactInfo,
}: CreatePropertyModalProps) {
  const DEFAULT_VALUES: PropertyUploadFormData = {
    ...BASE_DEFAULT_VALUES,
    contactName: defaultContactInfo?.contactName,
    contactPhone: defaultContactInfo?.contactPhone,
    contactEmail: defaultContactInfo?.contactEmail,
    showAgencyContact: true,
  };
  const rhf = useForm<PropertyUploadFormData>({
    defaultValues: DEFAULT_VALUES,
  });
  const [activeModuleId, setActiveModuleId] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parcelPickerOpen, setParcelPickerOpen] = useState(false);
  const formScrollRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    formScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeModuleId]);

  const propertyType = rhf.watch("type");
  const parcelPDA = rhf.watch("parcelPDA");
  const parcelCCA = rhf.watch("parcelCCA");
  const parcelGeom = rhf.watch("parcelGeom");
  const latitude = rhf.watch("latitude");
  const longitude = rhf.watch("longitude");
  const province = rhf.watch("province");
  const city = rhf.watch("city");
  const locality = rhf.watch("locality");

  const initialParcel: SelectedParcel | null = useMemo(() => {
    const geom = parcelGeom as Geometry | undefined;
    const lat = typeof latitude === "number" ? latitude : undefined;
    const lon = typeof longitude === "number" ? longitude : undefined;
    if (geom) {
      return {
        cca: parcelCCA ?? null,
        pda: parcelPDA ?? null,
        geometry: geom,
        lat: lat ?? 0,
        lon: lon ?? 0,
      };
    }
    if (lat != null && lon != null) {
      return { cca: null, pda: null, geometry: null, lat, lon, isManual: true };
    }
    return null;
  }, [parcelGeom, parcelCCA, parcelPDA, latitude, longitude]);

  const visibleModules = getVisibleModules(propertyType);

  const currentIndex = visibleModules.findIndex((m) => m.id === activeModuleId);
  const safeCurrentIndex = currentIndex !== -1 ? currentIndex : 0;
  const isFirstStep = safeCurrentIndex === 0;
  const isLastStep =
    currentIndex !== -1 && safeCurrentIndex === visibleModules.length - 1;
  const activeModule = visibleModules[safeCurrentIndex];

  useEffect(() => {
    if (currentIndex === -1 && visibleModules.length > 0) {
      setActiveModuleId(visibleModules[0].id);
    }
  }, [currentIndex, visibleModules]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

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

const handleParcelConfirm = (parcel: SelectedParcel) => {
    rhf.setValue("parcelCCA", parcel.cca ?? "");
    rhf.setValue("parcelPDA", parcel.pda ?? "");
    rhf.setValue(
      "parcelGeom",
      parcel.geometry ? (parcel.geometry as unknown as Record<string, unknown>) : undefined
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
        selectedParcelPDA={parcelPDA || parcelCCA}
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
      <style>{modalStyles}</style>

      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-0 md:pt-20 md:px-6 md:pb-6">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative w-full h-full max-w-none rounded-none md:max-w-xl md:h-[80vh] md:rounded-3xl bg-white/70 border border-white flex flex-col shadow-2xl overflow-hidden">
          <div className="flex flex-col shrink-0 bg-white/70">
            <div className="flex items-center justify-between px-8 py-5">
              <h2 className="text-lg font-black text-geora-black">
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

            <CreateProgressBar
              rhf={rhf}
              visibleModules={visibleModules}
              currentIndex={safeCurrentIndex}
            />

            {error && (
              <div className="mx-8 mb-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                <span className="text-red-500 font-bold leading-none">!</span>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>

          <div className="flex flex-1 overflow-hidden">
            <form
              id="create-property-form"
              ref={formScrollRef}
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  (e.target as HTMLElement).tagName !== "TEXTAREA"
                ) {
                  e.preventDefault();
                }
              }}
              className="flex-1 overflow-y-auto px-8 py-6"
            >
              {activeModule && (
                <div
                  key={activeModule.id}
                  className="step-transition opacity-0"
                >
                  <h3 className="text-xl font-bold text-center text-geora-black/80 mb-6">
                    {activeModule.label}
                  </h3>
                  {moduleContent[activeModule.id]}
                </div>
              )}
            </form>
          </div>

          <div className="px-8 py-4 shrink-0 flex items-center justify-between gap-4 bg-white/70 border-t border-white/40">
            <button
              type="button"
              onClick={handleBack}
              disabled={isFirstStep || isSubmitting}
              className="px-6 py-3 text-geora-black/80 font-bold hover:text-geora-black transition-colors
              disabled:opacity-40 cursor-pointer w-32"
            >
              VOLVER
            </button>

            {!isLastStep ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 text-geora-black/80 font-bold hover:text-geora-black transition-colors
              disabled:opacity-40 cursor-pointer w-32"
              >
                SIGUIENTE
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="px-6 py-3 text-geora-black/80 font-bold hover:text-geora-black transition-colors
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
        province={province ?? ""}
        city={city}
        locality={locality}
        initialParcel={initialParcel}
        onClose={() => setParcelPickerOpen(false)}
        onConfirm={handleParcelConfirm}
      />
    </>
  );
}