"use client";

import React from "react";
import { Loader2, X } from "lucide-react";
import { useSearchForm } from "./useSearchForm";
import SearchFormFields, { modalStyles } from "./SearchFormFields";

// Modal usado exclusivamente para EDITAR una búsqueda existente (abierto
// desde la card en "Mis Búsquedas" o desde /connections/[id]). Publicar una
// búsqueda nueva es una pantalla completa: /connections/new.
export default function CreateSearchModal({
  isOpen,
  onClose,
  clients,
  editingSearch,
  onPublished,
}: any) {
  const { formData, setField, handleLocation, handleSubmit, error, submitting, isRural, isEditing } =
    useSearchForm({
      isOpen,
      clients,
      editingSearch,
      onPublished: (data) => {
        onPublished?.(data);
        onClose();
      },
    });

  if (!isOpen) return null;

  return (
    <>
      <style>{modalStyles}</style>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-0 md:pt-20 md:px-6 md:pb-6 animate-fade-in">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative w-full h-full max-w-none rounded-none md:max-w-xl md:h-[85vh] md:rounded-3xl bg-white flex flex-col shadow-2xl overflow-hidden">
          <div className="flex flex-col shrink-0 border-b border-gray-100">
            <div className="flex items-center justify-between px-8 py-5">
              <h2 className="text-lg font-black text-geora-black">
                {isEditing ? "Editar Búsqueda" : "Publicar Búsqueda"}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            {error && (
              <div className="mx-8 mb-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                <span className="text-red-500 font-bold leading-none">!</span>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
            <SearchFormFields
              formData={formData}
              setField={setField}
              handleLocation={handleLocation}
              isRural={isRural}
              isEditing={isEditing}
              clients={clients}
            />
          </div>

          <div className="px-8 py-4 shrink-0 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-geora-black text-white font-bold disabled:opacity-40 hover:bg-geora-black/80 transition-all cursor-pointer"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {isEditing ? "GUARDAR CAMBIOS" : "PUBLICAR BÚSQUEDA"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
