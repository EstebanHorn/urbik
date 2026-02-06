/*
Este código define un hook personalizado en React (useSearch) diseñado para gestionar
la lógica de una barra de búsqueda con autocompletado. Su función principal es realizar
peticiones asíncronas a una API cada vez que el usuario escribe, incorporando un debouncing
de 300ms para evitar saturar el servidor con consultas innecesarias. Además, maneja de forma
inteligente la navegación: si el usuario selecciona una dirección, lo redirige al mapa con
coordenadas específicas, y si selecciona un perfil inmobiliario, lo envía a la página del
usuario correspondiente.
*/
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchSuggestion {
  type: "ADDRESS" | "REALESTATE_USER" | string;
  lat?: number;
  lon?: number;
  id?: string | number;
  [key: string]: unknown;
}

export const useSearch = () => {
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
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
        );
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

  const onSelectSuggestion = (suggestion: SearchSuggestion) => {
    setQuery("");
    setSuggestions([]);

    if (suggestion.type === "ADDRESS" && suggestion.lat && suggestion.lon) {
      router.push(`/map?lat=${suggestion.lat}&lon=${suggestion.lon}&zoom=16`);
    } else if (suggestion.type === "REALESTATE_USER" && suggestion.id) {
      router.push(`/profile/${suggestion.id}`);
    }
  };

  return { query, setQuery, suggestions, isLoading, onSelectSuggestion };
};
