"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomDropdown } from "@/components/CustomDropdown";
import type { PropertyUploadFormData } from "./types";

interface Props {
  rhf: UseFormReturn<PropertyUploadFormData>;
}

const BUILDING_CONDITION_OPTIONS = [
  { value: "excelente", label: "Excelente" },
  { value: "muy_bueno", label: "Muy bueno" },
  { value: "bueno", label: "Bueno" },
  { value: "regular", label: "Regular" },
];

export function Module08BuildingInfo({ rhf }: Props) {
  const { watch, setValue } = rhf;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
          Estado del edificio
        </label>
        <CustomDropdown
          label="Seleccionar"
          options={BUILDING_CONDITION_OPTIONS}
          value={watch("buildingCondition") ?? ""}
          onChange={(v) => setValue("buildingCondition", v)}
          variant="white2"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
          Cantidad de pisos
        </label>
        <input
          type="number"
          min={1}
          placeholder="0"
          value={(watch("buildingFloors") as string | number) ?? ""}
          onChange={(e) => setValue("buildingFloors", e.target.value)}
          className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
          Departamentos por piso
        </label>
        <input
          type="number"
          min={1}
          placeholder="0"
          value={(watch("unitsPerFloor") as string | number) ?? ""}
          onChange={(e) => setValue("unitsPerFloor", e.target.value)}
          className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
        />
      </div>
    </div>
  );
}
