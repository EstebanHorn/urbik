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

const createEmptyForm = () => ({
  title: "",
  description: "",

  province: "",
  city: "",
  street: "",
  number: "",

  type: "HOUSE",
  operationType: "RENT",
  status: "AVAILABLE",

  price: "",
  currency: "USD",
  areaM2: "",
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
  initialData: any,
  onCreated: () => void,
  onClose: () => void
) {
  const isEditing = !!initialData;

  const [step, setStep] = useState<1 | 2>(isEditing ? 2 : 1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [selectedParcel, setSelectedParcel] = useState<SelectedParcel | null>(
    isEditing
      ? {
          CCA: initialData.parcelCCA ?? "S/D",
          PDA: initialData.parcelPDA ?? "S/D",
          geometry: initialData.parcelGeom ?? {},
          lat: initialData.latitude,
          lon: initialData.longitude,
        }
      : null
  );

  const [form, setForm] = useState(() => {
  if (!isEditing) return createEmptyForm();

  return {
    ...createEmptyForm(),
    title: initialData.title ?? "",
    description: initialData.description ?? "",
    province: initialData.province ?? "",
    city: initialData.city ?? "",
    type: initialData.type ?? "HOUSE",
    operationType: initialData.operationType ?? "RENT",
    isAvailable: initialData.status === "AVAILABLE",
    price: initialData.price?.toString() ?? "",
    currency: initialData.currency ?? "USD",
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
  console.log("useCreateProperty MOUNT");
  return () => console.log("useCreateProperty UNMOUNT");
}, []);

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

    const address =
      form.street || form.number
        ? `${form.street ?? ""} ${form.number ?? ""}`.trim()
        : null;


        const normalizedOperationType =
  form.operationType === "sale"
    ? "SALE"
    : form.operationType === "both"
    ? "SALE_RENT"
    : "RENT";

const normalizedStatus = form.status ? "AVAILABLE" : "PAUSED";


    const payload = {
  title: form.title,
  description: form.description,

  address,
  city: form.city,
  province: form.province,
  country: "Argentina",

  type: form.type,
  operationType: normalizedOperationType,
  status: normalizedStatus,

  price: Number(form.price),
  currency: form.currency,

  area: form.areaM2 ? Number(form.areaM2) : null,
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
      if (isEditing) {
        await updateProperty(initialData.id, payload);
      } else {
        await createProperty(payload);
      }

      onCreated?.();
      onClose();
    } catch (e: any) {
      setMessage(e.message ?? "Error al guardar la propiedad");
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
