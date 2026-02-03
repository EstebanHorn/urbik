/*
Este código define un hook personalizado de React llamado useEditProperty diseñado para gestionar
la lógica de edición de una propiedad inmobiliaria, centralizando tanto el estado de sus atributos
(como título, precio, descripción y coordenadas geográficas) como las funciones para actualizarlos.
Al inicializarse con los datos existentes de una propiedad, el hook expone un conjunto de estados
controlados y una función asíncrona handleUpdate que, al ejecutarse, envía la información procesada
—incluyendo conversiones de tipos y datos de geolocalización— hacia un servicio externo; finalmente,
gestiona los estados de carga, maneja errores mediante alertas y coordina la ejecución de funciones
de retroalimentación (onUpdated y onClose) para cerrar el flujo de edición exitosamente.
*/

import { useState } from "react";
import { updateProperty } from "../service/dashboardService";

export function useEditProperty(property: any, onUpdated: () => void, onClose: () => void) {
  const [form, setForm] = useState({
    ...property,
    areaM2: property.area?.toString() || "",
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

    const updateData: any = {
      title: form.title,
      description: form.description,
      images: form.images,
      operationType: form.operationType,
      status: form.status,
      area: Number(form.areaM2),
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
    } catch (e: any) {
      console.error("CLIENT-LOG: Error capturado:", e.message);
      setMessage(e.message || "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  return { form, setForm, saving, message, handleUpdate };
}