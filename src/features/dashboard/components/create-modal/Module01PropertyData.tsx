"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { UseFormReturn } from "react-hook-form";
import { CustomDropdown } from "@/components/CustomDropdown";
import { CurrencySelector } from "./CurrencySelector";
import type { PropertyUploadFormData } from "./types";

interface Props {
  rhf: UseFormReturn<PropertyUploadFormData>;
}

const PROPERTY_TYPES = [
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

const OPERATION_OPTIONS = [
  { id: "SALE", label: "VENTA" },
  { id: "RENT", label: "ALQUILER" },
  { id: "TEMP_RENT", label: "TEMPORAL" },
  { id: "SALE_RENT", label: "AMBOS" },
];

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Vigente / Disponible" },
  { value: "RESERVED", label: "Reservado" },
  { value: "SUSPENDED", label: "Suspendido" },
  { value: "HISTORIC", label: "Histórico" },
  { value: "APPRAISAL", label: "En tasación" },
  { value: "SOLD", label: "Vendido" },
  { value: "RENTED", label: "Alquilado" },
];

const UNIT_TYPE_OPTIONS: Record<string, Array<{ value: string; label: string }>> = {
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
  ],
};

export function Module01PropertyData({ rhf }: Props) {
  const { watch, setValue } = rhf;
  const type = watch("type");
  const operationType = watch("operationType");
  const isPriceHidden = watch("isPriceHidden");
  const saleCurrency = watch("saleCurrency") ?? "USD";
  const rentCurrency = watch("rentCurrency") ?? "ARS";

  const showSale = operationType === "SALE" || operationType === "SALE_RENT";
  const showRent =
    operationType === "RENT" ||
    operationType === "TEMP_RENT" ||
    operationType === "SALE_RENT";
  const showExpenses = operationType === "RENT" || operationType === "SALE";

  const unitTypeOptions = UNIT_TYPE_OPTIONS[type ?? ""] ?? [];

  // Animated pill for operation selector
  const opRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [opPill, setOpPill] = useState({ width: 0, x: 0 });

  useEffect(() => {
    const node = opRefs.current[operationType ?? ""];
    if (node) setOpPill({ width: node.offsetWidth, x: node.offsetLeft });
  }, [operationType]);

  return (
    <div className="space-y-6">
      {/* Property type */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PROPERTY_TYPES.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              setValue("type", opt.value, { shouldValidate: true });
              setValue("unitType", "");
              setValue("propertySubtype", "");
            }}
            className={`rounded-full px-4 py-3 font-bold text-sm border transition-all
              ${
                type === opt.value
                  ? "bg-urbik-black text-white border-urbik-black shadow-md"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Unit type (APARTMENT / PH) */}
      {unitTypeOptions.length > 0 && (
        <div>
          <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
            Tipo de unidad
          </label>
          <CustomDropdown
            label="Seleccionar tipo"
            options={unitTypeOptions}
            value={watch("unitType") ?? ""}
            onChange={(v) => setValue("unitType", v)}
            variant="white2"
          />
        </div>
      )}

      {/* Operation */}
      <div>
        <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
          Operación
        </label>
        <div className="relative flex bg-white rounded-full w-fit overflow-hidden border border-black/50">
          <motion.div
            className="absolute top-0 bottom-0 bg-urbik-dark rounded-full border border-black/50"
            initial={false}
            animate={{ width: opPill.width, x: opPill.x }}
          />
          {OPERATION_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              ref={(el) => { opRefs.current[opt.id] = el; }}
              onClick={() => setValue("operationType", opt.id)}
              className={`relative z-10 px-6 py-2.5 text-xs font-bold transition-colors rounded-full
                ${operationType === opt.id ? "text-white" : "text-urbik-black/50"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="w-full md:w-1/2">
        <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
          Estado
        </label>
        <CustomDropdown
          label="Seleccionar estado"
          options={STATUS_OPTIONS}
          value={watch("status") ?? "AVAILABLE"}
          onChange={(v) => setValue("status", v)}
          variant="white2"
        />
      </div>

      {/* Price hidden toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(isPriceHidden)}
          onChange={(e) => setValue("isPriceHidden", e.target.checked)}
        />
        <span className="text-sm font-semibold text-urbik-black/70">
          Publicar como &ldquo;Sin precio&rdquo;
        </span>
      </label>

      {/* Prices */}
      {!isPriceHidden && (
        <div className="space-y-4">
          {showRent && (
            <div>
              <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
                Precio Alquiler
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="0"
                  value={watch("rentPrice") ?? ""}
                  onChange={(e) => setValue("rentPrice", e.target.value)}
                  className="bg-white text-urbik-black/50 border border-black/50 flex-1 px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
                />
                <CurrencySelector
                  value={rentCurrency}
                  onChange={(v) => setValue("rentCurrency", v)}
                />
              </div>
            </div>
          )}

          {showSale && (
            <div>
              <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
                Precio Venta
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="0"
                  value={watch("salePrice") ?? ""}
                  onChange={(e) => setValue("salePrice", e.target.value)}
                  className="bg-white text-urbik-black/50 border border-black/50 flex-1 px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
                />
                <CurrencySelector
                  value={saleCurrency}
                  onChange={(v) => setValue("saleCurrency", v)}
                />
              </div>
            </div>
          )}

          {showExpenses && (
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
                Expensas (opcional)
              </label>
              <input
                type="number"
                placeholder="0"
                value={watch("expenses") ?? ""}
                onChange={(e) => setValue("expenses", e.target.value)}
                className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
