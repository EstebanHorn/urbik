"use client";
import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Map, SlidersHorizontal, Menu, List } from "lucide-react"; // Añadido el ícono List
import Image from "next/image";
import UrbikLogo from "@/assets/Urbik_Logo.svg";
import UrbikLogo2 from "@/assets/Urbik_Logo_Mini.svg";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isScrolled, setIsScrolled] = useState(false);

  const excludedPaths = ["/auth/login", "/auth/register"];
  const isExcluded = excludedPaths.includes(pathname);
  
  // Validamos si el botón de filtros debe mostrarse
  const showFilterButton = pathname === "/" || pathname === "/map";

  // Variables condicionales para alternar entre Mapa y Listado
  const isMapView = pathname === "/map";
  const viewToggleHref = isMapView ? "/" : "/map"; // Asumiendo que "/" es el listado
  const viewToggleText = isMapView ? "Ver listado" : "Ir al mapa";
  const ViewToggleIcon = isMapView ? List : Map;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  const isLightMode = pathname === "/" && !isScrolled;

  if (loading) {
    const loadingLightMode = pathname === "/";
    return (
      <nav className={`fixed z-[1001] flex items-center justify-between transition-all duration-300 top-0 left-0 right-0 w-full py-3 px-4 md:bottom-auto md:left-0 md:right-0 md:w-full md:rounded-none md:py-4 md:px-6 border-transparent box-border ${
        !isScrolled ? "h-16 md:h-[76px] border-t-[8px] md:border-t-[12px]" : "h-14 md:h-16 border-t-0"
      } ${loadingLightMode ? "bg-white text-black" : "bg-urbik-black text-urbik-white"}`}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <div className={`h-5 w-24 rounded animate-pulse ${loadingLightMode ? "bg-black/10" : "bg-white/10"}`} />
          <div className={`flex-1 max-w-2xl h-10 rounded-full animate-pulse ${loadingLightMode ? "bg-black/10" : "bg-white/10"}`} />
          <div className={`h-9 w-9 md:w-28 rounded-full animate-pulse ${loadingLightMode ? "bg-black/10" : "bg-white/10"}`} />
        </div>
      </nav>
    );
  }

  const getNavLinks = (userRole?: string | null) => {
    const publicLinks: any[] = [];

    switch (userRole) {
      case "ADMIN":
        return [...publicLinks, { label: "Administrar", value: "/administrate" }];
      case "REALESTATE":
        return [...publicLinks, { label: "Mis Propiedades", value: "/dashboard" }, { label: "Propiedades Guardadas", value: "/saved" }];
      case "USER":
        return [...publicLinks, { label: "Mis Mensajes", value: "/messages" }, { label: "Propiedades Guardadas", value: "/saved" }];
      default:
        return publicLinks;
    }
  };

  const navLinks = getNavLinks(role);

  const profileOptions = session
    ? [
        ...navLinks,
        ...(role !== "ADMIN" ? [{ label: "Editar Perfil", value: "/profile" }] : []),
        ...(role === "REALESTATE" ? [{ label: "Publicar Propiedad", value: "/dashboard?nueva=1" }] : []),
        { label: "Configuración", value: "/settings" },
        { label: "Cerrar Sesión", value: "logout" },
      ]
    : [
        ...navLinks,
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

  return (
    <nav className={`fixed z-[1001] top-0 left-0 right-0 w-full py-2 px-3 md:bottom-auto md:left-0 md:right-0 md:w-full md:rounded-none md:py-4 md:px-6 transition-all duration-300 ease-in-out border-transparent box-border ${
      !isScrolled ? "h-16 md:h-[76px] border-t-[8px] md:border-t-[12px]" : "h-14 md:h-16 border-t-0"
    } ${
      isLightMode ? "text-black" : "text-urbik-white shadow-xl"
    }`}>
      
      <div 
        className={`absolute -top-8 inset-x-0 bottom-0 -z-20 bg-white transition-opacity duration-300 ease-in-out ${
          isLightMode ? "opacity-100" : "opacity-0"
        }`} 
      />
      
      <div 
        className={`absolute -top-8 inset-x-0 bottom-0 -z-10 bg-urbik-black origin-left transition-transform duration-300 ease-in-out ${
          isLightMode ? "scale-x-0" : "scale-x-100"
        }`} 
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full md:px-10 h-full flex items-center justify-between gap-2 md:gap-6">
        
        <div className="shrink-0 flex items-center">
          <Link href="/">
            <Image 
              src={UrbikLogo} 
              alt="Urbik Logo" 
              className={`hidden md:block w-auto transition-all duration-300 ease-in-out antialiased subpixel-antialiased will-change-filter ${
                !isScrolled ? "h-7" : "h-5"
              } ${
                isLightMode ? "brightness-0 opacity-75" : ""
              }`} 
            />
            <Image 
              src={UrbikLogo2} 
              alt="Urbik Logo" 
              className={`block md:hidden w-auto ml-1 transition-all duration-300 ease-in-out ${
                !isScrolled ? "h-8" : "h-6"
              } ${
                isLightMode ? "brightness-0 opacity-60" : "opacity-40"
              }`} 
            />
          </Link>
        </div>

        <div className="flex-1 flex justify-center px-1 md:px-4 w-full max-w-2xl mx-auto">
          {showFilterButton && (
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log("📢 Navbar: Botón clickeado. Enviando señal 'toggle-sidebar'...");
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('toggle-sidebar'));
                }
              }}
              className={`p-2 transition-colors duration-300 hover:cursor-pointer ${
                isLightMode ? "text-black/70 hover:text-black" : "text-white hover:text-urbik-white"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
          
          <div className={`flex items-center w-full rounded-full p-1 border transition-colors duration-300 ${
            isLightMode 
              ? "bg-black/5 md:bg-gray-100 border-black/10 focus-within:border-black/30" 
              : "bg-white/5 md:bg-urbik-gray1 border-white/10 focus-within:border-white/30"
          }`}>
            
            <input
              type="text"
              placeholder="Buscar..."
              className={`flex-1 bg-transparent border-none outline-none px-2 w-full text-sm md:text-base transition-colors duration-300 ${
                isLightMode 
                  ? "text-black placeholder:text-black/40" 
                  : "text-urbik-white placeholder:text-white/40"
              }`}
            />
          </div>
          
          {/* LINK DE ESCRITORIO ACTUALIZADO */}
          <Link 
            href={viewToggleHref} 
            className={`hidden md:flex items-center px-4 py-1.5 font-medium transition-colors duration-300 text-sm ml-2 shrink-0 rounded-full ${
              isLightMode ? "text-black/70 hover:text-black" : "text-white hover:text-gray-200"
            }`}
          >
            {viewToggleText}
          </Link>
        </div>

        {/* LINK DE MÓVIL ACTUALIZADO */}
        <Link 
          href={viewToggleHref} 
          className={`md:hidden flex items-center justify-center transition-colors duration-300 ml-1 shrink-0 ${
            isLightMode ? "text-black/60" : "text-urbik-white"
          }`}
        >
          <ViewToggleIcon className="w-5 h-5" />
        </Link>

        <div className="shrink-0 flex items-center md:hidden">
          <CustomDropdown 
            label={dropdownLabel} 
            value="" 
            options={profileOptions} 
            onChange={handleProfileClick} 
            className="shrink-0"
            variant={isLightMode ? "white2" : "black"}
          />
        </div>

        <div className="shrink-0 hidden md:flex items-center">
          <CustomDropdown 
            label={dropdownLabel} 
            value="" 
            options={profileOptions} 
            onChange={handleProfileClick} 
            className="shrink-0"
            variant={isLightMode ? "white2" : "white"} 
          />
        </div>

      </div>
    </nav>
  );
}