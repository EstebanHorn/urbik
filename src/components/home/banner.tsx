"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  SearchProperty, 
  glassCard, 
  getTypeLabel, 
  getOperationLabel 
} from "../../app/(public)/page";
import bg1 from "../../assets/banner/bg1.png";
import front1 from "../../assets/banner/front1.png";

const animationStyles = `
  @keyframes kenBurns {
    0% { transform: scale(1) translate(0, 0); }
    50% { transform: scale(1.05) translate(-1%, 1%); }
    100% { transform: scale(1) translate(0, 0); }
  }
  @keyframes kenBurnsReverse {
    0% { transform: scale(1) translate(0, 0); }
    50% { transform: scale(1.07) translate(1%, -1%); }
    100% { transform: scale(1) translate(0, 0); }
  }
  .animate-ken-burns {
    animation: kenBurns 20s ease-in-out infinite;
  }
  .animate-ken-burns-reverse {
    animation: kenBurnsReverse 25s ease-in-out infinite;
  }
`;

interface BannerProps {
  items: SearchProperty[];
}

export default function Banner({ items }: BannerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showProperty, setShowProperty] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!items || items.length === 0) return;
    
   
    const interval = setInterval(() => {
      setShowProperty((prev) => !prev);
    }, 8000); 
    return () => clearInterval(interval);
    
  }, [items]);

  const randomProperty = useMemo(() => {
    if (!items || items.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  }, [items]);

  const displayProperty = randomProperty && showProperty;

  const price = randomProperty?.salePrice ?? randomProperty?.rentPrice ?? 0;
  const currency = randomProperty?.saleCurrency ?? randomProperty?.rentCurrency ?? "ARS";

  return (
    <>
      <style>{animationStyles}</style>

      <div
        className={`relative mt-5 mb-8 h-[350px] md:h-[620px] w-full overflow-hidden rounded-3xl md:rounded-[30px] border border-white/20 bg-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-sm transition-all duration-1000 ease-out ${
          isMounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        } ${glassCard}`}
      >
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            displayProperty ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src={bg1}
              alt="Urbik Background"
              fill
              className="object-cover animate-ken-burns opacity-90"
              priority
            />
          </div>

          <div className="absolute inset-0 z-10 bg-linear-to-r from-black/60 via-black/20 to-transparent backdrop-blur-sm" />

          <div className="absolute inset-y-0 right-0 z-20 h-full w-1/2 overflow-hidden opacity-100 md:w-[45%]">
            <Image
              src={front1}
              alt="Urbik Front"
              fill
              className="object-contain object-right animate-ken-burns-reverse drop-shadow-2xl"
              priority
            />
          </div>

          <div className="absolute inset-0 z-30 bg-linear-to-t from-black/40 via-transparent to-transparent" />

          <div className="absolute inset-0 z-40 flex flex-col items-start justify-center p-6 md:p-16 lg:p-20 md:w-3/5">
            <div className="rounded-3xl p-6 md:p-10  transition-all">
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl drop-shadow-lg leading-tight">
                Propiedades<br />Destacadas
              </h2>
              <p className="mt-6 max-w-lg text-base font-medium leading-relaxed text-slate-200 sm:text-lg drop-shadow">
                Encontrá oportunidades premium con una estética limpia, moderna y minimalista en las mejores ubicaciones.
              </p>
            </div>
          </div>
          
        </div>
      

        {randomProperty && (
  <div
    className={`absolute inset-0 transition-opacity duration-1000 flex items-stretch ${
      displayProperty ? "opacity-100" : "opacity-0 pointer-events-none"
    }`}
  >
    <div className="absolute inset-0 z-10 bg-linear-to-r from-white/70 via-white/20 to-transparent" />
    
    {randomProperty.images?.[0] && (
      <Image
        src={randomProperty.images[0]}
        alt={randomProperty.title}
        fill
        className="object-cover transition-transform duration-10000 ease-linear scale-105"
        style={displayProperty ? { transform: 'scale(1.15)' } : {}}
      />
    )}
    
    <div className="relative z-20 flex w-full max-w-sm flex-col justify-start p-6 md:p-10 text-urbik-black/60 border-r border-white/20 bg-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-md">
      
      <div className="mb-6 flex flex-col items-start gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wide shadow-sm">
            {getTypeLabel(randomProperty.type)}
          </span>
          <span className="rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wide shadow-sm">
            {getOperationLabel(randomProperty.operationType)}
          </span>
        </div>
        <span className="rounded-full border border-white/40 bg-urbik-white1 px-3 py-1 text-xs text-urbik-black/30 font-bold uppercase tracking-wide shadow-sm">
          Recomendado
        </span>
      </div>

      <h2 className="mb-4 line-clamp-3 text-2xl font-black tracking-tight text-urbik-black/70 drop-shadow-md md:text-4xl">
        {randomProperty.title}
      </h2>
      
      <p className="mb-8 text-sm font-medium text-urbik-black/60 drop-shadow md:text-base">
        {randomProperty.address}, {randomProperty.city}, {randomProperty.province}
      </p>

      <div className="flex flex-col gap-6 pt-8 mt-auto">
        <span className="text-sm font-bold text-urbik-black/60 md:text-base">
          {randomProperty.rooms || 0} amb · {randomProperty.bathrooms || 0} baños {randomProperty.area ? `· ${randomProperty.area} m²` : ''}
        </span>
        
        <div className="flex flex-col items-start gap-4">
          <span className="text-2xl font-black tracking-tight drop-shadow-md md:text-4xl bg-linear-to-br from-white to-gray-200 bg-clip-text text-transparent">
              {currency} {Number(price).toLocaleString("es-AR")}
          </span>
          <Link
            href={`/property/${randomProperty.id}`}
            className="rounded-xl bg-urbik-white2 px-6 py-3 text-lg font-bold text-urbik-black/70 transition-all hover:bg-white/30 hover:scale-105 border border-white/10 w-full text-center"
          >
            Ver más
          </Link>
        </div>
      </div>
      
    </div>
  </div>
)}
      </div>
    </>
  );
}