import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FeaturedProperty, propertyService } from "../service/propertyService";

export function useHomeSearch() {
  const router = useRouter();

  // Estados
  const [query, setQuery] = useState("");
  const [operation, setOperation] = useState<"SALE" | "RENT">("SALE");
  // SUGERENCIA: Si quieres buscar "cualquier cosa" por texto, considera que el default sea "" o maneja "HOUSE" como filtro activo.
  const [propertyType, setPropertyType] = useState("HOUSE");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );

  // Estados UI / Datos
  const [featuredProperties, setFeaturedProperties] = useState<
    FeaturedProperty[]
  >([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [buttonData, setButtonData] = useState({ width: 0, x: 0 });

  // Fetch inicial y Carrusel (Sin cambios)
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

  // --- LÓGICA DE BÚSQUEDA MEJORADA ---
  const handleSearch = () => {
    const params = new URLSearchParams();

    // Siempre enviamos la operación y el tipo si existen (son filtros base)
    if (operation) params.set("operationType", operation);
    if (propertyType) params.set("propertyType", propertyType);

    // Búsqueda por texto (Inmobiliaria / Dirección)
    if (query.trim()) params.set("q", query.trim());

    // Ubicación: Priorizamos coordenadas si existen para mayor precisión
    if (coords) {
      params.set("lat", coords.lat.toString());
      params.set("lon", coords.lon.toString());
      // Opcional: enviar ciudad/provincia como fallback visual o SEO
      if (city) params.set("city", city);
      if (province) params.set("province", province);
    } else {
      // Si no hay coordenadas exactas, usamos los strings
      if (province) params.set("province", province);
      if (city) params.set("city", city);
    }

    router.push(`/map?${params.toString()}`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Optimistic UI update
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
    handleSearch,
    handleToggleFavorite,
  };
}
