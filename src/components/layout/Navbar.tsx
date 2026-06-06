"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Map, SlidersHorizontal, Menu, List, X } from "lucide-react";
import Image from "next/image";

import UrbikLogo from "@/assets/Urbik_Logo.svg";
import UrbikLogo2 from "@/assets/Urbik_Logo_Mini.svg";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { createClient } from "@/lib/supabase/client";
import { useSearch, type SearchSuggestion } from "@/hooks/useSearch";
import { areFiltersEqual, DEFAULT_FILTERS, parseFiltersFromQuery } from "@/utils/propertyFilters";

function getSuggestionBadge(s: SearchSuggestion): { label: string; className: string } {
  if (s.type === "PROPERTY_SEARCH") return { label: "Propiedad", className: "bg-violet-100 text-violet-700" };
  if (s.type === "ADDRESS") return { label: "Dirección", className: "bg-blue-50 text-blue-600" };
  return { label: "Inmobiliaria", className: "bg-emerald-50 text-emerald-700" };
}

function getSuggestionLabel(s: SearchSuggestion): string {
  if (s.type === "PROPERTY_SEARCH") return s.display_name || "Buscar propiedades";
  const display = s.display_name || s.name || "";
  const parts = display.split(",");
  return parts.length > 3 ? parts.slice(0, 3).join(",").trim() : display.trim();
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  
  const { query, setQuery, suggestions, isLoading: searchLoading, onSelectSuggestion, clearAutocomplete } = useSearch();

  const excludedPaths = ["/auth/login", "/auth/register"];
  const isExcluded = excludedPaths.includes(pathname);

  const currentFilters = parseFiltersFromQuery(new URLSearchParams(searchParams.toString()));
  const isSearchMode = !areFiltersEqual(currentFilters, DEFAULT_FILTERS);
  
  const isHomeWithoutSearch = pathname === "/" && !isSearchMode;
  const showSearchAndMap = !isHomeWithoutSearch;
  const showFilterButton = pathname === "/" || pathname === "/map";

  const isMapView = pathname === "/map";
  const viewToggleHref = isMapView ? "/" : "/map"; 
  const viewToggleText = isMapView ? "Ver listado" : "Ir al mapa";
  const ViewToggleIcon = isMapView ? List : Map;

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
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      setSession(activeSession);
      if (activeSession) await fetchRole();
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await fetchRole();
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isExcluded) return null;

  if (loading) {
    return (
      <nav className="fixed z-[1001] bottom-0 top-auto md:bottom-auto md:top-0 left-0 right-0 w-full py-4 px-6 bg-urbik-black text-urbik-white flex items-center justify-between h-16 md:h-[76px] box-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-xl">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="h-5 w-24 rounded animate-pulse bg-white/10" />
          <div className="flex-1 max-w-2xl h-10 rounded-full animate-pulse bg-white/10" />
          <div className="h-9 w-9 md:w-28 rounded-full animate-pulse bg-white/10" />
        </div>
      </nav>
    );
  }

  const profileOptions = session
    ? [
        { label: "Configuración", value: "/settings" },
        { label: "Cerrar Sesión", value: "logout" },
      ]
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
      <span className="hidden md:block">{session ? "Mi Perfil" : "Ingresar"}</span>
      <Menu className="block md:hidden w-6 h-6" />
    </span>
  );

  const renderSearchBar = (ref: React.RefObject<HTMLDivElement | null>, isDesktop: boolean) => {
    const containerClass = isDesktop 
      ? "bg-white/50 border border-white/70 shadow-md"
      : "bg-white/10 border-white/10 focus-within:border-white/30";
      
    const inputClass = isDesktop
      ? "text-black placeholder:text-black/70"
      : "text-urbik-white placeholder:text-white/40";
      
    const iconClass = isDesktop ? "text-gray-500 hover:text-gray-700" : "text-white/50 hover:text-white";

    return (
      <div ref={ref} className="relative flex-1 w-full">
        <div className={`flex items-center w-full rounded-full px-3 py-1 border transition-colors duration-300 ${containerClass}`}>
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
                router.push(`/properties?q=${encodeURIComponent(query.trim())}`);
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
          <ul className="absolute bottom-full mb-1 md:bottom-auto md:top-full md:mb-0 md:mt-1 left-0 right-0 z-[1050] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-72 overflow-y-auto">
            {suggestions.map((suggestion, index) => {
              const badge = getSuggestionBadge(suggestion);
              const label = getSuggestionLabel(suggestion);
              const sub = suggestion.type === "REALESTATE_USER" && suggestion.city ? suggestion.city : null;
              return (
                <li
                  key={`${suggestion.type}-${index}`}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center text-sm border-b last:border-none border-gray-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelectSuggestion(suggestion)}
                >
                  <div className="flex flex-col overflow-hidden mr-2">
                    <span className="truncate text-gray-800 font-medium">{label}</span>
                    {sub && <span className="text-[11px] text-gray-400 truncate">{sub}</span>}
                  </div>
                  <span className={`shrink-0 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${badge.className}`}>
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

  const renderNavLinks = () => {
    const linkClass = "text-sm md:text-base text-urbik-white hover:text-white/70 font-semibold transition-colors";

    if (!session) {
      return (
        <>
          <Link href="/?operationType=SALE" className={linkClass}>Comprar</Link>
          <Link href="/?operationType=RENT" className={linkClass}>Alquilar</Link>
          <Link href="/dashboard?nueva=1" className={linkClass}>Publicar</Link>
          <Link href="/for-agencies" className={linkClass}>Para Inmobiliarias</Link>
        </>
      );
    }

    if (role === "REALESTATE") {
      return (
        <>
          <Link href="/dashboard?nueva=1" className={linkClass}>Publicar</Link>
          <Link href="/dashboard" className={linkClass}>Mi Perfil</Link>
          <Link href="/?operationType=SALE" className={linkClass}>Comprar</Link>
        </>
      );
    }

    return (
      <>
        <Link href="/?operationType=SALE" className={linkClass}>Comprar</Link>
        <Link href="/?operationType=RENT" className={linkClass}>Alquilar</Link>
        <Link href="/dashboard" className={linkClass}>Mi Perfil</Link>
      </>
    );
  };

  return (
    <>
      <nav className="fixed z-[1001] bottom-0 top-auto md:bottom-auto md:top-0 left-0 right-0 w-full py-3 px-4 md:py-4 md:px-6 bg-urbik-black text-urbik-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-xl flex items-center h-[60px] md:h-[76px] box-border">
        
        <div className="relative z-10 max-w-7xl mx-auto w-full md:px-10 h-full flex items-center justify-between gap-2 md:gap-6">
          
          <div className="shrink-0 flex items-center">
            <Link href="/">
              <Image 
                src={UrbikLogo} 
                alt="Urbik Logo" 
                className="hidden md:block w-auto h-7 antialiased subpixel-antialiased"
              />
              <Image 
                src={UrbikLogo2} 
                alt="Urbik Logo Mini" 
                className="block md:hidden w-auto h-7 ml-1" 
              />
            </Link>
          </div>

          <div className="flex-1 flex justify-center px-1 md:px-4 w-full max-w-3xl mx-auto">
            
            {showSearchAndMap && (
              <div className="flex md:hidden items-center w-full gap-2">
                {showFilterButton && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('toggle-sidebar'));
                      }
                    }}
                    className="p-2 transition-colors duration-300 hover:cursor-pointer text-white hover:text-urbik-white"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                )}
                
                {renderSearchBar(mobileSearchRef, false)}

                <Link 
                  href={viewToggleHref} 
                  className="flex items-center justify-center transition-colors duration-300 ml-1 shrink-0 text-urbik-white"
                >
                  <ViewToggleIcon className="w-5 h-5" />
                </Link>
              </div>
            )}

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
        <div className="hidden md:flex fixed top-[76px] left-0 right-0 w-full bg-white/70 backdrop-blur-3xl shadow-sm border-b border-gray-200 z-[1000] h-[60px] items-center px-6 transition-all duration-300">
          <div className="mx-auto w-full md:px-10 flex items-center justify-center gap-4">
                        
            <div className="flex items-center gap-4 flex-1 max-w-md justify-end">
              {renderSearchBar(desktopSearchRef, true)}
              
            </div>
            <div className="flex items-center gap-3">

              <CustomDropdown 
                label="Operación" 
                value={currentFilters.operationType || ""} 
                options={[{label: "Venta", value: "SALE"}, {label: "Alquiler", value: "RENT"}]} 
                onChange={(val) => console.log(val)} 
                variant="white1"
              />
              <CustomDropdown 
                label="Tipo de Propiedad" 
                value="" 
                options={[{label: "Casa", value: "HOUSE"}, {label: "Departamento", value: "APARTMENT"}]} 
                onChange={() => {}} 
                variant="white1"
              />
              <CustomDropdown 
                label="Precio" 
                value="" 
                options={[{label: "Hasta $50.000", value: "50000"}, {label: "$50.000 - $100.000", value: "100000"}]} 
                onChange={() => {}} 
                variant="white1"
              />
              <CustomDropdown 
                label="Ambientes" 
                value="" 
                options={[{label: "1 Ambiente", value: "1"}, {label: "2 Ambientes", value: "2"}, {label: "3+ Ambientes", value: "3"}]} 
                onChange={() => {}} 
                variant="white1"
              />
            </div>
                          <Link
                href={viewToggleHref}
                className="flex items-center px-4 py-1.5 font-medium transition-colors duration-300 text-sm shrink-0 text-urbik-black/80 hover:text-urbik-black"
              >
                {viewToggleText}
              </Link>
          </div>
        </div>
      )}
    </>
  );
}