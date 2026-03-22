"use client";

import React from "react";
import { useSearch } from "../hooks/useSearch";
import { ResultList } from "./ResultList";

export const SearchBar: React.FC = () => {
  const { query, setQuery, suggestions, isLoading, onSelectSuggestion } =
    useSearch();

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
          <div className="animate-spin h-4 w-4 border-2  border-t-transparent rounded-full" />
        )}
      </div>

      <ResultList
        suggestions={suggestions}
        isLoading={isLoading}
        onSelect={onSelectSuggestion}
      />
    </div>
  );
};
