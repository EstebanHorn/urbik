/*
Este componente de React es una interfaz interactiva diseñada para comparar propiedades
inmobiliarias en tiempo real mediante el uso de inteligencia artificial y análisis estadístico
visual. El código gestiona un estado de "modo comparación" que, al activarse con al menos dos
propiedades seleccionadas, envía los datos técnicos y de ubicación a un endpoint de IA
(/api/smart-zone/smart-compare) para generar un análisis de rentabilidad y brechas, mientras simultáneamente
renderiza una tabla comparativa donde se resaltan automáticamente los mejores y peores valores
(como precio, superficie y habitaciones) utilizando una lógica de colores dinámica. Además,
integra animaciones fluidas con Framer Motion, estados de carga mediante video y un diseño visualmente
sofisticado (Urbik Smart Zone) orientado a mejorar la toma de decisiones del usuario final.
*/

"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Property {
  id: number;
  title: string;
  price: number;
  area: number;
  rooms: number;
  bathrooms: number;
  images: string[];
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
}

export default function Versus({
  selectedProperties,
  isVersusMode,
  setIsVersusMode,
  hasFavorites,
  setSelectedIds
}: {
  selectedProperties: Property[],
  isVersusMode: boolean,
  setIsVersusMode: (val: boolean) => void,
  hasFavorites: boolean,
  setSelectedIds: (ids: number[]) => void
}) {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const getAiAnalysis = async () => {
    if (selectedProperties.length < 2) {
      setAiAnalysis(null);
      return;
    }
    
    setLoadingAi(true);
    try {
      const propertiesData = selectedProperties.map((p, index) => {
        const nearbyProperty = selectedProperties.find((other, otherIdx) => {
          if (index === otherIdx) return false;
          return Math.abs(p.latitude - other.latitude) < 0.005 && Math.abs(p.longitude - other.longitude) < 0.005;
        });
        return {
          title: p.title, price: p.price, area: p.area, rooms: p.rooms, bathrooms: p.bathrooms,
          neighborhood: p.address.split(',')[0], city: p.city, province: p.province,
          coords: { lat: p.latitude, lng: p.longitude },
          share_zone_with: nearbyProperty ? nearbyProperty.title : null
        };
      });

      const res = await fetch("/api/smart-zone/smart-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ properties: propertiesData }),
      });
      const data = await res.json();
      setAiAnalysis(data.text);
    } catch (err) {
      setAiAnalysis("No se pudo obtener el análisis en este momento.");
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (isVersusMode && selectedProperties.length >= 2) {
      getAiAnalysis();
    } else {
      setAiAnalysis(null);
    }
  }, [selectedProperties.length, isVersusMode]);

  const getStatColor = (value: number | null, key: keyof Property, isLowerBetter: boolean) => {
    const allValues = selectedProperties.map(p => p[key] as number);
    if (allValues.length <= 1 || value === null) return "text-white";
    
    const max = Math.max(...allValues);
    const min = Math.min(...allValues);
    
    if (max === min) return "text-white/80";
    if (isLowerBetter ? value === min : value === max) {
      return "text-urbik-emerald drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]";
    }
    if (isLowerBetter ? value === max : value === min) {
      return "text-red-400";
    }
    return "text-white/60";
  };

  if (!hasFavorites) return null;

  const stats = [
    { label: "Precio", key: "price" as keyof Property, unit: "$", lowerBetter: true },
    { label: "Superficie", key: "area" as keyof Property, unit: " m²", lowerBetter: false },
    { label: "Habitaciones", key: "rooms" as keyof Property, unit: "", lowerBetter: false },
    { label: "Baños", key: "bathrooms" as keyof Property, unit: "", lowerBetter: false },
  ];

  return (
    <div className="mt-10 flex flex-col items-center w-full shadow-[0_0_40px_-12px_rgba(16,185,129,1)] border border-urbik-emerald/30 pt-10 pb-20 relative overflow-hidden bg-urbik-black rounded-3xl mx-auto max-w-7xl px-4 md:px-6">
      
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-urbik-emerald/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-urbik-emerald/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-4xl w-full flex flex-col items-center px-0 relative z-10">
        
        <div className="w-full bg-black/50 backdrop-blur-md rounded-full py-3 px-8 flex items-center justify-between shadow-2xl mb-8 border border-urbik-emerald/30">
          <div className="flex items-center justify-between w-2/3">
            <img 
              src="/Urbik_Logo_Smart_Zone.svg" 
              alt="Urbik Smart Zone" 
              className={`h-6 md:h-8 transition-all duration-700 ease-in-out ${
                isVersusMode 
                  ? "brightness-100 invert-0 drop-shadow-[0_0_5px_rgba(16,185,129,1)]" 
                  : "brightness-0 invert opacity-40"
              }`}
            />
            <span className={`mr-5 text-xs md:text-sm font-black italic tracking-tighter w-1/3 uppercase transition-colors duration-300 ${isVersusMode ? 'text-white' : 'text-white/30'}`}>
              Urbik <span className={isVersusMode ? 'text-urbik-emerald' : 'text-white/30'}>Smart Zone</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className={`hidden md:block text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${isVersusMode ? 'text-urbik-emerald' : 'text-white/30'}`}>
              {isVersusMode ? 'Análisis Activo' : 'Modo Comparación'}
            </span>
            <button 
              onClick={() => {
                setIsVersusMode(!isVersusMode);
                if (isVersusMode) setSelectedIds([]);
              }}
              className={`w-12 h-6 md:w-14 cursor-pointer md:h-7 flex items-center rounded-full p-1 transition-all duration-300 shadow-inner ${isVersusMode ? 'bg-urbik-emerald shadow-emerald-500/50' : 'bg-white/10'}`}
            >
              <motion.div 
                layout
                className="bg-white w-4 h-4 md:w-5 md:h-5 rounded-full shadow-lg"
                animate={{ x: isVersusMode ? 24 : 0 }}
              />
            </button>
          </div>
        </div>
        
        <div className="min-h-[140px] w-full flex items-center justify-center max-w-3xl mb-10">
          <AnimatePresence mode="wait">
            {loadingAi ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
                <video src="/ia_loading.webm" autoPlay loop muted playsInline className="w-20 h-20 object-cover brightness-125" />
              </motion.div>
            ) : aiAnalysis ? (
              <motion.div key="analysis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden w-full text-center">
                <div className="bg-urbik-emerald/5 border border-urbik-emerald/20 p-6 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 bg-urbik-emerald rounded-full shadow-[0_0_8px_rgba(16,185,129,1)]" />
                    <span className="text-[11px] font-black tracking-[0.2em] text-urbik-emerald uppercase">Resultado de la consulta</span>
                  </div>
                  <p className="text-lg font-medium italic leading-relaxed text-emerald-50/90">{aiAnalysis}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="description" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                {isVersusMode && selectedProperties.length < 2 ? (
                  <span className="text-urbik-emerald text-xl font-black italic uppercase tracking-tighter animate-pulse">
                    {selectedProperties.length === 0 ? "Elegí propiedades para comparar" : "Seleccioná una segunda opción"}
                  </span>
                ) : (
                  <div className="max-w-xl mx-auto opacity-60">
                    <h4 className="text-white text-lg font-black italic uppercase tracking-tighter mb-2">Urbik <span className="text-urbik-emerald">Smart Zone®</span></h4>
                    <p className="text-gray-400 text-sm font-medium">Análisis de brechas y rentabilidad en tiempo real.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isVersusMode && selectedProperties.length >= 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-6xl overflow-x-auto"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-4 bg-transparent text-left w-48"></th>
                  {selectedProperties.map((p) => (
                    <th key={p.id} className="p-4 min-w-[200px]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-3/4 h-32 rounded-md overflow-hidden border border-white/10 opacity-30">
                          <img src={p.images[0]} className="w-full h-full object-cover" alt="" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-tighter text-white text-center ">
                          {p.title}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => (
                  <tr key={stat.key} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-6 text-[10px] font-bold text-urbik-white/50 uppercase tracking-widest">
                      {stat.label}
                    </td>
                    {selectedProperties.map((p) => {
                      const val = p[stat.key] as number;
                      return (
                        <td key={p.id} className="p-6 text-center">
                          <span className={`text-xl md:text-2xl font-black tracking-tighter transition-all duration-500 ${getStatColor(val, stat.key, stat.lowerBetter)}`}>
                            {stat.unit === "$" && "$"}
                            {val?.toLocaleString() || "-"}
                            {stat.unit !== "$" && stat.unit}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}