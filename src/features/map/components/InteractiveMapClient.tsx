/*
Este componente de React, denominado InteractiveMapClient, implementa un mapa interactivo
avanzado utilizando la librería Leaflet y el framework Next.js, diseñado para visualizar
y gestionar capas de parcelas inmobiliarias. El código integra múltiples funcionalidades
críticas, como la sincronización de la posición del mapa a través de parámetros de URL
(lat y lon), controles de zoom personalizados, y una gestión dinámica de capas de fondo
(TileLayers) y datos de parcelas (estáticas y de base de datos) que se renderizan de forma
segura una vez que el mapa está listo. Además, incluye componentes auxiliares para controlar
el zoom con la rueda del ratón, animar transiciones de cámara mediante flyTo, y manejar
eventos de cambio de límites o centro, asegurando una experiencia de usuario fluida mediante
una limpieza adecuada de la instancia del mapa en el cliente para evitar fugas de memoria.
*/

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useSearchParams } from "next/navigation";
import "leaflet/dist/leaflet.css";

import { StaticParcelsLayer } from "./StaticParcelsLayer";
import { DbParcelsLayer } from "./DbParcelsLayer";
import { MapEventsHandler, ZoneData } from "./MapEventsHandler";
import { SelectedParcelLayer } from "./SelectedParcelLayer";
import { mapBaseLayers } from "@/features/map/config/baseLayers";
import { useMapSettings } from "@/features/map/context/MapSettingsProvider";
import { MapProperty, MapBounds, SelectedParcel } from "../types/types";

export interface InteractiveMapProps {
  lat: number;
  lon: number;
  properties?: MapProperty[];
  selectedParcel?: SelectedParcel | null; // Tipado específico
  onBoundsChange?: (bounds: MapBounds) => void;
  onCenterChange?: (data: ZoneData) => void;
  children?: React.ReactNode;
  height?: string;
}

function SafeMapChildren({ children }: { children: React.ReactNode }) {
  const map = useMap();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!map) return;
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [map]);

  return ready ? <>{children}</> : null;
}

function CustomZoomControls() {
  const map = useMap();

  return (
    <div className="absolute bottom-6 left-6 z-1000 flex flex-col gap-2">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="flex cursor-pointer h-11 w-11 items-center justify-center rounded-xl bg-white shadow-xl hover:bg-gray-50 active:scale-95 transition-all text-2xl font-bold text-gray-800 border border-gray-200"
      >
        +
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="flex h-11 cursor-pointer w-11 items-center justify-center rounded-xl bg-white shadow-xl hover:bg-gray-50 active:scale-95 transition-all text-2xl font-bold text-gray-800 border border-gray-200"
      >
        −
      </button>
    </div>
  );
}

function ScrollHandler({ enabled }: { enabled: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (enabled) {
      map.scrollWheelZoom.enable();
    } else {
      map.scrollWheelZoom.disable();
    }
  }, [enabled, map]);

  return null;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !center) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((map as any)._loaded) {
      map.flyTo(center, map.getZoom(), {
        animate: true,
        duration: 1.5,
      });
    }
  }, [center, map]);

  return null;
}

export function InteractiveMapClient({
  lat: initialLat,
  lon: initialLon,
  properties = [],
  selectedParcel = null,
  onBoundsChange,
  onCenterChange,
  children,
  height = "100%",
}: InteractiveMapProps) {
  const { baseLayer, isScrollZoomEnabled } = useMapSettings();
  const [mounted, setMounted] = useState(false);

  const searchParams = useSearchParams();

  const initialCenter = useMemo<[number, number]>(() => {
    const sLat = searchParams.get("lat");
    const sLon = searchParams.get("lon");
    return sLat && sLon
      ? [parseFloat(sLat), parseFloat(sLon)]
      : [initialLat, initialLon];
  }, [searchParams, initialLat, initialLon]);

  const currentBaseLayer = useMemo(
    () => mapBaseLayers[baseLayer] ?? mapBaseLayers.cartoLight,
    [baseLayer],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-full w-full bg-slate-100 animate-pulse" />;
  }

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <MapContainer
        center={initialCenter}
        zoom={15}
        minZoom={14}
        maxZoom={18}
        scrollWheelZoom={isScrollZoomEnabled}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <SafeMapChildren>
          <TileLayer
            url={currentBaseLayer.url}
            attribution={currentBaseLayer.attribution}
          />

          <CustomZoomControls />
          <ScrollHandler enabled={isScrollZoomEnabled} />
          <MapUpdater center={initialCenter} />

          <MapEventsHandler
            onBoundsChange={onBoundsChange || (() => {})}
            onCenterChange={onCenterChange || (() => {})}
          />

          <StaticParcelsLayer />
          <DbParcelsLayer properties={properties} />
          <SelectedParcelLayer selectedParcel={selectedParcel} />

          {children}
        </SafeMapChildren>
      </MapContainer>
    </div>
  );
}
