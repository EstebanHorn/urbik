/*
Este componente de React, denominado MapEventsHandler, actúa como un controlador de eventos
para una instancia de React-Leaflet que monitorea y comunica los cambios en el estado geográfico
del mapa. Al cargar el mapa o finalizar un movimiento (moveend), el código captura los nuevos
límites (norte, sur, este y oeste) y las coordenadas del centro para enviarlos mediante callbacks;
además, si el análisis de zona está habilitado, realiza una petición de geocodificación inversa a
la API de Nominatim para transformar las coordenadas centrales en una dirección legible y un nombre
de zona (barrio o ciudad), asegurando mediante un useRef que no se realicen actualizaciones de estado
si el componente se ha desmontado.
*/

"use client";

import { useMapEvents } from "react-leaflet";
import { useEffect, useCallback, useRef } from "react";
import type { MapBounds } from "../types/types";
import { useMapSettings } from "@/features/map/context/MapSettingsProvider";

export interface ZoneData {
  lat: number;
  lng: number;
  address: string;
  zone: string;
}

interface MapEventsHandlerProps {
  onBoundsChange: (bounds: MapBounds) => void;
  onCenterChange: (data: ZoneData) => void;
}

export function MapEventsHandler({ onBoundsChange, onCenterChange }: MapEventsHandlerProps) {
  const { isZoneAnalysisEnabled } = useMapSettings();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    if (!isZoneAnalysisEnabled || !isMountedRef.current) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { "Accept-Language": "es" } }
      );
      const data = await response.json();

      if (data && data.address && isMountedRef.current) {
        const { road, house_number, suburb, city, town, village } = data.address;
        const street = road || "Calle desconocida";
        const number = house_number ? ` ${house_number}` : "";
        const neighborhood = suburb || city || town || village || "Zona no identificada";
        
        onCenterChange({
          lat,
          lng,
          address: `${street}${number}`,
          zone: neighborhood
        });
      }
    } catch (error) {
      console.error("Error al obtener la dirección:", error);
    }
  }, [onCenterChange, isZoneAnalysisEnabled]);

  const map = useMapEvents({
    load: (e) => {
      const m = e.target;
      const center = m.getCenter();
      const bounds = m.getBounds();
      fetchAddress(center.lat, center.lng);
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLon: bounds.getWest(),
        maxLon: bounds.getEast(),
      });
    },
    moveend: () => {

      if (!map || !map._loaded) return;

      const center = map.getCenter();
      const bounds = map.getBounds();

      fetchAddress(center.lat, center.lng);

      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLon: bounds.getWest(),
        maxLon: bounds.getEast(),
      });
    },
  });

  return null;
}