/*
Este componente de React, llamado ResultList, se encarga de renderizar una lista
desplegable de sugerencias de búsqueda que muestra un estado de carga (spinner)
mientras se obtienen los datos o una lista de resultados con etiquetas dinámicas.
El código procesa cada sugerencia para extraer un nombre legible mediante la función
getLabel —que recorta nombres muy largos basándose en comas— y clasifica cada ítem
visualmente como "Dirección" o "Inmobiliaria" según su tipo, permitiendo al usuario
seleccionar una opción a través de la propiedad onSelect.
*/

import React from "react";
import { SearchSuggestion } from "../service/searchService";
import { SearchAction } from "../hooks/useSearch";

interface ResultListProps {
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  onSelect: SearchAction["onSelectSuggestion"];
}


function getStringField(obj: unknown, key: string): string | null {
  if (!obj || typeof obj !== "object") return null;
  const rec = obj as Record<string, unknown>;
  const v = rec[key];
  return typeof v === "string" ? v : null;
}

function getLabel(s: SearchSuggestion): string {
  const display = getStringField(s, "display_name");
  if (display) {
    const parts = display.split(",");
    return parts.length > 3 ? parts.slice(0, 3).join(",") : display;
  }

  const name = getStringField(s, "name");
  if (name) return name;

  return "Resultado sin nombre";
}

export const ResultList: React.FC<ResultListProps> = ({
  suggestions,
  isLoading,
  onSelect,
}) => {
  if (isLoading) {
    return (
      <div className="absolute z-50 mt-5 -ml-5 w-full bg-white border border-gray-200 shadow-xl rounded-full overflow-hidden">
        <div className="p-4 text-sm text-gray-500 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-urbik-black border-t-transparent rounded-full animate-spin"></div>
          Buscando...
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <ul className="absolute z-50 w-100  mt-5 bg-white border border-gray-200 shadow-xl rounded-3xl -ml-20 max-h-80 overflow-y-auto overflow-x-hidden">
      {suggestions.map((suggestion, index) => {
        const type = getStringField(suggestion, "type") ?? "";
        const isAddress = type === "ADDRESS";
        const badge = isAddress ? "Dirección" : "Inmobiliaria";

        return (
          <li
            key={`${type}-${index}`}
            className="p-3 cursor-pointer hover:bg-blue-50 transition-colors flex justify-between items-center text-sm border-b last:border-none border-gray-50"
            onClick={() => onSelect(suggestion)}
          >
            <div className="flex items-center overflow-hidden mr-2">
              <span className="truncate text-gray-800 font-medium">
                {getLabel(suggestion)}
              </span>
            </div>
            
            <span className={`
              flex-shrink-0 ml-2 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded
            `}>
              {badge}
            </span>
          </li>
        );
      })}
    </ul>
  );
};