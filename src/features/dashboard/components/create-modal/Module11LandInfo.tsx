"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomDropdown } from "@/components/CustomDropdown";
import type { PropertyUploadFormData } from "./types";

interface Props {
  rhf: UseFormReturn<PropertyUploadFormData>;
}

const LAND_USE_OPTIONS = [
  { value: "residencial", label: "Residencial" },
  { value: "comercial", label: "Comercial" },
  { value: "industrial", label: "Industrial" },
  { value: "rural", label: "Rural" },
  { value: "mixto", label: "Mixto" },
  { value: "country", label: "Country / Barrio privado" },
];

export function Module11LandInfo({ rhf }: Props) {
  const { watch, setValue } = rhf;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
          Uso del suelo (zonificación)
        </label>
        <CustomDropdown
          label="Seleccionar uso"
          options={LAND_USE_OPTIONS}
          value={watch("landUse") ?? ""}
          onChange={(v) => setValue("landUse", v)}
          variant="white2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 ml-1">
            <label className="text-sm font-bold text-urbik-black/50">
              FOS — Factor de ocupación del suelo
            </label>
            <span
              title="Porcentaje máximo de la parcela que puede ser ocupado por construcción en planta baja."
              className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[9px] font-black flex items-center justify-center cursor-help shrink-0"
            >
              ?
            </span>
          </div>
          <input
            type="number"
            min={0}
            max={100}
            placeholder="0–100"
            value={(watch("occupancyIndex") as string | number) ?? ""}
            onChange={(e) => setValue("occupancyIndex", e.target.value)}
            className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2 ml-1">
            <label className="text-sm font-bold text-urbik-black/50">
              FOT — Factor de ocupación total
            </label>
            <span
              title="Relación entre la superficie edificable total y la superficie del terreno."
              className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[9px] font-black flex items-center justify-center cursor-help shrink-0"
            >
              ?
            </span>
          </div>
          <input
            type="number"
            min={0}
            placeholder="Ej: 2.5"
            value={(watch("buildabilityIndex") as string | number) ?? ""}
            onChange={(e) => setValue("buildabilityIndex", e.target.value)}
            className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(watch("hasConstruction"))}
          onChange={(e) => setValue("hasConstruction", e.target.checked)}
        />
        <span className="text-sm font-semibold text-urbik-black/70">
          El terreno ya tiene una construcción existente
        </span>
      </label>
    </div>
  );
}
