import { useEffect, useState } from "react";

export interface SearchSuggestion {
  type: "ADDRESS" | "REALESTATE_USER" | string;
  id?: string | number;
  display_name?: string;
  name?: string;
  lat?: number;
  lon?: number;
  /** City of the address result (ADDRESS type) or agency headquarters (REALESTATE_USER type) */
  city?: string | null;
  province?: string;
  fullLabel?: string;
}

export function useAutocompleteSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  return { suggestions, isLoading, setSuggestions };
}

