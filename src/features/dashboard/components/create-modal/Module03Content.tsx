"use client";

import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import type { PropertyUploadFormData } from "./types";

interface Props {
  rhf: UseFormReturn<PropertyUploadFormData>;
}

const TITLE_TIPS = [
  "Utilizá un título corto (7 a 8 palabras) y descriptivo.",
  "No utilices demasiadas abreviaturas.",
  "Resaltá las características principales de la propiedad.",
  "Mencioná qué diferencia a esta propiedad del resto.",
  "Revisá la ortografía y redacción.",
];

export function Module03Content({ rhf }: Props) {
  const { watch, setValue } = rhf;
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-2 ml-1">
          <label className="text-sm font-bold text-urbik-black/50">
            Título del aviso *
          </label>
          <button
            type="button"
            onClick={() => setShowTips((v) => !v)}
            className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black flex items-center justify-center hover:bg-amber-200 transition-colors shrink-0"
          >
            ?
          </button>
        </div>
        <input
          type="text"
          placeholder="Ej: Departamento 3 amb con pileta en La Plata"
          value={watch("title") ?? ""}
          onChange={(e) => setValue("title", e.target.value)}
          className="bg-white text-urbik-black/60 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
        />
        {showTips && (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-[10px] font-black uppercase text-amber-700 tracking-wider mb-1">
              Consejos para un buen título
            </p>
            <ul className="text-xs text-amber-800 font-medium space-y-0.5">
              {TITLE_TIPS.map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
          Descripción
        </label>
        <textarea
          rows={6}
          placeholder="Describí los puntos fuertes de la propiedad..."
          value={watch("description") ?? ""}
          onChange={(e) => setValue("description", e.target.value)}
          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-urbik-black outline-none transition-all text-sm bg-gray-50 focus:bg-white resize-none"
        />
        <p className="text-[10px] text-gray-400 font-medium mt-1 ml-1">
          Una buena descripción mejora el posicionamiento SEO del aviso.
        </p>
      </div>
    </div>
  );
}
