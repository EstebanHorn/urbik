"use client";

import React from "react";
import LocationSelectors from "@/components/ui/LocationSelectors";
import {
  OPERATION_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  RADIUS_OPTIONS,
} from "@/lib/connections/searchUi";
import type { SearchFormData } from "./useSearchForm";

export const modalStyles = `
  @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .step-transition { animation: fadeSlideIn 0.3s ease-out forwards; }
`;

export function PillGroup({
  options,
  value,
  onChange,
  variant = "pill",
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  variant?: "pill" | "card";
}) {
  if (variant === "card") {
    return (
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex items-center justify-center text-center px-3 py-4 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer ${
              value === o.value
                ? "border-geora-emerald text-geora-emerald bg-geora-emerald/5"
                : "border-gray-200 text-geora-black/70 hover:border-geora-black/30"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-4 py-2 rounded-full text-sm font-bold border transition-all cursor-pointer ${
            value === o.value
              ? "bg-geora-black text-white border-geora-black shadow-sm"
              : "bg-white text-geora-black/70 border-gray-200 hover:border-geora-black/40"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function UnitInput({
  placeholder,
  value,
  onChange,
  unit,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
}) {
  return (
    <div className="relative w-1/2">
      <input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 bg-white rounded-xl pl-3 pr-12 py-3 text-sm focus:outline-none shadow-sm"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 pointer-events-none">
        {unit}
      </span>
    </div>
  );
}

interface Props {
  formData: SearchFormData;
  setField: (name: keyof SearchFormData, value: string) => void;
  handleLocation: (name: string, value: string) => void;
  isRural: boolean;
  isEditing: boolean;
  clients: any[];
}

export default function SearchFormFields({
  formData,
  setField,
  handleLocation,
  isRural,
  isEditing,
  clients,
}: Props) {
  return (
    <div className="space-y-7 step-transition">
      {/* 1. Tipo de operación */}
      <section>
        <label className="block text-xs font-bold text-geora-black/80 uppercase tracking-wider mb-2">
          1. Tipo de operación
        </label>
        <PillGroup
          variant="card"
          options={OPERATION_OPTIONS}
          value={formData.operationType}
          onChange={(v) => setField("operationType", v)}
        />
      </section>

      {/* 2. Tipo de propiedad */}
      <section>
        <label className="block text-xs font-bold text-geora-black/80 uppercase tracking-wider mb-2">
          2. Tipo de propiedad
        </label>
        <PillGroup
          variant="card"
          options={PROPERTY_TYPE_OPTIONS}
          value={formData.propertyType}
          onChange={(v) => setField("propertyType", v)}
        />
      </section>

      {/* 3. Zona de búsqueda */}
      <section>
        <label className="block text-xs font-bold text-geora-black/80 uppercase tracking-wider mb-3">
          3. Zona de búsqueda
        </label>
        <LocationSelectors
          layout="grid3"
          provinceValue={formData.province}
          cityValue={formData.department}
          localityValue={formData.locality}
          onChange={handleLocation}
          showLocality
          provinceLabel="Provincia"
          cityLabel="Departamento"
          localityLabel="Ciudad / Localidad"
        />
        {isRural && (
          <div className="mt-4">
            <label className="block text-[10px] font-bold text-geora-black/60 uppercase mb-2">
              Radio de búsqueda (rural)
            </label>
            <PillGroup
              options={RADIUS_OPTIONS}
              value={formData.radius}
              onChange={(v) => setField("radius", v)}
            />
          </div>
        )}
      </section>

      {/* 4. Superficie buscada */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-geora-black/80 uppercase tracking-wider">
            4. Superficie buscada
          </label>
          <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg">
            {["M2", "HA"].map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setField("areaUnit", u)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                  formData.areaUnit === u
                    ? "bg-white shadow-sm text-geora-black"
                    : "text-geora-black/50"
                }`}
              >
                {u === "HA" ? "ha" : "m²"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <UnitInput
            placeholder="Desde"
            value={formData.minArea}
            onChange={(v) => setField("minArea", v)}
            unit={formData.areaUnit === "HA" ? "ha" : "m²"}
          />
          <UnitInput
            placeholder="Hasta"
            value={formData.maxArea}
            onChange={(v) => setField("maxArea", v)}
            unit={formData.areaUnit === "HA" ? "ha" : "m²"}
          />
        </div>
      </section>

      {/* 5. Rango de precio */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-geora-black/80 uppercase tracking-wider">
            5. Rango de precio
          </label>
          <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg">
            {["USD", "ARS"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setField("currency", c)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                  formData.currency === c
                    ? "bg-white shadow-sm text-geora-black"
                    : "text-geora-black/50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <UnitInput
            placeholder="Desde"
            value={formData.minPrice}
            onChange={(v) => setField("minPrice", v)}
            unit={formData.currency}
          />
          <UnitInput
            placeholder="Hasta"
            value={formData.maxPrice}
            onChange={(v) => setField("maxPrice", v)}
            unit={formData.currency}
          />
        </div>
      </section>

      {/* 6. Condiciones adicionales */}
      <section>
        <label className="block text-xs font-bold text-geora-black/80 uppercase tracking-wider mb-2">
          6. Condiciones adicionales (opcional)
        </label>
        <textarea
          rows={3}
          value={formData.conditions}
          onChange={(e) => setField("conditions", e.target.value)}
          placeholder="Ej. Buscamos campos agrícolas mixtos. Preferentemente con mejoras y buena accesibilidad."
          className="w-full border border-gray-200 bg-white rounded-2xl px-4 py-3 text-sm focus:outline-none shadow-sm resize-none custom-scrollbar"
        />
      </section>

      {/* 7. Contacto interno */}
      <section>
        <label className="block text-xs font-bold text-geora-black/80 uppercase tracking-wider mb-2">
          7. Contacto interno{" "}
          <span className="normal-case text-geora-black/40">(oculto en la red)</span>
        </label>
        <select
          value={formData.clientId}
          onChange={(e) => setField("clientId", e.target.value)}
          className="w-full border border-gray-200 bg-white rounded-2xl px-4 py-3 text-sm focus:outline-none shadow-sm"
        >
          <option value="">Seleccionar contacto...</option>
          {clients
            .filter((c: any) => c.role !== "OWNER")
            .map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </section>

      {!isEditing && (
        <p className="text-[10px] font-bold text-geora-black/50 text-center">
          Estará activa por 60 días.
        </p>
      )}
    </div>
  );
}
