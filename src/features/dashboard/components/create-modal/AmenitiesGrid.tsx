"use client";

import React, { useState } from "react";

// TODO: add the new boolean tag fields to the Property model in a future migration.
// For now they are stored locally and sent as part of the form data (API ignores unknown fields).

interface AmenitiesGridProps {
  value: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
  propertyType?: string;
}

interface TagCategory {
  key: string;
  label: string;
  visibleFor: string[]; // empty = all types
  tags: Array<{ key: string; label: string; isLegacy?: boolean }>;
}

const ALL_TYPES = [
  "HOUSE", "APARTMENT", "PH", "COMMERCIAL_PROPERTY", "OFFICE",
  "LAND", "FIELD", "BUSINESS_BACKGROUND", "GARAGE", "WAREHOUSE",
  "DEVELOPMENT", "COUNTRY",
];

const TAG_CATEGORIES: TagCategory[] = [
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
    visibleFor: ALL_TYPES,
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
  {
    key: "climatizacion",
    label: "Climatización",
    visibleFor: ["HOUSE", "APARTMENT", "PH", "COMMERCIAL_PROPERTY", "OFFICE"],
    tags: [
      { key: "hasAirConditioning", label: "Aire acondicionado", isLegacy: true },
      { key: "hasCentralAC", label: "AC central" },
      { key: "hasHeating", label: "Calefacción" },
      { key: "hasCentralHeating", label: "Calefacción central" },
      { key: "hasRadiators", label: "Radiadores" },
      { key: "hasRadiantFloor", label: "Losa radiante" },
      { key: "hasBalancedFlue", label: "Estufa de tiro balanceado" },
      { key: "hasFireplace", label: "Chimenea" },
      { key: "hasBoiler", label: "Caldera" },
    ],
  },
  {
    key: "equipamiento",
    label: "Equipamiento",
    visibleFor: ["HOUSE", "APARTMENT", "PH", "COMMERCIAL_PROPERTY"],
    tags: [
      { key: "hasEquippedKitchen", label: "Cocina equipada" },
      { key: "hasKitchenFurniture", label: "Muebles de cocina" },
      { key: "hasFurnished", label: "Amoblado" },
      { key: "hasJacuzzi", label: "Jacuzzi" },
      { key: "hasPool", label: "Pileta", isLegacy: true },
      { key: "hasSafe", label: "Caja fuerte" },
    ],
  },
  {
    key: "infraestructura",
    label: "Infraestructura",
    visibleFor: ["APARTMENT", "PH", "COMMERCIAL_PROPERTY", "OFFICE"],
    tags: [
      { key: "hasSecurity", label: "Seguridad 24h" },
      { key: "hasSurveillance", label: "Vigilancia" },
      { key: "hasCCTV", label: "Cámaras de seguridad" },
      { key: "hasSharedParking", label: "Cochera cubierta", isLegacy: true },
      { key: "hasDisabledAccess", label: "Acceso para discapacitados" },
      { key: "hasPavement", label: "Pavimento" },
    ],
  },
  {
    key: "amenities",
    label: "Edificio / Amenities",
    visibleFor: ["APARTMENT", "PH"],
    tags: [
      { key: "hasSUM", label: "SUM" },
      { key: "hasGym", label: "Gimnasio" },
      { key: "hasLaundryRoom", label: "Laundry" },
      { key: "hasRoofDeck", label: "Roof deck" },
      { key: "hasGreenSpace", label: "Espacio verde" },
    ],
  },
];

function CategoryGroup({
  category,
  value,
  onChange,
}: {
  category: TagCategory;
  value: Record<string, boolean>;
  onChange: (key: string, next: boolean) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-[11px] font-black uppercase tracking-wider text-urbik-black/60">
          {category.label}
        </span>
        <span className="text-gray-400 font-bold text-sm">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {category.tags.map((tag) => {
            const active = Boolean(value[tag.key]);
            return (
              <button
                key={tag.key}
                type="button"
                onClick={() => onChange(tag.key, !active)}
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
      )}
    </div>
  );
}

export function AmenitiesGrid({
  value,
  onChange,
  propertyType,
}: AmenitiesGridProps) {
  const handleToggle = (key: string, next: boolean) => {
    onChange({ ...value, [key]: next } as Record<string, boolean>);
  };

  const visibleCategories = TAG_CATEGORIES.filter((cat) => {
    if (cat.visibleFor === ALL_TYPES || cat.visibleFor.length === ALL_TYPES.length) {
      return true;
    }
    if (!propertyType) return true;
    return cat.visibleFor.includes(propertyType);
  });

  return (
    <div className="space-y-3">
      <p className="text-xs font-black uppercase tracking-wider text-urbik-black/60 mb-1">
        Características y amenities
      </p>
      {visibleCategories.map((cat) => (
        <CategoryGroup
          key={cat.key}
          category={cat}
          value={value}
          onChange={handleToggle}
        />
      ))}
    </div>
  );
}
