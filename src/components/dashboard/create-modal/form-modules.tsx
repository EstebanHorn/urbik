"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { UseFormReturn, Path } from "react-hook-form";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import LocationSelectors from "@/components/ui/LocationSelectors";
import ImageUpload from "@/components/ui/ImageUpload";
import { CurrencySelector, AmenitiesGrid } from "./shared-ui";
import type { PropertyUploadFormData } from "./schema";

interface ModuleProps {
  rhf: UseFormReturn<PropertyUploadFormData>;
}

interface Module02LocationProps extends ModuleProps {
  onOpenMap?: () => void;
  selectedParcelPDA?: string;
  isSearchingCity?: boolean;
}

type SurfaceFieldKey =
  | "areaM2"
  | "semiCoveredArea"
  | "uncoveredArea";

type EnvironmentFieldKey =
  | "rooms"
  | "bedrooms"
  | "bathrooms"
  | "garages";

const AnimatedInput = ({
  fieldName,
  placeholder,
  rhf,
  type = "text",
  align = "left",
  inputClassName = "bg-white/30 shadow-md border border-white w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm",
}: {
  fieldName: Path<PropertyUploadFormData>;
  placeholder: string;
  rhf: UseFormReturn<PropertyUploadFormData>;
  type?: "text" | "number" | "url" | "tel";
  align?: "left" | "center";
  inputClassName?: string;
}) => {
  const { watch, setValue } = rhf;
  const value = watch(fieldName) ?? "";
  const valStr = String(value);

  const justifyClass = align === "center" ? "justify-center" : "justify-start";
  const textAlignClass = align === "center" ? "text-center" : "text-left";

  return (
    <div className="relative w-full flex">
      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: translateY(8px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      
      <div className={`absolute inset-0 flex items-center pointer-events-none px-5 overflow-hidden ${justifyClass}`}>
        {!valStr ? (
          <span className="text-urbik-black/50 whitespace-nowrap">{placeholder}</span>
        ) : (
          <div className="flex whitespace-pre">
            {valStr.split("").map((char, i) => (
              <span
                key={`${i}-${char}`}
                className="inline-block text-urbik-black font-medium"
                style={{
                  animation: "popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </div>
        )}
      </div>

      <input
        type={type}
        value={value as string | number}
        onChange={(e) => setValue(fieldName, e.target.value as any)}
        className={`${inputClassName} ${textAlignClass} text-transparent caret-urbik-black [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]`}
      />
    </div>
  );
};

export function Module01PropertyData({ rhf }: ModuleProps) {
  const { watch, setValue } = rhf;

  const operationType = watch("operationType") ?? "SALE";
  const propertyType = watch("type") ?? "";
  const statusType = watch("status") ?? "AVAILABLE";
  const saleCurrency = watch("saleCurrency") ?? "USD";

  const propertyOptions = [
    { id: "HOUSE", label: "Casa" },
    { id: "APARTMENT", label: "Departamento" },
    { id: "COMMERCIAL_PROPERTY", label: "Local" },
    { id: "PH", label: "PH" },
    { id: "LAND", label: "Terreno" },
  ];

  const operationOptions = [
    { id: "SALE", label: "Venta" },
    { id: "RENT", label: "Alquiler" },
    { id: "TEMP_RENT", label: "Temporal" },
    { id: "SALE_RENT", label: "Ambos" },
  ];

  const statusOptions = [
    { id: "AVAILABLE", label: "Disponible" },
    { id: "RESERVED", label: "Reservado" },
    { id: "PAUSED", label: "Pausada" },
  ];

  const opActiveIndex = operationOptions.findIndex((opt) => opt.id === operationType);
  const statusActiveIndex = statusOptions.findIndex((opt) => opt.id === statusType);

  const buildingConditionOptions = [
    { value: "bueno", label: "Bueno" },
    { value: "mediano", label: "Mediano" },
    { value: "malo", label: "Malo" },
  ];
  const buildingConditionValue = watch("buildingCondition") ?? "bueno";
  const buildingConditionActiveIndex = buildingConditionOptions.findIndex((opt) => opt.value === buildingConditionValue);

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto space-y-8">
      <div className="w-full text-center flex flex-col items-center">
        <label className="block text-sm font-bold text-urbik-black/50 mb-2">
          Tipo de propiedad
        </label>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-2">
          {propertyOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setValue("type", opt.id as any, { shouldValidate: true });
                setValue("unitType", "" as any);
              }}
              className={`text-md font-bold transition-colors duration-200 ${
                propertyType === opt.id ? "text-urbik-black/80" : "text-urbik-black/30 hover:text-urbik-black/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full text-center flex flex-col items-center">
        <label className="block text-sm font-bold text-urbik-black/50 mb-2">
          Operación
        </label>
        <div className="relative p-0.5 bg-white/30 shadow-md rounded-full border border-white w-full overflow-hidden">
          <div className="relative grid grid-cols-4 w-full h-full items-center min-w-[280px] sm:min-w-[360px]">
            <div
              className="absolute top-0 bottom-0 left-0 w-1/4 bg-urbik-white2 rounded-full border border-white transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${opActiveIndex !== -1 ? opActiveIndex * 100 : 0}%)` }}
            />
            {operationOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setValue("operationType", opt.id as any)}
                className={`relative z-10 py-2.5 text-center text-md font-bold transition-colors duration-300 rounded-full cursor-pointer ${
                  operationType === opt.id ? "text-urbik-black/80" : "text-urbik-black/50 hover:text-urbik-black"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full text-center flex flex-col items-center">
        <label className="block text-sm font-bold text-urbik-black/50 mb-2">
          Estado
        </label>
        <div className="relative p-0.5 bg-white/30 shadow-md rounded-full border border-white w-full overflow-hidden">
          <div className="relative grid grid-cols-3 w-full h-full items-center min-w-[280px] sm:min-w-[360px]">
            <div
              className="absolute top-0 bottom-0 left-0 w-1/3 bg-urbik-white2 rounded-full border border-white transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${statusActiveIndex !== -1 ? statusActiveIndex * 100 : 0}%)` }}
            />
            {statusOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setValue("status", opt.id as any)}
                className={`relative z-10 py-2.5 px-2 text-center text-md font-bold transition-colors duration-300 rounded-full cursor-pointer ${
                  statusType === opt.id ? "text-urbik-black/80" : "text-urbik-black/50 hover:text-urbik-black"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="flex items-center justify-center gap-2 cursor-pointer mt-4">
        <input
          type="checkbox"
          checked={Boolean(watch("isPriceHidden"))}
          onChange={(e) => setValue("isPriceHidden", e.target.checked)}
        />
        <span className="text-sm font-semibold text-urbik-black/70">
          Publicar como &ldquo;Sin precio&rdquo;
        </span>
      </label>

      {!watch("isPriceHidden") && (
        <div className="w-full space-y-6 flex flex-col items-center">
          <div className="w-full flex flex-col items-center gap-3">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setValue("saleCurrency", "ARS" as any)}
                className={`font-bold transition-colors duration-200 ${
                  saleCurrency === "ARS" ? "text-urbik-black/80" : "text-urbik-black/30"
                }`}
              >
                ARS
              </button>
              <button
                type="button"
                onClick={() => setValue("saleCurrency", "USD" as any)}
                className={`font-bold transition-colors duration-200 ${
                  saleCurrency === "USD" ? "text-urbik-black/80" : "text-urbik-black/30"
                }`}
              >
                USD
              </button>
            </div>

            <AnimatedInput type="number" align="center" rhf={rhf} fieldName="salePrice" placeholder="Precio" />
          </div>

          <div className="w-full flex flex-col items-center">
            <AnimatedInput type="number" align="center" rhf={rhf} fieldName="expenses" placeholder="Expensas (opcional)" />
          </div>
        </div>
      )}

      {propertyType && (
        <div className="w-full pt-6 mt-6 border-t border-white/40 space-y-6">
          
          {(propertyType === "APARTMENT" || propertyType === "PH") && (
            <div className="w-full grid grid-cols-1 gap-4 items-end">
              <div className="w-full text-center flex flex-col items-center md:items-start">
                <label className="block text-sm font-bold text-urbik-black/50 mb-2 md:pl-2">
                  Estado del edificio
                </label>
                <div className="relative p-0.5 bg-white/30 shadow-md rounded-full border border-white w-full overflow-hidden">
                  <div className="relative grid grid-cols-3 w-full h-full items-center">
                    <div
                      className="absolute top-0 bottom-0 left-0 w-1/3 bg-urbik-white2 rounded-full border border-white transition-transform duration-300 ease-out"
                      style={{ transform: `translateX(${buildingConditionActiveIndex !== -1 ? buildingConditionActiveIndex * 100 : 0}%)` }}
                    />
                    {buildingConditionOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setValue("buildingCondition", opt.value as any)}
                        className={`relative z-10 py-2.5 text-center text-xs sm:text-sm font-bold transition-colors duration-300 rounded-full cursor-pointer ${
                          buildingConditionValue === opt.value ? "text-urbik-black/80" : "text-urbik-black/50 hover:text-urbik-black"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <AnimatedInput 
                type="number" 
                rhf={rhf} 
                fieldName="buildingFloors" 
                placeholder="Cantidad de pisos" 
              />
            </div>
          )}

          {propertyType === "COMMERCIAL_PROPERTY" && (
            <CustomDropdown
              label="Rubro principal"
              options={[{ value: "gastronomia", label: "Gastronomía" }]}
              value={watch("commercialActivity") ?? ""}
              onChange={(v) => setValue("commercialActivity", v as any)}
              variant="white1"
            />
          )}

          {propertyType === "LAND" && (
            <div className="space-y-4">
              <AnimatedInput 
                type="number" 
                rhf={rhf} 
                fieldName="hectares" 
                placeholder="Hectáreas" 
                inputClassName="bg-white/30 shadow-md border border-white w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm" 
              />
              <CustomDropdown
                label="Uso del suelo"
                options={[{ value: "residencial", label: "Residencial" }]}
                value={watch("landUse") ?? ""}
                onChange={(v) => setValue("landUse", v as any)}
                variant="white1"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Module02Location({
  rhf,
  onOpenMap,
  selectedParcelPDA,
  isSearchingCity,
}: Module02LocationProps) {
  const { watch, setValue } = rhf;

  return (
    <div className="space-y-4">
      <LocationSelectors
        provinceValue={watch("province") ?? ""}
        cityValue={watch("city") ?? ""}
        localityValue={watch("locality") ?? ""}
        onChange={(n, v) => setValue(n as Path<PropertyUploadFormData>, v)}
        cityLabel="PARTIDO"
        localityLabel="LOCALIDAD"
        cityApiEndpoint="departamentos"
        showLocality={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatedInput rhf={rhf} fieldName="neighborhood" placeholder="Barrio" />
        <AnimatedInput rhf={rhf} fieldName="street" placeholder="Calle / Dirección *" />
        <AnimatedInput rhf={rhf} fieldName="number" placeholder="Altura *" />
      </div>

      {onOpenMap && (
        <button
          type="button"
          disabled={isSearchingCity}
          onClick={onOpenMap}
          className={`w-full py-4 px-6 rounded-full border-2 border-dashed transition-all flex items-center justify-center gap-3 font-medium text-xs ${
            selectedParcelPDA
              ? "border-emerald-500 text-emerald-700 bg-emerald-50"
              : "border-white text-white hover:border-urbik-black hover:text-urbik-black"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSearchingCity
            ? "Buscando zona..."
            : selectedParcelPDA
            ? `Parcela vinculada (PDA: ${selectedParcelPDA})`
            : "Seleccionar parcela catastral en el mapa"}
        </button>
      )}
    </div>
  );
}

export function Module03Content({ rhf }: ModuleProps) {
  return (
    <div className="space-y-5">
      <AnimatedInput rhf={rhf} fieldName="title" placeholder="Título. Ej: Departamento 3 amb con pileta" />

      <textarea
        rows={6}
        placeholder="Describí los puntos fuertes de la propiedad..."
        value={rhf.watch("description") ?? ""}
        onChange={(e) => rhf.setValue("description", e.target.value)}
        className="w-full px-5 py-4 rounded-xl border border-white focus:border-urbik-black outline-none transition-all text-sm bg-white/30 shadow-md focus:bg-white resize-none"
      />
    </div>
  );
}

export function Module04Surfaces({ rhf }: ModuleProps) {
  const surfaceFields: { key: SurfaceFieldKey; label: string }[] = [
    { key: "areaM2", label: "M2 cubiertos (m²) *" },
    { key: "semiCoveredArea", label: "Sup. semicubierta (m²)" },
    { key: "uncoveredArea", label: "Sup. descubierta (m²)" },
  ];

  const envFields: { key: EnvironmentFieldKey; label: string }[] = [
    { key: "rooms", label: "Ambientes" },
    { key: "bedrooms", label: "Habitaciones" },
    { key: "bathrooms", label: "Baños" },
    { key: "garages", label: "Cocheras" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4">
        {surfaceFields.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-bold text-urbik-black/50 mb-1 ml-1">
              {f.label}
            </label>
            <AnimatedInput 
              type="number" 
              rhf={rhf} 
              fieldName={f.key} 
              placeholder="0" 
              inputClassName="bg-white/30 shadow-md border border-white w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm" 
            />
          </div>
        ))}
      </div>

      <hr className="border-white/50" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {envFields.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-bold text-urbik-black/50 mb-1 ml-1">
              {f.label}
            </label>
            <AnimatedInput 
              type="number" 
              rhf={rhf} 
              fieldName={f.key} 
              placeholder="0" 
              inputClassName="bg-white/30 shadow-md border border-white w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm" 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Module05BasicCharacteristics({ rhf }: ModuleProps) {
  const conditionOptions = [
    { value: "excelente", label: "Excelente" },
    { value: "bueno", label: "Bueno" },
  ];
  const conditionValue = rhf.watch("condition") ?? "excelente";
  const conditionActiveIndex = conditionOptions.findIndex((opt) => opt.value === conditionValue);

  return (
    <div className="flex flex-col items-center w-full mx-auto space-y-6">
      <div className="w-full text-center flex flex-col items-center">
        <label className="block text-sm font-bold text-urbik-black/50 mb-2">
          Estado del Inmueble
        </label>
        <div className="relative p-0.5 bg-white/30 shadow-md rounded-full border border-white w-full overflow-hidden">
          <div className="relative grid grid-cols-2 w-full h-full items-center">
            <div
              className="absolute top-0 bottom-0 left-0 w-1/2 bg-urbik-white2 rounded-full border border-white transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${conditionActiveIndex !== -1 ? conditionActiveIndex * 100 : 0}%)` }}
            />
            {conditionOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => rhf.setValue("condition", opt.value as any)}
                className={`relative z-10 py-2.5 text-center text-sm font-bold transition-colors duration-300 rounded-full cursor-pointer ${
                  conditionValue === opt.value ? "text-urbik-black/80" : "text-urbik-black/50 hover:text-urbik-black"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatedInput 
        type="number" 
        rhf={rhf} 
        fieldName="constructionYear" 
        placeholder="Año de construcción" 
        inputClassName="bg-white/30 shadow-md border border-white w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all duration-300 text-sm" 
      />
    </div>
  );
}

export function Module06Tags({ rhf }: ModuleProps) {
  return (
    <AmenitiesGrid
      value={(rhf.watch("amenities") as Record<string, boolean>) ?? {}}
      propertyType={rhf.watch("type")}
      onChange={(n: Record<string, boolean>) => rhf.setValue("amenities", n as any)}
    />
  );
}

export function Module10Multimedia({ rhf }: ModuleProps) {
  return (
    <div className="space-y-6">
      <ImageUpload
        value={(rhf.watch("images") as string[]) ?? []}
        onChange={(urls: string[]) => rhf.setValue("images", urls as any)}
        onRemove={(u: string) =>
          rhf.setValue("images", ((rhf.watch("images") as string[]) || []).filter((i) => i !== u) as any)
        }
      />

      <div className="grid grid-cols-1 gap-4">
        <AnimatedInput 
          type="url" 
          rhf={rhf} 
          fieldName="youtubeUrl" 
          placeholder="URL video de YouTube" 
          inputClassName="bg-white-30 shadow-md border border-white w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm" 
        />
      </div>
    </div>
  );
}

export function Module11ContactInfo({ rhf }: ModuleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AnimatedInput 
        type="text" 
        rhf={rhf} 
        fieldName="contactName" 
        placeholder="Nombre contacto" 
        inputClassName="bg-white border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm" 
      />

      <AnimatedInput 
        type="tel" 
        rhf={rhf} 
        fieldName="contactPhone" 
        placeholder="Teléfono" 
        inputClassName="bg-white border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm" 
      />
    </div>
  );
}