"use client";

import React, { useEffect, useState } from "react";
import { useMap, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { MapProperty } from "@/components/map/types";
import { getDynamicParcelStyle } from "@/components/map/utils";
import { useMapSettings } from "@/components/map/MapSettingsProvider";
import { Geometry, Polygon, MultiPolygon, Position } from "geojson";

interface ExtendedMapProperty extends MapProperty {
  salePrice?: number | null;
  rentPrice?: number | null;
}

const getDisplayPrice = (prop: ExtendedMapProperty) => prop.rentPrice ?? prop.salePrice ?? 0;
const formatPriceShort = (price: number) => {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (price >= 1000) return `${Math.round(price / 1000)}K`;
  return price.toString();
};

const getCenterOfGeometry = (geometry: Geometry): { lat: number; lng: number } | null => {
  try {
    if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon") return null;
    const poly = geometry as Polygon | MultiPolygon;
    const coords: Position[] = poly.type === "Polygon" ? poly.coordinates[0] : poly.coordinates[0][0];
    let latSum = 0, lngSum = 0;
    coords.forEach((c) => { lngSum += c[0]; latSum += c[1]; });
    return { lat: latSum / coords.length, lng: lngSum / coords.length };
  } catch {
    return null;
  }
};

export function GoogleDbParcelsLayer({ properties, onPropertySelect }: { properties: MapProperty[], onPropertySelect?: (prop: MapProperty) => void }) {
  const map = useMap();
  const router = useRouter();
  const { colorMode } = useMapSettings();
  const [hoveredProp, setHoveredProp] = useState<ExtendedMapProperty | null>(null);
  const [hoverPos, setHoverPos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!map || properties.length === 0) return;

    map.data.forEach((feature: google.maps.Data.Feature) => {
      if (feature.getProperty("isProperty")) map.data.remove(feature);
    });

    const features = properties.map((rawProp) => {
      let geom;
      try { geom = typeof rawProp.parcelGeom === "string" ? JSON.parse(rawProp.parcelGeom) : rawProp.parcelGeom; } 
      catch { return null; }
      
      if (!geom) return null;
      return { type: "Feature", geometry: geom, properties: { ...rawProp, isProperty: true } };
    }).filter(Boolean);

    map.data.addGeoJson({ type: "FeatureCollection", features });

    map.data.setStyle((feature: google.maps.Data.Feature) => {
      if (!feature.getProperty("isProperty")) return {};
      const propId = feature.getProperty("id");
      const baseProp = properties.find(p => p.id === propId);
      const style = getDynamicParcelStyle(baseProp as MapProperty, colorMode);
      
      return {
        fillColor: style.fillColor,
        fillOpacity: style.fillOpacity,
        strokeColor: style.color,
        strokeWeight: style.weight,
        cursor: "pointer"
      };
    });

    const mouseoverListener = map.data.addListener("mouseover", (e: google.maps.Data.MouseEvent) => {
      if (!e.feature.getProperty("isProperty")) return;
      const propId = e.feature.getProperty("id");
      const prop = properties.find(p => p.id === propId) as ExtendedMapProperty;
      if (prop && e.latLng) {
        setHoveredProp(prop);
        setHoverPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        map.data.overrideStyle(e.feature, { fillOpacity: 0.8, strokeWeight: 2, strokeColor: "#fff" });
      }
    });

    const mouseoutListener = map.data.addListener("mouseout", (e: google.maps.Data.MouseEvent) => {
      if (!e.feature.getProperty("isProperty")) return;
      setHoveredProp(null);
      map.data.revertStyle(e.feature);
    });

    const clickListener = map.data.addListener("click", (e: google.maps.Data.MouseEvent) => {
      if (!e.feature.getProperty("isProperty")) return;
      const propId = e.feature.getProperty("id");
      const prop = properties.find(p => p.id === propId);
      if (prop) {
        if (onPropertySelect) {
          onPropertySelect(prop);
        } else {
          router.push(`/property/${prop.id}`);
        }
      }
    });

    return () => {
      google.maps.event.removeListener(mouseoverListener);
      google.maps.event.removeListener(mouseoutListener);
      google.maps.event.removeListener(clickListener);
    };
  }, [map, properties, colorMode, router, onPropertySelect]);

  return (
    <>
      {properties.map((rawProp) => {
        const prop = rawProp as ExtendedMapProperty;
        if (!prop.parcelGeom) return null;
        
        let geometry: Geometry | null = null;
        try { geometry = typeof prop.parcelGeom === "string" ? JSON.parse(prop.parcelGeom) : prop.parcelGeom as Geometry; } 
        catch { return null; }

        const position = getCenterOfGeometry(geometry!);
        if (!position) return null;

        return (
          <AdvancedMarker key={`marker-${prop.id}`} position={position} zIndex={100}>
            <div className="price-tag-container">
              <div className={`price-tag-badge ${prop.operationType === "SALE" ? "is-sale" : "is-rent"}`}>
                {formatPriceShort(getDisplayPrice(prop))}
              </div>
            </div>
          </AdvancedMarker>
        );
      })}

      {hoveredProp && hoverPos && (
        <InfoWindow position={hoverPos} disableAutoPan={true} headerDisabled={true}>
          <div className="w-52 overflow-hidden shadow-2xl flex flex-col rounded-2xl bg-urbik-white2 p-0 m-0">
            <div className="h-28 w-full relative parcel-layer-shadow">
              {hoveredProp.images?.[0] ? (
                <Image src={hoveredProp.images[0]} alt={hoveredProp.title || "Propiedad"} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-100 text-[10px] text-slate-400">Sin imagen</div>
              )}
            </div>
            <div className="p-2.5 text-left">
              <h4 className="text-sm font-black truncate italic text-slate-800 mb-1">{hoveredProp.title}</h4>
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <span className="text-md font-black text-slate-900">
                  USD {getDisplayPrice(hoveredProp).toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}