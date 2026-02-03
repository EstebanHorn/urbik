/*
Este código define un componente de React llamado PauseAccountZone que permite a los usuarios
(probablemente inmobiliarias) pausar o reactivar su visibilidad pública mediante una interfaz
dinámica. El componente cambia visualmente entre un estado de alerta (ámbar para pausar) y uno
de éxito (verde para reactivar), utilizando una ventana modal de confirmación animada con Framer
Motion para asegurar que el usuario esté de acuerdo antes de ejecutar el cambio de estado.
*/

"use client";
import React, { useState } from 'react';
import { Pause, Play, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PauseAccountZoneProps {
  isPaused: boolean;
  onTogglePause: (newState: boolean) => void;
}

const PauseAccountZone = ({ isPaused, onTogglePause }: PauseAccountZoneProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className={`p-5 pl-10 rounded-[3rem] border ${isPaused ? 'bg-green-50 border-green-200' : 'bg-urbik-black/10 border-urbik-black/20'}`}>
        <div className="flex items-center gap-3 mb-2">
          {isPaused ? <Play className="text-urbik-emerald" size={24} /> : <Pause className="text-urbik-black/50" size={24} />}
          <h3 className={`font-display font-bold text-lg uppercase tracking-tight ${isPaused ? 'text-urbik-emerald' : 'text-urbik-black/50'}`}>
            {isPaused ? "Reactivar Cuenta" : "Pausar Cuenta"}
          </h3>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className={`text-sm font-medium max-w-md ${isPaused ? 'text-green-700/80' : 'text-urbik-black/80'}`}>
            {isPaused 
              ? "Tu cuenta está pausada. Tus propiedades y perfil no son visibles para el público. Actívala para volver a operar."
              : "Al pausar tu cuenta, tu perfil y todas tus propiedades dejarán de ser visibles temporalmente. Podrás reactivarla en cualquier momento."}
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className={`whitespace-nowrap cursor-pointer px-5 py-2 border-2 font-bold rounded-full transition-all shadow-sm ${
              isPaused 
              ? "border-urbik-emerald text-urbik-emerald hover:bg-urbik-emerald hover:text-white" 
              : "border-urbik-black/50 text-urbik-black/50 hover:bg-urbik-black/50 hover:text-white"
            }`}
          >
            {isPaused ? "Reactivar Ahora" : "Pausar Cuenta"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} 
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl text-center"
            >
              <button onClick={() => setShowModal(false)} className="absolute cursor-pointer top-8 right-8 text-gray-400 hover:text-black">
                <X size={28} />
              </button>

              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isPaused ? 'bg-green-100' : 'bg-urbik-black/30'}`}>
                {isPaused ? <Play className="text-urbik-emerald" /> : <Pause className="text-urbik-black/50" />}
              </div>

              <h3 className="text-2xl font-display font-bold mb-4">
                {isPaused ? "¿Reactivar tu presencia?" : "¿Quieres pausar tu cuenta?"}
              </h3>
              
              <p className="text-gray-600 mb-8">
                {isPaused 
                  ? "Tus propiedades volverán a estar visibles en los resultados de búsqueda inmediatamente."
                  : "Esto ocultará tu perfil de inmobiliaria y todas tus publicaciones activas hasta que decidas volver."}
              </p>

              <button 
                onClick={() => {
                  onTogglePause(!isPaused);
                  setShowModal(false);
                }} 
                className={`w-full py-4 cursor-pointer rounded-full font-black transition-all ${
                  isPaused 
                  ? "bg-urbik-emerald text-white shadow-green-200 shadow-xl" 
                  : "bg-urbik-black/50 text-white shadow-urbik-black/20 shadow-xl"
                }`}
              >
                SÍ, {isPaused ? "REACTIVAR" : "PAUSAR"} CUENTA
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PauseAccountZone;