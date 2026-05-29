"use client";

import React from "react";
import { Search } from "lucide-react";
import { useSearch, type SearchSuggestion } from "@/hooks/useSearch";

function getStringField(obj: unknown, key: string): string | null {
  if (!obj || typeof obj !== "object") return null;
  const rec = obj as Record<string, unknown>;
  const v = rec[key];
  return typeof v === "string" ? v : null;
}

function getLabel(s: SearchSuggestion): string {
  if (s.type === "PROPERTY_SEARCH") return s.display_name || "Buscar propiedades";
  const display = getStringField(s, "display_name");
  if (display) {
    const parts = display.split(",");
    return parts.length > 3 ? parts.slice(0, 3).join(",") : display;
  }
  return getStringField(s, "name") || "Resultado sin nombre";
}

function getBadge(s: SearchSuggestion) {
  if (s.type === "PROPERTY_SEARCH") return { label: "Propiedad", className: "bg-violet-100 text-violet-700" };
  if (s.type === "ADDRESS") return { label: "Dirección", className: "bg-blue-50 text-blue-600" };
  return { label: "Inmobiliaria", className: "bg-emerald-50 text-emerald-700" };
}

export const SearchBar: React.FC = () => {
  const { query, setQuery, suggestions, isLoading, onSelectSuggestion } = useSearch();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        onSelectSuggestion(suggestions[0]);
      }
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 py-2 h-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar ciudad, dirección o propiedad..."
          className="w-full bg-transparent text-sm text-urbik-black placeholder:text-urbik-muted italic font-light outline-none pl-1"
        />
        {isLoading ? (
          <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full shrink-0" />
        ) : (
          <Search className="h-4 w-4 text-urbik-muted shrink-0" />
        )}
      </div>

      {(isLoading || suggestions.length > 0) && (
        <ul className="absolute z-50 w-full mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden">
          {isLoading ? (
            <li className="p-4 text-sm text-gray-500 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-urbik-black border-t-transparent rounded-full animate-spin" />
              Buscando...
            </li>
          ) : (
            suggestions.map((suggestion, index) => {
              const badge = getBadge(suggestion);
              const agencyCity = suggestion.type === "REALESTATE_USER" && typeof suggestion.city === "string" && suggestion.city ? suggestion.city : null;

              return (
                <li
                  key={`${suggestion.type}-${index}`}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center text-sm border-b last:border-none border-gray-50"
                  onClick={() => onSelectSuggestion(suggestion)}
                >
                  <div className="flex flex-col overflow-hidden mr-2">
                    <span className="truncate text-gray-800 font-medium">{getLabel(suggestion)}</span>
                    {agencyCity && <span className="text-[11px] text-gray-400 truncate">{agencyCity}</span>}
                  </div>
                  <span className={`shrink-0 ml-2 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};
