"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useSearchForm } from "@/components/dashboard/connections/useSearchForm";
import SearchFormFields, { modalStyles } from "@/components/dashboard/connections/SearchFormFields";

export default function NewSearchPage() {
  return (
    <Suspense fallback={<div className="pt-24 min-h-screen text-center">Cargando...</div>}>
      <NewSearchPageInner />
    </Suspense>
  );
}

function NewSearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get("clientId") || "";

  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch(() => setClients([]));
  }, []);

  const { formData, setField, handleLocation, handleSubmit, error, submitting, isRural, isEditing } =
    useSearchForm({
      clients,
      initialClientId,
      onPublished: (data) => {
        router.push(`/connections/${data.id}`);
      },
    });

  return (
    <div className="pt-24 pb-28 min-h-screen bg-gray-50/50">
      <style>{modalStyles}</style>
      <div className="max-w-4xl mx-auto px-4 md:px-10">
        <Link
          href="/connections"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-geora-black/50 hover:text-geora-black transition-colors mb-4 group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Volver a la Bolsa
        </Link>

        <div className="bg-white rounded-[24px] overflow-hidden">
          <div className="px-6 md:px-8 py-6 border-b border-gray-100">
            <h1 className="text-xl font-black text-geora-black">Publicar Búsqueda</h1>
            <p className="text-sm text-geora-black/50 font-medium mt-1">
              Se publica en la Bolsa de Conexiones para que otras inmobiliarias respondan.
            </p>
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                <span className="text-red-500 font-bold leading-none">!</span>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>

          <div className="px-6 md:px-8 py-6">
            <SearchFormFields
              formData={formData}
              setField={setField}
              handleLocation={handleLocation}
              isRural={isRural}
              isEditing={isEditing}
              clients={clients}
            />
          </div>

          <div className="px-6 md:px-8 py-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-geora-black text-white font-bold disabled:opacity-40 hover:bg-geora-black/80 transition-all cursor-pointer"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              PUBLICAR BÚSQUEDA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
