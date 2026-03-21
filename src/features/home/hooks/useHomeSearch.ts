import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FeaturedProperty, propertyService } from "../service/propertyService";
import { useSearchAutocomplete } from "@/features/search/hooks/useSearchAutocomplete";

interface ParsedSearchFilters {
  propertyType: string | null;
  operationType: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  city: string | null;
  province: string | null;
  rooms: number | null;
  bathrooms: number | null;
  amenities: Partial<
    Record<
      | "hasWater"
      | "hasElectricity"
      | "hasGas"
      | "hasInternet"
      | "hasParking"
      | "hasPool"
      | "hasBalcony"
      | "hasGrill"
      | "hasGarden"
      | "hasLaundry"
      | "hasAirConditioning",
      boolean
    >
  >;
}

export function useHomeSearch() {
  const router = useRouter();
  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    onSelectSuggestion,
  } = useSearchAutocomplete();

  const [operation, setOperation] = useState<"SALE" | "RENT">("SALE");
  const [propertyType, setPropertyType] = useState("HOUSE");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );

  const [featuredProperties, setFeaturedProperties] = useState<
    FeaturedProperty[]
  >([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [buttonData, setButtonData] = useState({ width: 0, x: 0 });

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await propertyService.getFeaturedProperties();
        setFeaturedProperties(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchFeatured();
  }, []);

  useEffect(() => {
    if (featuredProperties.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredProperties.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [featuredProperties]);

  const handleSearch = async () => {
    const params = new URLSearchParams();
    const trimmedQuery = query.trim();

    let parsed: ParsedSearchFilters | null = null;

    if (trimmedQuery) {
      try {
        const response = await fetch(
          `/api/search/parse?q=${encodeURIComponent(trimmedQuery)}`,
        );

        if (response.ok) {
          const data = await response.json();
          parsed = data.parsed as ParsedSearchFilters;
        }
      } catch (error) {
        console.error("Error parsing search query:", error);
      }
    }

    const resolvedOperation = parsed?.operationType || operation;
    const resolvedPropertyType = parsed?.propertyType || propertyType;
    const resolvedCity = parsed?.city || city;
    const resolvedProvince = parsed?.province || province;
    const hasDetectedLocation = Boolean(parsed?.city || parsed?.province);

    if (resolvedOperation) params.set("operationType", resolvedOperation);
    if (resolvedPropertyType) params.set("propertyType", resolvedPropertyType);

    if (parsed?.minPrice) params.set("minPrice", parsed.minPrice.toString());
    if (parsed?.maxPrice) params.set("maxPrice", parsed.maxPrice.toString());
    if (parsed?.rooms) params.set("rooms", parsed.rooms.toString());
    if (parsed?.bathrooms)
      params.append("bathrooms", parsed.bathrooms.toString());

    if (parsed?.amenities) {
      Object.entries(parsed.amenities).forEach(([key, value]) => {
        if (value) params.set(key, "true");
      });
    }

    if (trimmedQuery) params.set("q", trimmedQuery);

    let resolvedCoords = coords;

    if (!resolvedCoords && hasDetectedLocation) {
      const locationQuery = [resolvedCity, resolvedProvince]
        .filter(Boolean)
        .join(", ");

      if (locationQuery) {
        try {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(locationQuery)}`,
          );

          if (response.ok) {
            const data = await response.json();
            const firstAddress = (data.suggestions || []).find(
              (item: { type?: string; lat?: number; lon?: number }) =>
                item.type === "ADDRESS" && item.lat && item.lon,
            );

            if (firstAddress) {
              resolvedCoords = {
                lat: Number(firstAddress.lat),
                lon: Number(firstAddress.lon),
              };
            }
          }
        } catch (error) {
          console.error("Error resolving detected location:", error);
        }
      }
    }

    if (resolvedCoords) {
      params.set("lat", resolvedCoords.lat.toString());
      params.set("lon", resolvedCoords.lon.toString());
      if (resolvedCity) params.set("city", resolvedCity);
      if (resolvedProvince) params.set("province", resolvedProvince);
    } else if (coords && !hasDetectedLocation) {
      params.set("lat", coords.lat.toString());
      params.set("lon", coords.lon.toString());
      if (resolvedCity) params.set("city", resolvedCity);
      if (resolvedProvince) params.set("province", resolvedProvince);
    } else {
      if (resolvedProvince) params.set("province", resolvedProvince);
      if (resolvedCity) params.set("city", resolvedCity);
    }

    router.push(`/map?${params.toString()}`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    setFeaturedProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)),
    );

    const success = await propertyService.toggleFavorite(id);

    if (!success) {
      setFeaturedProperties((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isFavorite: !p.isFavorite } : p,
        ),
      );
    }
  };

  const updatePill = (element: HTMLButtonElement | null) => {
    if (element) {
      setButtonData({ width: element.offsetWidth, x: element.offsetLeft });
    }
  };

  return {
    query,
    setQuery,
    operation,
    setOperation,
    propertyType,
    setPropertyType,
    province,
    setProvince,
    city,
    setCity,
    coords,
    setCoords,
    featuredProperties,
    loadingFeatured,
    currentIndex,
    buttonData,
    updatePill,
    suggestions,
    isLoading,
    onSelectSuggestion,
    handleSearch,
    handleToggleFavorite,
  };
}
