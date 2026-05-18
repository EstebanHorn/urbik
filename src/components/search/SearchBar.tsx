"use client";

import React from "react";
import { useSearch, type SearchSuggestion } from "@/hooks/useSearch";

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
  return getStringField(s, "name") || "Resultado sin nombre";
}

export const SearchBar: React.FC = () => {
  const { query, setQuery, suggestions, isLoading, onSelectSuggestion } = useSearch();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      onSelectSuggestion(suggestions[0]);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center border-gray-200 py-2 h-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar dirección o inmobiliaria..."
          className="w-full bg-transparent text-sm text-urbik-black placeholder:text-urbik-muted italic font-light outline-none pl-1"
        />
        {isLoading && (
          <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full" />
        )}
      </div>

      {isLoading ? (
        <div className="absolute z-50 mt-5 -ml-5 w-full bg-white border border-gray-200 shadow-xl rounded-full overflow-hidden">
          <div className="p-4 text-sm text-gray-500 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-urbik-black border-t-transparent rounded-full animate-spin"></div>
            Buscando...
          </div>
        </div>
      ) : suggestions.length > 0 ? (
        <ul className="absolute z-50 w-100 mt-5 bg-white border border-gray-200 shadow-xl rounded-3xl -ml-20 max-h-80 overflow-y-auto overflow-x-hidden">
          {suggestions.map((suggestion, index) => {
            const type = getStringField(suggestion, "type") ?? "";
            const isAddress = type === "ADDRESS";
            const agencyCity = !isAddress && typeof suggestion.city === "string" && suggestion.city ? suggestion.city : null;

            return (
              <li
                key={`${type}-${index}`}
                className="p-3 cursor-pointer hover:bg-blue-50 transition-colors flex justify-between items-center text-sm border-b last:border-none border-gray-50"
                onClick={() => onSelectSuggestion(suggestion)}
              >
                <div className="flex flex-col overflow-hidden mr-2">
                  <span className="truncate text-gray-800 font-medium">{getLabel(suggestion)}</span>
                  {agencyCity && <span className="text-[11px] text-gray-400 truncate">{agencyCity}</span>}
                </div>
                <span className="shrink-0 ml-2 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">
                  {isAddress ? "Dirección" : "Inmobiliaria"}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};