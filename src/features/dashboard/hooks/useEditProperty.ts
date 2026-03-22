import { useState } from "react";
import { updateProperty } from "../service/dashboardService";

interface PropertyAmenities {
  [key: string]: boolean;
}

export interface EditPropertyFormState {
  title: string;
  description: string;
  images: string[];
  operationType: string;
  status: string;
  salePrice: string | number | null;
  rentPrice: string | number | null;
  areaM2?: string | number;
  area?: string | number;
  rooms: string | number;
  bathrooms: string | number;
  amenities: PropertyAmenities;
  address?: string;
  street?: string;
  number?: string;
  city?: string;
  province?: string;
  [key: string]: unknown;
}

interface UpdatePropertyPayload {
  title: string;
  description: string;
  images: string[];
  operationType: string;
  status: string;
  area: number;
  rooms: number;
  bathrooms: number;
  unitType?: string | null;
  country?: string;
  district?: string | null;
  locality?: string | null;
  neighborhood?: string | null;
  streetName?: string | null;
  streetNumber?: string | null;
  floor?: string | null;
  unitNumber?: string | null;
  toilets?: number | null;
  garages?: number | null;
  plants?: number | null;
  coveredArea?: number | null;
  semiCoveredArea?: number | null;
  uncoveredArea?: number | null;
  frontLength?: number | null;
  backLength?: number | null;
  expenses?: number | null;
  amenities: PropertyAmenities;
  salePrice?: number | null;
  rentPrice?: number | null;
  propertySubtype?: string | null;
  youtubeUrl?: string | null;
  tour360Url?: string | null;
  isPriceHidden?: boolean;
  featureGroups?: Record<string, Record<string, boolean>>;
  extraData?: Record<string, unknown>;
  [key: string]: unknown;
}

export function useEditProperty(
  property: EditPropertyFormState & { id: number | string },
  onUpdated: () => void,
  onClose: () => void,
) {
  const [form, setForm] = useState<EditPropertyFormState>({
    ...property,
    areaM2: property.area?.toString() || property.areaM2?.toString() || "",
    rooms: property.rooms?.toString() || "",
    bathrooms: property.bathrooms?.toString() || "",
    salePrice: property.salePrice?.toString() || "",
    rentPrice: property.rentPrice?.toString() || "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdate = async () => {
    console.log("CLIENT-LOG: Iniciando handleUpdate");
    setSaving(true);
    setMessage("");

    const updateData: UpdatePropertyPayload = {
      title: form.title,
      description: form.description,
      images: form.images,
      operationType: form.operationType,
      status: form.status,
      area: Number(form.areaM2 || form.area),
      rooms: Number(form.rooms),
      bathrooms: Number(form.bathrooms),
      unitType: (form.unitType as string) || null,
      country: (form.country as string) || "Argentina",
      district: (form.district as string) || null,
      locality: (form.locality as string) || null,
      neighborhood: (form.neighborhood as string) || null,
      streetName: (form.street as string) || null,
      streetNumber: (form.number as string) || null,
      floor: (form.floor as string) || null,
      unitNumber: (form.unitNumber as string) || null,
      toilets: form.toilets ? Number(form.toilets) : null,
      garages: form.garages ? Number(form.garages) : null,
      plants: form.plants ? Number(form.plants) : null,
      coveredArea: form.coveredArea ? Number(form.coveredArea) : null,
      semiCoveredArea: form.semiCoveredArea ? Number(form.semiCoveredArea) : null,
      uncoveredArea: form.uncoveredArea ? Number(form.uncoveredArea) : null,
      frontLength: form.frontLength ? Number(form.frontLength) : null,
      backLength: form.backLength ? Number(form.backLength) : null,
      expenses: form.expenses ? Number(form.expenses) : null,
      amenities: form.amenities,
      propertySubtype: (form.propertySubtype as string) || null,
      youtubeUrl: (form.youtubeUrl as string) || null,
      tour360Url: (form.tour360Url as string) || null,
      isPriceHidden: Boolean(form.isPriceHidden),
      featureGroups:
        (form.featureGroups as Record<string, Record<string, boolean>>) || {},
      extraData: (form.extraData as Record<string, unknown>) || {},
    };

    if (form.operationType === "SALE") {
      updateData.salePrice = Number(form.salePrice);
      updateData.rentPrice = null;
    } else if (form.operationType === "RENT" || form.operationType === "TEMP_RENT") {
      updateData.rentPrice = Number(form.rentPrice);
      updateData.salePrice = null;
    } else {
      updateData.salePrice = Number(form.salePrice);
      updateData.rentPrice = Number(form.rentPrice);
    }

    console.log("CLIENT-LOG: Datos a enviar:", updateData);

    try {
      const res = await updateProperty(property.id, updateData);
      console.log("CLIENT-LOG: Respuesta del servidor:", res);
      onUpdated();
      onClose();
    } catch (e: unknown) {
      let errorMessage = "Error al actualizar";
      if (e instanceof Error) {
        errorMessage = e.message;
        console.error("CLIENT-LOG: Error capturado:", e.message);
      } else if (typeof e === "string") {
        errorMessage = e;
      }
      setMessage(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return { form, setForm, saving, message, handleUpdate };
}
