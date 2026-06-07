"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import { X, MapPin, MousePointerClick } from "lucide-react";
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
  cca: string | null;
  pda?: string | null;
  geometry: Geometry | null;
  lat: number;
  lon: number;
  isManual?: boolean;
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
  const [fetchError, setFetchError] = useState(false);
  const [mode, setMode] = useState<"parcel" | "manual">("parcel");

  if (!open) return null;

  const handleParcelClick = async (lat: number, lng: number) => {
    if (mode === "manual") {
      setSelected({
        cca: null,
        pda: null,
        geometry: null,
        lat,
        lon: lng,
        isManual: true,
      });
      return;
    }

    setLoading(true);
    setNotFound(false);
    setFetchError(false);
    try {
      const res = await fetch(
        `/api/parcels/point?lat=${lat}&lng=${lng}&province=${encodeURIComponent(province)}`
      );
      if (res.status === 404) {
        setNotFound(true);
        setSelected(null);
        return;
      }
      if (!res.ok) {
        setFetchError(true);
        setSelected(null);
        return;
      }
      const data = await res.json();
      if (data.cca || data.geometry) {
        setSelected({ cca: data.cca, pda: data.pda, geometry: data.geometry, lat, lon: lng });
        setNotFound(false);
      }
    } catch {
      setFetchError(true);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (newMode: "parcel" | "manual") => {
    setMode(newMode);
    setSelected(null);
    setNotFound(false);
    setFetchError(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 flex flex-col"
        style={{ height: "88vh" }}
      >
        <div className="flex items-start justify-between px-5 pt-4 pb-0 border-b border-gray-100 shrink-0">
          <div className="w-full">
            <h3 className="font-black text-urbik-black">Ubicación de la propiedad</h3>
            
            <div className="flex items-center gap-6 mt-4">
              <button
                onClick={() => toggleMode("parcel")}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                  mode === "parcel" ? "border-urbik-cyan text-urbik-black" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Parcela Catastral
              </button>
              <button
                onClick={() => toggleMode("manual")}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                  mode === "manual" ? "border-urbik-cyan text-urbik-black" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Pin Manual
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-4 mt-1"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 min-h-0 relative">
          <ParcelPickerMap
            province={province}
            city={city}
            onParcelClick={handleParcelClick}
            selectedGeometry={selected?.geometry ?? null}
            manualPin={mode === "manual" && selected ? { lat: selected.lat, lng: selected.lon } : null}
          />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 rounded-xl px-4 py-2.5 shadow-lg border border-gray-100">
                <p className="text-xs font-bold text-urbik-black">Buscando parcela...</p>
              </div>
            </div>
          )}

          {notFound && !loading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-white/90 rounded-xl px-4 py-2.5 shadow-lg border border-red-100 flex flex-col items-center">
                <p className="text-xs font-bold text-red-500 text-center">No se encontró parcela en ese punto.</p>
                <button 
                  onClick={() => toggleMode("manual")} 
                  className="mt-2 text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full pointer-events-auto border border-red-200"
                >
                  Cambiar a Pin Manual
                </button>
              </div>
            </div>
          )}

          {fetchError && !loading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-white/90 rounded-xl px-4 py-2.5 shadow-lg border border-orange-100">
                <p className="text-xs font-bold text-orange-500">Error al consultar parcelas. Intentá de nuevo.</p>
              </div>
            </div>
          )}

          {!selected && !loading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-lg border border-gray-100">
                <p className="text-xs font-bold text-urbik-black/60 tracking-widest uppercase">
                  {mode === "parcel" ? "Hacé click sobre una parcela" : "Hacé click para fijar el pin"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex items-center gap-3">
          {selected ? (
            <div className="flex-1 bg-emerald-50 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-emerald-100">
              {mode === "manual" ? (
                <MousePointerClick size={15} className="text-emerald-600 shrink-0" />
              ) : (
                <MapPin size={15} className="text-emerald-600 shrink-0" />
              )}
              <div>
                <p className="text-xs font-black text-emerald-700">
                  {mode === "manual" ? "Ubicación manual fijada" : "Parcela seleccionada"}
                </p>
                <p className="text-xs text-emerald-600">
                  {mode === "manual" 
                    ? `Lat: ${selected.lat.toFixed(5)}, Lng: ${selected.lon.toFixed(5)}` 
                    : `CCA: ${selected.cca}${selected.pda ? ` · PDA: ${selected.pda}` : ""}`}
                </p>
              </div>
            </div>
          ) : (
            <p className="flex-1 text-xs text-gray-400 font-medium">Ninguna ubicación seleccionada aún</p>
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
            Confirmar ubicación
          </button>
        </div>
      </div>
    </div>
  );
}