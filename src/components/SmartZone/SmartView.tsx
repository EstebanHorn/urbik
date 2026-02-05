/*
Este componente de React, denominado SmartZoneSingle, es una interfaz de cliente diseñada para
obtener y visualizar un análisis de inteligencia artificial sobre una propiedad inmobiliaria
específica. Al montarse o recibir una nueva propiedad, el código extrae datos de ubicación
(barrio, ciudad y coordenadas) para realizar una petición asíncrona a una API interna
(/api/smart-zone/smart-view), gestionando estados de carga y errores mediante hooks de React.
Finalmente, presenta los resultados —un puntaje numérico y un veredicto textual— dentro de un
contenedor visualmente sofisticado que utiliza Framer Motion para transiciones fluidas,
animaciones de carga en video y un diseño responsivo con estilos de Tailwind CSS.
*/

"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SmartZoneSingle({ property }: { property: any }) {
  const [analysis, setAnalysis] = useState<{
    score: number;
    verdict: string;
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(true);

  useEffect(() => {
    const getAiAnalysis = async () => {
      try {
        const locationData = {
          neighborhood: property.address.split(",")[0],
          city: property.city,
          province: property.province,
          coords: { lat: property.latitude, lng: property.longitude },
        };

        const res = await fetch("/api/smart-zone/smart-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            property: {
              ...property,
              locationData,
            },
          }),
        });
        const data = await res.json();
        setAnalysis(data);
      } catch (err) {
        console.error("Error AI:", err);
      } finally {
        setLoadingAi(false);
      }
    };

    if (property) getAiAnalysis();
  }, [property]);

  return (
    <div className="mt-24 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-urbik-emerald/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 md:p-12 border border-urbik-emerald/30 shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)] relative overflow-hidden">
          <div className="absolute top-8 right-8">
            <img
              src="/Urbik_Logo_Smart_Zone.svg"
              alt="Smart Zone"
              className="h-10 w-auto drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center  mr-15">
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
              <span className="bg-urbik-emerald text-black text-sm font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-4">
                Análisis de IA
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-none tracking-tighter uppercase">
                URBIK SMART <br />
                <span className="text-urbik-emerald italic text-6xl md:text-8xl block mt-1 -ml-5">
                  ZONE
                </span>
              </h2>

              <div className="flex gap-4 mt-2">
                <div className="h-28 w-28 bg-urbik-emerald/10 border border-urbik-emerald/20 rounded-2xl flex flex-col items-center justify-center backdrop-blur-sm">
                  <span className="text-urbik-emerald font-black text-4xl">
                    {loadingAi ? (
                      <div className="w-6 h-6 border-2 border-urbik-emerald border-t-transparent rounded-full animate-spin" />
                    ) : (
                      analysis?.score || "N/A"
                    )}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Score Zona
                  </span>
                </div>
                <div className="h-28 w-28 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-black text-4xl">AI</span>
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                    Engine v2.1
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 relative">
              <div
                className="bg-white/5 border border-white/10 rounded-2xl p-8 min-h-[220px] 
              flex items-center justify-center relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {loadingAi ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center"
                    >
                      <video
                        src="/ia_loading.webm"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-32 h-32 object-contain"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative z-10"
                    >
                      <p className="text-md md:text-2xl  font-medium text-emerald-50/80 italic text-center lg:text-left">
                        {analysis?.verdict}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 flex justify-between items-center px-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${loadingAi ? "bg-gray-600" : "bg-urbik-emerald animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]"}`}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    {loadingAi ? "Neural Mapping..." : "Análisis Completo"}
                  </span>
                </div>
                <div className="text-[10px] text-urbik-emerald/60 font-bold uppercase tracking-widest flex gap-4">
                  <span
                    className={
                      loadingAi
                        ? "opacity-20"
                        : "opacity-100 transition-opacity"
                    }
                  >
                    Market Gap: OK
                  </span>
                  <span
                    className={
                      loadingAi
                        ? "opacity-20"
                        : "opacity-100 transition-opacity"
                    }
                  >
                    ROI: Calculated
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
