"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import type { PropertyUploadFormData } from "./types";

interface Props {
  rhf: UseFormReturn<PropertyUploadFormData>;
}

interface EnvField {
  key: keyof PropertyUploadFormData;
  label: string;
  visibleFor: string[];
}

const ENV_FIELDS: EnvField[] = [
  {
    key: "rooms",
    label: "Ambientes",
    visibleFor: ["HOUSE", "APARTMENT", "PH", "COUNTRY", "COMMERCIAL_PROPERTY", "OFFICE"],
  },
  {
    key: "bedrooms",
    label: "Habitaciones",
    visibleFor: ["HOUSE", "APARTMENT", "PH", "COUNTRY"],
  },
  {
    key: "bathrooms",
    label: "Baños",
    visibleFor: ["HOUSE", "APARTMENT", "PH", "COUNTRY", "COMMERCIAL_PROPERTY", "OFFICE", "WAREHOUSE"],
  },
  {
    key: "toilets",
    label: "Toilettes",
    visibleFor: ["HOUSE", "APARTMENT", "PH", "COUNTRY", "COMMERCIAL_PROPERTY", "OFFICE"],
  },
  {
    key: "garages",
    label: "Cocheras",
    visibleFor: ["HOUSE", "APARTMENT", "PH", "COUNTRY", "COMMERCIAL_PROPERTY", "GARAGE"],
  },
  {
    key: "plants",
    label: "Plantas / Niveles",
    visibleFor: ["HOUSE", "PH", "COUNTRY", "COMMERCIAL_PROPERTY", "OFFICE"],
  },
];

const LAUNDRY_TYPES = [
  { value: "", label: "Sin lavadero" },
  { value: "separado", label: "Separado" },
  { value: "incorporado", label: "Incorporado" },
];

const LAUNDRY_TYPES_FOR = ["HOUSE", "APARTMENT", "PH", "COUNTRY"];

export function Module05Environments({ rhf }: Props) {
  const { watch, setValue } = rhf;
  const type = watch("type") ?? "";

  const visibleFields = ENV_FIELDS.filter((f) => f.visibleFor.includes(type));
  const showLaundry = LAUNDRY_TYPES_FOR.includes(type);

  if (visibleFields.length === 0 && !showLaundry) {
    return (
      <p className="text-sm text-gray-400 font-medium italic">
        No aplica ambientes para este tipo de propiedad.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {visibleFields.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {visibleFields.map((field) => (
            <div key={field.key as string}>
              <label className="block text-sm font-bold text-urbik-black/50 mb-1 ml-1">
                {field.label}
              </label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={(watch(field.key) as string | number) ?? ""}
                onChange={(e) => setValue(field.key, e.target.value)}
                className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-2.5 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
              />
            </div>
          ))}
        </div>
      )}

      {showLaundry && (
        <div>
          <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
            Lavadero
          </label>
          <div className="flex gap-2 flex-wrap">
            {LAUNDRY_TYPES.map((opt) => {
              const active = (watch("laundryType") ?? "") === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("laundryType", opt.value)}
                  className={`px-4 py-2 rounded-full border text-sm font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-urbik-black text-white border-urbik-black"
                      : "border-gray-300 text-urbik-black/60 bg-white hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
