/*
Este hook personalizado de React, denominado useHomeSearch, centraliza la lógica de búsqueda
y visualización de una página de inicio inmobiliaria mediante la gestión de estados para
filtros (tipo de operación, ubicación y categoría), la obtención y rotación automática de
propiedades destacadas cada siete segundos, y la funcionalidad de marcar favoritos de forma
optimista. Además, facilita la navegación hacia una página de resultados mediante la
construcción de parámetros de búsqueda en la URL y proporciona datos para elementos visuales
de la interfaz, como el posicionamiento dinámico de indicadores en botones y el control de
carga de datos externos a través de un servicio dedicado.
*/

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FeaturedProperty, propertyService } from "../service/propertyService";

export function useHomeSearch() {
  const router = useRouter();

  // Estados de Filtros
  const [query, setQuery] = useState("");
  const [operation, setOperation] = useState<"SALE" | "RENT">("SALE");
  const [propertyType, setPropertyType] = useState("HOUSE"); // Default más común
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");

  // NUEVO: Estado para coordenadas (para centrar el mapa)
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );

  // Estados de UI / Datos
  const [featuredProperties, setFeaturedProperties] = useState<
    FeaturedProperty[]
  >([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [buttonData, setButtonData] = useState({ width: 0, x: 0 });

  // Carga de propiedades destacadas
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

  // Rotación del carrusel
  useEffect(() => {
    if (featuredProperties.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredProperties.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [featuredProperties]);

  // --- LÓGICA DE BÚSQUEDA ---
  const handleSearch = () => {
    const params = new URLSearchParams();

    // 1. Filtros básicos
    params.set("operationType", operation);
    params.set("propertyType", propertyType); // Corregido: 'type' -> 'propertyType'

    // 2. Ubicación (Texto y Coordenadas)
    if (province) params.set("province", province);
    if (city) params.set("city", city);

    // Si tenemos coordenadas elegidas, las pasamos para centrar el mapa
    if (coords) {
      params.set("lat", coords.lat.toString());
      params.set("lon", coords.lon.toString());
    }

    if (query) params.set("q", query);

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
      // Revertir si falla
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
    setCoords, // Exportamos esto para SearchSection
    featuredProperties,
    loadingFeatured,
    currentIndex,
    buttonData,
    updatePill,
    handleSearch,
    handleToggleFavorite,
  };
}
