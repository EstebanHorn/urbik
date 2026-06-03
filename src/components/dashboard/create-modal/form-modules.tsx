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

// Extraemos el componente afuera para evitar que pierda el foco (re-renderizado innecesario)
const AnimatedNumberInput = ({
  fieldName,
  placeholder,
  rhf,
}: {
  fieldName: Path<PropertyUploadFormData>;
  placeholder: string;
  rhf: UseFormReturn<PropertyUploadFormData>;
}) => {
  const { watch, setValue } = rhf;
  const value = watch(fieldName) ?? "";
  const valStr = String(value);

  return (
    <div className="relative w-full flex justify-center">
      {/* Capa visual animada */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-5">
        {!valStr ? (
          <span className="text-urbik-black/50">{placeholder}</span>
        ) : (
          <div className="flex">
            {valStr.split("").map((char, i) => (
              <span
                key={`${i}-${char}`}
                className="inline-block text-urbik-black font-medium"
                style={{
                  animation: "popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
                }}
              >
                {char}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Input real transparente */}
      <input
        type="number"
        value={value as string | number}
        onChange={(e) => setValue(fieldName, e.target.value as any)}
        className="bg-white/30 text-center border border-white w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-transparent caret-urbik-black [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
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

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto space-y-8">
      {/* Estilos inyectados para la animación de números */}
      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: translateY(8px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* 1. Tipo de propiedad (Estilo simple texto como currency) */}
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

      {/* 2. Operación */}
      <div className="w-full text-center flex flex-col items-center">
        <label className="block text-sm font-bold text-urbik-black/50 mb-2">
          Operación
        </label>
        <div className="relative p-0.5 bg-white/30 rounded-full border border-white w-full overflow-hidden">
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

      {/* 3. Estado */}
      <div className="w-full text-center flex flex-col items-center">
        <label className="block text-sm font-bold text-urbik-black/50 mb-2">
          Estado
        </label>
        <div className="relative p-0.5 bg-white/30 rounded-full border border-white w-full overflow-hidden">
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

      {/* 4. Checkbox Sin Precio */}
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

      {/* 5. Precios y Expensas */}
      {!watch("isPriceHidden") && (
        <div className="w-full space-y-6 flex flex-col items-center">
          <div className="w-full flex flex-col items-center gap-3">
            {/* Selector de Moneda */}
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

            {/* Inputs animados arreglados */}
            <AnimatedNumberInput rhf={rhf} fieldName="salePrice" placeholder="Precio" />
          </div>

          <div className="w-full flex flex-col items-center">
            <AnimatedNumberInput rhf={rhf} fieldName="expenses" placeholder="Expensas (opcional)" />
          </div>
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
        onChange={(n, v) =>
          setValue(
            n as Path<PropertyUploadFormData>,
            v
          )
        }
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
          onChange={(e) =>
            setValue("neighborhood", e.target.value)
          }
          className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-urbik-black outline-none transition-all text-sm font-medium"
        />

        <input
          type="text"
          placeholder="Calle / Dirección *"
          value={watch("street") ?? ""}
          onChange={(e) =>
            setValue("street", e.target.value)
          }
          className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-urbik-black outline-none transition-all text-sm font-medium"
        />

        <input
          type="text"
          placeholder="Altura *"
          value={watch("number") ?? ""}
          onChange={(e) =>
            setValue("number", e.target.value)
          }
          className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-urbik-black outline-none transition-all text-sm font-medium"
        />
      </div>

      {onOpenMap && (
        <button
          type="button"
          disabled={isSearchingCity}
          onClick={onOpenMap}
          className={`w-full py-4 px-6 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-3 font-bold text-xs tracking-widest ${
            selectedParcelPDA
              ? "border-emerald-500 text-emerald-700 bg-emerald-50"
              : "border-gray-300 text-gray-500 hover:border-urbik-black hover:text-urbik-black hover:bg-gray-50"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSearchingCity
            ? "Buscando zona..."
            : selectedParcelPDA
            ? `Parcela vinculada (PDA: ${selectedParcelPDA})`
            : "Seleccionar parcela catastral en el mapa (opcional)"}
        </button>
      )}
    </div>
  );
}

export function Module03Content({ rhf }: ModuleProps) {
  return (
    <div className="space-y-5">
      <input
        type="text"
        placeholder="Título. Ej: Departamento 3 amb con pileta"
        value={rhf.watch("title") ?? ""}
        onChange={(e) =>
          rhf.setValue("title", e.target.value)
        }
        className="bg-white text-urbik-black/60 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
      />

      <textarea
        rows={6}
        placeholder="Describí los puntos fuertes de la propiedad..."
        value={rhf.watch("description") ?? ""}
        onChange={(e) =>
          rhf.setValue("description", e.target.value)
        }
        className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-urbik-black outline-none transition-all text-sm bg-gray-50 focus:bg-white resize-none"
      />
    </div>
  );
}

export function Module04Surfaces({ rhf }: ModuleProps) {
  const fields: {
    key: SurfaceFieldKey;
    label: string;
  }[] = [
    {
      key: "areaM2",
      label: "M2 cubiertos (m²) *",
    },
    {
      key: "semiCoveredArea",
      label: "Sup. semicubierta (m²)",
    },
    {
      key: "uncoveredArea",
      label: "Sup. descubierta (m²)",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-sm font-bold text-urbik-black/50 mb-1 ml-1">
            {f.label}
          </label>

          <input
            type="number"
            min={0}
            placeholder="0"
            value={(rhf.watch(f.key) as string) ?? ""}
            onChange={(e) =>
              rhf.setValue(f.key, e.target.value as any)
            }
            className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
          />
        </div>
      ))}
    </div>
  );
}

export function Module05Environments({
  rhf,
}: ModuleProps) {
  const fields: {
    key: EnvironmentFieldKey;
    label: string;
  }[] = [
    {
      key: "rooms",
      label: "Ambientes",
    },
    {
      key: "bedrooms",
      label: "Habitaciones",
    },
    {
      key: "bathrooms",
      label: "Baños",
    },
    {
      key: "garages",
      label: "Cocheras",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-sm font-bold text-urbik-black/50 mb-1 ml-1">
            {f.label}
          </label>

          <input
            type="number"
            min={0}
            placeholder="0"
            value={(rhf.watch(f.key) as string) ?? ""}
            onChange={(e) =>
              rhf.setValue(f.key, e.target.value as any)
            }
            className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
          />
        </div>
      ))}
    </div>
  );
}

export function Module06BasicCharacteristics({
  rhf,
}: ModuleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CustomDropdown
        label="Estado del Inmueble"
        options={[
          {
            value: "excelente",
            label: "Excelente",
          },
          {
            value: "bueno",
            label: "Bueno",
          },
        ]}
        value={rhf.watch("condition") ?? ""}
        onChange={(v) =>
          rhf.setValue("condition", v as any)
        }
        variant="white2"
      />

      <input
        type="number"
        placeholder="Año de construcción"
        value={
          (rhf.watch("constructionYear") as string) ??
          ""
        }
        onChange={(e) =>
          rhf.setValue(
            "constructionYear",
            e.target.value as any
          )
        }
        className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
      />
    </div>
  );
}

export function Module07Tags({ rhf }: ModuleProps) {
  return (
    <AmenitiesGrid
      value={(rhf.watch("amenities") as Record<string, boolean>) ?? {}}
      propertyType={rhf.watch("type")}
      onChange={(n: Record<string, boolean>) =>
        rhf.setValue("amenities", n as any)
      }
    />
  );
}

export function Module08BuildingInfo({
  rhf,
}: ModuleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <CustomDropdown
        label="Estado Edificio"
        options={[
          {
            value: "bueno",
            label: "Bueno",
          },
        ]}
        value={rhf.watch("buildingCondition") ?? ""}
        onChange={(v) =>
          rhf.setValue("buildingCondition", v as any)
        }
        variant="white2"
      />

      <input
        type="number"
        placeholder="Cantidad de pisos"
        value={
          (rhf.watch("buildingFloors") as string) ??
          ""
        }
        onChange={(e) =>
          rhf.setValue(
            "buildingFloors",
            e.target.value as any
          )
        }
        className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
      />
    </div>
  );
}

export function Module09CommercialInfo({
  rhf,
}: ModuleProps) {
  return (
    <CustomDropdown
      label="Rubro principal"
      options={[
        {
          value: "gastronomia",
          label: "Gastronomía",
        },
      ]}
      value={rhf.watch("commercialActivity") ?? ""}
      onChange={(v) =>
        rhf.setValue("commercialActivity", v as any)
      }
      variant="white2"
    />
  );
}

export function Module10FieldInfo({
  rhf,
}: ModuleProps) {
  return (
    <input
      type="number"
      placeholder="Hectáreas"
      value={(rhf.watch("hectares") as string) ?? ""}
      onChange={(e) =>
        rhf.setValue("hectares", e.target.value as any)
      }
      className="bg-white text-urbik-black/50 border border-black/50 w-full md:w-1/3 px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
    />
  );
}

export function Module11LandInfo({
  rhf,
}: ModuleProps) {
  return (
    <CustomDropdown
      label="Uso del suelo"
      options={[
        {
          value: "residencial",
          label: "Residencial",
        },
      ]}
      value={rhf.watch("landUse") ?? ""}
      onChange={(v) => rhf.setValue("landUse", v as any)}
      variant="white2"
    />
  );
}

export function Module12Multimedia({
  rhf,
}: ModuleProps) {
  return (
    <div className="space-y-6">
      <ImageUpload
        value={(rhf.watch("images") as string[]) ?? []}
        onChange={(urls: string[]) =>
          rhf.setValue("images", urls as any)
        }
        onRemove={(u: string) =>
          rhf.setValue(
            "images",
            ((rhf.watch("images") as string[]) || []).filter(
              (i) => i !== u
            ) as any
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="url"
          placeholder="Video de YouTube"
          value={rhf.watch("youtubeUrl") ?? ""}
          onChange={(e) =>
            rhf.setValue("youtubeUrl", e.target.value)
          }
          className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
        />
      </div>
    </div>
  );
}

export function Module13ContactInfo({
  rhf,
}: ModuleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        type="text"
        placeholder="Nombre contacto"
        value={rhf.watch("contactName") ?? ""}
        onChange={(e) =>
          rhf.setValue("contactName", e.target.value)
        }
        className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
      />

      <input
        type="tel"
        placeholder="Teléfono"
        value={rhf.watch("contactPhone") ?? ""}
        onChange={(e) =>
          rhf.setValue("contactPhone", e.target.value)
        }
        className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
      />
    </div>
  );
}