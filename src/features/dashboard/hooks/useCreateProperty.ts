/*
Este código define un hook personalizado de React llamado useCreateProperty que gestiona la
lógica de negocio para crear o editar propiedades inmobiliarias a través de un formulario.
El hook centraliza el estado de los datos (título, precio, ubicación, servicios, etc.), maneja
la transición entre pasos del proceso, y normaliza la información geográfica proveniente de un
mapa mediante el objeto selectedParcel. Dependiendo de si recibe datos iniciales (initialData),
el hook determina si está en modo edición o creación, inicializando el formulario con valores
previos o por defecto, y finalmente expone una función handleSave que procesa los datos, los
envía a los servicios de API correspondientes (createProperty o updateProperty) y gestiona los
estados de carga y error de la operación asíncrona.
*/
import { useState, useEffect } from "react";
import { createProperty, updateProperty } from "../service/dashboardService";
import type { SelectedParcel } from "@/features/map/types/types";
import { PropertyFormData } from "../components/create-modal/PropertyFormField";

// Definimos una interfaz extendida para initialData
interface ExtendedInitialData extends Partial<PropertyFormData> {
  id?: number | string;
  parcelCCA?: string;
  parcelPDA?: string;
  parcelGeom?: unknown;
  latitude?: number;
  longitude?: number;
  area?: number; // Puede venir como area en lugar de areaM2
  address?: string;
  hasWater?: boolean;
  hasElectricity?: boolean;
  hasGas?: boolean;
  hasInternet?: boolean;
  hasParking?: boolean;
  hasPool?: boolean;
}

const createEmptyForm = (): PropertyFormData => ({
  title: "",
  description: "",
  province: "",
  city: "",
  street: "",
  number: "",
  type: "HOUSE",
  operationType: "RENT",
  status: "AVAILABLE",

  salePrice: "",
  saleCurrency: "USD",
  rentPrice: "",
  rentCurrency: "ARS",

  currency: "USD",
  areaM2: "",
  area: "", // Compatibilidad
  rooms: "",
  bathrooms: "",
  amenities: {
    agua: false,
    luz: false,
    gas: false,
    internet: false,
    cochera: false,
    pileta: false,
  },
  images: [],
});

export function useCreateProperty(
  initialData: ExtendedInitialData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCreated: (data?: any) => void,
  onClose: () => void,
) {
  const isEditing = !!initialData;

  const [step, setStep] = useState<1 | 2>(isEditing ? 1 : 1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [selectedParcel, setSelectedParcel] = useState<SelectedParcel | null>(
    isEditing
      ? {
          CCA: initialData.parcelCCA ?? "S/D",
          PDA: initialData.parcelPDA ?? "S/D",
          geometry: initialData.parcelGeom ?? {},
          lat: initialData.latitude ?? 0,
          lon: initialData.longitude ?? 0,
        }
      : null,
  );

  const [form, setForm] = useState<PropertyFormData>(() => {
    if (!isEditing) return createEmptyForm();

    return {
      ...createEmptyForm(),
      title: initialData.title ?? "",
      description: initialData.description ?? "",
      province: initialData.province ?? "",
      city: initialData.city ?? "",
      street: initialData.address?.split(" ")[0] ?? "",
      number: initialData.address?.split(" ")[1] ?? "",
      type: initialData.type ?? "HOUSE",
      operationType: initialData.operationType ?? "RENT",
      status: initialData.status ?? "AVAILABLE",

      salePrice: initialData.salePrice?.toString() ?? "",
      saleCurrency: initialData.saleCurrency ?? "USD",
      rentPrice: initialData.rentPrice?.toString() ?? "",
      rentCurrency: initialData.rentCurrency ?? "ARS",

      areaM2: initialData.area?.toString() ?? "",
      rooms: initialData.rooms?.toString() ?? "",
      bathrooms: initialData.bathrooms?.toString() ?? "",
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
      country: "Argentina",
      type: form.type,
      operationType: form.operationType,
      status: form.status,

      salePrice: form.salePrice ? Number(form.salePrice) : null,
      saleCurrency: form.saleCurrency,
      rentPrice: form.rentPrice ? Number(form.rentPrice) : null,
      rentCurrency: form.rentCurrency,

      areaM2: form.areaM2 ? Number(form.areaM2) : null,
      rooms: form.rooms ? Number(form.rooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,

      hasWater: form.amenities.agua,
      hasElectricity: form.amenities.luz,
      hasGas: form.amenities.gas,
      hasInternet: form.amenities.internet,
      hasParking: form.amenities.cochera,
      hasPool: form.amenities.pileta,

      latitude: selectedParcel?.lat ?? null,
      longitude: selectedParcel?.lon ?? null,
      parcelCCA: selectedParcel?.CCA ?? null,
      parcelPDA: selectedParcel?.PDA ?? null,
      parcelGeom: selectedParcel?.geometry ?? null,

      images: form.images,
    };

    try {
      let result;
      if (isEditing && initialData.id) {
        result = await updateProperty(initialData.id, payload);
      } else {
        result = await createProperty(payload);
      }

      if (onCreated) onCreated(result);
      onClose();
    } catch (e) {
      // CORRECCIÓN: Eliminado ': any'
      const errorMsg =
        e instanceof Error ? e.message : "Error al guardar la propiedad";
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
