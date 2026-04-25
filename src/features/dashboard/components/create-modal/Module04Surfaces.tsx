"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import type { PropertyUploadFormData } from "./types";

interface Props {
  rhf: UseFormReturn<PropertyUploadFormData>;
}

interface SurfaceField {
  key: keyof PropertyUploadFormData;
  label: string;
  required?: boolean;
  visibleFor: string[];
}

const ALL_SURFACE_TYPES = [
  "HOUSE", "APARTMENT", "PH", "COUNTRY", "COMMERCIAL_PROPERTY",
  "OFFICE", "WAREHOUSE", "LAND", "FIELD", "DEVELOPMENT",
];

const SURFACE_FIELDS: SurfaceField[] = [
  {
    key: "areaM2",
    label: "Superficie total (m²) *",
    required: true,
    visibleFor: ALL_SURFACE_TYPES,
  },
  {
    key: "coveredArea",
    label: "Sup. cubierta (m²)",
    visibleFor: ["HOUSE", "APARTMENT", "PH", "COUNTRY", "COMMERCIAL_PROPERTY", "OFFICE", "WAREHOUSE"],
  },
  {
    key: "semiCoveredArea",
    label: "Sup. semicubierta (m²)",
    visibleFor: ["HOUSE", "APARTMENT", "PH", "COUNTRY"],
  },
  {
    key: "uncoveredArea",
    label: "Sup. descubierta (m²)",
    visibleFor: ["HOUSE", "APARTMENT", "PH", "COUNTRY"],
  },
  {
    key: "frontLength",
    label: "Frente (m)",
    visibleFor: ["HOUSE", "LAND", "FIELD", "COUNTRY", "COMMERCIAL_PROPERTY"],
  },
  {
    key: "backLength",
    label: "Fondo (m)",
    visibleFor: ["HOUSE", "LAND", "FIELD", "COUNTRY", "COMMERCIAL_PROPERTY"],
  },
];

export function Module04Surfaces({ rhf }: Props) {
  const { watch, setValue } = rhf;
  const type = watch("type") ?? "";

  const visibleFields = SURFACE_FIELDS.filter(
    (f) => f.visibleFor.includes(type),
  );

  if (visibleFields.length === 0) {
    return (
      <p className="text-sm text-gray-400 font-medium italic">
        No aplica superficies para este tipo de propiedad.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {visibleFields.map((field) => (
        <div key={field.key as string}>
          <label className="block text-sm font-bold text-urbik-black/50 mb-1 ml-1">
            {field.label}
          </label>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={(watch(field.key) as string | number) ?? ""}
            onChange={(e) => setValue(field.key, e.target.value)}
            className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
          />
        </div>
      ))}
    </div>
  );
}
