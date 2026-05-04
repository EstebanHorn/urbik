"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomDropdown } from "@/components/CustomDropdown";
import type { PropertyUploadFormData } from "./types";

interface Props {
  rhf: UseFormReturn<PropertyUploadFormData>;
}

const ACTIVITY_OPTIONS = [
  { value: "gastronomia", label: "Gastronomía" },
  { value: "indumentaria", label: "Indumentaria" },
  { value: "supermercado", label: "Supermercado / Almacén" },
  { value: "farmacia", label: "Farmacia" },
  { value: "peluqueria", label: "Peluquería / Estética" },
  { value: "servicios", label: "Servicios / Oficinas" },
  { value: "educacion", label: "Educación" },
  { value: "salud", label: "Salud / Clínica" },
  { value: "logistica", label: "Logística / Depósito" },
  { value: "otro", label: "Otro" },
];

const BOOL_FEATURES = [
  { key: "hasDisplay" as const, label: "Vidriera / Frente comercial" },
  { key: "hasLoadingDock" as const, label: "Portón de carga y descarga" },
];

export function Module09CommercialInfo({ rhf }: Props) {
  const { watch, setValue } = rhf;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
          Rubro / Actividad principal
        </label>
        <CustomDropdown
          label="Seleccionar rubro"
          options={ACTIVITY_OPTIONS}
          value={watch("commercialActivity") ?? ""}
          onChange={(v) => setValue("commercialActivity", v)}
          variant="white2"
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-bold text-urbik-black/50 ml-1">
          Características del local
        </p>
        <div className="flex flex-col gap-2">
          {BOOL_FEATURES.map((feat) => (
            <label key={feat.key} className="flex items-center gap-2 cursor-pointer">
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
