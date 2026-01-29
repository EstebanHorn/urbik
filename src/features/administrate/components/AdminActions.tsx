/*
Este componente de React, denominado AdminActions, es un panel de control interactivo para
una aplicación Next.js que permite a los administradores gestionar propiedades o usuarios
mediante acciones directas sobre una API. El código utiliza el hook useRouter para actualizar
la interfaz tras realizar cambios y define dos funciones principales: handleDelete, que ejecuta
una petición DELETE para eliminar permanentemente el registro tras una confirmación del usuario,
y handleTogglePause, que permite alternar el estado de una propiedad entre "disponible" y "pausada"
mediante una petición PUT. Visualmente, el componente renderiza un contenedor estilizado con botones
que cambian dinámicamente según el tipo de entidad y su estado actual, asegurando que la interfaz
se refresque automáticamente para reflejar los cambios realizados en la base de datos.
*/

"use client";

import { useRouter } from "next/navigation";
import { Trash2, Pause, Play } from "lucide-react";

interface AdminActionsProps {
  id: number;
  currentStatus?: string;
  type: "property" | "user";
}

export default function AdminActions({ id, currentStatus, type }: AdminActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    const targetName = type === "property" ? "esta propiedad" : "esta inmobiliaria/cuenta";
    if (!confirm(`¿Estás seguro de que deseas eliminar ${targetName}? Esta acción es irreversible.`)) return;

    try {
      const endpoint = type === "property" ? `/api/property/${id}` : `/api/user`;
      
      const res = await fetch(endpoint, { method: "DELETE" });
      
      if (res.ok) {
        alert(`${type === "property" ? "Propiedad" : "Inmobiliaria"} eliminada`);
        router.push(type === "property" ? "/dashboard" : "/");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  const handleTogglePause = async () => {
    if (type !== "property") return;
    
    const newStatus = currentStatus === "PAUSED" ? "AVAILABLE" : "PAUSED";
    
    try {
      const res = await fetch(`/api/property/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Error al cambiar el estado");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  return (
    <div className="flex mt-4 p-4 border justify-between border-urbik-black/60 rounded-md items-center bg-white/50 backdrop-blur-sm">
      <p className="w-1/2 text-xl font-bold text-urbik-black/50 ml-5">
        Panel de Administración de {type === "property" ? "Propiedad" : "Inmobiliaria"}
      </p>
      <div className="flex gap-2">
        {type === "property" && (
          <button
            onClick={handleTogglePause}
            className="flex items-center gap-2 px-4 py-2 border border-urbik-white bg-urbik-cyan hover:bg-urbik-white hover:border-urbik-cyan hover:text-urbik-cyan text-white rounded-full text-sm font-bold transition-colors"
          >
            {currentStatus === "PAUSED" ? <Play size={16} /> : <Pause size={16} />}
            {currentStatus === "PAUSED" ? "Reanudar" : "Pausar"}
          </button>
        )}
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 border border-urbik-white bg-urbik-rose hover:bg-urbik-white hover:border-urbik-rose hover:text-urbik-rose text-white rounded-full text-sm font-bold transition-colors"
        >
          <Trash2 size={16} />
          Eliminar {type === "property" ? "Propiedad" : "Inmobiliaria"}
        </button>
      </div>
    </div>
  );
}