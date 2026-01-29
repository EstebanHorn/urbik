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
  const [title, setTitle] = useState(property.title);
  const [price, setPrice] = useState(property.price?.toString() || "");
  const [description, setDescription] = useState(property.description || "");
  const [areaM2, setAreaM2] = useState(property.area?.toString() || "");
  const [rooms, setRooms] = useState(property.rooms?.toString() || "");
  const [bathrooms, setBathrooms] = useState(property.bathrooms?.toString() || "");
  const [images, setImages] = useState<string[]>(property.images || []);
  const [operationType, setOperationType] = useState(property.operationType || "SALE");
  const [status, setStatus] = useState(property.status || "AVAILABLE");
  const [saving, setSaving] = useState(false);
  const [viewMap, setViewMap] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState({
    lat: property.latitude ?? -34.921,
    lon: property.longitude ?? -57.954,
    CCA: property.parcelCCA,
    geometry: property.parcelGeom,
  });

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateProperty(property.id, {
        title, description, images, operationType, status,
        price: Number(price), areaM2: Number(areaM2),
        rooms: Number(rooms), bathrooms: Number(bathrooms),
        lat: selectedParcel.lat, lon: selectedParcel.lon,
        parcel: selectedParcel.CCA ? { CCA: selectedParcel.CCA, geometry: selectedParcel.geometry } : undefined,
      });
      onUpdated();
      onClose();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return {
    state: { title, price, description, areaM2, rooms, bathrooms, images, operationType, status, saving, viewMap, selectedParcel },
    actions: { setTitle, setPrice, setDescription, setAreaM2, setRooms, setBathrooms, setImages, setOperationType, setStatus, setViewMap, setSelectedParcel, handleUpdate }
  };
}