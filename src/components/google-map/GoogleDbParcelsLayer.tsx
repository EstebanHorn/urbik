"use client";

import React, { useEffect, useState } from "react";
import { useMap, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { MapProperty } from "@/components/map/types";
import { getDynamicParcelStyle } from "@/components/map/utils";
import { Geometry, Polygon, MultiPolygon, Position } from "geojson";

const glassCard = "md:rounded-[10px] rounded-2xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[10px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";

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
  const colorMode = "uniform" as const;
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
        let position: { lat: number; lng: number } | null = null;

        if (prop.parcelGeom) {
          let geometry: Geometry | null = null;
          try { geometry = typeof prop.parcelGeom === "string" ? JSON.parse(prop.parcelGeom) : prop.parcelGeom as Geometry; } 
          catch {  }
          if (geometry) {
             position = getCenterOfGeometry(geometry);
          }
        }

        if (!position && prop.latitude && prop.longitude) {
          position = { lat: prop.latitude, lng: prop.longitude };
        }

        if (!position) return null;

        return (
          <AdvancedMarker 
            key={`marker-${prop.id}`} 
            position={position} 
            zIndex={100}
            onMouseEnter={() => {
              setHoveredProp(prop);
              setHoverPos(position);
            }}
            onMouseLeave={() => setHoveredProp(null)}
          >
            <div className="price-tag-container">
              <div className={`price-tag-badge ${prop.operationType === "SALE" ? "is-sale" : "is-rent"}`}>
                {formatPriceShort(getDisplayPrice(prop))}
              </div>
            </div>
          </AdvancedMarker>
        );
      })}

      {hoveredProp && hoverPos && (
        <AdvancedMarker position={hoverPos} zIndex={99999}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-4 pointer-events-none">
            <div className={`relative w-40 overflow-hidden flex flex-col pb-1.5 ${glassCard}`}>
              <div className="h-24 w-full relative overflow-hidden bg-slate-100">
                {hoveredProp.images?.[0] ? (
                  <Image 
                    src={hoveredProp.images[0]} 
                    alt={hoveredProp.title || "Propiedad"} 
                    fill 
                    className="object-cover" 
                    sizes="160px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-slate-400 font-medium">Sin imagen</div>
                )}
              </div>
              
              <div className="pt-2 pb-1 text-center z-10">
                <span className="text-sm font-black text-slate-950 tracking-tight">
                  {hoveredProp.operationType === 'RENT' ? 'ARS ' : '$ '}
                  {getDisplayPrice(hoveredProp).toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          </div>
        </AdvancedMarker>
      )}
    </>
  );
}