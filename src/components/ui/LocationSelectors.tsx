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
  localityValue?: string;
  onChange: (name: string, value: string) => void;
  onCityCoordsChange?: (coords: { lat: number; lon: number } | null) => void;
  provinceLabel?: string;
  cityLabel?: string;
  localityLabel?: string;
  cityApiEndpoint?: "municipios" | "departamentos";
  showLocality?: boolean;
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
}: LocationSelectorsProps) {
  const [provincias, setProvincias] = useState<GeorefItem[]>([]);
  const [ciudades, setCiudades] = useState<GeorefItem[]>([]);
  const [localidades, setLocalidades] = useState<GeorefItem[]>([]);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [hasCities, setHasCities] = useState(true);
  const [hasLocalidades, setHasLocalidades] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<"province" | "city" | "locality" | null>(null);

  const provRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const localityRef = useRef<HTMLDivElement>(null);

  const provMenuRef = useRef<HTMLDivElement>(null);
  const cityMenuRef = useRef<HTMLDivElement>(null);
  const localityMenuRef = useRef<HTMLDivElement>(null);

  const scrollRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    fetch("https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.provincias)) {
          setProvincias(
            data.provincias.sort((a: GeorefItem, b: GeorefItem) =>
              a.nombre.localeCompare(b.nombre),
            ),
          );
        } else {
          console.warn("API responded, but 'provincias' array is missing:", data);
          setProvincias([]);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch provinces:", error);
        setProvincias([]);
      });

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
    if (!provinceValue) {
      setCiudades([]);
      setHasCities(true);
      return;
    }
    setLoadingCiudades(true);
    const endpoint = cityApiEndpoint === "departamentos"
      ? `https://apis.datos.gob.ar/georef/api/departamentos?provincia=${encodeURIComponent(provinceValue)}&max=200&campos=id,nombre`
      : `https://apis.datos.gob.ar/georef/api/municipios?provincia=${encodeURIComponent(provinceValue)}&max=1000&campos=id,nombre,centroide`;
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        const items = data.departamentos || data.municipios || [];
        setCiudades(
          items.sort((a: GeorefItem, b: GeorefItem) =>
            a.nombre.localeCompare(b.nombre),
          ),
        );
        setHasCities(items.length > 0);
        setLoadingCiudades(false);
      })
      .catch(() => {
        setCiudades([]);
        setHasCities(false);
        setLoadingCiudades(false);
      });
  }, [provinceValue, cityApiEndpoint]);

  useEffect(() => {
    if (!showLocality || !cityValue) {
      setLocalidades([]);
      setHasLocalidades(true);
      return;
    }
    setLoadingLocalidades(true);
    fetch(
      `https://apis.datos.gob.ar/georef/api/localidades?departamento=${encodeURIComponent(cityValue)}&max=1000&campos=id,nombre`,
    )
      .then((res) => res.json())
      .then((data) => {
        const items = data.localidades || [];
        setLocalidades(
          items.sort((a: GeorefItem, b: GeorefItem) =>
            a.nombre.localeCompare(b.nombre),
          ),
        );
        setHasLocalidades(items.length > 0);
        setLoadingLocalidades(false);
      })
      .catch(() => {
        setLocalidades([]);
        setHasLocalidades(false);
        setLoadingLocalidades(false);
      });
  }, [cityValue, showLocality]);

  useEffect(() => {
    if (openDropdown === "province" && provMenuRef.current) {
      provMenuRef.current.focus();
    } else if (openDropdown === "city" && cityMenuRef.current) {
      cityMenuRef.current.focus();
    } else if (openDropdown === "locality" && localityMenuRef.current) {
      localityMenuRef.current.focus();
    }
  }, [openDropdown]);

  const handleSearchByKey = (
    e: React.KeyboardEvent,
    items: GeorefItem[],
    containerRef: React.RefObject<HTMLDivElement | null>,
  ) => {
    const char = e.key.toLowerCase();
    if (char.length === 1 && /[a-zñ]/.test(char)) {
      const target = items.find((item) =>
        item.nombre
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .startsWith(char),
      );

      if (target && containerRef.current) {
        const el = scrollRefs.current[target.id];
        if (el) {
          containerRef.current.scrollTo({
            top: el.offsetTop,
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
    menuRef,
  }: {
    items: GeorefItem[];
    onSelect: (item: GeorefItem) => void;
    isOpen: boolean;
    menuRef: React.RefObject<HTMLDivElement | null>;
  }) => (
    <div
      ref={menuRef}
      tabIndex={0}
      onKeyDown={(e) => handleSearchByKey(e, items, menuRef)}
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
          className="w-full text-left cursor-pointer px-5 py-3 text-md font-bold text-urbik-white hover:bg-white/10 transition"
        >
          {item.nombre}
        </button>
      ))}
    </div>
  );

  return (
    <div className={`flex flex-col gap-2 w-full ${showLocality ? "flex-wrap" : ""}`}>
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
          disabled={!provinceValue || !hasCities}
          onClick={() =>
            setOpenDropdown(openDropdown === "city" ? null : "city")
          }
          className="uppercase w-full cursor-pointer flex items-center justify-between rounded-full px-6 py-3 mb-2 bg-white/30 border border-white font-bold disabled:opacity-30"
        >
          {loadingCiudades ? "..." : !hasCities && provinceValue ? "SIN DATOS" : cityValue || cityLabel}
          <ChevronDown />
        </button>

        {hasCities && (
          <DropdownMenu
            items={ciudades}
            isOpen={openDropdown === "city"}
            menuRef={cityMenuRef}
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
            className="uppercase w-full cursor-pointer flex items-center justify-between rounded-full px-6 py-3 mb-2 bg-white/30 border border-white font-bold disabled:opacity-30"
          >
            {loadingLocalidades ? "..." : !hasLocalidades && cityValue ? "SIN DATOS" : localityValue || localityLabel}
            <ChevronDown />
          </button>

          {hasLocalidades && (
            <DropdownMenu
              items={localidades}
              isOpen={openDropdown === "locality"}
              menuRef={localityMenuRef}
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
