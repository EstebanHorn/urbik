/*
Este componente de React para Leaflet implementa una interacción espacial que permite
identificar y seleccionar parcelas catastrales de un archivo GeoJSON cargado en memoria
(caché). Al mover el ratón sobre el mapa, el código utiliza la librería Turf.js para
realizar una búsqueda de tipo "point-in-polygon", actualizando un estado de resaltado
(hover) mediante requestAnimationFrame para optimizar el rendimiento; al hacer clic,
captura los datos específicos de la parcela (identificadores CCA/PDA y geometría),
actualiza el estado global de la capa seleccionada y notifica a la aplicación mediante
un callback.
*/

"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import * as turf from "@turf/turf";
import type {
  FeatureCollection,
  Polygon,
  MultiPolygon,
  Geometry,
} from "geojson";
import { useMapLayers } from "./MapLayersProvider";
import type { SelectedParcel } from "../types/types";

type LaplataGeoJSON = FeatureCollection<
  Polygon | MultiPolygon,
  { CCA?: string; PDA?: string }
>;

interface Props {
  onParcelPicked: (parcel: SelectedParcel) => void;
}

let cache: LaplataGeoJSON | null = null;

export function ClickToCreateProperty({ onParcelPicked }: Props) {
  const map = useMap();
  const { setHovered, setSelected } = useMapLayers();

  const loadingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastHoverKeyRef = useRef<string>("");

  const load = async () => {
    if (cache || loadingRef.current) return;
    loadingRef.current = true;
    try {
      const res = await fetch("/laplata.geojson");
      cache = (await res.json()) as LaplataGeoJSON;
    } catch (err) {
      console.error("Error cargando laplata.geojson:", err);
    } finally {
      loadingRef.current = false;
    }
  };

  const pickFeatureAt = (lat: number, lng: number) => {
    if (!cache) return null;
    const point = turf.point([lng, lat]);
    for (const feature of cache.features) {
      if (turf.booleanPointInPolygon(point, feature)) return feature;
    }
    return null;
  };

  useEffect(() => {
    load();

    const prevCursor = map.getContainer().style.cursor;
    map.getContainer().style.cursor = "crosshair";

    const handleMove = async (e: LeafletMouseEvent) => {
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(async () => {
        rafRef.current = null;

        if (!cache) await load();
        if (!cache) return;

        const { lat, lng } = e.latlng;
        const feat = pickFeatureAt(lat, lng);

        if (!feat) {
          lastHoverKeyRef.current = "";
          setHovered(null);
          return;
        }

        const cca = feat.properties?.CCA ?? "";
        const pda = feat.properties?.PDA ?? "";
        const key = `${cca}-${pda}`;

        if (key === lastHoverKeyRef.current) return;
        lastHoverKeyRef.current = key;

        setHovered({
          geometry: feat.geometry,
          label: `CCA ${cca || "—"} · PDA ${pda || "—"}`,
        });
      });
    };

    const handleOut = () => {
      lastHoverKeyRef.current = "";
      setHovered(null);
    };

    const handleClick = async (e: LeafletMouseEvent) => {
      if (!cache) await load();
      if (!cache) return;

      const { lat, lng } = e.latlng;
      const feat = pickFeatureAt(lat, lng);
      if (!feat) return;

      const cca = feat.properties?.CCA ?? null;
      const pda = feat.properties?.PDA ?? null;

      setSelected(null);
      queueMicrotask(() => {
        setSelected({
          geometry: feat.geometry as Geometry,
          label: `CCA ${cca ?? "—"} · PDA ${pda ?? "—"}`,
        });
      });

      onParcelPicked({
        CCA: cca,
        PDA: pda,
        geometry: feat.geometry as Geometry,
        lat,
        lon: lng,
      });
    };

    map.on("mousemove", handleMove);
    map.on("mouseout", handleOut);
    map.on("click", handleClick);

    return () => {
      map.off("mousemove", handleMove);
      map.off("mouseout", handleOut);
      map.off("click", handleClick);
      map.getContainer().style.cursor = prevCursor;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;

      setHovered(null);
    };
  }, [map, onParcelPicked, setHovered, setSelected]);

  return null;
}
