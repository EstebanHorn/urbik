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

const FeaturePill = ({ icon: Icon, value, unit }: { icon: any, value: number | string, unit: string }) => (
  <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 border border-black/50 transition-colors group-hover:border-black ">
    <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-urbik-black/50 group-hover:text-urbik-black" />
    <span className="text-[11px] sm:text-sm text-urbik-black/50 group-hover:text-urbik-black">
      <strong className="font-bold text-urbik-black/50 group-hover:text-urbik-black">{value}</strong> {unit}
    </span>
  </div>
);

function PropertyFeatures({ property }: { property: SearchProperty }) {
  const propertyType = property.type?.toUpperCase() || "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {propertyType !== "TERRENO" && propertyType !== "LOTE" && propertyType !== "COCHERA" && propertyType !== "LOCAL" && propertyType !== "OFICINA" && (
        <FeaturePill icon={RoomIcon} value={property.rooms || 0} unit="amb" />
      )}

      {propertyType !== "TERRENO" && propertyType !== "LOTE" && propertyType !== "COCHERA" && (
        <FeaturePill icon={BathIcon} value={property.bathrooms || 0} unit="ba" />
      )}

      <FeaturePill icon={AreaIcon} value={property.area || 0} unit="m²" />
    </div>
  );
}

function PromotedPropertyCard({
  property,
  setHoveredPropertyId,
}: {
  property: SearchProperty;
  setHoveredPropertyId: React.Dispatch<React.SetStateAction<string | null>>;
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
        className="group relative flex flex-col md:flex-row items-center gap-6 overflow-hidden rounded-[30px] bg-transparent p-3 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="relative h-auto min-h-[140px] sm:h-48 md:h-80 overflow-hidden rounded-[20px] w-full md:w-1/3 shrink-0">
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
          <div className="absolute top-4 left-4 rounded-full bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-urbik-black/60 shadow-lg">
            Propiedad Patrocinada
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center p-4 md:p-6 min-w-0 z-10 w-full">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-black/10 bg-urbik-black px-3 py-1 text-xs font-bold text-white uppercase shadow-sm z-1">
              {getTypeLabel(property.type)} en {getOperationLabel(property.operationType)}
            </span>
            <span className="rounded-full border border-emerald-200  text-urbik-emerald px-3 py-1 text-xs font-bold uppercase shadow-sm z-1">
              OPORTUNIDAD
            </span>
          </div>

          <h3 className="line-clamp-2 text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-urbik-black/90 z-1">
            {property.title}
          </h3>

          <p className="mt-2 truncate text-sm font-medium text-urbik-black/50 z-1">
            {property.address}, {property.city}, {property.province}
          </p>

          <div className="mt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-6 border-t border-black/5">
            <PropertyFeatures property={property} />

            <div className="flex items-center gap-4">
              <div className="text-2xl font-black tracking-tight md:text-4xl text-urbik-black">
                {currency} {Number(price).toLocaleString("es-AR")}
              </div>
              <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-black/5 text-urbik-black transition-colors duration-300 group-hover:bg-urbik-black group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
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
  setHoveredPropertyId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function List({ items, viewMode, premiumProperty, setHoveredPropertyId }: ListProps) {
  if (items.length <= 3) return null;

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 gap-6 xl:grid-cols-2"
          : "flex flex-col gap-4 md:gap-6"
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
              className={`group flex flex-col md:flex-row gap-4 p-3 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl rounded-2xl md:rounded-[24px] ${glassCard}`}
            >
              <div className="relative h-48 md:h-auto md:min-h-[220px] overflow-hidden rounded-l-xl md:rounded-l-[18px] w-full md:w-[340px] shrink-0">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100 text-xs font-bold text-gray-400">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between px-2 pb-2 md:py-3 md:pr-4 z-100">
                <div className="min-w-0">
                  <div className="mb-2 md:mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-urbik-white2 group-hover:bg-urbik-black px-2 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider text-urbik-black/80">
                      {getTypeLabel(property.type)} en {getOperationLabel(property.operationType)}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 text-lg sm:text-xl md:text-2xl font-black tracking-tight text-urbik-black">
                    {property.title}
                  </h3>
                  <p className="mt-1 md:mt-2 truncate text-xs sm:text-sm font-medium text-urbik-black/50">
                    {property.address}, {property.city}, {property.province}
                  </p>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-black/5">
                  <PropertyFeatures property={property} />

                  <div className="flex items-center gap-3">
                    <div className="text-xl font-black tracking-tight md:text-3xl text-urbik-black">
                      {currency} {Number(price).toLocaleString("es-AR")}
                    </div>
                    <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-urbik-black transition-colors duration-300 group-hover:bg-urbik-black group-hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
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