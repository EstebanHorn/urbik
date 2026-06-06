import { useState } from "react";
import { useForm } from "react-hook-form";
import { propertyService } from "@/services/properties";
import type { SelectedParcel } from "@/components/map/types";
import type { Geometry } from "geojson";

export interface PropertyAmenities {
  agua?: boolean;
  luz?: boolean;
  gas?: boolean;
  internet?: boolean;
  cochera?: boolean;
  pileta?: boolean;
  [key: string]: boolean | undefined;
}

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

export interface PropertyFormValues {
  type: string;
  unitType: string;
  propertySubtype: string;
  operationType: string;
  status: string;
  salePrice: string;
  saleCurrency: string;
  rentPrice: string;
  rentCurrency: string;
  isPriceHidden: boolean;
  expenses: string;
  country: string;
  province: string;
  city: string;
  district: string;
  locality: string;
  neighborhood: string;
  street: string;
  number: string;
  floor: string;
  unitNumber: string;
  title: string;
  description: string;
  areaM2: string;
  coveredArea: string;
  semiCoveredArea: string;
  uncoveredArea: string;
  frontLength: string;
  backLength: string;
  rooms: string;
  bathrooms: string;
  toilets: string;
  garages: string;
  plants: string;
  amenities: Record<string, boolean>;
  featureGroups: Record<string, Record<string, boolean>>;
  youtubeUrl: string;
  tour360Url: string;
  images: string[];
  showAgencyContact: boolean;

  commercialActivity?: string;
  hasDisplay?: boolean;
  hasLoadingDock?: boolean;
  hectares?: string;
  soilType?: string;
  hasIrrigation?: boolean;
  hasFencing?: boolean;
  landUse?: string;
  buildabilityIndex?: string;
  occupancyIndex?: string;
  hasConstruction?: boolean;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  bedrooms: string;
  condition?: string;
  orientation?: string;
  disposition?: string;
  constructionYear?: string;
  renovationYear?: string;
  buildingCondition?: string;
  buildingFloors?: string;
  unitsPerFloor?: string;
  garageType?: string;
  balconyType?: string;
  viewType?: string;
  floorType?: string;
  roofType?: string;
  slope?: string;
  coastType?: string;
}

function buildDefaultValues(
  initialData: PropertyInitialData | null,
): PropertyFormValues {
  if (!initialData) {
    return {
      type: "HOUSE",
      unitType: "",
      propertySubtype: "",
      operationType: "RENT",
      status: "AVAILABLE",
      salePrice: "",
      saleCurrency: "USD",
      rentPrice: "",
      rentCurrency: "ARS",
      isPriceHidden: false,
      expenses: "",
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
      title: "",
      description: "",
      areaM2: "",
      coveredArea: "",
      semiCoveredArea: "",
      uncoveredArea: "",
      frontLength: "",
      backLength: "",
      rooms: "",
      bedrooms: "",
      bathrooms: "",
      toilets: "",
      garages: "",
      plants: "",
      amenities: {},
      featureGroups: {},
      youtubeUrl: "",
      tour360Url: "",
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
    saleCurrency: initialData.saleCurrency ?? "USD",
    rentPrice: initialData.rentPrice?.toString() ?? "",
    rentCurrency: initialData.rentCurrency ?? "ARS",
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
    bedrooms: (initialData.extraData?.bedrooms as string | number | undefined)?.toString() ?? "",
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

  const rhf = useForm<PropertyFormValues>({
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

    const amenities = form.amenities ?? {};

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
      semiCoveredArea: form.semiCoveredArea
        ? Number(form.semiCoveredArea)
        : null,
      uncoveredArea: form.uncoveredArea
        ? Number(form.uncoveredArea)
        : null,
      frontLength: form.frontLength ? Number(form.frontLength) : null,
      backLength: form.backLength ? Number(form.backLength) : null,
      expenses: form.expenses ? Number(form.expenses) : null,
      extraData: {
        ...(form.commercialActivity && {
          commercialActivity: form.commercialActivity,
        }),
        ...(form.hasDisplay !== undefined && {
          hasDisplay: form.hasDisplay,
        }),
        ...(form.hasLoadingDock !== undefined && {
          hasLoadingDock: form.hasLoadingDock,
        }),
        ...(form.hectares && {
          hectares: Number(form.hectares),
        }),
        ...(form.soilType && {
          soilType: form.soilType,
        }),
        ...(form.hasIrrigation !== undefined && {
          hasIrrigation: form.hasIrrigation,
        }),
        ...(form.hasFencing !== undefined && {
          hasFencing: form.hasFencing,
        }),
        ...(form.landUse && {
          landUse: form.landUse,
        }),
        ...(form.buildabilityIndex && {
          buildabilityIndex: Number(form.buildabilityIndex),
        }),
        ...(form.occupancyIndex && {
          occupancyIndex: Number(form.occupancyIndex),
        }),
        ...(form.hasConstruction !== undefined && {
          hasConstruction: form.hasConstruction,
        }),
        ...(form.contactName && {
          contactName: form.contactName,
        }),
        ...(form.contactPhone && {
          contactPhone: form.contactPhone,
        }),
        ...(form.contactEmail && {
          contactEmail: form.contactEmail,
        }),
        ...(form.contactWhatsapp && {
          contactWhatsapp: form.contactWhatsapp,
        }),
        ...(form.showAgencyContact !== undefined && {
          showAgencyContact: form.showAgencyContact,
        }),
        ...(form.condition && {
          condition: form.condition,
        }),
        ...(form.orientation && {
          orientation: form.orientation,
        }),
        ...(form.disposition && {
          disposition: form.disposition,
        }),
        ...(form.constructionYear && {
          constructionYear: Number(form.constructionYear),
        }),
        ...(form.renovationYear && {
          renovationYear: Number(form.renovationYear),
        }),
        ...(form.buildingCondition && {
          buildingCondition: form.buildingCondition,
        }),
        ...(form.buildingFloors && {
          buildingFloors: Number(form.buildingFloors),
        }),
        ...(form.unitsPerFloor && {
          unitsPerFloor: Number(form.unitsPerFloor),
        }),
        ...(form.bedrooms && { bedrooms: Number(form.bedrooms) }),
        ...(form.garageType && { garageType: form.garageType }),
        ...(form.balconyType && { balconyType: form.balconyType }),
        ...(form.viewType && { viewType: form.viewType }),
        ...(form.floorType && { floorType: form.floorType }),
        ...(form.roofType && { roofType: form.roofType }),
        ...(form.slope && { slope: form.slope }),
        ...(form.coastType && { coastType: form.coastType }),
      },
      hasWater: amenities["agua"] ?? amenities["hasWater"] ?? false,
      hasElectricity:
        amenities["luz"] ?? amenities["hasElectricity"] ?? false,
      hasGas: amenities["gas"] ?? amenities["hasGas"] ?? false,
      hasInternet:
        amenities["internet"] ?? amenities["hasInternet"] ?? false,
      hasParking:
        amenities["cochera"] ?? amenities["hasSharedParking"] ?? false,
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
        result = await propertyService.updateProperty(
          initialData.id,
          payload,
        );
      } else {
        result = await propertyService.createProperty(payload);
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

  const isFormComplete = () => {
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
  };

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
  unitType?: string;
  country?: string;
  district?: string;
  locality?: string;
  neighborhood?: string;
  floor?: string;
  unitNumber?: string;
  toilets?: string | number;
  garages?: string | number;
  plants?: string | number;
  coveredArea?: string | number;
  semiCoveredArea?: string | number;
  uncoveredArea?: string | number;
  frontLength?: string | number;
  backLength?: string | number;
  expenses?: string | number;
  propertySubtype?: string;
  youtubeUrl?: string;
  tour360Url?: string;
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
    setSaving(true);
    setMessage("");

    const updateData: Record<string, unknown> = {
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
      coveredArea: form.coveredArea
        ? Number(form.coveredArea)
        : null,
      semiCoveredArea: form.semiCoveredArea
        ? Number(form.semiCoveredArea)
        : null,
      uncoveredArea: form.uncoveredArea
        ? Number(form.uncoveredArea)
        : null,
      frontLength: form.frontLength
        ? Number(form.frontLength)
        : null,
      backLength: form.backLength
        ? Number(form.backLength)
        : null,
      expenses: form.expenses ? Number(form.expenses) : null,
      amenities: form.amenities,
      propertySubtype: (form.propertySubtype as string) || null,
      youtubeUrl: (form.youtubeUrl as string) || null,
      tour360Url: (form.tour360Url as string) || null,
      isPriceHidden: Boolean(form.isPriceHidden),
      featureGroups:
        (form.featureGroups as Record<
          string,
          Record<string, boolean>
        >) || {},
      extraData:
        (form.extraData as Record<string, unknown>) || {},
    };

    if (form.operationType === "SALE") {
      updateData.salePrice = Number(form.salePrice);
      updateData.rentPrice = null;
    } else if (
      form.operationType === "RENT" ||
      form.operationType === "TEMP_RENT"
    ) {
      updateData.rentPrice = Number(form.rentPrice);
      updateData.salePrice = null;
    } else {
      updateData.salePrice = Number(form.salePrice);
      updateData.rentPrice = Number(form.rentPrice);
    }

    try {
      await propertyService.updateProperty(property.id, updateData);

      onUpdated();
      onClose();
    } catch (e: unknown) {
      let errorMessage = "Error al actualizar";

      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === "string") {
        errorMessage = e;
      }

      setMessage(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    setForm,
    saving,
    message,
    handleUpdate,
  };
}