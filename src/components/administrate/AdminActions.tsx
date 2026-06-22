"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pause, Play, ShieldAlert, Loader2, Check, X } from "lucide-react";

interface AdminActionsProps {
  id: string | number;
  currentStatus?: string;
  type: "property" | "user";
}

type ActionType = "delete" | "pause" | null;

export default function AdminActions({ id, currentStatus, type }: AdminActionsProps) {
  const router = useRouter();
  
  const [pendingAction, setPendingAction] = useState<ActionType>(null);
  const [isLoading, setIsLoading] = useState(false);

  const executeDelete = async () => {
    try {
      const endpoint = type === "property" ? `/api/property/${id}` : `/api/user/${id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      
      if (res.ok) {
        alert(`${type === "property" ? "Propiedad" : "Inmobiliaria"} eliminada`);
        router.push(type === "property" ? "/dashboard" : "/");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar");
      }
    } catch {
      alert("Error de conexión");
    }
  };

  const executeTogglePause = async () => {
    const newStatus = currentStatus === "PAUSED" ? "AVAILABLE" : "PAUSED";
    try {
      const endpoint = type === "property" ? `/api/property/${id}` : `/api/user/${id}`;
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Error al cambiar el estado");
      }
    } catch {
      alert("Error de conexión");
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    
    if (pendingAction === "delete") {
      await executeDelete();
    } else if (pendingAction === "pause") {
      await executeTogglePause();
    }
    
    setIsLoading(false);
    setPendingAction(null);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-[9999] bg-white/10 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] rounded-full transition-all duration-300 min-h-[72px] flex items-center justify-center overflow-hidden">
      
      <div className="w-full relative px-4 py-3 flex items-center justify-center">
        
        {pendingAction !== null ? (
          <div className="flex w-full items-center justify-center gap-4 transition-opacity duration-300">
            {isLoading ? (
              <div className="flex items-center gap-3 text-geora-black font-bold">
                <Loader2 className="animate-spin" size={24} />
                <span>{pendingAction === "delete" ? "Eliminando..." : "Procesando..."}</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-4">
                <span className="font-bold text-geora-black text-center sm:text-left">
                  ¿Confirmar {pendingAction === "delete" ? "eliminación" : "cambio de estado"}?
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPendingAction(null)}
                    disabled={isLoading}
                    className="cursor-pointer flex justify-center items-center gap-2 px-5 py-2.5 bg-white/50 hover:bg-white/80 border border-white text-geora-black shadow-sm rounded-full text-sm font-bold transition-all duration-300 active:scale-95"
                  >
                    <X size={16} /> Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={`cursor-pointer flex justify-center items-center gap-2 px-5 py-2.5 border border-white shadow-sm rounded-full text-sm font-bold transition-all duration-300 active:scale-95 text-white ${
                      pendingAction === "delete" ? "bg-geora-rose hover:opacity-80" : "bg-geora-black hover:opacity-80"
                    }`}
                  >
                    <Check size={16} /> Confirmar
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          
          <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4 transition-opacity duration-300">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2 bg-geora-black text-white rounded-full">
                <ShieldAlert size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-geora-black/60">
                  Modo Administrador
                </p>
                <p className="text-sm font-bold text-geora-black">
                  Gestionando {type === "property" ? "propiedad" : "inmobiliaria"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => setPendingAction("pause")}
                className="flex-1 sm:flex-none cursor-pointer flex justify-center items-center gap-2 px-5 py-2.5 bg-white/10 border border-white text-geora-black/60 shadow-sm rounded-full text-sm font-bold transition-all duration-300 active:scale-95"
              >
                {currentStatus === "PAUSED" ? <Play size={16} /> : <Pause size={16} />}
                {currentStatus === "PAUSED" ? "Reanudar" : "Pausar"}
              </button>
              
              <button
                onClick={() => setPendingAction("delete")}
                className="flex-1 sm:flex-none cursor-pointer flex justify-center items-center gap-2 px-5 py-2.5 bg-white/10 border border-white text-geora-rose shadow-sm rounded-full text-sm font-bold transition-all duration-300 active:scale-95"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}