"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import { X, MapPin } from "lucide-react";
import type { Geometry } from "geojson";

const ParcelPickerMap = dynamic(() => import("./ParcelPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-50 flex items-center justify-center">
      <p className="text-xs font-bold text-gray-400 tracking-widest animate-pulse">
        Cargando mapa...
      </p>
    </div>
  ),
});

export interface SelectedParcel {
  cca: string;
  pda?: string;
  geometry: Geometry;
  lat: number;
  lon: number;
}

interface ParcelPickerModalProps {
  open: boolean;
  province: string;
  city?: string;
  onClose: () => void;
  onConfirm: (parcel: SelectedParcel) => void;
}

export default function ParcelPickerModal({
  open,
  province,
  city,
  onClose,
  onConfirm,
}: ParcelPickerModalProps) {
  const [selected, setSelected] = useState<SelectedParcel | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  if (!open) return null;

  const handleParcelClick = async (lat: number, lng: number) => {
    setLoading(true);
    setNotFound(false);
    try {
      const res = await fetch(
        `/api/parcels/point?lat=${lat}&lng=${lng}&province=${encodeURIComponent(province)}`,
      );
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      if (data.cca || data.geometry) {
        setSelected({ cca: data.cca, pda: data.pda, geometry: data.geometry, lat, lon: lng });
        setNotFound(false);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 flex flex-col"
        style={{ height: "88vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="font-black text-urbik-black">
              Seleccionar parcela catastral
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Hacé click sobre una parcela en el mapa para vincularla
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 min-h-0 relative">
          <ParcelPickerMap
            province={province}
            city={city}
            onParcelClick={handleParcelClick}
            selectedGeometry={selected?.geometry ?? null}
          />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 rounded-xl px-4 py-2.5 shadow-lg border border-gray-100">
                <p className="text-xs font-bold text-urbik-black">
                  Buscando parcela...
                </p>
              </div>
            </div>
          )}

          {notFound && !loading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-white/90 rounded-xl px-4 py-2.5 shadow-lg border border-red-100">
                <p className="text-xs font-bold text-red-500">
                  No se encontró parcela en ese punto
                </p>
              </div>
            </div>
          )}

          {!selected && !loading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-lg border border-gray-100">
                <p className="text-xs font-bold text-urbik-black/60 tracking-widest">
                  Hacé click sobre una parcela para seleccionarla
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex items-center gap-3">
          {selected ? (
            <div className="flex-1 bg-emerald-50 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-emerald-100">
              <MapPin size={15} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-emerald-700">
                  Parcela seleccionada
                </p>
                <p className="text-xs text-emerald-600">
                  CCA: {selected.cca}
                  {selected.pda ? ` · PDA: ${selected.pda}` : ""}
                </p>
              </div>
            </div>
          ) : (
            <p className="flex-1 text-xs text-gray-400 font-medium">
              Ninguna parcela seleccionada aún
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
            className="px-6 py-2.5 rounded-full bg-urbik-cyan text-urbik-black font-black text-sm disabled:opacity-40 cursor-pointer"
          >
            Confirmar selección
          </button>
        </div>
      </div>
    </div>
  );
}
