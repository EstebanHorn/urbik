/*
Este código define una página de configuración para una aplicación de mapas (probablemente inmobiliaria)
que permite a los usuarios personalizar su experiencia visual e interactiva mediante el uso de un contexto
global (MapSettingsProvider). A través de una interfaz moderna construida con React, Framer Motion y Lucide
React, el componente gestiona estados y preferencias como el estilo de las capas de datos, el mapa base, el
zoom del ratón, el análisis de zonas inteligentes y el tamaño de los elementos en la barra lateral,
ofreciendo además una vista previa en tiempo real mediante un mapa interactivo cargado de forma dinámica
para optimizar el rendimiento.
*/

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useMapSettings, ColorMode } from "@/features/map/context/MapSettingsProvider";
import { mapBaseLayers, type BaseLayerId } from "@/features/map/config/baseLayers";
import { 
  MousePointer2, 
  BrainCircuit, 
  LayoutList, 
  Palette, 
  Layers 
} from 'lucide-react';

const InteractiveMap = dynamic(
  () => import("@/features/map/components/InteractiveMap").then((m) => m.InteractiveMap),
  { 
    ssr: false,
    loading: () => <div className="h-[60vh] w-full bg-urbik-g200 animate-pulse rounded-[2rem]" /> 
  }
);

export default function SettingsPage() {
  const { 
    baseLayer, setBaseLayer, 
    propertiesLimit, setPropertiesLimit,
    colorMode, setColorMode,
    isZoneAnalysisEnabled, setIsZoneAnalysisEnabled,
    isScrollZoomEnabled, setIsScrollZoomEnabled 
  } = useMapSettings();

  const [sizePillData, setSizePillData] = useState({ width: 0, x: 0 });

  const sizeOptions = [
    { id: 2, label: "MUY GRANDE" },
    { id: 4, label: "GRANDE" },
    { id: 6, label: "NORMAL" },
    { id: 8, label: "CHICO" },
  ];

  const colorOptions = [
    { id: "uniform", label: "Uniforme", desc: "Color Esmeralda estándar", icon: <Palette size={20} /> },
    { id: "operation", label: "Por Operación", desc: "Venta o Alquiler", icon: <LayoutList size={20} /> },
    { id: "propertyType", label: "Por Propiedad", desc: "Casa, Depto, etc.", icon: <Layers size={20} /> },
  ];

  const updateSizePill = (element: HTMLButtonElement | null) => {
    if (element) {
      setSizePillData({
        width: element.offsetWidth,
        x: element.offsetLeft,
      });
    }
  };

  useEffect(() => {
    const activeBtn = document.getElementById(`size-btn-${propertiesLimit}`) as HTMLButtonElement;
    updateSizePill(activeBtn);
  }, [propertiesLimit]);

  const sectionClasses = "p-8 md:p-5 transition-all";
  const labelClasses = "mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide block";
  const toggleBase = "relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none ring-offset-2 focus:ring-2 focus:ring-urbik-black";

  return (
    <div className="bg-white overflow-x-hidden min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-20 relative mt-10 space-y-6">
        
        <header className="text-center mb-16">
          <h1 className="text-5xl font-display font-bold text-urbik-black tracking-tighter">
            Configuración
          </h1>
          <span className="block italic font-black text-6xl text-urbik-black">
            Personalizada.
          </span>
        </header>

        <div className="space-y-4">
          
          
          <section className={sectionClasses}>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-urbik-black p-2 rounded-full text-white">
                <MousePointer2 size={20} />
              </div>
              <h2 className="text-2xl font-display font-bold text-urbik-muted tracking-tight">Interacción</h2>
            </div>
            
            <div className="flex items-center justify-between px-8 py-6 bg-urbik-white border border-gray-200 rounded-[2rem]">
              <div>
                <h3 className="font-bold text-urbik-black text-lg">Zoom con mouse</h3>
                <p className="text-sm text-gray-500 italic">Navegación fluida con la rueda del ratón.</p>
              </div>
              <button 
                onClick={() => setIsScrollZoomEnabled(!isScrollZoomEnabled)}
                className={` cursor-pointer ${toggleBase} ${isScrollZoomEnabled ? 'bg-urbik-black' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isScrollZoomEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </section>

          <section className={sectionClasses}>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-urbik-black p-2 rounded-full text-white">
                <BrainCircuit size={20} />
              </div>
              <h2 className="text-2xl font-display font-bold text-urbik-muted tracking-tight">Urbik Smart Zone®</h2>
            </div>

            <div className="flex items-center justify-between px-8 py-6 bg-urbik-white border border-gray-200 rounded-[2rem]">
              <div>
                <h3 className="font-bold text-urbik-black text-lg">Análisis de zona</h3>
                <p className="text-sm text-gray-500 italic">Evaluación automática de entorno y servicios.</p>
              </div>
              <button 
                onClick={() => setIsZoneAnalysisEnabled(!isZoneAnalysisEnabled)}
                className={`  cursor-pointer ${toggleBase} ${isZoneAnalysisEnabled ? 'bg-urbik-black' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isZoneAnalysisEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </section>

          <section className={sectionClasses}>
            <label className={labelClasses}>Estilo de Capas</label>
            <div className="grid gap-4 md:grid-cols-3">
              {colorOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setColorMode(opt.id as ColorMode)}
                  className={`cursor-pointer flex flex-col p-6 rounded-[2rem] border transition-all text-left ${
                    colorMode === opt.id 
                    ? "border-urbik-black bg-urbik-black text-white shadow-lg scale-[1.02]" 
                    : "border-gray-200 bg-white hover:border-urbik-black/40 text-urbik-black"
                  }`}
                >
                  <div className={`mb-3 p-2 w-fit rounded-full ${colorMode === opt.id ? "bg-white/20" : "bg-urbik-black/5"}`}>
                    {opt.icon}
                  </div>
                  <span className="font-bold text-lg leading-tight">{opt.label}</span>
                  <span className={`text-xs mt-1 italic ${colorMode === opt.id ? "opacity-70" : "opacity-40"}`}>
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </section>
<section className={sectionClasses}>
  <div className="flex items-center gap-3 mb-8">
    <div className="bg-urbik-black p-2 rounded-full text-white">
      <LayoutList size={20} />
    </div>
    <h2 className="text-2xl font-display font-bold text-urbik-muted tracking-tight">Barra Lateral</h2>
  </div>
  
  <label className={labelClasses}>Tamaño de propiedades en barra lateral</label>
  
  <div className="relative flex bg-urbik-g300 rounded-full w-full overflow-hidden p-0 border border-transparent">
    <motion.div
      className="absolute top-0 bottom-0 bg-urbik-black rounded-full"
      initial={false}
      animate={{
        width: sizePillData.width,
        x: sizePillData.x,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
    />

    {sizeOptions.map((opt) => (
      <button
        key={opt.id}
        id={`size-btn-${opt.id}`}
        onClick={(e) => {
          setPropertiesLimit(opt.id);
          updateSizePill(e.currentTarget);
        }}
        className={`relative cursor-pointer z-10 flex-1 px-4 py-4 font-bold tracking-wide text-xs transition-colors duration-300 whitespace-nowrap rounded-full ${
          propertiesLimit === opt.id ? "text-urbik-white" : "text-urbik-muted hover:bg-urbik-g400/50"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
</section>
          <section className={sectionClasses}>
            <label className={labelClasses}>Mapa de Fondo</label>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.values(mapBaseLayers).map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setBaseLayer(layer.id as BaseLayerId)}
                  className={`flex cursor-pointer w-full flex-col rounded-full border px-8 py-5 text-left transition-all ${
                    baseLayer === layer.id 
                    ? "border-urbik-black bg-urbik-black text-white shadow-xl" 
                    : "border-gray-200 bg-white text-urbik-black hover:bg-gray-50"
                  }`}
                >
                  <div className="text-md font-bold italic">{layer.label}</div>
                  <p className={`text-[10px] font-medium uppercase tracking-wider ${baseLayer === layer.id ? "text-white/50" : "text-gray-400"}`}>
                    {layer.description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <div className="px-10 mt-10">
            <div className="overflow-hidden rounded-[2.5rem] border border-gray-200 bg-white shadow-2xl mb-20">
              <div className="px-0 py-2 mt-2 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                 <p className={labelClasses}>Vista Previa</p>
              </div>
              <InteractiveMap lat={-34.92145} lon={-57.95453} height="60vh" />
            </div>
          </div>
       
          
        </div>
      </div>
    </div>
  );
}