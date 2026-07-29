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
    <div className="relative flex bg-geora-white rounded-full w-fit overflow-hidden border border-black/50 focus:border-geora-black outline-none transition-all">
      <motion.div
        className="absolute top-0 bottom-0 left-0 bg-geora-dark rounded-full border border-black/50"
        initial={false}
        animate={{ x: value === "USD" ? "0%" : "100%" }}
        style={{ width: "50%" }}
      />

      <button
        type="button"
        onClick={() => onChange("USD")}
        className={`relative z-10 px-8 cursor-pointer py-2.5 font-bold text-sm rounded-full transition-colors flex-1 ${
          value === "USD"
            ? "text-geora-g100"
            : "text-geora-dark/50 hover:bg-geora-g400/50"
        }`}
      >
        USD
      </button>

      <button
        type="button"
        onClick={() => onChange("ARS")}
        className={`relative z-10 cursor-pointer px-8 py-2.5 font-bold text-sm rounded-full transition-colors flex-1 ${
          value === "ARS"
            ? "text-geora-g100"
            : "text-geora-muted hover:bg-geora-g400/50"
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
          <span className="w-6 h-6 rounded-full bg-geora-black text-white flex items-center justify-center text-[10px] font-black shrink-0">
            {id}
          </span>

          <span className="text-xs font-black uppercase tracking-wider text-geora-black/80">
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
    key: "ambientesCasaPh",
    label: "Ambientes / Espacios",
    visibleFor: ["HOUSE", "PH", "COUNTRY"],
    tags: [
      { key: "hasBath", label: "Baño" },
      { key: "hasStorage", label: "Bodega / Depósito" },
      { key: "hasLocker", label: "Baulera" },
      { key: "hasStudy", label: "Estudio / Escritorio" },
      { key: "hasLibrary", label: "Biblioteca" },
      { key: "hasBedroom", label: "Dormitorio" },
      { key: "hasMezzanine", label: "Entrepiso" },
      { key: "hasKitchen", label: "Cocina" },
      { key: "hasKitchenDining", label: "Cocina-comedor" },
      { key: "hasLiving", label: "Living" },
      { key: "hasLivingDining", label: "Living-comedor" },
      { key: "hasDiningRoom", label: "Comedor" },
      { key: "hasGarageRoom", label: "Garaje" },
      { key: "hasLocal", label: "Local" },
      { key: "hasOffice", label: "Oficina" },
      { key: "hasBasement", label: "Sótano / Subsuelo" },
      { key: "hasTerrace", label: "Terraza" },
      { key: "hasWalkInCloset", label: "Vestidor" },
      { key: "hasAttic", label: "Altillo" },
      { key: "hasPantry", label: "Despensa" },
    ],
  },

  {
    key: "ambientesDepto",
    label: "Ambientes / Espacios",
    visibleFor: ["APARTMENT"],
    tags: [
      { key: "hasBath", label: "Baño" },
      { key: "hasStorage", label: "Bodega / Depósito" },
      { key: "hasLocker", label: "Baulera" },
      { key: "hasBalcony", label: "Balcón", isLegacy: true },
      { key: "hasStudy", label: "Estudio / Escritorio" },
      { key: "hasShed", label: "Galpón" },
      { key: "hasLibrary", label: "Biblioteca" },
      { key: "hasBedroom", label: "Dormitorio" },
      { key: "hasMezzanine", label: "Entrepiso" },
      { key: "hasGallery", label: "Galería" },
      { key: "hasGarageRoom", label: "Cochera" },
      { key: "hasOffice", label: "Oficina" },
      { key: "hasTerrace", label: "Terraza" },
      { key: "hasWalkInCloset", label: "Vestidor" },
      { key: "hasKitchen", label: "Cocina" },
      { key: "hasKitchenDining", label: "Cocina-comedor" },
      { key: "hasLiving", label: "Living" },
      { key: "hasLivingDining", label: "Living-comedor" },
      { key: "hasDiningRoom", label: "Comedor" },
    ],
  },

  {
    key: "ambientesOffice",
    label: "Ambientes / Espacios",
    visibleFor: ["OFFICE"],
    tags: [
      { key: "hasLiving", label: "Living" },
      { key: "hasKitchen", label: "Cocina" },
      { key: "hasPantry", label: "Despensa" },
      { key: "hasWalkInCloset", label: "Vestidor" },
      { key: "hasStudy", label: "Escritorio" },
      { key: "hasServiceRoom", label: "Cuarto de servicio" },
      { key: "hasStorage", label: "Depósito" },
    ],
  },

  {
    key: "exterior",
    label: "Exterior",
    visibleFor: ["HOUSE", "PH", "COUNTRY"],
    tags: [
      { key: "hasShed", label: "Galpón" },
      { key: "hasGallery", label: "Galería" },
      { key: "hasFrontYard", label: "Patio delantero" },
      { key: "hasBackYard", label: "Patio trasero" },
      { key: "hasGrill", label: "Parrilla", isLegacy: true },
      { key: "hasBalcony", label: "Balcón", isLegacy: true },
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
      { key: "hasCable", label: "TV por cable" },
      { key: "hasPhone", label: "Teléfono" },
    ],
  },

  {
    key: "climatizacion",
    label: "Climatización",
    visibleFor: ["HOUSE", "APARTMENT", "PH", "COMMERCIAL_PROPERTY", "OFFICE", "COUNTRY"],
    tags: [
      { key: "hasAirConditioning", label: "Aire acondicionado", isLegacy: true },
      { key: "hasCentralAC", label: "AC central" },
      { key: "hasCentralHeating", label: "Calefacción central" },
      { key: "hasRadiators", label: "Radiadores" },
      { key: "hasFloorHeating", label: "Losa radiante" },
      { key: "hasGasHeater", label: "Estufa tiro balanceado" },
      { key: "hasFireplace", label: "Hogar a leña" },
      { key: "hasBoiler", label: "Caldera" },
    ],
  },

  {
    key: "equipamiento",
    label: "Equipamiento",
    visibleFor: ["HOUSE", "APARTMENT", "PH", "COMMERCIAL_PROPERTY", "COUNTRY"],
    tags: [
      { key: "hasEquippedKitchen", label: "Cocina equipada" },
      { key: "hasKitchenFurniture", label: "Cocina amoblada" },
      { key: "isFurnished", label: "Amoblado" },
      { key: "hasJacuzzi", label: "Hidromasaje" },
      { key: "hasPool", label: "Piscina / Pileta", isLegacy: true },
      { key: "hasSafe", label: "Caja fuerte" },
    ],
  },

  {
    key: "infraestructura",
    label: "Infraestructura",
    visibleFor: ["APARTMENT", "PH", "COMMERCIAL_PROPERTY", "OFFICE"],
    tags: [
      { key: "hasSecurity", label: "Seguridad" },
      { key: "hasSurveillance", label: "Vigilancia" },
      { key: "hasCCTV", label: "Vigilancia por cámaras" },
      { key: "hasSharedParking", label: "Estacionamiento común", isLegacy: true },
      { key: "hasDisabledAccess", label: "Acceso movilidad reducida" },
      { key: "hasAsphalt", label: "Asfalto" },
    ],
  },

  {
    key: "edificio",
    label: "Edificio / Amenities",
    visibleFor: ["APARTMENT", "PH"],
    tags: [
      { key: "hasSUM", label: "SUM" },
      { key: "hasGym", label: "Gimnasio" },
      { key: "hasLaundry", label: "Laundry", isLegacy: true },
      { key: "hasRooftopTerrace", label: "Terraza común" },
      { key: "hasGreenSpaces", label: "Espacios verdes" },
    ],
  },

  {
    key: "locales",
    label: "Características del local",
    visibleFor: ["COMMERCIAL_PROPERTY"],
    tags: [
      { key: "hasDisplay", label: "Vidriera" },
      { key: "hasDepot", label: "Depósito" },
      { key: "hasPrivateOffice", label: "Oficina privada" },
      { key: "hasChangeRoom", label: "Vestuario" },
      { key: "hasCommercialKitchen", label: "Cocina" },
      { key: "hasFourWindows", label: "Salida 4 vientos" },
      { key: "inGallery", label: "En galería" },
      { key: "inShopping", label: "En shopping" },
      { key: "isStreetFacing", label: "A la calle" },
    ],
  },

  {
    key: "campo",
    label: "Infraestructura de campo",
    visibleFor: ["FIELD"],
    tags: [
      { key: "hasTrough", label: "Bebedero" },
      { key: "hasCattleChute", label: "Manga" },
      { key: "hasPens", label: "Corrales" },
      { key: "hasBarn", label: "Galpón" },
      { key: "hasHouse", label: "Vivienda" },
      { key: "hasForestry", label: "Forestación" },
      { key: "hasPasture", label: "Potrero" },
      { key: "hasDam", label: "Represa" },
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

      {visibleCategories.map((cat) => (
        <div
          key={cat.key}
          className="overflow-hidden"
        >
          <div className="w-full flex items-center justify-between px-4 py-3text-left">
            <span className="text-md font-bold text-geora-black/60">
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
                  title={tag.label}
                  onClick={() => handleToggle(tag.key, !active)}
                  className={`group rounded-full border px-3 py-2 text-xs font-bold transition-all text-left flex items-center justify-between gap-1 overflow-hidden relative ${
                    active
                      ? "bg-geora-white text-geora-black/80 border-none"
                      : "border-white text-geora-black/60 bg-white/30 hover:bg-gray-50"
                  }`}
                >
                  <span className="block w-full overflow-hidden">
                    <span className="block whitespace-nowrap truncate group-hover:[animation:pill-marquee_6s_linear_infinite]">
                      {tag.label}
                    </span>
                  </span>

                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

interface MultiChipSelectProps {
  label: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (next: string[]) => void;
}

export function MultiChipSelect({
  label,
  options,
  value,
  onChange,
}: MultiChipSelectProps) {
  const selected = new Set(value ?? []);

  const handleToggle = (val: string) => {
    const next = new Set(selected);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    onChange(Array.from(next));
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-bold text-geora-black/50 mb-2 ml-1">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.has(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleToggle(opt.value)}
              className={`rounded-full border px-3 py-2 text-xs font-bold transition-all ${
                active
                  ? "bg-geora-white text-geora-black/80 border-none shadow-sm"
                  : "border-white text-geora-black/60 bg-white/30 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
