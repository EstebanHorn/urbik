"use client";

import React from "react";
import Link from "next/link";
import { SearchProperty, ViewMode, getTypeLabel, getOperationLabel, glassCard } from "../../app/(public)/page";
import { motion, AnimatePresence } from "framer-motion";

const RoomIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
    <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
    <path d="M12 3v6"/>
  </svg>
);

const BathIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>
    <line x1="10" x2="8" y1="5" y2="7"/>
    <line x1="2" x2="22" y1="12" y2="12"/>
    <line x1="7" x2="7" y1="19" y2="21"/>
    <line x1="17" x2="17" y1="19" y2="21"/>
  </svg>
);

const AreaIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 3h6v6"/>
    <path d="M9 21H3v-6"/>
    <path d="M21 3l-7 7"/>
    <path d="M3 21l7-7"/>
  </svg>
);

const PriceIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" x2="12" y1="2" y2="22"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

function PropertyFeatures({ property }: { property: SearchProperty }) {
  const propertyType = property.type?.toUpperCase() || "";
  
  let dynamicFeature1 = null;
  let dynamicFeature2 = null;

  switch (propertyType) {
    case "TERRENO":
    case "LOTE":

      break;
    
    case "COCHERA":
      break;

    case "LOCAL":
    case "OFICINA":
      dynamicFeature1 = (
        <div className="flex items-center gap-3 px-2 py-1 text-[10px] sm:text-xl font-bold">
          <BathIcon className="w-3 h-3 md:w-7 md:h-7" />
          <span>{property.bathrooms || 0} ba</span>
        </div>
      );
      break;

    default:
      dynamicFeature1 = (
        <div className="flex items-center gap-3 px-2 py-1 text-[10px] sm:text-xl font-bold">
          <RoomIcon className="w-3 h-3 md:w-7 md:h-7" />
          <span>{property.rooms || 0} amb</span>
        </div>
      );
      dynamicFeature2 = (
        <div className="flex items-center gap-3 px-2 py-1 text-[10px] sm:text-xl font-bold">
          <BathIcon className="w-3 h-3 md:w-7 md:h-7" />
          <span>{property.bathrooms || 0} ba</span>
        </div>
      );
      break;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-urbik-black/50">
      {dynamicFeature1}
      {dynamicFeature2}
      
      <div className="flex items-center gap-3 px-2 py-1 text-[10px] sm:text-xl font-bold">
        <AreaIcon className="w-3 h-3 md:w-7 md:h-7" />
        <span>{property.area || 0} m²</span>
      </div>
    </div>
  );
}

function PromotedPropertyCard({
  property,
  setHoveredPropertyId,
}: {
  property: SearchProperty;
  setHoveredPropertyId: (id: number | null) => void;
}) {
  const price = property.salePrice ?? property.rentPrice ?? 0;
  const currency = property.saleCurrency ?? property.rentCurrency ?? "ARS";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, filter: "blur(8px)", scale: 0.95 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      exit={{ opacity: 0, filter: "blur(8px)", scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <Link
        href={`/property/${property.id}`}
        onMouseEnter={() => setHoveredPropertyId(property.id)}
        onMouseLeave={() =>
          setHoveredPropertyId((current) => (current === property.id ? null : current))
        }
        className="group relative flex flex-col md:flex-row items-center gap-6 overflow-hidden rounded-[30px] p-2 transition-all duration-500 hover:-translate-y-1"
      >
        <div className="relative h-auto min-h-[140px] sm:h-48 md:h-80 overflow-hidden rounded-2xl w-full md:w-1/3 shrink-0">
          {property.images?.[0] ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-100 text-xs font-bold text-slate-500">
              Sin imagen
            </div>
          )}
          <div className="absolute top-4 left-4 rounded-full bg-urbik-white2 px-4 py-1.5 text-[10px] font-black uppercase text-urbik-black/60 shadow-lg">
            Propiedad Patrocinada
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center p-4 md:p-6 min-w-0 z-10">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-bold text-urbik-black uppercase shadow-sm z-1">
              {getTypeLabel(property.type)} en {getOperationLabel(property.operationType)}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 text-urbik-emerald px-3 py-1 text-xs font-bold uppercase shadow-sm z-1">
              OPORTUNIDAD
            </span>
          </div>

          <h3 className="line-clamp-2 text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-urbik-black/70 z-1">
            {property.title}
          </h3>

          <p className="mt-2 truncate text-sm font-semibold text-urbik-black/50 z-1">
            {property.address}, {property.city}, {property.province}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6">
            <PropertyFeatures property={property} />

            <div className="text-2xl font-black tracking-tight md:text-4xl bg-linear-to-br from-black/90 to-gray-400 bg-clip-text text-transparent">
              <span>{currency} {Number(price).toLocaleString("es-AR")}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

interface ListProps {
  items: SearchProperty[];
  viewMode: ViewMode;
  premiumProperty: SearchProperty | null;
  setHoveredPropertyId: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function List({ items, viewMode, premiumProperty, setHoveredPropertyId }: ListProps) {
  if (items.length <= 3) return null;

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 gap-4 xl:grid-cols-2"
          : "flex flex-col gap-2 md:gap-4"
      }
    >
      {items.slice(3).map((property, index) => {
        const price = property.salePrice ?? property.rentPrice ?? 0;
        const currency = property.saleCurrency ?? property.rentCurrency ?? "ARS";

        const normalCard = (
          <motion.div
            key={property.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ margin: "-50px 0px -50px 0px" }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href={`/property/${property.id}`}
              onMouseEnter={() => setHoveredPropertyId(property.id)}
              onMouseLeave={() =>
                setHoveredPropertyId((current) => (current === property.id ? null : current))
              }
              className={`group grid min-w-0 grid-cols-[110px_minmax(0,1fr)] sm:grid-cols-[180px_minmax(0,1fr)] md:grid-cols-[340px_minmax(0,1fr)] gap-3 md:gap-4 p-2 md:p-3 overflow-hidden transition-all duration-500 hover:-translate-y-[2px] hover:shadow-[0_20px_50px_rgba(15,23,42,0.10)] ${glassCard}`}
            >
              <div className="relative h-auto min-h-[140px] sm:h-48 md:h-80 overflow-hidden rounded-xl md:rounded-l-2xl md:rounded-r-none">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-100 text-[10px] md:text-xs font-bold text-slate-400">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-col justify-between py-1 pr-2 md:pr-0">
                <div className="min-w-0 ml-5">
                  <div className="mb-2 md:mb-3 flex flex-wrap items-center gap-1 md:gap-2">
                    <span className="py-0.5  md:py-1 text-[8px] md:text-sm font-black uppercase text-urbik-black/50 z-1">
                      {getTypeLabel(property.type)} en {getOperationLabel(property.operationType)}
                    </span>
                  </div>
                  <h3 className="truncate text-sm sm:text-base md:text-3xl font-black tracking-tight text-urbik-black z-1">
                    {property.title}
                  </h3>
                  <p className="mt-0.5 md:mt-2 truncate text-[10px] sm:text-xs md:text-lg font-medium text-urbik-black">
                    {property.address}, {property.city}, {property.province}
                  </p>
                </div>

                <div className="z-1 mt-3 md:mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between border-t border-slate-200/60 pt-3 md:pt-4 gap-3 sm:gap-0">
                  
                  <PropertyFeatures property={property} />

                  <div className="text-2xl font-black tracking-tight md:text-4xl bg-linear-to-br from-black/70 to-gray-200 bg-clip-text text-transparent">
                    <span>{currency} {Number(price).toLocaleString("es-AR")}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );

        if ((index + 1) % 5 === 0 && premiumProperty) {
          return (
            <React.Fragment key={`wrapper-${property.id}`}>
              {normalCard}
              <PromotedPropertyCard
                property={premiumProperty}
                setHoveredPropertyId={setHoveredPropertyId}
              />
            </React.Fragment>
          );
        }

        return normalCard;
      })}
    </div>
  );
}