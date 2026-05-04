import { useForm } from "react-hook-form";
import { useState } from "react";
import { createProperty, updateProperty } from "../service/dashboardService";
import type { SelectedParcel } from "@/features/map/types/types";
import type { Geometry } from "geojson";
import type { PropertyUploadFormData } from "../components/create-modal/types";
import type { PropertyInitialData } from "./useCreateProperty";

function buildDefaultValues(
  initialData: PropertyInitialData | null,
): PropertyUploadFormData {
  if (!initialData) {
    return {
      type: "HOUSE",
      operationType: "RENT",
      status: "AVAILABLE",
      country: "Argentina",
      saleCurrency: "USD",
      rentCurrency: "ARS",
      isPriceHidden: false,
      amenities: {},
      featureGroups: {},
      images: [],
      showAgencyContact: true,
    };
  }

  return {
    type: initialData.type ?? "HOUSE",
    unitType: initialData.unitType ?? "",
    propertySubtype: initialData.propertySubtype ?? "",
    operationType: initialData.operationType ?? "RENT",
    status: initialData.status ?? "AVAILABLE",
    salePrice: initialData.salePrice?.toString() ?? "",
    saleCurrency: (initialData.saleCurrency as "USD" | "ARS") ?? "USD",
    rentPrice: initialData.rentPrice?.toString() ?? "",
    rentCurrency: (initialData.rentCurrency as "USD" | "ARS") ?? "ARS",
    isPriceHidden: initialData.isPriceHidden ?? false,
    expenses: initialData.expenses?.toString() ?? "",

    country: initialData.country ?? "Argentina",
    province: initialData.province ?? "",
    city: initialData.city ?? "",
    district: initialData.district ?? "",
    locality: initialData.locality ?? "",
    neighborhood: initialData.neighborhood ?? "",
    street: initialData.streetName ?? "",
    number: initialData.streetNumber ?? "",
    floor: initialData.floor ?? "",
    unitNumber: initialData.unitNumber ?? "",

    title: initialData.title ?? "",
    description: initialData.description ?? "",

    areaM2: initialData.area?.toString() ?? "",
    coveredArea: initialData.coveredArea?.toString() ?? "",
    semiCoveredArea: initialData.semiCoveredArea?.toString() ?? "",
    uncoveredArea: initialData.uncoveredArea?.toString() ?? "",
    frontLength: initialData.frontLength?.toString() ?? "",
    backLength: initialData.backLength?.toString() ?? "",

    rooms: initialData.rooms?.toString() ?? "",
    bathrooms: initialData.bathrooms?.toString() ?? "",
    toilets: initialData.toilets?.toString() ?? "",
    garages: initialData.garages?.toString() ?? "",
    plants: initialData.plants?.toString() ?? "",

    amenities: {
      agua: initialData.hasWater ?? false,
      luz: initialData.hasElectricity ?? false,
      gas: initialData.hasGas ?? false,
      internet: initialData.hasInternet ?? false,
      cochera: initialData.hasParking ?? false,
      pileta: initialData.hasPool ?? false,
    },
    featureGroups: initialData.featureGroups ?? {},

    youtubeUrl: initialData.youtubeUrl ?? "",
    tour360Url: initialData.tour360Url ?? "",
    images: initialData.images ?? [],

    showAgencyContact: true,
  };
}

export function usePropertyUploadForm(
  initialData: PropertyInitialData | null,
  onCreated: (data?: unknown) => void,
  onClose: () => void,
) {
  const isEditing = !!initialData;

  const rhf = useForm<PropertyUploadFormData>({
    defaultValues: buildDefaultValues(initialData),
    mode: "onChange",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [selectedParcel, setSelectedParcel] = useState<SelectedParcel | null>(
    isEditing && initialData
      ? {
          CCA: initialData.parcelCCA ?? "S/D",
          PDA: initialData.parcelPDA ?? "S/D",
          geometry: (initialData.parcelGeom as Geometry) ?? {},
          lat: initialData.latitude ?? 0,
          lon: initialData.longitude ?? 0,
        }
      : null,
  );

  const handleSave = async () => {
    const form = rhf.getValues();
    setSaving(true);
    setMessage(null);

    const fullAddress =
      form.street || form.number
        ? `${form.street ?? ""} ${form.number ?? ""}`.trim()
        : form.city;

    const amenities = (form.amenities ?? {}) as Record<string, boolean>;

    const payload = {
      title: form.title,
      description: form.description,
      address: fullAddress,
      city: form.city,
      province: form.province,
      country: form.country || "Argentina",
      district: form.district || null,
      locality: form.locality || null,
      neighborhood: form.neighborhood || null,
      streetName: form.street || null,
      streetNumber: form.number || null,
      floor: form.floor || null,
      unitNumber: form.unitNumber || null,
      type: form.type,
      unitType: form.unitType || null,
      operationType: form.operationType,
      status: form.status,
      propertySubtype: form.propertySubtype || null,
      youtubeUrl: form.youtubeUrl || null,
      tour360Url: form.tour360Url || null,
      isPriceHidden: Boolean(form.isPriceHidden),

      salePrice: form.salePrice ? Number(form.salePrice) : null,
      saleCurrency: form.saleCurrency,
      rentPrice: form.rentPrice ? Number(form.rentPrice) : null,
      rentCurrency: form.rentCurrency,

      areaM2: form.areaM2 ? Number(form.areaM2) : null,
      rooms: form.rooms ? Number(form.rooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      toilets: form.toilets ? Number(form.toilets) : null,
      garages: form.garages ? Number(form.garages) : null,
      plants: form.plants ? Number(form.plants) : null,
      coveredArea: form.coveredArea ? Number(form.coveredArea) : null,
      semiCoveredArea: form.semiCoveredArea ? Number(form.semiCoveredArea) : null,
      uncoveredArea: form.uncoveredArea ? Number(form.uncoveredArea) : null,
      frontLength: form.frontLength ? Number(form.frontLength) : null,
      backLength: form.backLength ? Number(form.backLength) : null,
      expenses: form.expenses ? Number(form.expenses) : null,

      // Extra data: merge commercial/field/land specific fields into extraData
      extraData: {
        ...(form.commercialActivity && { commercialActivity: form.commercialActivity }),
        ...(form.hasDisplay !== undefined && { hasDisplay: form.hasDisplay }),
        ...(form.hasLoadingDock !== undefined && { hasLoadingDock: form.hasLoadingDock }),
        ...(form.hectares && { hectares: Number(form.hectares) }),
        ...(form.soilType && { soilType: form.soilType }),
        ...(form.hasIrrigation !== undefined && { hasIrrigation: form.hasIrrigation }),
        ...(form.hasFencing !== undefined && { hasFencing: form.hasFencing }),
        ...(form.landUse && { landUse: form.landUse }),
        ...(form.buildabilityIndex && { buildabilityIndex: Number(form.buildabilityIndex) }),
        ...(form.occupancyIndex && { occupancyIndex: Number(form.occupancyIndex) }),
        ...(form.hasConstruction !== undefined && { hasConstruction: form.hasConstruction }),
        ...(form.contactName && { contactName: form.contactName }),
        ...(form.contactPhone && { contactPhone: form.contactPhone }),
        ...(form.contactEmail && { contactEmail: form.contactEmail }),
        ...(form.contactWhatsapp && { contactWhatsapp: form.contactWhatsapp }),
        ...(form.showAgencyContact !== undefined && { showAgencyContact: form.showAgencyContact }),
        ...(form.condition && { condition: form.condition }),
        ...(form.orientation && { orientation: form.orientation }),
        ...(form.disposition && { disposition: form.disposition }),
        ...(form.constructionYear && { constructionYear: Number(form.constructionYear) }),
        ...(form.renovationYear && { renovationYear: Number(form.renovationYear) }),
        ...(form.buildingCondition && { buildingCondition: form.buildingCondition }),
        ...(form.buildingFloors && { buildingFloors: Number(form.buildingFloors) }),
        ...(form.unitsPerFloor && { unitsPerFloor: Number(form.unitsPerFloor) }),
      },

      hasWater: amenities["agua"] ?? amenities["hasWater"] ?? false,
      hasElectricity: amenities["luz"] ?? amenities["hasElectricity"] ?? false,
      hasGas: amenities["gas"] ?? amenities["hasGas"] ?? false,
      hasInternet: amenities["internet"] ?? amenities["hasInternet"] ?? false,
      hasParking: amenities["cochera"] ?? amenities["hasSharedParking"] ?? false,
      hasPool: amenities["pileta"] ?? amenities["hasPool"] ?? false,
      featureGroups: form.featureGroups || {},

      latitude: selectedParcel?.lat ?? null,
      longitude: selectedParcel?.lon ?? null,
      parcelCCA: selectedParcel?.CCA ?? null,
      parcelPDA: selectedParcel?.PDA ?? null,
      parcelGeom: selectedParcel?.geometry ?? null,

      images: form.images,
    };

    try {
      let result;
      if (isEditing && initialData?.id) {
        result = await updateProperty(initialData.id, payload);
      } else {
        result = await createProperty(payload);
      }
      if (onCreated) onCreated(result);
      onClose();
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Error al guardar la propiedad";
      setMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  const isFormComplete = (() => {
    const form = rhf.getValues();
    const hasPrice =
      Boolean(form.isPriceHidden) ||
      (form.salePrice ? Number(form.salePrice) > 0 : false) ||
      (form.rentPrice ? Number(form.rentPrice) > 0 : false);

    return (
      !!form.title?.trim() &&
      !!form.type &&
      !!form.operationType &&
      !!form.status &&
      !!form.country &&
      !!form.street?.trim() &&
      !!form.number?.toString().trim() &&
      hasPrice &&
      !!form.province &&
      !!form.city &&
      (form.images?.length ?? 0) > 0
    );
  });

  return {
    rhf,
    saving,
    message,
    setMessage,
    selectedParcel,
    setSelectedParcel,
    handleSave,
    isEditing,
    isFormComplete,
  };
}
