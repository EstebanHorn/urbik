"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import type { PropertyUploadFormData } from "./types";

interface Props {
  rhf: UseFormReturn<PropertyUploadFormData>;
}

export function Module13ContactInfo({ rhf }: Props) {
  const { watch, setValue } = rhf;

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 font-medium">
        Estos datos de contacto se mostrarán en el aviso. Si no los completás,
        se usarán los datos de la inmobiliaria registrada.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
            Nombre del contacto
          </label>
          <input
            type="text"
            placeholder="Nombre completo"
            value={watch("contactName") ?? ""}
            onChange={(e) => setValue("contactName", e.target.value)}
            className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
            Teléfono
          </label>
          <input
            type="tel"
            placeholder="+54 9 11 XXXX XXXX"
            value={watch("contactPhone") ?? ""}
            onChange={(e) => setValue("contactPhone", e.target.value)}
            className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
            Email de contacto
          </label>
          <input
            type="email"
            placeholder="contacto@ejemplo.com"
            value={watch("contactEmail") ?? ""}
            onChange={(e) => setValue("contactEmail", e.target.value)}
            className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
            WhatsApp (opcional)
          </label>
          <input
            type="tel"
            placeholder="+54 9 11 XXXX XXXX"
            value={watch("contactWhatsapp") ?? ""}
            onChange={(e) => setValue("contactWhatsapp", e.target.value)}
            className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(watch("showAgencyContact"))}
          onChange={(e) => setValue("showAgencyContact", e.target.checked)}
        />
        <span className="text-sm font-semibold text-urbik-black/70">
          Mostrar también los datos de contacto de la inmobiliaria
        </span>
      </label>
    </div>
  );
}
