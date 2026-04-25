"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomDropdown } from "@/components/CustomDropdown";
import type { PropertyUploadFormData } from "./types";

interface Props {
  rhf: UseFormReturn<PropertyUploadFormData>;
}

const SOIL_TYPE_OPTIONS = [
  { value: "agricola", label: "Agrícola" },
  { value: "ganadero", label: "Ganadero" },
  { value: "mixto", label: "Mixto" },
  { value: "forestal", label: "Forestal" },
  { value: "tambo", label: "Tambo" },
  { value: "frutihorticultura", label: "Frutihorticultura" },
  { value: "otro", label: "Otro" },
];

const FIELD_BOOL_FEATURES: Array<{ key: keyof PropertyUploadFormData; label: string }> = [
  { key: "hasIrrigation", label: "Sistema de riego" },
  { key: "hasElectricity", label: "Luz eléctrica" },
  { key: "hasFencing", label: "Alambrado perimetral" },
  { key: "hasWater", label: "Agua corriente / pozo" },
];

export function Module10FieldInfo({ rhf }: Props) {
  const { watch, setValue } = rhf;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
          Hectáreas
        </label>
        <input
          type="number"
          min={0}
          placeholder="0"
          value={(watch("hectares") as string | number) ?? ""}
          onChange={(e) => setValue("hectares", e.target.value)}
          className="bg-white text-urbik-black/50 border border-black/50 w-full md:w-1/3 px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
          Tipo de suelo / productividad
        </label>
        <CustomDropdown
          label="Seleccionar tipo"
          options={SOIL_TYPE_OPTIONS}
          value={watch("soilType") ?? ""}
          onChange={(v) => setValue("soilType", v)}
          variant="white2"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-bold text-urbik-black/50 ml-1">
          Infraestructura del campo
        </p>
        <div className="grid grid-cols-2 gap-2">
          {FIELD_BOOL_FEATURES.map((feat) => (
            <label key={feat.key as string} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(watch(feat.key))}
                onChange={(e) => setValue(feat.key, e.target.checked)}
              />
              <span className="text-sm font-semibold text-urbik-black/70">
                {feat.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
