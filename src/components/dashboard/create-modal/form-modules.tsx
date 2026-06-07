"use client";

import React from "react";
import { UseFormReturn, Path } from "react-hook-form";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import LocationSelectors from "@/components/ui/LocationSelectors";
import ImageUpload from "@/components/ui/ImageUpload";
import { AmenitiesGrid } from "./shared-ui";
import type { PropertyUploadFormData } from "./schema";

interface ModuleProps {
  rhf: UseFormReturn<PropertyUploadFormData>;
}

interface Module02LocationProps extends ModuleProps {
  onOpenMap?: () => void;
  selectedParcelPDA?: string;
  isSearchingCity?: boolean;
}

const SURFACE_INPUT_CLASS =
  "bg-white/30 shadow-md border border-white w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm";

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

  const textAlignClass = align === "center" ? "text-center" : "text-left";

  return (
    <input
      type={type}
      value={value as string | number}
      placeholder={placeholder}
      onChange={(e) => setValue(fieldName, e.target.value as any)}
      className={`${inputClassName} ${textAlignClass} text-urbik-black placeholder:text-urbik-black/50 caret-urbik-black [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]`}
    />
  );
};

const CounterInput = ({
  label,
  fieldName,
  rhf,
}: {
  label: string;
  fieldName: Path<PropertyUploadFormData>;
  rhf: UseFormReturn<PropertyUploadFormData>;
}) => {
  const { watch, setValue } = rhf;
  const value = Number(watch(fieldName) ?? 0);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-bold text-urbik-black/50 text-center whitespace-nowrap">
        {label}
      </span>
      <div className="flex items-center gap-2 bg-white/30 shadow-md border border-white rounded-full px-3 py-2">
        <button
          type="button"
          onClick={() => setValue(fieldName, Math.max(0, value - 1) as any)}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-urbik-black font-bold hover:bg-white/80 transition-colors text-sm leading-none"
        >
          −
        </button>
        <span className="w-7 text-center text-sm font-bold text-urbik-black">
          {value > 0 ? value : "—"}
        </span>
        <button
          type="button"
          onClick={() => setValue(fieldName, (value + 1) as any)}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-urbik-black font-bold hover:bg-white/80 transition-colors text-sm leading-none"
        >
          +
        </button>
      </div>
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
    { id: "FIELD", label: "Campo" },
    { id: "OFFICE", label: "Oficina" },
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

  const opActiveIndex = operationOptions.findIndex(
    (opt) => opt.id === operationType,
  );
  const statusActiveIndex = statusOptions.findIndex(
    (opt) => opt.id === statusType,
  );

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
                propertyType === opt.id
                  ? "text-urbik-black/80"
                  : "text-urbik-black/30 hover:text-urbik-black/50"
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
              style={{
                transform: `translateX(${opActiveIndex !== -1 ? opActiveIndex * 100 : 0}%)`,
              }}
            />
            {operationOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setValue("operationType", opt.id as any)}
                className={`relative z-10 py-2.5 text-center text-md font-bold transition-colors duration-300 rounded-full cursor-pointer ${
                  operationType === opt.id
                    ? "text-urbik-black/80"
                    : "text-urbik-black/50 hover:text-urbik-black"
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
              style={{
                transform: `translateX(${statusActiveIndex !== -1 ? statusActiveIndex * 100 : 0}%)`,
              }}
            />
            {statusOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setValue("status", opt.id as any)}
                className={`relative z-10 py-2.5 px-2 text-center text-md font-bold transition-colors duration-300 rounded-full cursor-pointer ${
                  statusType === opt.id
                    ? "text-urbik-black/80"
                    : "text-urbik-black/50 hover:text-urbik-black"
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
                  saleCurrency === "ARS"
                    ? "text-urbik-black/80"
                    : "text-urbik-black/30"
                }`}
              >
                ARS
              </button>
              <button
                type="button"
                onClick={() => setValue("saleCurrency", "USD" as any)}
                className={`font-bold transition-colors duration-200 ${
                  saleCurrency === "USD"
                    ? "text-urbik-black/80"
                    : "text-urbik-black/30"
                }`}
              >
                USD
              </button>
            </div>

            <AnimatedInput
              type="number"
              align="center"
              rhf={rhf}
              fieldName="salePrice"
              placeholder="Precio"
            />
          </div>

          <div className="w-full flex flex-col items-center">
            <AnimatedInput
              type="number"
              align="center"
              rhf={rhf}
              fieldName="expenses"
              placeholder="Expensas (opcional)"
            />
          </div>
        </div>
      )}

      {propertyType && (
        <div className="w-full pt-6 mt-6 border-t border-white/40 space-y-6">
          {(propertyType === "APARTMENT" || propertyType === "PH") && (
            <div className="w-full space-y-4">
              <div className="w-full text-center flex flex-col items-center md:items-start">
                <label className="block text-sm font-bold text-urbik-black/50 mb-2 md:pl-2">
                  Estado del edificio
                </label>
                {(() => {
                  const opts = [
                    { value: "bueno", label: "Bueno" },
                    { value: "mediano", label: "Mediano" },
                    { value: "malo", label: "Malo" },
                  ];
                  const cur = watch("buildingCondition") ?? "bueno";
                  const idx = opts.findIndex((o) => o.value === cur);
                  return (
                    <div className="relative p-0.5 bg-white/30 shadow-md rounded-full border border-white w-full overflow-hidden">
                      <div className="relative grid grid-cols-3 w-full h-full items-center">
                        <div
                          className="absolute top-0 bottom-0 left-0 w-1/3 bg-urbik-white2 rounded-full border border-white transition-transform duration-300 ease-out"
                          style={{
                            transform: `translateX(${idx !== -1 ? idx * 100 : 0}%)`,
                          }}
                        />
                        {opts.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              setValue("buildingCondition", opt.value as any)
                            }
                            className={`relative z-10 py-2.5 text-center text-xs sm:text-sm font-bold transition-colors duration-300 rounded-full cursor-pointer ${cur === opt.value ? "text-urbik-black/80" : "text-urbik-black/50 hover:text-urbik-black"}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
              <AnimatedInput
                type="number"
                rhf={rhf}
                fieldName="buildingFloors"
                placeholder="Cantidad de pisos"
              />
              <AnimatedInput
                type="number"
                rhf={rhf}
                fieldName="unitsPerFloor"
                placeholder="Departamentos por piso"
              />
            </div>
          )}

          {propertyType === "LAND" && (
            <div className="space-y-4">
              <AnimatedInput
                type="number"
                rhf={rhf}
                fieldName="hectares"
                placeholder="Hectáreas"
                inputClassName={SURFACE_INPUT_CLASS}
              />
              <CustomDropdown
                label="Tipo de lote"
                options={[
                  { value: "lote", label: "Lote" },
                  { value: "manzana", label: "Manzana" },
                  { value: "fraccion", label: "Fracción" },
                ]}
                value={watch("landUse") ?? ""}
                onChange={(v) => setValue("landUse", v as any)}
                variant="white2"
              />
              <AnimatedInput
                type="number"
                rhf={rhf}
                fieldName="buildabilityIndex"
                placeholder="FOT (índice de edificabilidad)"
              />
              <AnimatedInput
                type="number"
                rhf={rhf}
                fieldName="occupancyIndex"
                placeholder="FOS (índice de ocupación)"
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(watch("hasConstruction"))}
                  onChange={(e) =>
                    setValue("hasConstruction", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-urbik-black/70">
                  Tiene construcción existente
                </span>
              </label>
            </div>
          )}

          {propertyType === "FIELD" && (
            <div className="space-y-4">
              <AnimatedInput
                type="number"
                rhf={rhf}
                fieldName="hectares"
                placeholder="Hectáreas"
                inputClassName={SURFACE_INPUT_CLASS}
              />
              <CustomDropdown
                label="Tipo de explotación"
                options={[
                  { value: "agricola", label: "Agrícola" },
                  { value: "ganadero", label: "Ganadero" },
                  { value: "mixto", label: "Mixto" },
                  { value: "forestal", label: "Forestal" },
                  { value: "tambero", label: "Tambero" },
                  { value: "apicola", label: "Apícola" },
                ]}
                value={watch("soilType") ?? ""}
                onChange={(v) => setValue("soilType", v as any)}
                variant="white2"
              />
              <CustomDropdown
                label="Fuente de agua"
                options={[
                  { value: "rio", label: "Río" },
                  { value: "arroyo", label: "Arroyo" },
                  { value: "lago", label: "Lago" },
                  { value: "perforacion", label: "Perforación" },
                  { value: "represa", label: "Represa" },
                ]}
                value={(watch("extraData")?.waterSource as string) ?? ""}
                onChange={(v) =>
                  setValue("extraData", {
                    ...(watch("extraData") ?? {}),
                    waterSource: v,
                  })
                }
                variant="white2"
              />
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(watch("hasIrrigation"))}
                    onChange={(e) =>
                      setValue("hasIrrigation", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-urbik-black/70">
                    Tiene riego
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(watch("hasFencing"))}
                    onChange={(e) => setValue("hasFencing", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-urbik-black/70">
                    Tiene alambrado
                  </span>
                </label>
              </div>
            </div>
          )}

          {propertyType === "COMMERCIAL_PROPERTY" && (
            <div className="space-y-4">
              <CustomDropdown
                label="Rubro principal"
                options={[
                  { value: "gastronomia", label: "Gastronomía" },
                  { value: "comercio_minorista", label: "Comercio minorista" },
                  { value: "salud", label: "Salud" },
                  { value: "educacion", label: "Educación" },
                  { value: "servicio", label: "Servicio" },
                  { value: "industria", label: "Industria" },
                  { value: "otro", label: "Otro" },
                ]}
                value={watch("commercialActivity") ?? ""}
                onChange={(v) => setValue("commercialActivity", v as any)}
                variant="white2"
              />
              <CustomDropdown
                label="Ubicación del local"
                options={[
                  { value: "calle", label: "A la calle" },
                  { value: "galeria", label: "En galería" },
                  { value: "shopping", label: "En shopping" },
                  { value: "edificio", label: "En edificio" },
                ]}
                value={(watch("extraData")?.commercialLocation as string) ?? ""}
                onChange={(v) =>
                  setValue("extraData", {
                    ...(watch("extraData") ?? {}),
                    commercialLocation: v,
                  })
                }
                variant="white2"
              />
              <CustomDropdown
                label="Estado comercial"
                options={[
                  { value: "en_actividad", label: "En actividad" },
                  { value: "sin_actividad", label: "Sin actividad" },
                  { value: "en_reforma", label: "En reforma" },
                ]}
                value={(watch("extraData")?.commercialStatus as string) ?? ""}
                onChange={(v) =>
                  setValue("extraData", {
                    ...(watch("extraData") ?? {}),
                    commercialStatus: v,
                  })
                }
                variant="white2"
              />
            </div>
          )}

          {propertyType === "BUSINESS_BACKGROUND" && (
            <CustomDropdown
              label="Rubro del negocio"
              options={[
                { value: "gastronomia", label: "Gastronomía" },
                { value: "comercio_minorista", label: "Comercio minorista" },
                { value: "salud", label: "Salud" },
                { value: "educacion", label: "Educación" },
                { value: "servicio", label: "Servicio" },
                { value: "industria", label: "Industria" },
                { value: "otro", label: "Otro" },
              ]}
              value={watch("commercialActivity") ?? ""}
              onChange={(v) => setValue("commercialActivity", v as any)}
              variant="white2"
            />
          )}

          {propertyType === "WAREHOUSE" && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(watch("hasLoadingDock"))}
                onChange={(e) => setValue("hasLoadingDock", e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold text-urbik-black/70">
                Tiene playa de carga
              </span>
            </label>
          )}

          {propertyType === "DEVELOPMENT" && (
            <div className="space-y-4">
              <AnimatedInput
                type="number"
                rhf={rhf}
                fieldName="buildingFloors"
                placeholder="Cantidad de pisos"
              />
              <AnimatedInput
                type="number"
                rhf={rhf}
                fieldName="unitsPerFloor"
                placeholder="Unidades por piso"
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
        <AnimatedInput
          rhf={rhf}
          fieldName="neighborhood"
          placeholder="Barrio"
        />
        <AnimatedInput
          rhf={rhf}
          fieldName="street"
          placeholder="Calle / Dirección *"
        />
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
      <AnimatedInput
        rhf={rhf}
        fieldName="title"
        placeholder="Título. Ej: Departamento 3 amb con pileta"
      />

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
  const { watch } = rhf;
  const propertyType = watch("type") ?? "";

  const showFrontBack = [
    "HOUSE",
    "LAND",
    "FIELD",
    "COMMERCIAL_PROPERTY",
    "COUNTRY",
  ].includes(propertyType);
  const showRooms = !["LAND", "FIELD"].includes(propertyType) && !!propertyType;

  type RoomField = { key: Path<PropertyUploadFormData>; label: string };

  const getRoomFields = (): RoomField[] => {
    if (!showRooms) return [];
    if (propertyType === "HOUSE" || propertyType === "COUNTRY") {
      return [
        { key: "rooms", label: "Ambientes" },
        { key: "bedrooms", label: "Dormitorios" },
        { key: "bathrooms", label: "Baños" },
        { key: "toilets", label: "Toilettes" },
        { key: "garages", label: "Cocheras" },
        { key: "plants", label: "Plantas" },
      ];
    }
    if (propertyType === "PH") {
      return [
        { key: "rooms", label: "Ambientes" },
        { key: "bedrooms", label: "Dormitorios" },
        { key: "bathrooms", label: "Baños" },
        { key: "toilets", label: "Toilettes" },
        { key: "garages", label: "Cocheras" },
        { key: "plants", label: "Plantas" },
      ];
    }
    if (propertyType === "APARTMENT") {
      return [
        { key: "rooms", label: "Ambientes" },
        { key: "bedrooms", label: "Dormitorios" },
        { key: "bathrooms", label: "Baños" },
        { key: "toilets", label: "Toilettes" },
        { key: "garages", label: "Cocheras" },
      ];
    }
    if (propertyType === "COMMERCIAL_PROPERTY" || propertyType === "OFFICE") {
      return [
        { key: "rooms", label: "Ambientes" },
        { key: "bathrooms", label: "Baños" },
        { key: "garages", label: "Cocheras" },
      ];
    }
    return [
      { key: "rooms", label: "Ambientes" },
      { key: "bathrooms", label: "Baños" },
    ];
  };

  const roomFields = getRoomFields();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-bold text-urbik-black/50 mb-1 ml-1">
            M2 cubiertos (m²) *
          </label>
          <AnimatedInput
            type="number"
            rhf={rhf}
            fieldName="areaM2"
            placeholder="0"
            inputClassName={SURFACE_INPUT_CLASS}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-urbik-black/50 mb-1 ml-1">
            Sup. semicubierta (m²)
          </label>
          <AnimatedInput
            type="number"
            rhf={rhf}
            fieldName="semiCoveredArea"
            placeholder="0"
            inputClassName={SURFACE_INPUT_CLASS}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-urbik-black/50 mb-1 ml-1">
            Sup. descubierta (m²)
          </label>
          <AnimatedInput
            type="number"
            rhf={rhf}
            fieldName="uncoveredArea"
            placeholder="0"
            inputClassName={SURFACE_INPUT_CLASS}
          />
        </div>

        {showFrontBack && (
          <>
            <div>
              <label className="block text-sm font-bold text-urbik-black/50 mb-1 ml-1">
                Frente (m)
              </label>
              <AnimatedInput
                type="number"
                rhf={rhf}
                fieldName="frontLength"
                placeholder="0"
                inputClassName={SURFACE_INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-urbik-black/50 mb-1 ml-1">
                Fondo (m)
              </label>
              <AnimatedInput
                type="number"
                rhf={rhf}
                fieldName="backLength"
                placeholder="0"
                inputClassName={SURFACE_INPUT_CLASS}
              />
            </div>
          </>
        )}
      </div>

      {roomFields.length > 0 && (
        <>
          <hr className="border-white/50" />
          <div className="flex flex-wrap gap-4 justify-center">
            {roomFields.map((f) => (
              <CounterInput
                key={f.key}
                label={f.label}
                fieldName={f.key}
                rhf={rhf}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Module05BasicCharacteristics({ rhf }: ModuleProps) {
  const { watch, setValue } = rhf;
  const propertyType = watch("type") ?? "";

  const CONDITION_TYPES = [
    "HOUSE",
    "APARTMENT",
    "PH",
    "COMMERCIAL_PROPERTY",
    "OFFICE",
    "COUNTRY",
  ];
  const ORIENTATION_TYPES = ["HOUSE", "APARTMENT", "PH", "OFFICE", "COUNTRY"];
  const DISPOSITION_TYPES = [
    "APARTMENT",
    "PH",
    "COMMERCIAL_PROPERTY",
    "OFFICE",
  ];
  const YEAR_TYPES = ["HOUSE", "APARTMENT", "PH", "COUNTRY"];

  const showCondition = CONDITION_TYPES.includes(propertyType);
  const showOrientation = ORIENTATION_TYPES.includes(propertyType);
  const showDisposition = DISPOSITION_TYPES.includes(propertyType);
  const showYears = YEAR_TYPES.includes(propertyType);
  const isAptOrPH = propertyType === "APARTMENT" || propertyType === "PH";
  const isHouseOrCountry =
    propertyType === "HOUSE" || propertyType === "COUNTRY";

  const conditionOptions = [
    { value: "excelente", label: "Excelente" },
    { value: "muy_bueno", label: "Muy bueno" },
    { value: "bueno", label: "Bueno" },
    { value: "regular", label: "Regular" },
    { value: "a_reciclar", label: "A reciclar" },
  ];

  const orientationOptions = [
    { value: "N", label: "Norte" },
    { value: "NE", label: "Noreste" },
    { value: "E", label: "Este" },
    { value: "SE", label: "Sureste" },
    { value: "S", label: "Sur" },
    { value: "SO", label: "Suroeste" },
    { value: "O", label: "Oeste" },
    { value: "NO", label: "Noroeste" },
  ];

  const dispositionOptions = [
    { value: "frente", label: "Frente" },
    { value: "contrafrente", label: "Contrafrente" },
    { value: "lateral", label: "Lateral" },
    { value: "interior", label: "Interior" },
  ];

  const viewOptions = [
    { value: "rio", label: "Río" },
    { value: "mar", label: "Mar" },
    { value: "lago", label: "Lago" },
    { value: "montana", label: "Montaña" },
    { value: "bosque", label: "Bosque" },
    { value: "abierta", label: "Abierta" },
    { value: "ciudad", label: "Ciudad" },
    { value: "golf", label: "Golf" },
  ];

  return (
    <div className="flex flex-col items-center w-full mx-auto space-y-6">
      {showCondition && (
        <div className="w-full">
          <label className="block text-sm font-bold text-urbik-black/50 mb-2">
            Estado del inmueble
          </label>
          <CustomDropdown
            label="Seleccioná estado"
            options={conditionOptions}
            value={watch("condition") ?? ""}
            onChange={(v) => setValue("condition", v as any)}
            variant="white2"
          />
        </div>
      )}

      {showOrientation && (
        <div className="w-full">
          <CustomDropdown
            label="Orientación"
            options={orientationOptions}
            value={watch("orientation") ?? ""}
            onChange={(v) => setValue("orientation", v as any)}
            variant="white2"
          />
        </div>
      )}

      {showDisposition && (
        <div className="w-full">
          <CustomDropdown
            label="Disposición"
            options={dispositionOptions}
            value={watch("disposition") ?? ""}
            onChange={(v) => setValue("disposition", v as any)}
            variant="white2"
          />
        </div>
      )}

      {showYears && (
        <>
          <AnimatedInput
            type="number"
            rhf={rhf}
            fieldName="constructionYear"
            placeholder="Año de construcción"
            inputClassName="bg-white/30 shadow-md border border-white w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all duration-300 text-sm"
          />
          <AnimatedInput
            type="number"
            rhf={rhf}
            fieldName="renovationYear"
            placeholder="Año de renovación (opcional)"
            inputClassName="bg-white/30 shadow-md border border-white w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all duration-300 text-sm"
          />
        </>
      )}

      {isAptOrPH && (
        <>
          <div className="w-full pt-4 border-t border-white/40 space-y-4">
            <p className="text-xs font-bold text-urbik-black/40 uppercase tracking-widest">
              Detalles adicionales
            </p>
            <CustomDropdown
              label="Tipo de cochera"
              options={[
                { value: "cubierta", label: "Cubierta" },
                { value: "semicubierta", label: "Semicubierta" },
                { value: "descubierta", label: "Descubierta" },
              ]}
              value={watch("garageType") ?? ""}
              onChange={(v) => setValue("garageType", v as any)}
              variant="white2"
            />
            <CustomDropdown
              label="Tipo de balcón"
              options={[
                { value: "corrido", label: "Corrido" },
                { value: "frances", label: "Francés" },
                { value: "terraza", label: "Terraza" },
              ]}
              value={watch("balconyType") ?? ""}
              onChange={(v) => setValue("balconyType", v as any)}
              variant="white2"
            />
            <CustomDropdown
              label="Tipo de piso"
              options={[
                { value: "madera", label: "Madera" },
                { value: "ceramica", label: "Cerámica" },
                { value: "porcelana", label: "Porcelana" },
                { value: "marmol", label: "Mármol" },
                { value: "cemento", label: "Cemento" },
                { value: "otro", label: "Otro" },
              ]}
              value={watch("floorType") ?? ""}
              onChange={(v) => setValue("floorType", v as any)}
              variant="white2"
            />
            <CustomDropdown
              label="Vista"
              options={viewOptions}
              value={watch("viewType") ?? ""}
              onChange={(v) => setValue("viewType", v as any)}
              variant="white2"
            />
          </div>
        </>
      )}

      {isHouseOrCountry && (
        <>
          <div className="w-full pt-4 border-t border-white/40 space-y-4">
            <p className="text-xs font-bold text-urbik-black/40 uppercase tracking-widest">
              Terreno y entorno
            </p>
            <CustomDropdown
              label="Pendiente del terreno"
              options={[
                { value: "plana", label: "Plana" },
                { value: "moderada", label: "Moderada" },
                { value: "empinada", label: "Empinada" },
              ]}
              value={watch("slope") ?? ""}
              onChange={(v) => setValue("slope", v as any)}
              variant="white2"
            />
            <CustomDropdown
              label="Costa"
              options={[
                { value: "rio", label: "Río" },
                { value: "lago", label: "Lago" },
                { value: "mar", label: "Mar" },
              ]}
              value={watch("coastType") ?? ""}
              onChange={(v) => setValue("coastType", v as any)}
              variant="white2"
            />
            <CustomDropdown
              label="Vista"
              options={viewOptions}
              value={watch("viewType") ?? ""}
              onChange={(v) => setValue("viewType", v as any)}
              variant="white2"
            />
          </div>

          <div className="w-full space-y-4">
            <p className="text-xs font-bold text-urbik-black/40 uppercase tracking-widest">
              Edificación
            </p>
            <CustomDropdown
              label="Tipo de piso"
              options={[
                { value: "madera", label: "Madera" },
                { value: "ceramica", label: "Cerámica" },
                { value: "porcelana", label: "Porcelana" },
                { value: "marmol", label: "Mármol" },
                { value: "cemento", label: "Cemento alisado" },
                { value: "otro", label: "Otro" },
              ]}
              value={watch("floorType") ?? ""}
              onChange={(v) => setValue("floorType", v as any)}
              variant="white2"
            />
            <CustomDropdown
              label="Tipo de techo"
              options={[
                { value: "losa", label: "Losa" },
                { value: "teja", label: "Teja" },
                { value: "chapa", label: "Chapa" },
                { value: "madera", label: "Madera" },
                { value: "pizarra", label: "Pizarra" },
                { value: "otro", label: "Otro" },
              ]}
              value={watch("roofType") ?? ""}
              onChange={(v) => setValue("roofType", v as any)}
              variant="white2"
            />
          </div>
        </>
      )}
    </div>
  );
}

export function Module06Tags({ rhf }: ModuleProps) {
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

export function Module10Multimedia({ rhf }: ModuleProps) {
  return (
    <div className="space-y-6">
      <ImageUpload
        value={(rhf.watch("images") as string[]) ?? []}
        onChange={(urls: string[]) => rhf.setValue("images", urls as any)}
        onRemove={(u: string) =>
          rhf.setValue(
            "images",
            ((rhf.watch("images") as string[]) || []).filter(
              (i) => i !== u,
            ) as any,
          )
        }
      />

      <div className="grid grid-cols-1 gap-4">
        <AnimatedInput
          type="url"
          rhf={rhf}
          fieldName="youtubeUrl"
          placeholder="URL video de YouTube"
          inputClassName="bg-white/30 shadow-md border border-white w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
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
