import { useState } from "react";
import { updateProperty } from "../service/dashboardService";

interface PropertyAmenities {
  [key: string]: boolean;
}

// Definición completa del estado del formulario para edición
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
  // Campos geográficos adicionales pueden ser necesarios
  address?: string;
  street?: string;
  number?: string;
  city?: string;
  province?: string;
  [key: string]: unknown; // Flexibilidad controlada para otros campos
}

// Interfaz para el objeto que se envía a la API
interface UpdatePropertyPayload {
  title: string;
  description: string;
  images: string[];
  operationType: string;
  status: string;
  area: number;
  rooms: number;
  bathrooms: number;
  amenities: PropertyAmenities;
  salePrice?: number | null;
  rentPrice?: number | null;
  // CORRECCIÓN: Index signature necesaria para ser compatible con PropertyPayload del servicio
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
      amenities: form.amenities,
    };

    if (form.operationType === "SALE") {
      updateData.salePrice = Number(form.salePrice);
      updateData.rentPrice = null;
    } else if (form.operationType === "RENT") {
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
