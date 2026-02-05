"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { PropertySummary } from "../../../app/dashboard/page";
import { deleteProperty } from "../service/dashboardService";
import ConfirmationModal from "../components/ConfirmationModal";

interface PropertiesListProps {
  properties: PropertySummary[];
  onRefresh: () => void;
  onEdit: (property: PropertySummary) => void;
}

export default function PropertiesList({
  properties,
  onRefresh,
  onEdit,
}: PropertiesListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null);
  const router = useRouter();

  const triggerDelete = (id: number) => {
    setPropertyToDelete(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;

    setDeletingId(propertyToDelete);
    try {
      await deleteProperty(propertyToDelete);
      onRefresh();
      setIsModalOpen(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message || "Error al eliminar");
      } else {
        alert("Ocurrió un error inesperado.");
      }
    } finally {
      setDeletingId(null);
      setPropertyToDelete(null);
    }
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col items-center justify-center">
        <h3 className="text-lg font-bold text-gray-900">
          Aún no hay propiedades
        </h3>
        <p className="text-gray-500 mb-0 max-w-sm">
          Cargá tu primera propiedad usando el botón &quot;Cargar
          propiedad&quot; de arriba.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-md text-urbik-black/50 font-bold tracking-wider border-b border-gray-200">
              <th className="px-7 py-5">Propiedad</th>
              <th className="px-7 py-5">Precio</th>
              <th className="px-10 py-5">Estado</th>
              <th className="px-6 py-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {properties.map((prop) => (
              <tr
                key={prop.id}
                onClick={() => router.push(`/property/${prop.id}`)}
                className="group hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-sm bg-gray-200 overflow-hidden shrink-0 border border-gray-200 relative">
                      {prop.images && prop.images.length > 0 ? (
                        <img
                          src={prop.images[0]}
                          alt={prop.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs font-bold">
                          URBIK
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 truncate max-w-[220px]">
                        <Link href={`/property/${prop.id}`}>{prop.title}</Link>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {prop.city ?? "—"}, {prop.province ?? "—"}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 font-bold text-gray-900">
                  {prop.price ? (
                    `USD ${prop.price.toLocaleString("es-AR")}`
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                <td className="px-6 py-4">
                  {prop.status === "AVAILABLE" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-urbik-emerald border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-urbik-emerald"></span>
                      Activa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-500 border border-gray-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                      Pausada
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/property/${prop.id}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-urbik-cyan text-urbik-cyan hover:text-white hover:border-white hover:bg-urbik-cyan transition-colors disabled:opacity-50"
                      title="Ver publicación"
                    >
                      ↗
                    </Link>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(prop);
                      }}
                      className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full bg-white border border-urbik-emerald text-urbik-emerald hover:text-white hover:border-white hover:bg-urbik-emerald transition-colors disabled:opacity-50"
                      title="Editar"
                    >
                      ✎
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerDelete(prop.id);
                      }}
                      disabled={deletingId === prop.id}
                      className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full bg-white border border-urbik-rose text-urbik-rose hover:text-white hover:border-white hover:bg-urbik-rose transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      {deletingId === prop.id ? "..." : "✕"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar propiedad?"
        message="Esta acción es permanente y la propiedad dejará de estar visible en el portal."
        isLoading={deletingId !== null}
      />
    </div>
  );
}
