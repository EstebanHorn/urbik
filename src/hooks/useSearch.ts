import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface ParsedFilters {
  propertyType: string | null;
  operationType: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  city: string | null;
  province: string | null;
  rooms: number | null;
  bathrooms: number | null;
  amenities: Record<string, boolean>;
  hasStructuredFilters: boolean;
}

export interface SearchSuggestion {
  type: "ADDRESS" | "REALESTATE_USER" | "PROPERTY_SEARCH" | string;
  id?: string | number;
  display_name?: string;
  name?: string;
  lat?: number;
  lon?: number;
  city?: string | null;
  province?: string;
  fullLabel?: string;
  parsedFilters?: ParsedFilters;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const [searchResponse, parseResponse] = await Promise.all([
          fetch(`/api/search?q=${encodeURIComponent(query)}`),
          fetch(`/api/search/parse?q=${encodeURIComponent(query)}`),
        ]);
        const searchData = await searchResponse.json();
        const parseData = await parseResponse.json();

        const addressSuggestions: SearchSuggestion[] = searchData.suggestions || [];
        const parsed = parseData.parsed as ParsedFilters | null;

        const all: SearchSuggestion[] = [];
        if (parsed?.hasStructuredFilters) {
          all.push({ type: "PROPERTY_SEARCH", display_name: query, parsedFilters: parsed });
        }
        all.push(...addressSuggestions);
        setSuggestions(all);
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
    } else if (suggestion.type === "PROPERTY_SEARCH" && suggestion.parsedFilters) {
      const f = suggestion.parsedFilters;
      const params = new URLSearchParams();
      if (f.propertyType) params.set("propertyType", f.propertyType);
      if (f.operationType) params.set("operationType", f.operationType);
      if (f.city) params.set("city", f.city);
      if (f.province) params.set("province", f.province);
      if (f.rooms) params.set("rooms", String(f.rooms));
      if (f.bathrooms) params.set("bathrooms", String(f.bathrooms));
      if (f.minPrice) params.set("minPrice", String(f.minPrice));
      if (f.maxPrice) params.set("maxPrice", String(f.maxPrice));
      if (suggestion.display_name) params.set("q", suggestion.display_name);
      Object.entries(f.amenities || {}).forEach(([key, value]) => {
        if (value) params.set(key, "true");
      });
      router.push(`/properties?${params.toString()}`);
    }
  }, [clearAutocomplete, router]);

  return {
    query, setQuery, suggestions, isLoading, onSelectSuggestion, setSuggestions, clearAutocomplete,
  };
}