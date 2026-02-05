"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface GeorefItem {
  id: string;
  nombre: string;
  centroide?: {
    lat: number;
    lon: number;
  };
}

interface LocationSelectorsProps {
  provinceValue: string;
  cityValue: string;
  onChange: (name: string, value: string) => void;
  onCityCoordsChange?: (coords: { lat: number; lon: number } | null) => void;
  provinceLabel?: string;
  cityLabel?: string;
}

export default function LocationSelectors({
  provinceValue,
  cityValue,
  onChange,
  onCityCoordsChange,
  provinceLabel = "PROVINCIA",
  cityLabel = "CIUDAD",
}: LocationSelectorsProps) {
  const [provincias, setProvincias] = useState<GeorefItem[]>([]);
  const [ciudades, setCiudades] = useState<GeorefItem[]>([]);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"province" | "city" | null>(
    null,
  );

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const provMenuRef = useRef<HTMLDivElement>(null);
  const cityMenuRef = useRef<HTMLDivElement>(null);
  const scrollRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // 1. Cargar Provincias
  useEffect(() => {
    fetch("https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre")
      .then((res) => res.json())
      .then((data) => {
        if (data.provincias) {
          setProvincias(
            data.provincias.sort((a: GeorefItem, b: GeorefItem) =>
              a.nombre.localeCompare(b.nombre),
            ),
          );
        }
      })
      .catch((err) => console.error(err));

    // Manejo de click afuera
    const handleClickOutside = (e: MouseEvent) => {
      // Si el click fue dentro del componente, no hacemos nada (dejamos que el botón maneje su lógica)
      if (
        containerRef.current &&
        containerRef.current.contains(e.target as Node)
      ) {
        return;
      }
      setOpenDropdown(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Cargar Ciudades
  useEffect(() => {
    if (!provinceValue) {
      setCiudades([]);
      return;
    }
    setLoadingCiudades(true);
    const url = `https://apis.datos.gob.ar/georef/api/municipios?provincia=${encodeURIComponent(
      provinceValue,
    )}&max=1000&campos=id,nombre,centroide`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.municipios) {
          setCiudades(
            data.municipios.sort((a: GeorefItem, b: GeorefItem) =>
              a.nombre.localeCompare(b.nombre),
            ),
          );
        }
        setLoadingCiudades(false);
      })
      .catch(() => setLoadingCiudades(false));
  }, [provinceValue]);

  // Manejo de teclado (Search by key)
  const handleSearchByKey = (
    e: React.KeyboardEvent,
    items: GeorefItem[],
    containerMenuRef: React.RefObject<HTMLDivElement | null>,
  ) => {
    const char = e.key.toLowerCase();
    if (char.length === 1 && /[a-zñ]/.test(char)) {
      const target = items.find((item) =>
        item.nombre
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .startsWith(char),
      );
      if (target && containerMenuRef.current) {
        const el = scrollRefs.current[target.id];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  };

  // Sub-componente Dropdown (Internalizado para acceder al scope)
  const renderDropdown = (
    items: GeorefItem[],
    type: "province" | "city",
    menuRef: React.RefObject<HTMLDivElement | null>,
    isLoading = false,
  ) => {
    const isOpen = openDropdown === type;

    return (
      <div
        ref={menuRef}
        tabIndex={0}
        onKeyDown={(e) => handleSearchByKey(e, items, menuRef)}
        // FIX VISUAL: z-50 y manejo de posición
        className={`absolute z-50 left-0 mt-2 min-w-[280px] w-full max-h-72 overflow-y-auto rounded-2xl bg-urbik-black border border-white/10 shadow-2xl transition-all duration-200 outline-none
        ${isOpen ? "opacity-100 translate-y-0 visible pointer-events-auto" : "opacity-0 -translate-y-2 invisible pointer-events-none"}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {isLoading && (
          <div className="p-4 text-center text-white/50 text-sm">
            Cargando...
          </div>
        )}
        {!isLoading && items.length === 0 && (
          <div className="p-4 text-center text-white/50 text-sm">
            Sin resultados
          </div>
        )}

        {!isLoading &&
          items.map((item) => (
            <button
              key={item.id}
              ref={(el) => {
                if (el) scrollRefs.current[item.id] = el;
              }}
              type="button"
              // FIX DE EVENTO: Usamos onMouseDown en lugar de onClick.
              // onMouseDown ocurre antes que el "blur" o el click del document, asegurando la selección.
              onMouseDown={(e) => {
                e.preventDefault(); // Prevenir comportamientos extraños del navegador
                e.stopPropagation(); // Evitar burbujeo innecesario

                if (type === "province") {
                  if (provinceValue !== item.nombre) {
                    onChange("province", item.nombre);
                    onChange("city", "");
                    onCityCoordsChange?.(null);
                  }
                } else {
                  onChange("city", item.nombre);
                  onCityCoordsChange?.(item.centroide || null);
                }
                setOpenDropdown(null); // Cerrar explícitamente después de seleccionar
              }}
              className="w-full text-left cursor-pointer px-5 py-3 text-sm font-bold text-white hover:bg-white/10 transition border-b border-white/5 last:border-0 block"
            >
              {item.nombre}
            </button>
          ))}
      </div>
    );
  };

  return (
    // FIX DE Z-INDEX PADRE: Agregamos 'relative z-30' aquí.
    // Esto eleva todo el componente de selectores por encima de los botones que le siguen en el DOM.
    <div
      className="flex flex-col sm:flex-row gap-3 w-full relative z-30"
      ref={containerRef}
    >
      {/* Selector Provincia */}
      <div className="relative flex-1">
        <button
          type="button"
          onClick={() =>
            setOpenDropdown(openDropdown === "province" ? null : "province")
          }
          className="uppercase w-full cursor-pointer flex items-center justify-between rounded-full px-6 py-4 bg-white/5 border border-gray-200 hover:border-urbik-black font-bold text-urbik-black transition-all text-sm tracking-wide"
        >
          <span className="truncate">{provinceValue || provinceLabel}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${openDropdown === "province" ? "rotate-180" : ""}`}
          />
        </button>
        {renderDropdown(provincias, "province", provMenuRef)}
      </div>

      {/* Selector Ciudad */}
      <div className="relative flex-1">
        <button
          type="button"
          disabled={!provinceValue}
          onClick={() =>
            setOpenDropdown(openDropdown === "city" ? null : "city")
          }
          className={`uppercase w-full cursor-pointer flex items-center justify-between rounded-full px-6 py-4 bg-white/5 border border-gray-200 font-bold text-urbik-black transition-all text-sm tracking-wide
            ${!provinceValue ? "opacity-50 cursor-not-allowed" : "hover:border-urbik-black"}
          `}
        >
          <span className="truncate">
            {loadingCiudades ? "Cargando..." : cityValue || cityLabel}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${openDropdown === "city" ? "rotate-180" : ""}`}
          />
        </button>
        {renderDropdown(ciudades, "city", cityMenuRef, loadingCiudades)}
      </div>
    </div>
  );
}
