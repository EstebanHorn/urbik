import { useState, useEffect } from "react";
import { createProperty, updateProperty } from "../service/dashboardService";
import type { SelectedParcel } from "@/features/map/types/types";
import type { Geometry } from "geojson";

export interface PropertyInitialData {
  id?: number | string;
  parcelCCA?: string;
  parcelPDA?: string;
  parcelGeom?: Geometry | Record<string, unknown>;
  latitude?: number;
  longitude?: number;
  title?: string;
  description?: string;
  province?: string;
  country?: string;
  district?: string;
  locality?: string;
  neighborhood?: string;
  streetName?: string;
  streetNumber?: string;
  floor?: string;
  unitNumber?: string;
  city?: string;
  address?: string;
  type?: string;
  unitType?: string;
  operationType?: string;
  status?: string;
  salePrice?: number | string;
  saleCurrency?: string;
  rentPrice?: number | string;
  rentCurrency?: string;
  area?: number | string;
  rooms?: number | string;
  bathrooms?: number | string;
  toilets?: number | string;
  garages?: number | string;
  plants?: number | string;
  coveredArea?: number | string;
  semiCoveredArea?: number | string;
  uncoveredArea?: number | string;
  frontLength?: number | string;
  backLength?: number | string;
  expenses?: number | string;
  images?: string[];
  hasWater?: boolean;
  hasElectricity?: boolean;
  hasGas?: boolean;
  hasInternet?: boolean;
  hasParking?: boolean;
  hasPool?: boolean;
  propertySubtype?: string;
  youtubeUrl?: string;
  tour360Url?: string;
  isPriceHidden?: boolean;
  featureGroups?: Record<string, Record<string, boolean>>;
  extraData?: Record<string, unknown>;
}

const createEmptyForm = () => ({
  title: "",
  description: "",
  country: "Argentina",
  province: "",
  city: "",
  district: "",
  locality: "",
  neighborhood: "",
  street: "",
  number: "",
  floor: "",
  unitNumber: "",
  type: "HOUSE",
  unitType: "",
  operationType: "RENT",
  status: "AVAILABLE",

  salePrice: "",
  saleCurrency: "USD",
  rentPrice: "",
  rentCurrency: "ARS",

  currency: "USD",
  areaM2: "",
  rooms: "",
  bathrooms: "",
  toilets: "",
  garages: "",
  plants: "",
  coveredArea: "",
  semiCoveredArea: "",
  uncoveredArea: "",
  frontLength: "",
  backLength: "",
  expenses: "",
  amenities: {
    agua: false,
    luz: false,
    gas: false,
    internet: false,
    cochera: false,
    pileta: false,
  },
  featureGroups: {} as Record<string, Record<string, boolean>>,
  propertySubtype: "",
  youtubeUrl: "",
  tour360Url: "",
  isPriceHidden: false,
  extraData: {} as Record<string, unknown>,
  images: [] as string[],
});

export function useCreateProperty(
  initialData: PropertyInitialData | null,
  onCreated: (data?: unknown) => void,
  onClose: () => void,
) {
  const isEditing = !!initialData;

  const [step, setStep] = useState<1 | 2>(isEditing ? 1 : 1);
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

  const [form, setForm] = useState(() => {
    if (!isEditing || !initialData) return createEmptyForm();

    return {
      ...createEmptyForm(),
      title: initialData.title ?? "",
      description: initialData.description ?? "",
      province: initialData.province ?? "",
      country: initialData.country ?? "Argentina",
      city: initialData.city ?? "",
      district: initialData.district ?? "",
      locality: initialData.locality ?? "",
      neighborhood: initialData.neighborhood ?? "",
      street: initialData.streetName ?? initialData.address?.split(" ")[0] ?? "",
      number: initialData.streetNumber ?? initialData.address?.split(" ")[1] ?? "",
      floor: initialData.floor ?? "",
      unitNumber: initialData.unitNumber ?? "",
      type: initialData.type ?? "HOUSE",
      unitType: initialData.unitType ?? "",
      operationType: initialData.operationType ?? "RENT",
      status: initialData.status ?? "AVAILABLE",

      salePrice: initialData.salePrice?.toString() ?? "",
      saleCurrency: initialData.saleCurrency ?? "USD",
      rentPrice: initialData.rentPrice?.toString() ?? "",
      rentCurrency: initialData.rentCurrency ?? "ARS",

      areaM2: initialData.area?.toString() ?? "",
      rooms: initialData.rooms?.toString() ?? "",
      bathrooms: initialData.bathrooms?.toString() ?? "",
      toilets: initialData.toilets?.toString() ?? "",
      garages: initialData.garages?.toString() ?? "",
      plants: initialData.plants?.toString() ?? "",
      coveredArea: initialData.coveredArea?.toString() ?? "",
      semiCoveredArea: initialData.semiCoveredArea?.toString() ?? "",
      uncoveredArea: initialData.uncoveredArea?.toString() ?? "",
      frontLength: initialData.frontLength?.toString() ?? "",
      backLength: initialData.backLength?.toString() ?? "",
      expenses: initialData.expenses?.toString() ?? "",
      propertySubtype: initialData.propertySubtype ?? "",
      youtubeUrl: initialData.youtubeUrl ?? "",
      tour360Url: initialData.tour360Url ?? "",
      isPriceHidden: initialData.isPriceHidden ?? false,
      featureGroups: initialData.featureGroups ?? {},
      extraData: initialData.extraData ?? {},
      images: initialData.images ?? [],
      amenities: {
        agua: initialData.hasWater ?? false,
        luz: initialData.hasElectricity ?? false,
        gas: initialData.hasGas ?? false,
        internet: initialData.hasInternet ?? false,
        cochera: initialData.hasParking ?? false,
        pileta: initialData.hasPool ?? false,
      },
    };
  });

  useEffect(() => {
    if (!isEditing && selectedParcel && !form.title) {
      setForm((prev) => ({
        ...prev,
        title: `Propiedad en ${selectedParcel.PDA ?? selectedParcel.CCA ?? "Buenos Aires"}`,
      }));
    }
  }, [selectedParcel, isEditing, form.title]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const fullAddress =
      form.street || form.number
        ? `${form.street ?? ""} ${form.number ?? ""}`.trim()
        : form.city;

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
      extraData: form.extraData || {},

      hasWater: form.amenities.agua,
      hasElectricity: form.amenities.luz,
      hasGas: form.amenities.gas,
      hasInternet: form.amenities.internet,
      hasParking: form.amenities.cochera,
      hasPool: form.amenities.pileta,
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
      let errorMsg = "Error al guardar la propiedad";
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === "string") {
        errorMsg = error;
      }
      setMessage(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return {
    step,
    setStep,
    selectedParcel,
    setSelectedParcel,
    form,
    setForm,
    saving,
    message,
    setMessage,
    handleSave,
    isEditing,
  };
}
