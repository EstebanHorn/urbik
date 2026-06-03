"use client";

import React from "react";
import { motion } from "framer-motion";
import type {
  ModuleDefinition,
  ModuleStatus,
  PropertyUploadFormData,
} from "./schema";

interface CurrencySelectorProps {
  value: "USD" | "ARS";
  onChange: (val: "USD" | "ARS") => void;
}

export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  return (
    <div className="relative flex bg-urbik-white rounded-full w-fit overflow-hidden border border-black/50 focus:border-urbik-black outline-none transition-all">
      <motion.div
        className="absolute top-0 bottom-0 left-0 bg-urbik-dark rounded-full border border-black/50"
        initial={false}
        animate={{ x: value === "USD" ? "0%" : "100%" }}
        style={{ width: "50%" }}
      />

      <button
        type="button"
        onClick={() => onChange("USD")}
        className={`relative z-10 px-8 cursor-pointer py-2.5 font-bold text-sm rounded-full transition-colors flex-1 ${
          value === "USD"
            ? "text-urbik-g100"
            : "text-urbik-dark/50 hover:bg-urbik-g400/50"
        }`}
      >
        USD
      </button>

      <button
        type="button"
        onClick={() => onChange("ARS")}
        className={`relative z-10 cursor-pointer px-8 py-2.5 font-bold text-sm rounded-full transition-colors flex-1 ${
          value === "ARS"
            ? "text-urbik-g100"
            : "text-urbik-muted hover:bg-urbik-g400/50"
        }`}
      >
        ARS
      </button>
    </div>
  );
}

const STATUS_ACCENT: Record<ModuleStatus, string> = {
  empty: "border-l-red-400",
  partial: "border-l-amber-400",
  complete: "border-l-emerald-500",
};

const STATUS_DOT: Record<ModuleStatus, string> = {
  empty: "bg-red-400",
  partial: "bg-amber-400",
  complete: "bg-emerald-500",
};

interface ModuleShellProps {
  id: number;
  label: string;
  status: ModuleStatus;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function ModuleShell({
  id,
  label,
  status,
  isOpen,
  onToggle,
  children,
}: ModuleShellProps) {
  return (
    <div
      id={`module-${id}`}
      className={`rounded-2xl border border-gray-200 border-l-4 transition-all ${STATUS_ACCENT[status]}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left rounded-t-2xl"
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-urbik-black text-white flex items-center justify-center text-[10px] font-black shrink-0">
            {id}
          </span>

          <span className="text-xs font-black uppercase tracking-wider text-urbik-black/80">
            {label}
          </span>

          <div className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
        </div>

        <span className="text-gray-400 font-bold text-sm select-none">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div className="px-5 pb-6 pt-2 space-y-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

const STATUS_STYLES: Record<
  ModuleStatus,
  { dot: string; text: string; bg: string }
> = {
  empty: {
    dot: "bg-red-400",
    text: "text-red-500",
    bg: "bg-red-50 border-red-200",
  },
  partial: {
    dot: "bg-amber-400",
    text: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  complete: {
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
};

type AmenityTag = {
  key: string;
  label: string;
  isLegacy?: boolean;
};

type AmenityCategory = {
  key: string;
  label: string;
  visibleFor: string[];
  tags: AmenityTag[];
};

const TAG_CATEGORIES: AmenityCategory[] = [
  {
    key: "ambientes",
    label: "Ambientes / Espacios",
    visibleFor: ["HOUSE", "APARTMENT", "PH", "OFFICE"],
    tags: [
      { key: "hasLiving", label: "Living" },
      { key: "hasLivingDining", label: "Living-comedor" },
      { key: "hasDining", label: "Comedor" },
      { key: "hasKitchen", label: "Cocina" },
      { key: "hasKitchenDining", label: "Cocina-comedor" },
      { key: "hasIntegratedKitchen", label: "Cocina integrada" },
      { key: "hasPantry", label: "Despensa" },
      { key: "hasSuite", label: "Suite" },
      { key: "hasWalkInCloset", label: "Vestidor" },
      { key: "hasStudy", label: "Escritorio" },
      { key: "hasPlayroom", label: "Playroom" },
      { key: "hasServiceRoom", label: "Cuarto de servicio" },
      { key: "hasStorage", label: "Depósito" },
      { key: "hasAttic", label: "Altillo" },
      { key: "hasBasement", label: "Subsuelo" },
    ],
  },

  {
    key: "exterior",
    label: "Exterior",
    visibleFor: ["HOUSE", "APARTMENT", "PH"],
    tags: [
      { key: "hasPatio", label: "Patio" },
      { key: "hasTerrace", label: "Terraza" },
      { key: "hasBalcony", label: "Balcón", isLegacy: true },
      { key: "hasGarden", label: "Jardín", isLegacy: true },
      { key: "hasGallery", label: "Galería" },
      { key: "hasGrill", label: "Parrilla", isLegacy: true },
      { key: "hasSolarium", label: "Solárium" },
    ],
  },

  {
    key: "servicios",
    label: "Servicios",
    visibleFor: [],
    tags: [
      { key: "hasWater", label: "Agua corriente", isLegacy: true },
      { key: "hasGas", label: "Gas natural", isLegacy: true },
      { key: "hasGasBottle", label: "Gas en garrafa" },
      { key: "hasElectricity", label: "Luz eléctrica", isLegacy: true },
      { key: "hasSewage", label: "Cloacas" },
      { key: "hasInternet", label: "Internet", isLegacy: true },
      { key: "hasCable", label: "Televisión por cable" },
      { key: "hasPhone", label: "Teléfono" },
    ],
  },
];

interface AmenitiesGridProps {
  value: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
  propertyType?: string;
}

export function AmenitiesGrid({
  value,
  onChange,
  propertyType,
}: AmenitiesGridProps) {
  const handleToggle = (key: string, next: boolean) => {
    onChange({
      ...value,
      [key]: next,
    });
  };

  const visibleCategories = TAG_CATEGORIES.filter(
    (cat) =>
      cat.visibleFor.length === 0 ||
      !propertyType ||
      cat.visibleFor.includes(propertyType),
  );

  return (
    <div className="space-y-3">
      <p className="text-xs font-black uppercase tracking-wider text-urbik-black/60 mb-1">
        Características y amenities
      </p>

      {visibleCategories.map((cat) => (
        <div
          key={cat.key}
          className="rounded-2xl border border-gray-200 overflow-hidden"
        >
          <div className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-left">
            <span className="text-[11px] font-black uppercase tracking-wider text-urbik-black/60">
              {cat.label}
            </span>
          </div>

          <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {cat.tags.map((tag) => {
              const active = Boolean(value?.[tag.key]);

              return (
                <button
                  key={tag.key}
                  type="button"
                  onClick={() => handleToggle(tag.key, !active)}
                  className={`rounded-full border px-3 py-2 text-xs font-bold transition-all text-left flex items-center justify-between gap-1 ${
                    active
                      ? "bg-urbik-black text-white border-urbik-black shadow-sm"
                      : "border-gray-300 text-urbik-black/60 bg-white hover:bg-gray-50"
                  }`}
                >
                  <span className="truncate">{tag.label}</span>

                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      active ? "bg-urbik-rose" : "bg-gray-200"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
