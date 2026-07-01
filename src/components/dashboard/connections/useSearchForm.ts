"use client";

import { useState, useEffect } from "react";
import { RURAL_TYPES } from "@/lib/connections/searchUi";

export interface SearchFormData {
  clientId: string;
  operationType: string;
  propertyType: string;
  province: string;
  department: string;
  locality: string;
  radius: string;
  minArea: string;
  maxArea: string;
  areaUnit: string;
  minPrice: string;
  maxPrice: string;
  currency: string;
  conditions: string;
}

// Estado + lógica del formulario de publicar/editar una búsqueda, compartida
// entre el modal de edición (CreateSearchModal) y la pantalla completa de
// creación (/connections/new).
export function useSearchForm({
  isOpen = true,
  clients,
  initialClientId,
  editingSearch,
  onPublished,
}: {
  isOpen?: boolean;
  clients: any[];
  initialClientId?: string;
  editingSearch?: any;
  onPublished?: (data: any) => void;
}) {
  const isEditing = !!editingSearch;

  const emptyForm: SearchFormData = {
    clientId: initialClientId || "",
    operationType: "SALE",
    propertyType: "FIELD",
    province: "",
    department: "",
    locality: "",
    radius: "",
    minArea: "",
    maxArea: "",
    areaUnit: "HA",
    minPrice: "",
    maxPrice: "",
    currency: "USD",
    conditions: "",
  };
  const [formData, setFormData] = useState<SearchFormData>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRural = RURAL_TYPES.includes(formData.propertyType);

  useEffect(() => {
    if (!isOpen) return;
    if (editingSearch) {
      setFormData({
        clientId: editingSearch.client_id || editingSearch.clientId || "",
        operationType: editingSearch.operation_type || "SALE",
        propertyType: editingSearch.property_type || "FIELD",
        province: editingSearch.province || "",
        department: editingSearch.city || "",
        locality: "",
        radius: editingSearch.radius_km ? String(editingSearch.radius_km) : "",
        minArea: editingSearch.min_area ?? "",
        maxArea: editingSearch.max_area ?? "",
        areaUnit: editingSearch.area_unit || "HA",
        minPrice: editingSearch.min_price ?? "",
        maxPrice: editingSearch.max_price ?? "",
        currency: editingSearch.currency || "USD",
        conditions: editingSearch.additional_conditions || "",
      });
    } else {
      setFormData({ ...emptyForm, clientId: initialClientId || "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingSearch]);

  useEffect(() => {
    if (isEditing || !initialClientId) return;
    setFormData((prev) => ({ ...prev, clientId: initialClientId }));
  }, [initialClientId, isEditing]);

  // Ajustar unidad de superficie por defecto según el tipo (rural -> ha).
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      areaUnit: RURAL_TYPES.includes(prev.propertyType) ? "HA" : "M2",
      radius: RURAL_TYPES.includes(prev.propertyType) ? prev.radius : "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.propertyType]);

  // Pre-completar con los parámetros del contacto si los tiene (sólo al crear).
  useEffect(() => {
    if (isEditing || !formData.clientId) return;
    const c = clients.find((x: any) => x.id === formData.clientId);
    const sp = c?.searchParams;
    if (sp) {
      setFormData((prev) => ({
        ...prev,
        operationType: sp.operationType || prev.operationType,
        propertyType: sp.propertyType || prev.propertyType,
        province: sp.province || prev.province,
        department: sp.department || prev.department,
        locality: sp.locality || sp.city || prev.locality,
        minPrice: sp.minPrice ?? prev.minPrice,
        maxPrice: sp.maxPrice ?? prev.maxPrice,
        currency: sp.currency || prev.currency,
        minArea: sp.minArea ?? prev.minArea,
        maxArea: sp.maxArea ?? prev.maxArea,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.clientId, isEditing]);

  const setField = (name: keyof SearchFormData, value: string) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  // LocationSelectors emite los nombres province / city (=departamento) / locality
  const handleLocation = (name: string, value: string) => {
    if (name === "province")
      setFormData((p) => ({ ...p, province: value, department: "", locality: "" }));
    else if (name === "city")
      setFormData((p) => ({ ...p, department: value, locality: "" }));
    else if (name === "locality")
      setFormData((p) => ({ ...p, locality: value }));
  };

  const handleSubmit = async (): Promise<void> => {
    setError(null);
    if (!formData.clientId) {
      setError("Debés seleccionar un contacto interno.");
      return;
    }
    if (!formData.province) {
      setError("Seleccioná al menos la provincia de búsqueda.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        clientId: formData.clientId,
        operationType: formData.operationType,
        propertyType: formData.propertyType,
        province: formData.province,
        city: formData.locality || formData.department || "",
        radiusKm: isRural && formData.radius ? Number(formData.radius) : null,
        minArea: formData.minArea,
        maxArea: formData.maxArea,
        areaUnit: formData.areaUnit,
        minPrice: formData.minPrice,
        maxPrice: formData.maxPrice,
        currency: formData.currency,
        conditions: formData.conditions,
      };
      const res = isEditing
        ? await fetch(`/api/searches/${editingSearch.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/searches", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error ||
            (isEditing ? "Error al actualizar la búsqueda" : "Error al publicar la búsqueda")
        );

      setFormData(emptyForm);
      onPublished?.(data);

      if (isEditing) {
        alert("¡Búsqueda actualizada!");
      } else {
        const n = data.matchCount || 0;
        alert(
          n > 0
            ? `¡Búsqueda publicada! Encontramos ${n} ${
                n === 1 ? "propiedad" : "propiedades"
              } en la red y notificamos a sus inmobiliarias.`
            : "¡Búsqueda publicada en la bolsa!"
        );
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData,
    setField,
    handleLocation,
    handleSubmit,
    error,
    submitting,
    isRural,
    isEditing,
  };
}
