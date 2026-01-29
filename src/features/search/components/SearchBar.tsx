/*
Este componente, llamado SearchBar, es una interfaz de búsqueda interactiva construida
en React que gestiona la entrada de texto del usuario para buscar direcciones o inmobiliarias.
Utiliza un hook personalizado (useSearch) para manejar la lógica del estado, permitiendo que
el campo de texto se actualice en tiempo real, muestre un indicador de carga mientras busca y
despliegue una lista de sugerencias mediante el componente ResultList. Además, incluye una
función de accesibilidad que permite al usuario seleccionar automáticamente la primera
sugerencia de la lista simplemente presionando la tecla Enter.
*/

"use client";

import React from "react";
import { useSearch } from "../hooks/useSearch";
import { ResultList } from "./ResultList";

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
        {isLoading && <div className="animate-spin h-4 w-4 border-2  border-t-transparent rounded-full" />}
      </div>
      
      <ResultList
        suggestions={suggestions}
        isLoading={isLoading}
        onSelect={onSelectSuggestion}
      />
    </div>
  );
};