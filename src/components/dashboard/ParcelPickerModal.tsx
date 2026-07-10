"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { X, MapPin, MousePointerClick, PenTool } from "lucide-react";
import type { Geometry, Polygon } from "geojson";

const ParcelPickerMap = dynamic(() => import("./ParcelPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-50 flex items-center justify-center rounded-2xl">
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

// Centro inicial del mapa al editar: usa lat/lon guardadas o, si faltan,
// el centroide del polígono de la parcela.
function getInitialCenter(
  parcel?: SelectedParcel | null,
): { lat: number; lng: number } | null {
  if (!parcel) return null;
  if (
    Number.isFinite(parcel.lat) &&
    Number.isFinite(parcel.lon) &&
    (parcel.lat !== 0 || parcel.lon !== 0)
  ) {
    return { lat: parcel.lat, lng: parcel.lon };
  }
  if (parcel.geometry && parcel.geometry.type === "Polygon") {
    const ring = (parcel.geometry as Polygon).coordinates[0] ?? [];
    if (ring.length > 0) {
      const sum = ring.reduce(
        (acc, c) => ({ lng: acc.lng + c[0], lat: acc.lat + c[1] }),
        { lng: 0, lat: 0 },
      );
      return { lat: sum.lat / ring.length, lng: sum.lng / ring.length };
    }
  }
  return null;
}

interface ParcelPickerModalProps {
  open: boolean;
  province: string;
  city?: string;
  locality?: string;
  onClose: () => void;
  onConfirm: (parcel: SelectedParcel) => void;
  // Parcela ya vinculada/dibujada al editar: se precarga para que se vea en el mapa.
  initialParcel?: SelectedParcel | null;
}

export default function ParcelPickerModal({
  open,
  province,
  city,
  locality,
  onClose,
  onConfirm,
  initialParcel,
}: ParcelPickerModalProps) {
  const [selected, setSelected] = useState<SelectedParcel | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Agregamos el modo "draw" y el estado para los vértices dibujados
  const [mode, setMode] = useState<"parcel" | "manual" | "draw">("parcel");
  const [drawnPath, setDrawnPath] = useState<{ lat: number; lng: number }[]>([]);

  // Al abrir, precargamos lo que se había seleccionado/dibujado antes para que
  // se renderice en el mapa (antes el mapa aparecía vacío al editar).
  useEffect(() => {
    if (!open) return;
    setNotFound(false);
    setFetchError(false);

    if (initialParcel?.geometry) {
      if (initialParcel.cca || initialParcel.pda) {
        // Parcela catastral vinculada.
        setMode("parcel");
        setSelected(initialParcel);
        setDrawnPath([]);
      } else {
        // Parcela esbozada manualmente: reconstruimos los vértices.
        const geom = initialParcel.geometry as Polygon;
        const ring = geom.type === "Polygon" ? geom.coordinates[0] ?? [] : [];
        // El polígono guardado cierra repitiendo el primer punto; lo quitamos.
        const path = ring
          .slice(0, ring.length > 1 ? -1 : ring.length)
          .map((c) => ({ lat: c[1], lng: c[0] }));
        setMode("draw");
        setDrawnPath(path);
        setSelected(null);
      }
    } else if (initialParcel && Number.isFinite(initialParcel.lat) && Number.isFinite(initialParcel.lon)) {
      // Pin manual.
      setMode("manual");
      setSelected(initialParcel);
      setDrawnPath([]);
    } else {
      setMode("parcel");
      setSelected(null);
      setDrawnPath([]);
    }
  }, [open, initialParcel]);

  if (!open) return null;

  const initialCenter = getInitialCenter(initialParcel);

  const handleMapClick = async (lat: number, lng: number) => {
    if (mode === "manual") {
      setSelected({ cca: null, pda: null, geometry: null, lat, lon: lng, isManual: true });
      return;
    }

    if (mode === "draw") {
      setDrawnPath((prev) => [...prev, { lat, lng }]);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setFetchError(false);
    try {
      const res = await fetch(
        `/api/parcels/point?lat=${lat}&lng=${lng}&province=${encodeURIComponent(province)}`
      );
      if (res.status === 404) { setNotFound(true); setSelected(null); return; }
      if (!res.ok) { setFetchError(true); setSelected(null); return; }
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

  const toggleMode = (newMode: "parcel" | "manual" | "draw") => {
    setMode(newMode);
    setSelected(null);
    setDrawnPath([]); // Reseteamos el dibujo al cambiar de modo
    setNotFound(false);
    setFetchError(false);
  };

  const handleConfirm = () => {
    if (mode === "draw") {
      if (drawnPath.length < 3) return;
      
      // GeoJSON espera [longitud, latitud] y que el último punto sea igual al primero
      const coordinates = drawnPath.map(p => [p.lng, p.lat]);
      coordinates.push([drawnPath[0].lng, drawnPath[0].lat]); 
      
      const geometry: Geometry = {
        type: "Polygon",
        coordinates: [coordinates],
      };
      
      onConfirm({
        cca: null,
        pda: null,
        geometry,
        lat: drawnPath[0].lat,
        lon: drawnPath[0].lng,
        isManual: true,
      });
    } else if (selected) {
      onConfirm(selected);
    }
  };

  const isConfirmDisabled = mode === "draw" ? drawnPath.length < 3 : !selected;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center pt-20 px-6 pb-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl h-[80vh] bg-white/90 border border-white rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col shrink-0 bg-white/70">
          <div className="flex items-center justify-between px-8 py-5">
            <h2 className="text-lg font-black text-geora-black">
              Ubicación de la propiedad
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Mode tabs */}
          <div className="flex items-center gap-6 px-8 pb-0 border-b border-gray-100">
            <button
              onClick={() => toggleMode("parcel")}
              className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                mode === "parcel"
                  ? "border-geora-cyan text-geora-black"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Parcela Catastral
            </button>
            <button
              onClick={() => toggleMode("draw")}
              className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                mode === "draw"
                  ? "border-geora-cyan text-geora-black"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Dibujar Parcela
            </button>
            <button
              onClick={() => toggleMode("manual")}
              className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                mode === "manual"
                  ? "border-geora-cyan text-geora-black"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Pin Manual
            </button>
          </div>

        </div>

        <div className="flex-1 min-h-0 relative mx-4 my-3 rounded-2xl overflow-hidden">
          <ParcelPickerMap
            province={province}
            city={city}
            locality={locality}
            onMapClick={handleMapClick}
            selectedGeometry={selected?.geometry ?? null}
            manualPin={mode === "manual" && selected ? { lat: selected.lat, lng: selected.lon } : null}
            drawnPath={mode === "draw" ? drawnPath : undefined}
            initialCenter={initialCenter}
          />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 rounded-xl px-4 py-2.5 shadow-lg border border-gray-100">
                <p className="text-xs font-bold text-geora-black">Buscando parcela...</p>
              </div>
            </div>
          )}

          {notFound && !loading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-white/90 rounded-xl px-4 py-2.5 shadow-lg border border-red-100 flex flex-col items-center">
                <p className="text-xs font-bold text-red-500 text-center">
                  No se encontró parcela en ese punto.
                </p>
                <div className="flex gap-2 mt-2 pointer-events-auto">
                  <button
                    onClick={() => toggleMode("manual")}
                    className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 cursor-pointer"
                  >
                    Usar Pin Manual
                  </button>
                  <button
                    onClick={() => toggleMode("draw")}
                    className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 cursor-pointer"
                  >
                    Dibujar Parcela
                  </button>
                </div>
              </div>
            </div>
          )}

          {fetchError && !loading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-white/90 rounded-xl px-4 py-2.5 shadow-lg border border-orange-100">
                <p className="text-xs font-bold text-orange-500">
                  Error al consultar parcelas. Intentá de nuevo.
                </p>
              </div>
            </div>
          )}

          {!selected && drawnPath.length === 0 && !loading && !notFound && !fetchError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-lg border border-gray-100">
                <p className="text-xs font-bold text-geora-black/60 tracking-widest uppercase">
                  {mode === "parcel" && "Hacé click sobre una parcela"}
                  {mode === "manual" && "Hacé click para fijar el pin"}
                  {mode === "draw" && "Hacé click en los vértices"}
                </p>
              </div>
            </div>
          )}
        </div>
          <span className="px-15 text-center text-xs mt-2 mb-2 italic text-black/60">Los límites catastrales que se muestran en el mapa corresponden a información pública provista por organismos catastrales provinciales y municipales, y pueden no reflejar modificaciones recientes.</span>

        {/* Footer */}
        <div className="px-8 pb-4 pt-0 flex items-center justify-between gap-4 bg-white/70 shrink-0">
          
          {mode === "draw" ? (
             <div className="flex-1 bg-emerald-50 rounded-xl px-4 py-2.5 flex items-center gap-3 border border-emerald-100 transition-all">
                <PenTool size={15} className="text-emerald-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-black text-emerald-700">Dibujo de parcela</p>
                  <p className="text-xs text-emerald-600">
                    {drawnPath.length < 3 
                      ? `Marcá los vértices (van ${drawnPath.length}, mínimo 3)` 
                      : `Polígono de ${drawnPath.length} vértices listo`}
                  </p>
                </div>
                {drawnPath.length > 0 && (
                  <button 
                    onClick={() => setDrawnPath([])} 
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold px-2 py-1 rounded bg-emerald-100/50 cursor-pointer"
                  >
                    Limpiar
                  </button>
                )}
             </div>
          ) : selected ? (
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
            <p className="flex-1 text-xs text-gray-400 font-medium">
              Ninguna ubicación seleccionada aún
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-geora-black/80 font-bold hover:text-geora-black transition-colors cursor-pointer"
          >
            CANCELAR
          </button>
          <button
            type="button"
            disabled={isConfirmDisabled}
            onClick={handleConfirm}
            className="px-6 py-3 text-geora-black/80 font-bold hover:text-geora-black transition-colors disabled:opacity-40 cursor-pointer"
          >
            CONFIRMAR
          </button>
        </div>
      </div>
    </div>
  );
}