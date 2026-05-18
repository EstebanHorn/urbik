import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface SearchSuggestion {
  type: "ADDRESS" | "REALESTATE_USER" | string;
  id?: string | number;
  display_name?: string;
  name?: string;
  lat?: number;
  lon?: number;
  city?: string | null;
  province?: string;
  fullLabel?: string;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error("Error:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const clearAutocomplete = useCallback(() => {
    setQuery("");
    setSuggestions([]);
  }, []);

  const onSelectSuggestion = useCallback((suggestion: SearchSuggestion) => {
    clearAutocomplete();
    if (suggestion.type === "ADDRESS" && suggestion.lat && suggestion.lon) {
      const q = encodeURIComponent(suggestion.display_name || "");
      router.push(`/properties?lat=${suggestion.lat}&lon=${suggestion.lon}&zoom=16&q=${q}`);
    } else if (suggestion.type === "REALESTATE_USER" && suggestion.id) {
      router.push(`/realestate/${suggestion.id}`);
    }
  }, [clearAutocomplete, router]);

  return {
    query, setQuery, suggestions, isLoading, onSelectSuggestion, setSuggestions, clearAutocomplete,
  };
}