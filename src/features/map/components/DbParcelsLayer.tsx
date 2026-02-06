/*
Este componente de React, denominado DbParcelsLayer, utiliza la librería React-Leaflet
para renderizar dinámicamente una capa de parcelas inmobiliarias en un mapa interactivo.
Su función principal consiste en iterar sobre una lista de propiedades para dibujar
geometrías GeoJSON con estilos personalizados según el estado de la propiedad, posicionar
etiquetas de precio simplificadas mediante marcadores de Leaflet y gestionar la navegación
del usuario hacia el detalle de cada inmueble al hacer clic. Además, integra una interfaz
de usuario enriquecida que incluye efectos visuales con Framer Motion y tooltips informativos
que muestran imágenes, títulos y precios detallados cuando el usuario interactúa con las 
parcelas en el mapa.
*/
"use client";

/* eslint-disable @next/next/no-img-element */

import React from "react";
import { GeoJSON, Tooltip, Marker } from "react-leaflet";
import { useRouter } from "next/navigation";
import L from "leaflet";
import type { MapProperty } from "../types/types";
import { getDynamicParcelStyle } from "../utils/parcelStyles";
import { useMapSettings } from "@/features/map/context/MapSettingsProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Geometry,
  GeoJsonObject,
  Polygon,
  MultiPolygon,
  Position,
} from "geojson";

interface ExtendedMapProperty extends MapProperty {
  salePrice?: number | null;
  rentPrice?: number | null;
}

const getDisplayPrice = (prop: ExtendedMapProperty) => {
  return prop.rentPrice ?? prop.salePrice ?? 0;
};

const formatPriceShort = (price: number) => {
  if (price >= 1000000)
    return `${(price / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (price >= 1000) return `${Math.round(price / 1000)}K`;
  return price.toString();
};

const getCenterOfGeometry = (geometry: Geometry): [number, number] | null => {
  try {
    if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon")
      return null;

    const poly = geometry as Polygon | MultiPolygon;
    // Normalizamos para obtener siempre una lista de coordenadas lineales del primer anillo
    const coords: Position[] =
      poly.type === "Polygon" ? poly.coordinates[0] : poly.coordinates[0][0];

    let latSum = 0;
    let lngSum = 0;

    coords.forEach((c) => {
      lngSum += c[0]; // GeoJSON es [long, lat]
      latSum += c[1];
    });

    return [latSum / coords.length, lngSum / coords.length];
  } catch {
    return null;
  }
};

interface DbParcelsLayerProps {
  properties: MapProperty[];
}

export function DbParcelsLayer({ properties }: DbParcelsLayerProps) {
  const router = useRouter();
  const { colorMode } = useMapSettings();

  if (!properties || properties.length === 0) return null;

  return (
    <>
      {properties.map((rawProp) => {
        const prop = rawProp as ExtendedMapProperty;

        if (!prop.parcelGeom) return null;

        let geometry: Geometry | null = null;
        try {
          geometry =
            typeof prop.parcelGeom === "string"
              ? JSON.parse(prop.parcelGeom)
              : (prop.parcelGeom as Geometry);
        } catch {
          return null;
        }

        if (!geometry) return null;

        // Corrección: Usamos any explícitamente y desactivamos la regla porque getDynamicParcelStyle
        // espera un objeto Property completo (DB) y aquí tenemos una versión optimizada (MapProperty)
        // que es suficiente para el estilo pero no satisface la interfaz estricta.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dynamicStyle = getDynamicParcelStyle(prop as any, colorMode);

        const displayPrice = getDisplayPrice(prop);
        const shortPrice = formatPriceShort(displayPrice);

        const position = getCenterOfGeometry(geometry);

        if (!position) return null;

        return (
          <React.Fragment key={`${prop.id}-${colorMode}`}>
            <Marker
              position={position}
              interactive={false}
              icon={L.divIcon({
                className: "price-tag-container",
                html: `<div class="price-tag-badge ${prop.operationType === "SALE" ? "is-sale" : "is-rent"}">${shortPrice}</div>`,
                iconSize: [40, 20],
                iconAnchor: [20, 10],
              })}
            />

            <GeoJSON
              data={geometry as GeoJsonObject}
              style={dynamicStyle}
              eventHandlers={{
                click: () => router.push(`/property/${prop.id}`),
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    fillOpacity: 1,
                    weight: 2,
                    color: "#fff",
                  });
                  layer.bringToFront();
                },
                mouseout: (e) => {
                  e.target.setStyle(dynamicStyle);
                },
              }}
            >
              <Tooltip
                sticky
                direction="top"
                offset={[0, -20]}
                opacity={1}
                className="custom-property-tooltip"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-52 overflow-hidden shadow-2xl flex flex-col rounded-2xl bg-urbik-white2"
                  >
                    <div className="h-28 w-full relative parcel-layer-shadow">
                      {prop.images?.[0] ? (
                        <img
                          src={prop.images[0]}
                          className="w-full h-full object-cover"
                          alt={prop.title}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-slate-100 text-[10px] text-slate-400">
                          Sin imagen
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-urbik-cyan text-urbik-dark text-[8px] px-1.5 py-0.5 rounded font-black">
                        {prop.operationType === "SALE"
                          ? "VENTA"
                          : prop.operationType === "RENT"
                            ? "ALQUILER"
                            : "VENTA/ALQ"}
                      </div>
                    </div>
                    <div className="p-2.5 text-left">
                      <h4 className="text-sm font-black truncate italic text-urbik-black/50 mb-1">
                        {prop.title}
                      </h4>
                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <span className="text-md font-black text-urbik-black/90">
                          USD {displayPrice.toLocaleString("es-AR")}
                          {prop.rentPrice && !prop.salePrice ? " / mes" : ""}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </Tooltip>
            </GeoJSON>
          </React.Fragment>
        );
      })}
    </>
  );
}
