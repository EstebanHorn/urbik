import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SearchSuggestion,
  useAutocompleteSuggestions,
} from "./useAutocompleteSuggestions";

export function useSearchAutocomplete() {
  const [query, setQuery] = useState("");
  const { suggestions, isLoading, setSuggestions } =
    useAutocompleteSuggestions(query);
  const router = useRouter();

  const clearAutocomplete = useCallback(() => {
    setQuery("");
    setSuggestions([]);
  }, [setSuggestions]);

  const onSelectSuggestion = useCallback(
    (suggestion: SearchSuggestion) => {
      clearAutocomplete();

      if (suggestion.type === "ADDRESS" && suggestion.lat && suggestion.lon) {
        router.push(`/map?lat=${suggestion.lat}&lon=${suggestion.lon}&zoom=16`);
        return;
      }

      if (suggestion.type === "REALESTATE_USER" && suggestion.id) {
        router.push(`/realestate/${suggestion.id}`);
      }
    },
    [clearAutocomplete, router],
  );

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    onSelectSuggestion,
    setSuggestions,
    clearAutocomplete,
  };
}
