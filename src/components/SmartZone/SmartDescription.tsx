/*
Este componente de React, denominado SmartDescription, es una interfaz de cliente diseñada para
generar sugerencias automáticas de texto mediante inteligencia artificial basándose en una
descripción y un contexto proporcionados. El código gestiona un estado de activación mediante
un interruptor que, al encenderse, dispara un efecto de búsqueda (useEffect) con un retraso de
800ms para evitar peticiones excesivas mientras el usuario escribe; si se cumplen las condiciones
de longitud mínima, se realiza una solicitud POST a una API interna para obtener un análisis detallado.
Visualmente, utiliza la librería framer-motion para animar la aparición del contenido, mostrando un
estado de carga con video mientras se procesa la información o el resultado final del análisis de 
"Urbik AI" en un contenedor estilizado con bordes brillantes y desenfoques decorativos.
*/

"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SmartDescriptionProps {
  description: string;
  context: Record<string, unknown>;
}

export default function SmartDescription({
  description,
  context,
}: SmartDescriptionProps) {
  const [isActive, setIsActive] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getAnalysis = async () => {
    if (!description || description.length < 20) return;
    setLoading(true);
    try {
      const res = await fetch("/api/smart-zone/smart-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, context }),
      });
      const data = await res.json();
      setAnalysis(data.text);
    } catch {
      setAnalysis("Error al conectar con Urbik AI.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => getAnalysis(), 800);
      return () => clearTimeout(timer);
    } else {
      setAnalysis(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description, isActive]);
  const showLoadingState =
    loading || (isActive && (!description || description.length < 20));

  return (
    <div className="mt-4 flex flex-col items-center w-full shadow-[0_0_30px_-10px_rgba(16,185,129,0.6)] border border-urbik-emerald/30 p-1 relative overflow-hidden bg-urbik-black rounded-2xl mx-auto">
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-urbik-emerald/5 rounded-full blur-[60px] pointer-events-none" />

      <div className="w-full relative z-10 p-2">
        <div className="w-full flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div
              className={`relative h-5 w-5 transition-all duration-700 ${
                isActive
                  ? "brightness-100 drop-shadow-[0_0_5px_rgba(16,185,129,1)]"
                  : "brightness-0 invert opacity-30"
              }`}
            >
              <img
                src="/Urbik_Logo_Smart_Zone.svg"
                alt="Urbik Smart Zone"
                className="object-contain"
              />
            </div>
            <span
              className={`text-xs font-black italic uppercase transition-colors ${isActive ? "text-white" : "text-white/30"}`}
            >
              Urbik{" "}
              <span
                className={isActive ? "text-urbik-emerald" : "text-white/30"}
              >
                Smart Description
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`hidden sm:block text-[8px] font-bold uppercase tracking-widest transition-colors ${isActive ? "text-urbik-emerald" : "text-white/20"}`}
            >
              {isActive ? "Análisis Activo" : "IA Desactivada"}
            </span>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`w-10 cursor-pointer h-5 flex items-center rounded-full p-1 transition-all duration-300 ${isActive ? "bg-urbik-emerald shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-white/10"}`}
            >
              <motion.div
                layout
                className="bg-white w-3 h-3 rounded-full shadow-sm"
                animate={{ x: isActive ? 18 : 0 }}
              />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl min-h-20 flex items-center justify-center">
                {showLoadingState ? (
                  <div className="flex flex-col items-center justify-center">
                    <video
                      src="/ia_loading.webm"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-12 h-12 object-cover brightness-125"
                    />
                  </div>
                ) : (
                  analysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full"
                    >
                      <div className="bg-urbik-emerald/5 border border-urbik-emerald/10 p-4 rounded-xl backdrop-blur-sm relative">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1 h-1 bg-urbik-emerald rounded-full shadow-[0_0_5px_rgba(16,185,129,1)]" />
                          <span className="text-[9px] font-bold text-urbik-emerald/80 uppercase tracking-widest">
                            Sugerencia de IA
                          </span>
                        </div>
                        <p className="text-xs font-medium italic leading-relaxed text-emerald-50/80">
                          {analysis}
                        </p>
                      </div>
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
