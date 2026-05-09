"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import LocationSelectors from "@/components/LocationSelectors";
import type { PropertyUploadFormData } from "./types";

interface Props {
  rhf: UseFormReturn<PropertyUploadFormData>;
  onOpenMap?: () => void;
  selectedParcelPDA?: string | null;
  isSearchingCity?: boolean;
}

export function Module02Location({
  rhf,
  onOpenMap,
  selectedParcelPDA,
  isSearchingCity,
}: Props) {
  const { watch, setValue } = rhf;

  const handleLocationChange = (name: string, value: string) => {
    setValue(name as keyof PropertyUploadFormData, value);
  };

  const isBuenosAires = watch("province")?.toUpperCase().includes("BUENOS AIRES");
  const hasCity = !!watch("city");
  const canSelectParcel = isBuenosAires && hasCity;

  return (
    <div className="space-y-4">
      <LocationSelectors
        provinceValue={watch("province") ?? ""}
        cityValue={watch("city") ?? ""}
        localityValue={watch("locality") ?? ""}
        onChange={handleLocationChange}
        cityLabel="DEPARTAMENTO / PARTIDO"
        localityLabel="LOCALIDAD"
        cityApiEndpoint="departamentos"
        showLocality={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Barrio"
          value={watch("neighborhood") ?? ""}
          onChange={(e) => setValue("neighborhood", e.target.value)}
          className="input-urbik w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-urbik-black outline-none transition-all text-sm font-medium"
        />
        <input
          type="text"
          placeholder="Calle / Dirección *"
          value={watch("street") ?? ""}
          onChange={(e) => setValue("street", e.target.value)}
          className="input-urbik w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-urbik-black outline-none transition-all text-sm font-medium"
        />
        <input
          type="text"
          placeholder="Altura *"
          value={watch("number") ?? ""}
          onChange={(e) => setValue("number", e.target.value)}
          className="input-urbik w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-urbik-black outline-none transition-all text-sm font-medium"
        />
        <input
          type="text"
          placeholder="Piso (Opcional)"
          value={watch("floor") ?? ""}
          onChange={(e) => setValue("floor", e.target.value)}
          className="input-urbik w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-urbik-black outline-none transition-all text-sm font-medium"
        />
        <input
          type="text"
          placeholder="Unidad (Opcional)"
          value={watch("unitNumber") ?? ""}
          onChange={(e) => setValue("unitNumber", e.target.value)}
          className="input-urbik w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-urbik-black outline-none transition-all text-sm font-medium"
        />
      </div>

      {onOpenMap && (
        <button
          type="button"
          disabled={!canSelectParcel || isSearchingCity}
          onClick={onOpenMap}
          className={`w-full py-4 px-6 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-3 font-bold text-xs tracking-widest
            ${
              selectedParcelPDA
                ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                : "border-gray-300 text-gray-500 hover:border-urbik-black hover:text-urbik-black hover:bg-gray-50"
            }
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSearchingCity ? (
            <>Buscando zona...</>
          ) : selectedParcelPDA ? (
            <>Parcela vinculada (PDA: {selectedParcelPDA})</>
          ) : (
            <>Seleccionar parcela catastral en el mapa (opcional)</>
          )}
        </button>
      )}
    </div>
  );
}
