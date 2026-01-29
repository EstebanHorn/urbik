/*
Este código implementa un Context Provider de React diseñado para gestionar y persistir
globalmente las configuraciones de un mapa, tales como la capa base, el modo de color,
límites de propiedades y preferencias de zoom o análisis. Utiliza el hook useState para
manejar el estado en memoria, useMemo para optimizar el rendimiento al exponer los valores
y funciones de actualización, y emplea efectos (useEffect) para sincronizar automáticamente
estas preferencias con el localStorage del navegador, permitiendo que la configuración del
usuario se mantenga incluso después de recargar la página.
*/

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultBaseLayerId,
  isBaseLayerId,
  type BaseLayerId,
} from "../config/baseLayers";

export type ColorMode = "uniform" | "operation" | "propertyType";

type MapSettingsContextValue = {
  baseLayer: BaseLayerId;
  setBaseLayer: (id: BaseLayerId) => void;
  propertiesLimit: number;
  setPropertiesLimit: (limit: number) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  isZoneAnalysisEnabled: boolean;
  setIsZoneAnalysisEnabled: (enabled: boolean) => void;
  isScrollZoomEnabled: boolean;
  setIsScrollZoomEnabled: (enabled: boolean) => void; 
};

const MapSettingsContext = createContext<MapSettingsContextValue | null>(null);

export function MapSettingsProvider({ children }: { children: ReactNode }) {
  const [baseLayer, setBaseLayerState] = useState<BaseLayerId>(defaultBaseLayerId);
  const [propertiesLimit, setPropertiesLimitState] = useState<number>(4);
  const [colorMode, setColorModeState] = useState<ColorMode>("uniform");
  const [isZoneAnalysisEnabled, setIsZoneAnalysisEnabledState] = useState<boolean>(true);
  const [isScrollZoomEnabled, setIsScrollZoomEnabledState] = useState<boolean>(true); 

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedLayer = window.localStorage.getItem("urbik.baseLayer");
    const storedLimit = window.localStorage.getItem("urbik.propertiesLimit");
    const storedColorMode = window.localStorage.getItem("urbik.colorMode");
    const storedZoneAnalysis = window.localStorage.getItem("urbik.isZoneAnalysisEnabled");
    const storedScrollZoom = window.localStorage.getItem("urbik.isScrollZoomEnabled");

    if (storedLayer && isBaseLayerId(storedLayer)) setBaseLayerState(storedLayer);
    if (storedLimit) setPropertiesLimitState(parseInt(storedLimit, 10));
    if (storedColorMode) setColorModeState(storedColorMode as ColorMode);
    if (storedZoneAnalysis !== null) setIsZoneAnalysisEnabledState(storedZoneAnalysis === "true");
    if (storedScrollZoom !== null) setIsScrollZoomEnabledState(storedScrollZoom === "true"); 
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("urbik.baseLayer", baseLayer);
    window.localStorage.setItem("urbik.propertiesLimit", propertiesLimit.toString());
    window.localStorage.setItem("urbik.colorMode", colorMode);
    window.localStorage.setItem("urbik.isZoneAnalysisEnabled", isZoneAnalysisEnabled.toString());
    window.localStorage.setItem("urbik.isScrollZoomEnabled", isScrollZoomEnabled.toString());
  }, [baseLayer, propertiesLimit, colorMode, isZoneAnalysisEnabled, isScrollZoomEnabled]);

  const value = useMemo(
    () => ({
      baseLayer,
      setBaseLayer: (id: BaseLayerId) => setBaseLayerState(id),
      propertiesLimit,
      setPropertiesLimit: (limit: number) => setPropertiesLimitState(limit),
      colorMode,
      setColorMode: (mode: ColorMode) => setColorModeState(mode),
      isZoneAnalysisEnabled,
      setIsZoneAnalysisEnabled: (enabled: boolean) => setIsZoneAnalysisEnabledState(enabled),
      isScrollZoomEnabled, 
      setIsScrollZoomEnabled: (enabled: boolean) => setIsScrollZoomEnabledState(enabled), 
    }),
    [baseLayer, propertiesLimit, colorMode, isZoneAnalysisEnabled, isScrollZoomEnabled]
  );

  return (
    <MapSettingsContext.Provider value={value}>
      {children}
    </MapSettingsContext.Provider>
  );
}

export function useMapSettings() {
  const ctx = useContext(MapSettingsContext);
  if (!ctx) throw new Error("useMapSettings debe usarse dentro de MapSettingsProvider");
  return ctx;
}