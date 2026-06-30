"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  Suspense,
} from "react";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  Map,
  SlidersHorizontal,
  Menu,
  List,
  X,
  ChevronDown,
  Home,
  Key,
  PlusCircle,
  User,
  Shield,
  Network,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

import GeoraLogo from "@/assets/Geora_Logo.svg";
import GeoraLogo2 from "@/assets/Geora_Logo_Mini.svg";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { createClient } from "@/lib/supabase/client";
import { useSearch, type SearchSuggestion } from "@/hooks/useSearch";
import {
  areFiltersEqual,
  DEFAULT_FILTERS,
  parseFiltersFromQuery,
} from "@/utils/propertyFilters";
import PriceFilterCard from "@/components/search/PriceFilterCard";
import RoomsFilterCard from "@/components/search/RoomsFilterCard";

function getSuggestionBadge(s: SearchSuggestion): {
  label: string;
  className: string;
} {
  if (s.type === "PROPERTY_SEARCH")
    return {
      label: "Propiedad",
      className: "bg-violet-100/80 text-violet-700",
    };
  if (s.type === "ADDRESS")
    return { label: "Dirección", className: "bg-blue-50/80 text-blue-600" };
  return {
    label: "Inmobiliaria",
    className: "bg-emerald-50/80 text-emerald-700",
  };
}

function getSuggestionLabel(s: SearchSuggestion): string {
  if (s.type === "PROPERTY_SEARCH")
    return s.display_name || "Buscar propiedades";
  const display = s.display_name || s.name || "";
  const parts = display.split(",");
  return parts.length > 3 ? parts.slice(0, 3).join(",").trim() : display.trim();
}

function formatPriceShort(val: string) {
  if (!val) return "";
  const n = Number(val);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  return n.toLocaleString("es-AR");
}

export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarInner />
    </Suspense>
  );
}

function NavbarInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"price" | "rooms" | null>(null);
  const [localMinPrice, setLocalMinPrice] = useState("");
  const [localMaxPrice, setLocalMaxPrice] = useState("");

  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    query,
    setQuery,
    suggestions,
    isLoading: searchLoading,
    onSelectSuggestion,
    clearAutocomplete,
  } = useSearch();

  const excludedPaths = ["/auth/login", "/auth/register"];
  const isExcluded = excludedPaths.includes(pathname);

  const currentFilters = parseFiltersFromQuery(
    new URLSearchParams(searchParams.toString()),
  );
  const isSearchMode = !areFiltersEqual(currentFilters, DEFAULT_FILTERS);

  const isHomeWithoutSearch = pathname === "/" && !isSearchMode;
  const showSearchAndMap = !isHomeWithoutSearch;
  const showFilterButton = pathname === "/" || pathname === "/map";

  const isMapView = pathname === "/map";
  const viewToggleHref = isMapView ? "/" : "/map";
  const viewToggleText = isMapView ? "Ver listado" : "Ir al mapa";
  const ViewToggleIcon = isMapView ? List : Map;

  useEffect(() => {
    setLocalMinPrice(searchParams.get("minPrice") || "");
    setLocalMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  useEffect(() => {
    if (!activeFilter) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(e.target as Node)
      ) {
        setActiveFilter(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [activeFilter]);

  const handleNavParamChange = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleNavPriceChange = useCallback(
    (field: "minPrice" | "maxPrice", value: string) => {
      if (field === "minPrice") setLocalMinPrice(value);
      else setLocalMaxPrice(value);
      if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
      priceTimerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        const newMin = field === "minPrice" ? value : localMinPrice;
        const newMax = field === "maxPrice" ? value : localMaxPrice;
        if (newMin) params.set("minPrice", newMin);
        else params.delete("minPrice");
        if (newMax) params.set("maxPrice", newMax);
        else params.delete("maxPrice");
        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }, 500);
    },
    [pathname, router, searchParams, localMinPrice, localMaxPrice],
  );

  const handleCurrencySwitch = useCallback(
    (newCurrency: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newCurrency) params.set("currency", newCurrency);
      else params.delete("currency");

      params.delete("minPrice");
      params.delete("maxPrice");
      params.set("page", "1");

      setLocalMinPrice("");
      setLocalMaxPrice("");

      if (priceTimerRef.current) clearTimeout(priceTimerRef.current);

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleNavRoomsChange = useCallback(
    (field: "rooms" | "bedrooms" | "bathrooms", value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(field);
      if (value) params.set(field, value);
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inMobile = mobileSearchRef.current?.contains(target);
      const inDesktop = desktopSearchRef.current?.contains(target);

      if (!inMobile && !inDesktop) {
        clearAutocomplete();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clearAutocomplete]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        onSelectSuggestion(suggestions[0]);
      } else if (query.trim()) {
        clearAutocomplete();
        router.push(`/properties?q=${encodeURIComponent(query.trim())}`);
      }
    }
    if (e.key === "Escape") {
      clearAutocomplete();
    }
  };

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          setRole(data.role || "USER");
        } else {
          setRole("USER");
        }
      } catch {
        setRole("USER");
      }
    };

    const fetchSession = async () => {
      const {
        data: { session: activeSession },
      } = await supabase.auth.getSession();
      setSession(activeSession);
      if (activeSession) await fetchRole();
      setLoading(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await fetchRole();
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isExcluded) return null;

  if (loading) {
    return (
      <nav className="fixed z-[1001] bottom-0 top-auto md:bottom-auto md:top-0 left-0 right-0 w-full py-4 px-6 bg-geora-black text-geora-white flex items-center justify-between h-16 md:h-[76px] box-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-xl">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="h-5 w-24 rounded animate-pulse bg-white/10" />
          <div className="flex-1 max-w-2xl h-10 rounded-full animate-pulse bg-white/10" />
          <div className="h-9 w-9 md:w-28 rounded-full animate-pulse bg-white/10" />
        </div>
      </nav>
    );
  }

  const profileOptions = session
    ? [{ label: "Cerrar Sesión", value: "logout" }]
    : [
        { label: "Iniciar Sesión", value: "/auth/login" },
        { label: "Registrarse", value: "/auth/register" },
      ];

  const handleProfileClick = async (value: string) => {
    if (value === "logout") {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } else {
      router.push(value);
    }
  };

  const dropdownLabel = (
    <span className="flex items-center gap-2">
      <span className="hidden md:block">
        {session ? "Mi Perfil" : "Ingresar"}
      </span>
      <Menu className="block md:hidden w-6 h-6" />
    </span>
  );

  const renderSearchBar = (
    ref: React.RefObject<HTMLDivElement | null>,
    isDesktop: boolean,
    extraClass: string = "",
  ) => {
    const containerClass = isDesktop
      ? "bg-white/50 border border-white/70 shadow-md"
      : "bg-white/10 border-white/10 focus-within:border-white/30";

    const inputClass = isDesktop
      ? "text-black placeholder:text-black/70"
      : "text-geora-white placeholder:text-white/40";

    const iconClass = isDesktop
      ? "text-gray-500 hover:text-gray-700"
      : "text-white/50 hover:text-white";

    return (
      <div ref={ref} className={`relative flex-1 w-full ${extraClass}`}>
        <div
          className={`flex items-center w-full rounded-full px-3 py-1 border transition-colors duration-300 ${containerClass}`}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Buscar ciudad, dirección o propiedad..."
            className={`flex-1 bg-transparent border-none outline-none py-1 w-full text-sm md:text-base transition-colors duration-300 ${inputClass}`}
          />
          {query ? (
            <button
              type="button"
              onClick={clearAutocomplete}
              className={`p-1 transition-colors shrink-0 ${iconClass}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (suggestions.length > 0) {
                onSelectSuggestion(suggestions[0]);
              } else if (query.trim()) {
                clearAutocomplete();
                router.push(
                  `/properties?q=${encodeURIComponent(query.trim())}`,
                );
              }
            }}
            className={`p-1 transition-colors shrink-0 ${iconClass}`}
          >
            {searchLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4 cursor-pointer" />
            )}
          </button>
        </div>

        {!searchLoading && suggestions.length > 0 && (
          <ul className="absolute bottom-full mb-1 md:bottom-auto md:top-full md:mb-0 md:mt-1 left-0 right-0 z-[1050] bg-white/70 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 overflow-hidden max-h-72 overflow-y-auto">
            {suggestions.map((suggestion, index) => {
              const badge = getSuggestionBadge(suggestion);
              const label = getSuggestionLabel(suggestion);
              const sub =
                suggestion.type === "REALESTATE_USER" && suggestion.city
                  ? suggestion.city
                  : null;
              return (
                <li
                  key={`${suggestion.type}-${index}`}
                  className="px-4 py-3 cursor-pointer hover:bg-white/50 transition-colors flex justify-between items-center text-sm border-b last:border-none border-white/30"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelectSuggestion(suggestion)}
                >
                  <div className="flex flex-col overflow-hidden mr-2">
                    <span className="truncate text-gray-800 font-medium">
                      {label}
                    </span>
                    {sub && (
                      <span className="text-[11px] text-gray-500 truncate">
                        {sub}
                      </span>
                    )}
                  </div>
                  <span
                    className={`shrink-0 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  type NavItem = {
    href: string;
    label: string;
    short?: string;
    Icon: LucideIcon;
  };

  const getNavItems = (): NavItem[] => {
    if (!session) {
      return [
        { href: "/?operationType=SALE", label: "Comprar", Icon: Home },
        { href: "/?operationType=RENT", label: "Alquilar", Icon: Key },
        { href: "/dashboard?nueva=1", label: "Publicar", Icon: PlusCircle },
      ];
    }

    if (role === "ADMIN" || role === "admin") {
      return [
        {
          href: "/administrate",
          label: "Administrate",
          short: "Admin",
          Icon: Shield,
        },
      ];
    }

    if (role === "REALESTATE") {
      return [
        { href: `/dashboard?nueva=1`, label: "Publicar", Icon: PlusCircle },
        { href: "/dashboard", label: "Mi Perfil", short: "Perfil", Icon: User },
        { href: "/connections", label: "Bolsa", short: "Bolsa", Icon: Network },
        { href: "/", label: "Buscar", Icon: Search },
      ];
    }

    return [
      { href: "/?operationType=SALE", label: "Comprar", Icon: Home },
      { href: "/?operationType=RENT", label: "Alquilar", Icon: Key },
      { href: "/dashboard", label: "Mi Perfil", short: "Perfil", Icon: User },
    ];
  };

  const isNavActive = (href: string) => {
    const [path, qs] = href.split("?");
    if (pathname !== path) return false;
    if (!qs) return !searchParams.toString();
    const params = new URLSearchParams(qs);
    for (const [k, v] of params.entries()) {
      if (searchParams.get(k) !== v) return false;
    }
    return true;
  };

  const renderNavLinks = () => {
    const linkClass =
      "text-sm md:text-base text-geora-white hover:text-white/70 font-semibold transition-colors";
    return getNavItems().map((item) => (
      <Link key={item.label} href={item.href} className={linkClass}>
        {item.label}
      </Link>
    ));
  };

  const renderMobileNavIcons = () => {
    return getNavItems().map((item) => {
      const active = isNavActive(item.href);
      const Icon = item.Icon;
      return (
        <Link
          key={item.label}
          href={item.href}
          className={`flex flex-col items-center justify-center gap-1 px-1 min-w-0 transition-colors ${
            active ? "text-geora-white" : "text-white/55 hover:text-white/80"
          }`}
        >
          <Icon className="w-[22px] h-[22px] shrink-0" />
          <span className="text-[10px] font-medium leading-none truncate max-w-full">
            {item.short ?? item.label}
          </span>
        </Link>
      );
    });
  };

  return (
    <>
      <nav className="fixed z-[1001] bottom-0 top-auto md:bottom-auto md:top-0 left-0 right-0 w-full py-3 px-4 md:py-4 md:px-6 bg-geora-black text-geora-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-xl flex items-center h-[60px] md:h-[76px] box-border">
        <div className="relative z-10 max-w-7xl mx-auto w-full md:px-10 h-full flex items-center justify-between gap-2 md:gap-6">
          <div className="shrink-0 flex items-center">
            <Link href="/">
              <Image
                src={GeoraLogo}
                alt="Geora Logo"
                className="hidden md:block w-auto h-5 md:h-7 antialiased subpixel-antialiased"
              />
              <Image
                src={GeoraLogo2}
                alt="Geora Logo Mini"
                className="block md:hidden w-auto h-5 md:h-7 ml-1"
              />
            </Link>
          </div>

          <div className="flex-1 flex justify-center px-1 md:px-4 w-full max-w-3xl mx-auto">
            <div className="flex md:hidden items-center w-full gap-1">
              {showFilterButton && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("toggle-sidebar"));
                    }
                  }}
                  className="p-2 shrink-0 transition-colors duration-300 hover:cursor-pointer text-white/70 hover:text-geora-white"
                  aria-label="Filtros"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              )}

              <div className="flex-1 flex items-center justify-around min-w-0">
                {renderMobileNavIcons()}
              </div>

              {showSearchAndMap && (
                <Link
                  href={viewToggleHref}
                  className="flex flex-col items-center justify-center gap-1 px-1 shrink-0 text-white/55 hover:text-white/80 transition-colors"
                  aria-label={viewToggleText}
                >
                  <ViewToggleIcon className="w-[22px] h-[22px]" />
                  <span className="text-[10px] font-medium leading-none">
                    {isMapView ? "Listado" : "Mapa"}
                  </span>
                </Link>
              )}
            </div>

            <div className="hidden md:flex items-center justify-center gap-4 md:gap-8 overflow-x-auto no-scrollbar whitespace-nowrap px-2 w-full">
              {renderNavLinks()}
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            <CustomDropdown
              label={dropdownLabel}
              value=""
              options={profileOptions}
              onChange={handleProfileClick}
              className="shrink-0"
              variant="white"
            />
          </div>
        </div>
      </nav>

      {showFilterButton && showSearchAndMap && (
        <>
          <div className="hidden md:flex fixed top-[76px] left-0 right-0 w-full bg-white/70 backdrop-blur-3xl shadow-sm border-b border-gray-200 z-[1000] h-[60px] items-center px-6 transition-all duration-300 anim-bar">
            <div className="mx-auto w-full md:px-10 flex items-center justify-center gap-4">
              <div className="flex items-center gap-4 flex-1 max-w-md justify-end">
                {renderSearchBar(desktopSearchRef, true, "anim-item delay-1")}
              </div>

              <div className="flex items-center gap-2" ref={filterPanelRef}>
                <div className="anim-item delay-2">
                  <CustomDropdown
                    label={
                      currentFilters.operationType
                        ? currentFilters.operationType === "SALE"
                          ? "Venta"
                          : currentFilters.operationType === "RENT"
                            ? "Alquiler"
                            : "Temporal"
                        : "Operación"
                    }
                    value={currentFilters.operationType || ""}
                    options={[
                      { label: "Venta", value: "SALE" },
                      { label: "Alquiler", value: "RENT" },
                      { label: "Temporal", value: "TEMP_RENT" },
                    ]}
                    onChange={(val) => {
                      const current = searchParams.get("operationType") || "";
                      handleNavParamChange(
                        "operationType",
                        val === current ? null : val,
                      );
                    }}
                    variant="white1"
                  />
                </div>

                <div className="anim-item delay-3">
                  <CustomDropdown
                    label={
                      currentFilters.propertyType
                        ? (() => {
                            const map: Record<string, string> = {
                              HOUSE: "Casa",
                              APARTMENT: "Depto",
                              PH: "PH",
                              LAND: "Terreno",
                              COMMERCIAL_PROPERTY: "Local",
                              OFFICE: "Oficina",
                              GARAGE: "Cochera",
                              FIELD: "Campo",
                              WAREHOUSE: "Galpón",
                            };
                            return map[currentFilters.propertyType] || "Tipo";
                          })()
                        : "Tipo"
                    }
                    value={currentFilters.propertyType || ""}
                    options={[
                      { label: "Casa", value: "HOUSE" },
                      { label: "Departamento", value: "APARTMENT" },
                      { label: "PH", value: "PH" },
                      { label: "Terreno", value: "LAND" },
                      { label: "Local", value: "COMMERCIAL_PROPERTY" },
                      { label: "Oficina", value: "OFFICE" },
                      { label: "Cochera", value: "GARAGE" },
                      { label: "Campo", value: "FIELD" },
                      { label: "Galpón", value: "WAREHOUSE" },
                    ]}
                    onChange={(val) => {
                      const current = searchParams.get("propertyType") || "";
                      handleNavParamChange(
                        "propertyType",
                        val === current ? null : val,
                      );
                    }}
                    variant="white1"
                  />
                </div>

                <div className="relative anim-item delay-4">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveFilter((v) => (v === "price" ? null : "price"))
                    }
                    className={`h-10 cursor-pointer px-3 md:px-5 py-2 rounded-full tracking-wide transition-colors duration-200 flex items-center justify-center md:justify-between gap-2 w-[180px] font-bold ${
                      currentFilters.minPrice ||
                      currentFilters.maxPrice ||
                      currentFilters.currency
                        ? "bg-white/70 border border-white text-geora-black/70 shadow-md"
                        : activeFilter === "price"
                          ? "bg-white/70 border border-white text-geora-black/70 shadow-md"
                          : "bg-white/70 border border-white text-geora-black/70 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    <span className="text-md tracking-wider flex items-center justify-center truncate">
                      {currentFilters.minPrice || currentFilters.maxPrice
                        ? "Precio"
                        : "Precio"}
                    </span>
                    <ChevronDown
                      size={16}
                      strokeWidth={3}
                      className={`hidden md:block w-4 h-4 shrink-0 transition-transform duration-200 ${activeFilter === "price" ? "rotate-180" : ""}`}
                    />
                  </button>

                  {activeFilter === "price" && (
                    <div className="absolute top-full left-0 mt-3 z-999 w-80 rounded-2xl border border-gray-200 bg-white text-geora-black/70 shadow-xl p-5">
                      <PriceFilterCard
                        minPrice={localMinPrice}
                        maxPrice={localMaxPrice}
                        currency={searchParams.get("currency") || ""}
                        operationType={searchParams.get("operationType") || ""}
                        propertyType={searchParams.get("propertyType") || ""}
                        onChangeMin={(v) => handleNavPriceChange("minPrice", v)}
                        onChangeMax={(v) => handleNavPriceChange("maxPrice", v)}
                        onChangeCurrency={handleCurrencySwitch}
                      />
                    </div>
                  )}
                </div>

                <div className="relative anim-item delay-5">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveFilter((v) => (v === "rooms" ? null : "rooms"))
                    }
                    className={`h-10 cursor-pointer px-3 md:px-5 py-2 rounded-full tracking-wide transition-colors duration-200 flex items-center justify-center md:justify-between gap-2 w-[130px] md:w-[170px] font-bold ${
                      currentFilters.rooms.length > 0 ||
                      currentFilters.bedrooms.length > 0 ||
                      currentFilters.bathrooms.length > 0
                        ? "bg-white/70 border border-white text-geora-black/70 shadow-md"
                        : activeFilter === "rooms"
                          ? "bg-white/70 border border-white text-geora-black/70 shadow-md"
                          : "bg-white/70 border border-white text-geora-black/70 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    <span className="text-md tracking-wider flex items-center justify-center">
                      {currentFilters.rooms[0]
                        ? `${currentFilters.rooms[0]} amb.`
                        : currentFilters.bedrooms[0]
                          ? `${currentFilters.bedrooms[0]} hab.`
                          : "Ambientes"}
                    </span>
                    <ChevronDown
                      size={16}
                      strokeWidth={3}
                      className={`hidden md:block w-4 h-4 shrink-0 transition-transform duration-200 ${activeFilter === "rooms" ? "rotate-180" : ""}`}
                    />
                  </button>

                  {activeFilter === "rooms" && (
                    <div className="absolute top-full left-0 mt-3 z-[999] w-80 rounded-2xl border border-gray-200 bg-white text-geora-black/70 shadow-xl p-5">
                      <RoomsFilterCard
                        rooms={searchParams.getAll("rooms")}
                        bedrooms={searchParams.getAll("bedrooms")}
                        bathrooms={searchParams.getAll("bathrooms")}
                        onChange={handleNavRoomsChange}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="anim-item delay-6">
                <Link
                  href={viewToggleHref}
                  className="flex items-center px-4 py-1.5 font-medium transition-colors duration-300 text-sm shrink-0 text-geora-black/80 hover:text-geora-black"
                >
                  {viewToggleText}
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideDownBar {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInItem {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-bar {
          animation: slideDownBar 0.3s ease-out forwards;
        }
        .anim-item {
          opacity: 0;
          animation: fadeInItem 0.4s ease-out forwards;
        }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.3s; }
        .delay-3 { animation-delay: 0.4s; }
        .delay-4 { animation-delay: 0.5s; }
        .delay-5 { animation-delay: 0.6s; }
        .delay-6 { animation-delay: 0.7s; }
      `}</style>
    </>
  );
}