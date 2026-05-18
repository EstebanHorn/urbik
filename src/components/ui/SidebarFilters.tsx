"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";

export default function SidebarFilters() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Detectar si es móvil para cambiar el comportamiento
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Escuchar el evento del Navbar
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggle-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-sidebar", handleToggle);
  }, []);

  // Ocultar si cambiamos de ruta que no sea / o /map
  useEffect(() => {
    if (pathname !== "/" && pathname !== "/map") {
      setIsOpen(false);
    }
  }, [pathname]);

  // Actualización automática al tocar un filtro
  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const currentOpType = searchParams.get("operationType") || "";
  const currentPropType = searchParams.get("propertyType") || "";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo oscuro SOLO en móviles (en desktop el panel flota sin bloquear el mapa) */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[1002] bg-urbik-black/40 backdrop-blur-sm md:hidden"
            />
          )}

          {/* Panel Flotante Glassmorphism */}
          <motion.div
            // Configuraciones de Animación
            initial={isMobile ? { y: "100%" } : { y: 50, opacity: 0, scale: 0.95 }}
            animate={isMobile ? { y: 0 } : { y: 0, opacity: 1, scale: 1 }}
            exit={isMobile ? { y: "100%" } : { y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            
            // Habilitar arrastre solo en escritorio
            drag={!isMobile}
            dragMomentum={false} // Evita que siga deslizándose al soltarlo
            
            // Estilos: Full screen en móvil | Flotante abajo izq. 66vh en Desktop
            className={`fixed z-[1003] flex flex-col overflow-hidden
              ${isMobile 
                ? "inset-0 w-full h-full rounded-none bg-white/95" 
                : "bottom-6 right-6 w-[340px] h-[66vh] md:rounded-[2rem] border border-white/70 bg-white/60 backdrop-blur-2xl shadow-[0_15px_50px_rgba(15,23,42,0.15)] cursor-grab active:cursor-grabbing"
              }`}
          >
            {/* Header y Drag Handle */}
            <div className="shrink-0 pt-4 px-6 pb-2 flex flex-col relative">
              {!isMobile && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-slate-300/80 pointer-events-none" />
              )}
              
              <div className={`flex items-center justify-between ${!isMobile ? "mt-4" : "mt-2"}`}>
                <h2 className="text-xl font-black text-urbik-black/80 tracking-tight">Filtros</h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
                >
                  <X size={20} className="text-urbik-black/60" />
                </button>
              </div>
            </div>

            {/* Contenedor scrolleable de los filtros */}
            <div 
              // Esto evita que al hacer scroll en los filtros, arrastres la ventana por error
              onPointerDownCapture={(e) => !isMobile && e.stopPropagation()}
              className="flex-1 overflow-y-auto px-6 pb-8 cursor-auto custom-scrollbar"
            >
              <div className="flex flex-col gap-8 mt-4">
                
                {/* Operación */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operación</span>
                  <div className="grid grid-cols-2 gap-2">
                    {["SALE", "RENT", "TEMP_RENT"].map((op) => (
                      <button
                        key={op}
                        onClick={() => handleFilterChange("operationType", currentOpType === op ? null : op)}
                        className={`py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          currentOpType === op 
                            ? "bg-urbik-emerald text-white shadow-md shadow-urbik-emerald/20" 
                            : "bg-white/50 text-slate-600 hover:bg-white hover:shadow-sm"
                        }`}
                      >
                        {op === "SALE" ? "Venta" : op === "RENT" ? "Alquiler" : "Temporal"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipo de Propiedad */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tipo</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { val: "HOUSE", label: "Casa" },
                      { val: "APARTMENT", label: "Depto" },
                      { val: "PH", label: "PH" },
                      { val: "LAND", label: "Terreno" },
                      { val: "COMMERCIAL_PROPERTY", label: "Local" }
                    ].map((type) => (
                      <button
                        key={type.val}
                        onClick={() => handleFilterChange("propertyType", currentPropType === type.val ? null : type.val)}
                        className={`py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          currentPropType === type.val 
                            ? "bg-urbik-black text-white shadow-md" 
                            : "bg-white/50 text-slate-600 hover:bg-white hover:shadow-sm"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comodidades */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Características</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "hasPool", label: "Pileta" },
                      { key: "hasGarden", label: "Jardín" },
                      { key: "hasBalcony", label: "Balcón" },
                      { key: "hasParking", label: "Cochera" },
                      { key: "hasGrill", label: "Parrilla" }
                    ].map((amenity) => {
                      const isActive = searchParams.get(amenity.key) === "true";
                      return (
                        <button
                          key={amenity.key}
                          onClick={() => handleFilterChange(amenity.key, isActive ? null : "true")}
                          className={`py-1.5 px-3 rounded-full border text-xs font-bold transition-all duration-300 ${
                            isActive 
                              ? "border-urbik-emerald bg-urbik-emerald/10 text-urbik-emerald" 
                              : "border-slate-200 bg-white/40 text-slate-500 hover:border-slate-300 hover:bg-white"
                          }`}
                        >
                          {amenity.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                
                {/* Botón de limpiar filtros */}
                <button 
                  onClick={() => router.replace(pathname, { scroll: false })}
                  className="mt-6 py-3 w-full rounded-xl border border-rose-200 text-rose-500 font-bold text-sm hover:bg-rose-50 hover:border-rose-300 transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}