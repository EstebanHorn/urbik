"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomDropdown } from "@/components/CustomDropdown";
import type { PropertyUploadFormData } from "./types";

interface Props {
  rhf: UseFormReturn<PropertyUploadFormData>;
}

const CONDITION_OPTIONS = [
  { value: "excelente", label: "Excelente" },
  { value: "muy_bueno", label: "Muy bueno" },
  { value: "bueno", label: "Bueno" },
  { value: "regular", label: "Regular" },
  { value: "a_refaccionar", label: "A refaccionar" },
];

const ORIENTATION_OPTIONS = [
  { value: "norte", label: "Norte" },
  { value: "noreste", label: "Noreste" },
  { value: "este", label: "Este" },
  { value: "sureste", label: "Sureste" },
  { value: "sur", label: "Sur" },
  { value: "suroeste", label: "Suroeste" },
  { value: "oeste", label: "Oeste" },
  { value: "noroeste", label: "Noroeste" },
];

const DISPOSITION_OPTIONS = [
  { value: "frente", label: "Frente" },
  { value: "contrafrente", label: "Contrafrente" },
  { value: "lateral", label: "Lateral" },
  { value: "interno", label: "Interno" },
];

const DISPOSITION_TYPES = new Set(["APARTMENT", "PH", "COMMERCIAL_PROPERTY", "OFFICE"]);
const CURRENT_YEAR = new Date().getFullYear();

export function Module06BasicCharacteristics({ rhf }: Props) {
  const { watch, setValue } = rhf;
  const type = watch("type") ?? "";
  const showDisposition = DISPOSITION_TYPES.has(type);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
            Estado del inmueble
          </label>
          <CustomDropdown
            label="Seleccionar estado"
            options={CONDITION_OPTIONS}
            value={watch("condition") ?? ""}
            onChange={(v) => setValue("condition", v)}
            variant="white2"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
            Orientación
          </label>
          <CustomDropdown
            label="Seleccionar orientación"
            options={ORIENTATION_OPTIONS}
            value={watch("orientation") ?? ""}
            onChange={(v) => setValue("orientation", v)}
            variant="white2"
          />
        </div>

        {showDisposition && (
          <div>
            <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
              Disposición
            </label>
            <CustomDropdown
              label="Seleccionar disposición"
              options={DISPOSITION_OPTIONS}
              value={watch("disposition") ?? ""}
              onChange={(v) => setValue("disposition", v)}
              variant="white2"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 ml-1">
            <label className="text-sm font-bold text-urbik-black/50">
              Año de construcción
            </label>
            <span
              title="Es el año en que se inauguró o habitó el inmueble."
              className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[9px] font-black flex items-center justify-center cursor-help shrink-0"
            >
              ?
            </span>
          </div>
          <input
            type="number"
            min={1900}
            max={CURRENT_YEAR}
            placeholder={`1900–${CURRENT_YEAR}`}
            value={(watch("constructionYear") as string | number) ?? ""}
            onChange={(e) => setValue("constructionYear", e.target.value)}
            className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
            Año de última renovación
          </label>
          <input
            type="number"
            min={1900}
            max={CURRENT_YEAR}
            placeholder={`1900–${CURRENT_YEAR}`}
            value={(watch("renovationYear") as string | number) ?? ""}
            onChange={(e) => setValue("renovationYear", e.target.value)}
            className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
          />
        </div>
      </div>
    </div>
  );
}
