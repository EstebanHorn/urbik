/*
Este componente de React es un selector de ubicación dependiente que utiliza la API de
Georef Argentina para permitir al usuario elegir una provincia y, posteriormente, una
ciudad basada en esa elección. El código gestiona de forma asíncrona la carga de datos,
el filtrado de municipios por provincia y el estado de los menús desplegables personalizados,
incluyendo funcionalidades avanzadas como el cierre al hacer clic fuera del elemento y una 
navegación mediante teclado que permite desplazarse rápidamente por las listas al presionar
la letra inicial de cada localidad.
*/

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
}

export default function LocationSelectors({
  provinceValue,
  cityValue,
  onChange,
  onCityCoordsChange,
}: LocationSelectorsProps) {
  const [provincias, setProvincias] = useState<GeorefItem[]>([]);
  const [ciudades, setCiudades] = useState<GeorefItem[]>([]);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [openDropdown, setOpenDropdown] =
    useState<"province" | "city" | null>(null);

  const provRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const scrollRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    fetch(
      "https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre"
    )
      .then((res) => res.json())
      .then((data) =>
        setProvincias(
          data.provincias.sort((a: any, b: any) =>
            a.nombre.localeCompare(b.nombre)
          )
        )
      );

    const handleClickOutside = (e: MouseEvent) => {
      if (
        provRef.current &&
        !provRef.current.contains(e.target as Node) &&
        cityRef.current &&
        !cityRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!provinceValue) return;

    setLoadingCiudades(true);

    fetch(
      `https://apis.datos.gob.ar/georef/api/municipios?provincia=${provinceValue}&max=1000&campos=id,nombre,centroide`
    )
      .then((res) => res.json())
      .then((data) => {
        setCiudades(
          data.municipios.sort((a: any, b: any) =>
            a.nombre.localeCompare(b.nombre)
          )
        );
        setLoadingCiudades(false);
      });
  }, [provinceValue]);

  const handleSearchByKey = (
    e: React.KeyboardEvent,
    items: GeorefItem[]
  ) => {
    const char = e.key.toLowerCase();
    if (char.length === 1 && /[a-zñ]/.test(char)) {
      e.preventDefault();
      e.stopPropagation();

      const target = items.find((item) =>
        item.nombre
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .startsWith(char)
      );

      if (target && menuContainerRef.current) {
        const el = scrollRefs.current[target.id];
        if (el) {
          menuContainerRef.current.scrollTo({
            top: el.offsetTop - 10,
            behavior: "smooth",
          });
        }
      }
    }
  };

  const DropdownMenu = ({
    items,
    onSelect,
    isOpen,
  }: {
    items: GeorefItem[];
    onSelect: (item: GeorefItem) => void;
    isOpen: boolean;
  }) => (
    <div
      ref={menuContainerRef}
      tabIndex={0}
      onKeyDown={(e) => handleSearchByKey(e, items)}
      className={`absolute z-50 left-0 mt-2 min-w-[280px] max-h-72 overflow-y-auto rounded-2xl bg-urbik-dark border border-white/10 shadow-2xl transition-all duration-200 outline-none
      ${
        isOpen
          ? "opacity-100 translate-y-0"
          : "pointer-events-none opacity-0 -translate-y-2"
      }`}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          ref={(el) => {
            scrollRefs.current[item.id] = el;
          }}
          type="button"
          onClick={() => onSelect(item)}
          className="w-full text-left px-5 py-3 text-md font-bold text-urbik-white hover:bg-white/10 transition"
        >
          {item.nombre}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      {/* PROVINCIA */}
      <div className="relative flex-1" ref={provRef}>
        <button
          type="button"
          onClick={() =>
            setOpenDropdown(
              openDropdown === "province" ? null : "province"
            )
          }
          className="uppercase w-full flex items-center justify-between rounded-full px-6 py-3 bg-urbik-g300 font-bold"
        >
          {provinceValue || "PROVINCIA"}
          <ChevronDown />
        </button>

        <DropdownMenu
          items={provincias}
          isOpen={openDropdown === "province"}
          onSelect={(item) => {
            onChange("province", item.nombre);
            onChange("city", "");
            onCityCoordsChange?.(null);
            setOpenDropdown(null);
          }}
        />
      </div>

      <div className="relative flex-1" ref={cityRef}>
        <button
          type="button"
          disabled={!provinceValue}
          onClick={() =>
            setOpenDropdown(
              openDropdown === "city" ? null : "city"
            )
          }
          className="uppercase w-full flex items-center justify-between rounded-full px-6 py-3 bg-urbik-g300 font-bold disabled:opacity-30"
        >
          {loadingCiudades ? "..." : cityValue || "CIUDAD"}
          <ChevronDown />
        </button>

        <DropdownMenu
          items={ciudades}
          isOpen={openDropdown === "city"}
          onSelect={(item) => {
              onChange("city", item.nombre);
              // Ya no pasamos el centroide de Georef aquí para evitar errores de precisión
              onCityCoordsChange?.(null); 
              setOpenDropdown(null);
            }}
        />
      </div>
    </div>
  );
}