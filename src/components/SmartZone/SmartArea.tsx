/*
Este componente de React es una interfaz visual diseñada para mostrar un análisis inteligente 
de una zona geográfica específica basándose en los datos recibidos mediante la propiedad data.
Cuando el componente detecta cambios en la información de la zona, activa un efecto que realiza
una petición POST asíncrona a un endpoint de API (/api/smart-zone/smart-area) para obtener una descripción
textual generada, gestionando estados de carga que disparan una animación de video tipo "loading"
y manejando posibles errores de red. Finalmente, renderiza una tarjeta con estética futurista que
incluye el logotipo de la aplicación, el nombre de la zona, la dirección y el análisis obtenido,
utilizando transiciones de CSS para alternar suavemente entre el estado de carga y la visualización
de los resultados.
*/

import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { ZoneData } from '../../features/map/components/MapEventsHandler';

interface ZoneAnalysisProps {
  data: ZoneData | null;
}

export const ZoneAnalysis = ({ data }: ZoneAnalysisProps) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data) return;

    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/smart-zone/smart-area', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        setAnalysis(result.text);
      } catch (error) {
        setAnalysis("No se pudo cargar el análisis de la zona.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [data]);

  if (!data) return null;

  return (
    <div className="bg-black/90 backdrop-blur-xl p-5 rounded-2xl shadow-[0_0_40px_-12px_rgba(16,185,129,0.3)] border border-urbik-emerald/30 w-80 transition-all duration-500 ease-in-out">
      
      <div className={`flex flex-col items-center justify-center transition-all duration-500 ${loading ? 'opacity-100 h-28' : 'opacity-0 h-0 overflow-hidden'}`}>
        <video 
          src="/ia_loading.webm" 
          autoPlay loop muted playsInline
          className="w-20 h-auto rounded-lg brightness-125"
        />
      </div>

      <div className={`grid transition-all w-full duration-500 ease-in-out ${!loading ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
        <div className="overflow-hidden w-full"> 
          <div className="flex w-full mb-4 border-b border-white/10 pb-3">
            <div className="flex justify-between items-center w-full">
              <img 
                src="/Urbik_Logo_Smart_Zone.svg" 
                alt="Urbik Logo" 
                className="w-6 h-6 object-contain drop-shadow-[0_0_3px_rgba(16,185,129,1)]" 
              />
              <h3 className="text-sm font-black text-white italic tracking-tighter uppercase mr-2">
                Urbik <span className="text-urbik-emerald">Smart Zone</span>
              </h3>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin className="w-3 h-3 text-urbik-emerald" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{data.zone}</p>
              </div>
              
              <div className="bg-urbik-emerald/5 border border-urbik-emerald/20 p-3 rounded-xl">
                <p className="text-sm text-emerald-50/90 leading-relaxed font-medium italic">
                  "{analysis}"
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <p className="text-[9px] text-gray-500 font-mono text-right truncate">
                {data.address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};