"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { CurrencySelector } from "./shared-ui";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

export interface PropertyFormData {
  id?: number | string;
  title?: string;
  type?: string;
  propertySubtype?: string;
  unitType?: string;
  operationType?: string;
  status?: string;
  rentPrice?: number;
  salePrice?: number;
  rentCurrency?: "USD" | "ARS";
  saleCurrency?: "USD" | "ARS";
  currency?: string;
  isPriceHidden?: boolean;
  areaM2?: number;
  area?: number;
  rooms?: number;
  bathrooms?: number;
  toilets?: number;
  garages?: number;
  plants?: number;
  coveredArea?: number;
  semiCoveredArea?: number;
  uncoveredArea?: number;
  frontLength?: number;
  backLength?: number;
  expenses?: number;
  condition?: string;
  orientation?: string;
  disposition?: string;
  constructionYear?: number;
  renovationYear?: number;
  buildingCondition?: string;
  buildingFloors?: number;
  unitsPerFloor?: number;
  amenities?: Record<string, boolean>;
  featureGroups?: Record<string, Record<string, boolean>>;
  extraData?: Record<string, unknown>;
  youtubeUrl?: string;
  tour360Url?: string;
  country?: string;
  district?: string;
  locality?: string;
  neighborhood?: string;
  floor?: string;
  unitNumber?: string;
  address?: string;
  street?: string;
  number?: string;
  city?: string;
  province?: string;
  description?: string;
  images?: string[];
}

interface FormFieldsProps {
  form: PropertyFormData;
  setForm: React.Dispatch<React.SetStateAction<PropertyFormData>>;
}

type DynamicField = {
  key:
    | "areaM2"
    | "rooms"
    | "bathrooms"
    | "toilets"
    | "garages"
    | "plants"
    | "coveredArea"
    | "semiCoveredArea"
    | "uncoveredArea"
    | "frontLength"
    | "backLength"
    | "expenses";
  label: string;
  required?: boolean;
};

const DYNAMIC_FIELDS_BY_TYPE: Record<string, DynamicField[]> = {
  HOUSE: [
    { key: "areaM2", label: "M² Totales", required: true },
    { key: "rooms", label: "Ambientes", required: true },
    { key: "bathrooms", label: "Baños", required: true },
    { key: "toilets", label: "Toilettes" },
    { key: "garages", label: "Cocheras" },
    { key: "plants", label: "Plantas" },
    { key: "coveredArea", label: "Sup. cubierta (m²)" },
    { key: "semiCoveredArea", label: "Sup. semicubierta (m²)" },
    { key: "uncoveredArea", label: "Sup. descubierta (m²)" },
    { key: "frontLength", label: "Frente (m)" },
    { key: "backLength", label: "Fondo (m)" },
  ],
  APARTMENT: [
    { key: "areaM2", label: "M² Cubiertos", required: true },
    { key: "rooms", label: "Ambientes", required: true },
    { key: "bathrooms", label: "Baños", required: true },
    { key: "toilets", label: "Toilettes" },
    { key: "garages", label: "Cocheras" },
    { key: "expenses", label: "Expensas" },
    { key: "coveredArea", label: "Sup. cubierta (m²)" },
    { key: "semiCoveredArea", label: "Sup. semicubierta (m²)" },
    { key: "uncoveredArea", label: "Sup. descubierta (m²)" },
  ],
  PH: [
    { key: "areaM2", label: "M² Totales", required: true },
    { key: "rooms", label: "Ambientes", required: true },
    { key: "bathrooms", label: "Baños", required: true },
  ],
  COUNTRY: [
    { key: "areaM2", label: "M² Totales", required: true },
    { key: "rooms", label: "Ambientes", required: true },
    { key: "bathrooms", label: "Baños", required: true },
  ],
  LAND: [{ key: "areaM2", label: "M² del terreno", required: true }],
  FIELD: [{ key: "areaM2", label: "Hectáreas / m²", required: true }],
  BUSINESS_BACKGROUND: [{ key: "areaM2", label: "M² Totales" }],
  GARAGE: [{ key: "garages", label: "Cantidad de cocheras", required: true }],
  WAREHOUSE: [
    { key: "areaM2", label: "M² Totales", required: true },
    { key: "bathrooms", label: "Baños" },
  ],
  DEVELOPMENT: [{ key: "areaM2", label: "M² del desarrollo" }],
  OFFICE: [
    { key: "areaM2", label: "M² Totales", required: true },
    { key: "bathrooms", label: "Baños" },
  ],
  COMMERCIAL_PROPERTY: [
    { key: "areaM2", label: "M² Totales", required: true },
    { key: "bathrooms", label: "Baños" },
  ],
};

const SUBTYPE_BY_TYPE: Record<
  string,
  Array<{ value: string; label: string }>
> = {
  APARTMENT: [
    { value: "monoambiente", label: "Monoambiente" },
    { value: "semipiso", label: "Semipiso" },
    { value: "departamento", label: "Departamento" },
    { value: "piso", label: "Piso" },
    { value: "semipiso", label: "Semipiso" },
    { value: "duplex", label: "Dúplex" },
    { value: "triplex", label: "Tríplex" },
    { value: "loft", label: "Loft" },
    { value: "penthouse", label: "Penthouse" },
    { value: "ph", label: "PH" },
  ],
  HOUSE: [
    { value: "chalet", label: "Chalet" },
    { value: "duplex", label: "Dúplex" },
    { value: "triplex", label: "Tríplex" },
  ],
  PH: [
    { value: "al_frente", label: "Al frente" },
    { value: "interno", label: "Interno" },
  ],
  COUNTRY: [
    { value: "lote_casa", label: "Lote + Casa" },
    { value: "lote", label: "Solo Lote" },
  ],
};

const UNIT_TYPE_BY_PROPERTY: Record<
  string,
  Array<{ value: string; label: string }>
> = {
  APARTMENT: SUBTYPE_BY_TYPE.APARTMENT,
  HOUSE: [
    { value: "casa", label: "Casa" },
    { value: "chalet", label: "Chalet" },
    { value: "duplex", label: "Dúplex" },
    { value: "triplex", label: "Tríplex" },
  ],
  LAND: [
    { value: "terreno", label: "Terreno" },
    { value: "lote", label: "Lote" },
  ],
};

const UNIT_TYPE_SELECTOR: Record<
  string,
  Array<{ value: string; label: string }>
> = {
  APARTMENT: [
    { value: "departamento", label: "Departamento" },
    { value: "piso", label: "Piso" },
    { value: "semipiso", label: "Semipiso" },
    { value: "duplex", label: "Dúplex" },
    { value: "triplex", label: "Tríplex" },
    { value: "loft", label: "Loft" },
    { value: "penthouse", label: "Penthouse" },
  ],
  PH: [
    { value: "ph", label: "PH" },
    { value: "piso", label: "Piso" },
    { value: "semipiso", label: "Semipiso" },
    { value: "duplex", label: "Dúplex" },
    { value: "triplex", label: "Tríplex" },
    { value: "loft", label: "Loft" },
    { value: "penthouse", label: "Penthouse" },
  ],
};

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

const BUILDING_CONDITION_OPTIONS = [
  { value: "excelente", label: "Excelente" },
  { value: "muy_bueno", label: "Muy bueno" },
  { value: "bueno", label: "Bueno" },
  { value: "regular", label: "Regular" },
];

const TYPES_WITH_CHARACTERISTICS = new Set([
  "HOUSE",
  "APARTMENT",
  "PH",
  "COMMERCIAL_PROPERTY",
  "OFFICE",
]);

const TYPES_WITH_DISPOSITION = new Set([
  "APARTMENT",
  "PH",
  "COMMERCIAL_PROPERTY",
  "OFFICE",
]);

const TYPES_WITH_BUILDING_INFO = new Set(["APARTMENT", "PH"]);

const CURRENT_YEAR = new Date().getFullYear();

export function PropertyFormFields({ form, setForm }: FormFieldsProps) {
  const [opPill, setOpPill] = useState({ width: 0, x: 0 });
  const opRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [showTitleTip, setShowTitleTip] = useState(false);
  const [showCharacteristics, setShowCharacteristics] = useState(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "number"
        ? value === ""
          ? undefined
          : parseFloat(value)
        : value;

    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const updatePill = (
    id: string | undefined,
    refs: React.MutableRefObject<{ [key: string]: HTMLButtonElement | null }>,
    setter: (val: { width: number; x: number }) => void,
  ) => {
    if (!id) return;
    const node = refs.current[id];
    if (node) {
      setter({ width: node.offsetWidth, x: node.offsetLeft });
    }
  };

  useEffect(() => {
    updatePill(form.operationType, opRefs, setOpPill);
  }, [form.operationType]);

  const operationOptions = [
    { id: "SALE", label: "VENTA" },
    { id: "RENT", label: "ALQUILER" },
    { id: "TEMP_RENT", label: "TEMPORAL" },
    { id: "SALE_RENT", label: "AMBOS" },
  ];

  const propertyTypes = [
    { value: "HOUSE", label: "Casa" },
    { value: "APARTMENT", label: "Departamento" },
    { value: "COMMERCIAL_PROPERTY", label: "Local" },
    { value: "PH", label: "PH" },
    { value: "LAND", label: "Terreno" },
    { value: "FIELD", label: "Campo" },
    { value: "BUSINESS_BACKGROUND", label: "Fondo de comercio" },
    { value: "OFFICE", label: "Oficina" },
    { value: "GARAGE", label: "Cochera" },
    { value: "WAREHOUSE", label: "Galpón" },
    { value: "DEVELOPMENT", label: "Desarrollo" },
    { value: "COUNTRY", label: "Country" },
  ];

  const statusOptions = [
    { value: "AVAILABLE", label: "Vigente / Disponible" },
    { value: "RESERVED", label: "Reservado" },
    { value: "SUSPENDED", label: "Suspendido" },
    { value: "HISTORIC", label: "Histórico" },
    { value: "APPRAISAL", label: "En tasación" },
    { value: "SOLD", label: "Vendido" },
    { value: "RENTED", label: "Alquilado" },
  ];

  const showSalePrice =
    form.operationType === "SALE" || form.operationType === "SALE_RENT";
  const showRentPrice =
    form.operationType === "RENT" ||
    form.operationType === "TEMP_RENT" ||
    form.operationType === "SALE_RENT";

  const showExpenses =
    form.operationType === "RENT" || form.operationType === "SALE";

  const dynamicFields =
    DYNAMIC_FIELDS_BY_TYPE[form.type || "HOUSE"] ||
    DYNAMIC_FIELDS_BY_TYPE.HOUSE;

  const filteredDynamicFields = dynamicFields.filter(
    (f) => f.key !== "expenses",
  );

  const subtypeOptions = useMemo(
    () => SUBTYPE_BY_TYPE[form.type || ""] || [],
    [form.type],
  );
  const unitTypeOptions = useMemo(
    () => UNIT_TYPE_BY_PROPERTY[form.type || ""] || [],
    [form.type],
  );

  const unitTypeSelectorOptions = useMemo(
    () => UNIT_TYPE_SELECTOR[form.type || ""] || [],
    [form.type],
  );
  const showUnitTypeSelector = unitTypeSelectorOptions.length > 0;

  const showCharacteristicsSection = TYPES_WITH_CHARACTERISTICS.has(
    form.type || "",
  );
  const showDisposition = TYPES_WITH_DISPOSITION.has(form.type || "");
  const showBuildingInfo = TYPES_WITH_BUILDING_INFO.has(form.type || "");

  const titleTips = [
    "Utilizá un título corto (7 a 8 palabras) y descriptivo.",
    "No utilices demasiadas abreviaturas.",
    "Resaltá las características principales de la propiedad.",
    "Mencioná qué diferencia a esta propiedad del resto.",
    "Revisá la ortografía y redacción.",
  ];

  return (
    <div className="space-y-8">
      {/* Título del Aviso con tooltip (Módulo F) */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-2 ml-5">
          <label className="block text-md font-bold text-urbik-black/50">
            Título del Aviso
          </label>
          <button
            type="button"
            onClick={() => setShowTitleTip((v) => !v)}
            className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black flex items-center justify-center hover:bg-amber-200 transition-colors shrink-0"
            aria-label="Consejos para el título"
          >
            ?
          </button>
        </div>
        <input
          type="text"
          name="title"
          value={form.title || ""}
          onChange={handleChange}
          placeholder="Ej: Departamento 3 amb con pileta en La Plata"
          className="bg-urbik-white text-urbik-black/60 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
        />
        {showTitleTip && (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-[10px] font-black uppercase text-amber-700 tracking-wider mb-1">
              Consejos para un buen título
            </p>
            <ul className="text-xs text-amber-800 font-medium space-y-0.5">
              {titleTips.map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tipo de Propiedad + Operación */}
      <div className="flex flex-wrap gap-5 items-end justify-between">
        <div className="flex flex-col w-full md:w-[45%]">
          <label className="block text-md font-bold text-urbik-black/50 mb-3 ml-5">
            Tipo de Propiedad
          </label>
          <CustomDropdown
            label="Seleccionar tipo"
            options={propertyTypes}
            value={form.type || ""}
            onChange={(val) =>
              setForm((prev) => ({
                ...prev,
                type: val,
                propertySubtype: "",
                unitType: "",
              }))
            }
            className="w-full"
            variant="white2"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-md font-bold text-urbik-black/50 mb-3 ml-5">
            Operación
          </label>
          <div className="relative flex bg-urbik-white rounded-full w-fit overflow-hidden border border-black/50 focus:border-urbik-black outline-none transition-all">
            <motion.div
              className="absolute top-0 bottom-0 bg-urbik-dark rounded-full border border-black/50"
              initial={false}
              animate={{ width: opPill.width, x: opPill.x }}
            />
            {operationOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                ref={(el) => {
                  opRefs.current[opt.id] = el;
                }}
                onClick={() =>
                  setForm((prev) => ({ ...prev, operationType: opt.id }))
                }
                className={`relative cursor-pointer z-10 px-7 py-2.5 text-xs font-bold transition-colors rounded-full ${
                  form.operationType === opt.id
                    ? "text-white"
                    : "text-urbik-black/50 hover:bg-urbik-g400/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Módulo A: Tipo de Unidad (APARTMENT / PH only) */}
      {showUnitTypeSelector && (
        <div className="flex flex-col w-full md:w-[45%]">
          <label className="block text-md font-bold text-urbik-black/50 mb-3 ml-5">
            Tipo de Unidad
          </label>
          <CustomDropdown
            label="Seleccionar tipo de unidad"
            options={unitTypeSelectorOptions}
            value={form.unitType || ""}
            onChange={(val) => setForm((prev) => ({ ...prev, unitType: val }))}
            className="w-full"
            variant="white2"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-5 items-end">
        {unitTypeOptions.length > 0 && (
          <div className="flex flex-col w-full md:w-[45%]">
            <label className="block text-md font-bold text-urbik-black/50 mb-3 ml-5">
              Subtipo de Unidad
            </label>
            <CustomDropdown
              label="Seleccionar unidad"
              options={unitTypeOptions}
              value={form.unitType || ""}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, unitType: val }))
              }
              className="w-full"
              variant="white2"
            />
          </div>
        )}

        <div className="flex flex-col w-full md:w-[45%]">
          <label className="block text-md font-bold text-urbik-black/50 mb-3 ml-5">
            Estado
          </label>
          <CustomDropdown
            label="Seleccionar estado"
            options={statusOptions}
            value={form.status || "AVAILABLE"}
            onChange={(val) => setForm((prev) => ({ ...prev, status: val }))}
            className="w-full"
            variant="white2"
          />
        </div>
      </div>

      {subtypeOptions.length > 0 && (
        <div className="flex flex-col w-full md:w-[45%]">
          <label className="block text-md font-bold text-urbik-black/50 mb-3 ml-5">
            Subtipo
          </label>
          <CustomDropdown
            label="Seleccionar subtipo"
            options={subtypeOptions}
            value={form.propertySubtype || ""}
            onChange={(val) =>
              setForm((prev) => ({ ...prev, propertySubtype: val }))
            }
            className="w-full"
            variant="white2"
          />
        </div>
      )}

      {/* Publicación: precio + expensas (Módulo B) */}
      <div className="flex items-center gap-2">
        <input
          id="sinPrecio"
          type="checkbox"
          checked={Boolean(form.isPriceHidden)}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              isPriceHidden: e.target.checked,
            }))
          }
        />
        <label
          htmlFor="sinPrecio"
          className="text-sm font-semibold text-urbik-black/70"
        >
          Publicar como &ldquo;Sin precio&rdquo;
        </label>
      </div>

      {!form.isPriceHidden && (
        <div className="flex flex-col gap-5">
          {showRentPrice && (
            <div className="flex flex-col w-full">
              <label className="block text-md ml-5 font-bold text-urbik-black/50 mb-2">
                Precio Alquiler
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="rentPrice"
                  value={form.rentPrice || ""}
                  onChange={handleChange}
                  placeholder="0"
                  className="bg-urbik-white text-urbik-black/50 border border-black/50 flex-1 px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
                />
                <CurrencySelector
                  value={form.rentCurrency || "ARS"}
                  onChange={(val) =>
                    setForm((prev) => ({ ...prev, rentCurrency: val }))
                  }
                />
              </div>
            </div>
          )}

          {showSalePrice && (
            <div className="flex flex-col w-full">
              <label className="block text-md ml-5 font-bold text-urbik-black/50 mb-2">
                Precio Venta
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="salePrice"
                  value={form.salePrice || ""}
                  onChange={handleChange}
                  placeholder="0"
                  className="bg-urbik-white text-urbik-black/50 border border-black/50 flex-1 px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
                />
                <CurrencySelector
                  value={form.saleCurrency || "USD"}
                  onChange={(val) =>
                    setForm((prev) => ({ ...prev, saleCurrency: val }))
                  }
                />
              </div>
            </div>
          )}

          {/* Módulo B: Expensas */}
          {showExpenses && (
            <div className="flex flex-col w-full md:w-[45%]">
              <label className="block text-md ml-5 font-bold text-urbik-black/50 mb-2">
                Expensas (opcional)
              </label>
              <input
                type="number"
                name="expenses"
                value={form.expenses || ""}
                onChange={handleChange}
                placeholder="0"
                className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
              />
            </div>
          )}
        </div>
      )}

      {/* Campos dinámicos por tipo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredDynamicFields.map((field) => (
          <div key={field.key}>
            <label className="block text-md ml-5 font-bold text-urbik-black/50">
              {field.label} {field.required ? "*" : ""}
            </label>
            <input
              type="number"
              name={field.key}
              value={form[field.key] || ""}
              onChange={handleChange}
              className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-2 rounded-full focus:border-urbik-black outline-none transition-all"
            />
          </div>
        ))}
      </div>

      {/* Módulo 6: Características básicas */}
      {showCharacteristicsSection && (
        <div className="rounded-2xl border border-gray-200 ">
          <button
            type="button"
            onClick={() => setShowCharacteristics((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <span className="text-xs font-black uppercase tracking-wider text-urbik-black/70">
              Características
            </span>
            <span className="text-gray-400 font-bold text-sm">
              {showCharacteristics ? "−" : "+"}
            </span>
          </button>

          {showCharacteristics && (
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Estado del inmueble */}
                <div>
                  <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
                    Estado del inmueble
                  </label>
                  <CustomDropdown
                    label="Seleccionar estado"
                    options={CONDITION_OPTIONS}
                    value={form.condition || ""}
                    onChange={(val) =>
                      setForm((prev) => ({ ...prev, condition: val }))
                    }
                    className="w-full"
                    variant="white2"
                  />
                </div>

                {/* Orientación */}
                <div>
                  <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
                    Orientación
                  </label>
                  <CustomDropdown
                    label="Seleccionar orientación"
                    options={ORIENTATION_OPTIONS}
                    value={form.orientation || ""}
                    onChange={(val) =>
                      setForm((prev) => ({ ...prev, orientation: val }))
                    }
                    className="w-full"
                    variant="white2"
                  />
                </div>

                {/* Disposición — solo para APARTMENT, PH, COMMERCIAL_PROPERTY, OFFICE */}
                {showDisposition && (
                  <div>
                    <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
                      Disposición
                    </label>
                    <CustomDropdown
                      label="Seleccionar disposición"
                      options={DISPOSITION_OPTIONS}
                      value={form.disposition || ""}
                      onChange={(val) =>
                        setForm((prev) => ({ ...prev, disposition: val }))
                      }
                      className="w-full"
                      variant="white2"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Año de construcción */}
                <div>
                  <div className="flex items-center gap-2 mb-2 ml-1">
                    <label className="block text-sm font-bold text-urbik-black/50">
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
                    name="constructionYear"
                    value={form.constructionYear || ""}
                    onChange={handleChange}
                    min={1900}
                    max={CURRENT_YEAR}
                    placeholder={`1900–${CURRENT_YEAR}`}
                    className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all"
                  />
                </div>

                {/* Año de última renovación */}
                <div>
                  <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
                    Año de última renovación
                  </label>
                  <input
                    type="number"
                    name="renovationYear"
                    value={form.renovationYear || ""}
                    onChange={handleChange}
                    min={1900}
                    max={CURRENT_YEAR}
                    placeholder={`1900–${CURRENT_YEAR}`}
                    className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Módulo 8: Más sobre el edificio (APARTMENT / PH only) */}
      {showBuildingInfo && (
        <div className="rounded-2xl border border-gray-200 p-5 space-y-5">
          <p className="text-xs font-black uppercase tracking-wider text-urbik-black/60">
            Más sobre el edificio
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
                Estado del edificio
              </label>
              <CustomDropdown
                label="Seleccionar"
                options={BUILDING_CONDITION_OPTIONS}
                value={form.buildingCondition || ""}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, buildingCondition: val }))
                }
                className="w-full"
                variant="white2"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
                Cantidad de pisos
              </label>
              <input
                type="number"
                name="buildingFloors"
                value={form.buildingFloors || ""}
                onChange={handleChange}
                min={1}
                className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
                Departamentos por piso
              </label>
              <input
                type="number"
                name="unitsPerFloor"
                value={form.unitsPerFloor || ""}
                onChange={handleChange}
                min={1}
                className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-md ml-5 font-bold text-urbik-black/50 mb-2">
            Video de YouTube
          </label>
          <input
            type="url"
            name="youtubeUrl"
            value={form.youtubeUrl || ""}
            onChange={handleChange}
            placeholder="https://www.youtube.com/watch?v=..."
            className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-md ml-5 font-bold text-urbik-black/50 mb-2">
            Tour 360
          </label>
          <input
            type="url"
            name="tour360Url"
            value={form.tour360Url || ""}
            onChange={handleChange}
            placeholder="https://..."
            className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full py-4 space-y-1">
        {showSalePrice && (form.salePrice || 0) > 0 && (
          <span className="text-xl font-black text-urbik-black/70 italic">
            VENTA: {form.saleCurrency} {Number(form.salePrice).toLocaleString()}
          </span>
        )}
        {showRentPrice && (form.rentPrice || 0) > 0 && (
          <span className="text-xl font-black text-urbik-black/70 italic">
            ALQ: {form.rentCurrency} {Number(form.rentPrice).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
