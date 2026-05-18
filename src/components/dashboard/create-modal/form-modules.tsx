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

export function Module01PropertyData({ rhf }: ModuleProps) {
  const { watch, setValue } = rhf;

  const operationType = watch("operationType");

  const opRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [opPill, setOpPill] = useState({ width: 0, x: 0 });

  useEffect(() => {
    const node = opRefs.current[operationType ?? ""];

    if (node) {
      setOpPill({
        width: node.offsetWidth,
        x: node.offsetLeft,
      });
    }
  }, [operationType]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {[
          { value: "HOUSE", label: "Casa" },
          { value: "APARTMENT", label: "Departamento" },
          { value: "COMMERCIAL_PROPERTY", label: "Local" },
          { value: "PH", label: "PH" },
          { value: "LAND", label: "Terreno" },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              setValue("type", opt.value, {
                shouldValidate: true,
              });

              setValue("unitType", "");
            }}
            className={`rounded-full px-4 py-3 font-bold text-sm border transition-all ${
              watch("type") === opt.value
                ? "bg-urbik-black text-white border-urbik-black shadow-md"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
          Operación
        </label>

        <div className="relative flex bg-white rounded-full w-fit overflow-hidden border border-black/50">
          <motion.div
            className="absolute top-0 bottom-0 bg-urbik-dark rounded-full border border-black/50"
            initial={false}
            animate={{
              width: opPill.width,
              x: opPill.x,
            }}
          />

          {[
            { id: "SALE", label: "VENTA" },
            { id: "RENT", label: "ALQUILER" },
            { id: "TEMP_RENT", label: "TEMPORAL" },
            { id: "SALE_RENT", label: "AMBOS" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              ref={(el) => {
                opRefs.current[opt.id] = el;
              }}
              onClick={() =>
                setValue("operationType", opt.id)
              }
              className={`relative z-10 px-6 py-2.5 text-xs font-bold transition-colors rounded-full ${
                operationType === opt.id
                  ? "text-white"
                  : "text-urbik-black/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full md:w-1/2">
        <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
          Estado
        </label>

        <CustomDropdown
          label="Seleccionar estado"
          options={[
            {
              value: "AVAILABLE",
              label: "Vigente / Disponible",
            },
            {
              value: "RESERVED",
              label: "Reservado",
            },
            {
              value: "PAUSED",
              label: "Pausada",
            },
          ]}
          value={watch("status") ?? "AVAILABLE"}
          onChange={(v) => setValue("status", v)}
          variant="white2"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(watch("isPriceHidden"))}
          onChange={(e) =>
            setValue("isPriceHidden", e.target.checked)
          }
        />

        <span className="text-sm font-semibold text-urbik-black/70">
          Publicar como &ldquo;Sin precio&rdquo;
        </span>
      </label>

      {!watch("isPriceHidden") && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Precio USD/ARS"
              value={watch("salePrice") ?? ""}
              onChange={(e) =>
                setValue("salePrice", e.target.value)
              }
              className="bg-white text-urbik-black/50 border border-black/50 flex-1 px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
            />

            <CurrencySelector
              value={
                (watch("saleCurrency") as "USD" | "ARS") ??
                "USD"
              }
              onChange={(v) =>
                setValue("saleCurrency", v)
              }
            />
          </div>

          <input
            type="number"
            placeholder="Expensas (opcional)"
            value={watch("expenses") ?? ""}
            onChange={(e) =>
              setValue("expenses", e.target.value)
            }
            className="bg-white text-urbik-black/50 border border-black/50 w-full md:w-1/2 px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
          />
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
              rhf.setValue(f.key, e.target.value)
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
              rhf.setValue(f.key, e.target.value)
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
          rhf.setValue("condition", v)
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
            e.target.value
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
      value={rhf.watch("amenities") ?? {}}
      propertyType={rhf.watch("type")}
      onChange={(n: Record<string, boolean>) =>
        rhf.setValue("amenities", n)
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
          rhf.setValue("buildingCondition", v)
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
            e.target.value
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
        rhf.setValue("commercialActivity", v)
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
        rhf.setValue("hectares", e.target.value)
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
      onChange={(v) => rhf.setValue("landUse", v)}
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
        value={rhf.watch("images") ?? []}
        onChange={(urls: string[]) =>
          rhf.setValue("images", urls)
        }
        onRemove={(u: string) =>
          rhf.setValue(
            "images",
            (rhf.watch("images") || []).filter(
              (i) => i !== u
            )
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