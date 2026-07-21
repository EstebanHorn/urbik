"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import geoData from "@/data/argentina-geo.json";

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
  localityValue?: string;
  onChange: (name: string, value: string) => void;
  onCityCoordsChange?: (coords: { lat: number; lon: number } | null) => void;
  provinceLabel?: string;
  cityLabel?: string;
  localityLabel?: string;
  cityApiEndpoint?: "municipios" | "departamentos";
  showLocality?: boolean;
  /** "grid3": Provincia/Departamento/Ciudad en una sola fila de 3 columnas (desktop). Default: apiladas. */
  layout?: "stack" | "grid3";
}

// Definido a nivel de módulo (identidad estable entre renders) para que el
// menú no se desmonte/remonte en cada render del padre. Antes estaba declarado
// dentro del componente: cualquier re-render recreaba el componente, React
// remontaba el DOM y el scroll del listado volvía solo hacia arriba.
function DropdownMenu({
  items,
  onSelect,
  isOpen,
  menuRef,
  scrollRefs,
}: {
  items: GeorefItem[];
  onSelect: (item: GeorefItem) => void;
  isOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  scrollRefs: React.RefObject<Record<string, HTMLButtonElement | null>>;
}) {
  const handleSearchByKey = (e: React.KeyboardEvent) => {
    const char = e.key.toLowerCase();
    if (char.length === 1 && /[a-zñ]/.test(char)) {
      const target = items.find((item) =>
        item.nombre
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .startsWith(char),
      );

      if (target && menuRef.current) {
        const el = scrollRefs.current[target.id];
        if (el) {
          menuRef.current.scrollTo({
            top: el.offsetTop,
            behavior: "smooth",
          });
        }
      }
    }
  };

  return (
    <div
      ref={menuRef}
      tabIndex={0}
      onKeyDown={handleSearchByKey}
      className={`absolute z-50 left-0 mt-2 min-w-[280px] max-h-72 overflow-y-auto rounded-2xl bg-geora-dark border border-white/10 shadow-2xl transition-all duration-200 outline-none
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
          className="w-full text-left cursor-pointer px-5 py-3 text-md font-bold text-geora-white hover:bg-white/10 transition"
        >
          {item.nombre}
        </button>
      ))}
    </div>
  );
}

export default function LocationSelectors({
  provinceValue,
  cityValue,
  localityValue,
  onChange,
  onCityCoordsChange,
  provinceLabel = "PROVINCIA",
  cityLabel = "CIUDAD",
  localityLabel = "LOCALIDAD",
  cityApiEndpoint = "municipios",
  showLocality = false,
  layout = "stack",
}: LocationSelectorsProps) {
  const [localidades, setLocalidades] = useState<GeorefItem[]>([]);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [hasLocalidades, setHasLocalidades] = useState(true);

  const provincias = geoData.provincias as GeorefItem[];
  const ciudades: GeorefItem[] = provinceValue
    ? ((geoData.departamentos as Record<string, GeorefItem[]>)[provinceValue] ?? [])
    : [];
  const [openDropdown, setOpenDropdown] = useState<"province" | "city" | "locality" | null>(null);

  const provRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const localityRef = useRef<HTMLDivElement>(null);

  const provMenuRef = useRef<HTMLDivElement>(null);
  const cityMenuRef = useRef<HTMLDivElement>(null);
  const localityMenuRef = useRef<HTMLDivElement>(null);

  const scrollRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        provRef.current &&
        !provRef.current.contains(e.target as Node) &&
        cityRef.current &&
        !cityRef.current.contains(e.target as Node) &&
        (!localityRef.current || !localityRef.current.contains(e.target as Node))
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

useEffect(() => {
    if (!showLocality || !cityValue) {
      setLocalidades([]);
      setHasLocalidades(true);
      return;
    }

    const depts = provinceValue
      ? ((geoData.departamentos as Record<string, GeorefItem[]>)[provinceValue] ?? [])
      : [];
    const cityItem = depts.find((c) => c.nombre === cityValue);
    const deptParam = cityItem?.id ?? cityValue;

    setLoadingLocalidades(true);
    fetch(
      `https://apis.datos.gob.ar/georef/api/localidades?departamento=${encodeURIComponent(deptParam)}&max=1000&campos=id,nombre`,
    )
      .then((res) => res.json())
      .then((data) => {
        const items = data.localidades || [];
        
        // --- FILTRO DE DUPLICADOS ---
        // Usamos un Map para quedarnos con un solo registro por nombre
        const uniqueItems = Array.from(
          new Map(items.map((item: GeorefItem) => [item.nombre, item])).values()
        );

        setLocalidades(
          uniqueItems.sort((a: GeorefItem, b: GeorefItem) =>
            a.nombre.localeCompare(b.nombre),
          ),
        );
        setHasLocalidades(uniqueItems.length > 0);
        setLoadingLocalidades(false);
      })
      .catch(() => {
        setLocalidades([]);
        setHasLocalidades(false);
        setLoadingLocalidades(false);
      });
  }, [cityValue, showLocality, provinceValue]);
  useEffect(() => {
    if (openDropdown === "province" && provMenuRef.current) {
      provMenuRef.current.focus();
    } else if (openDropdown === "city" && cityMenuRef.current) {
      cityMenuRef.current.focus();
    } else if (openDropdown === "locality" && localityMenuRef.current) {
      localityMenuRef.current.focus();
    }
  }, [openDropdown]);

  return (
    <div
      className={
        layout === "grid3"
          ? "grid grid-cols-1 sm:grid-cols-3 gap-3 w-full"
          : `flex flex-col gap-2 w-full ${showLocality ? "flex-wrap" : ""}`
      }
    >
      <div className="relative flex-1" ref={provRef}>
        <button
          type="button"
          onClick={() =>
            setOpenDropdown(openDropdown === "province" ? null : "province")
          }
          className="uppercase w-full cursor-pointer flex items-center justify-between rounded-full px-6 py-3 mb-2 bg-white/30 shadow-md border border-white font-bold"
        >
          {provinceValue || provinceLabel}
          <ChevronDown />
        </button>

        <DropdownMenu
          items={provincias}
          isOpen={openDropdown === "province"}
          menuRef={provMenuRef}
          scrollRefs={scrollRefs}
          onSelect={(item) => {
            onChange("province", item.nombre);
            onChange("city", "");
            if (showLocality) onChange("locality", "");
            onCityCoordsChange?.(null);
            setOpenDropdown(null);
          }}
        />
      </div>

      <div className="relative flex-1" ref={cityRef}>
        <button
          type="button"
          disabled={!provinceValue || ciudades.length === 0}
          onClick={() =>
            setOpenDropdown(openDropdown === "city" ? null : "city")
          }
          className="uppercase w-full cursor-pointer flex items-center justify-between rounded-full px-6 py-3 mb-2 shadow-md bg-white/30 border border-white font-bold disabled:opacity-30"
        >
          {provinceValue && ciudades.length === 0 ? "SIN DATOS" : cityValue || cityLabel}
          <ChevronDown />
        </button>

        {ciudades.length > 0 && (
          <DropdownMenu
            items={ciudades}
            isOpen={openDropdown === "city"}
            menuRef={cityMenuRef}
            scrollRefs={scrollRefs}
            onSelect={(item) => {
              onChange("city", item.nombre);
              if (showLocality) onChange("locality", "");
              onCityCoordsChange?.(item.centroide || null);
              setOpenDropdown(null);
            }}
          />
        )}
      </div>

      {showLocality && (
        <div className="relative flex-1 min-w-[200px]" ref={localityRef}>
          <button
            type="button"
            disabled={!cityValue || !hasLocalidades}
            onClick={() =>
              setOpenDropdown(openDropdown === "locality" ? null : "locality")
            }
            className="uppercase w-full cursor-pointer flex items-center justify-between rounded-full px-6 py-3 mb-2 shadow-md bg-white/30 border border-white font-bold disabled:opacity-30"
          >
            {loadingLocalidades ? "..." : !hasLocalidades && cityValue ? "SIN DATOS" : localityValue || localityLabel}
            <ChevronDown />
          </button>

          {hasLocalidades && (
            <DropdownMenu
              items={localidades}
              isOpen={openDropdown === "locality"}
              menuRef={localityMenuRef}
              scrollRefs={scrollRefs}
              onSelect={(item) => {
                onChange("locality", item.nombre);
                setOpenDropdown(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
