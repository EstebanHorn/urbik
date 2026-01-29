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
  
  const [query, setQuery] = useState("");
  const [operation, setOperation] = useState<"SALE" | "RENT">("SALE");
  const [propertyType, setPropertyType] = useState("COMMERCIAL");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [featuredProperties, setFeaturedProperties] = useState<FeaturedProperty[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [buttonData, setButtonData] = useState({ width: 10, x: 0 });

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

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("operationType", operation);
    params.set("type", propertyType);
    if (province) params.set("province", province);
    if (city) params.set("city", city);
    if (query) params.set("q", query);
    router.push(`/map?${params.toString()}`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setFeaturedProperties(prev =>
      prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
    );

    const success = await propertyService.toggleFavorite(id);
    if (!success) {
      setFeaturedProperties(prev =>
        prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
      );
      alert("No se pudo guardar la propiedad.");
    }
  };

  const updatePill = (element: HTMLButtonElement | null) => {
    if (element) {
      setButtonData({ width: element.offsetWidth, x: element.offsetLeft });
    }
  };

  return {
    query, setQuery,
    operation, setOperation,
    propertyType, setPropertyType,
    province, setProvince,
    city, setCity,
    featuredProperties,
    loadingFeatured,
    currentIndex,
    buttonData,
    updatePill,
    handleSearch,
    handleToggleFavorite
  };
}