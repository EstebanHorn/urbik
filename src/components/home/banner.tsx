"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  SearchProperty, 
} from "../../app/(public)/page";

import bg1 from "../../assets/banner/bg1.png";
import bg2 from "../../assets/banner/bg2.png";

const animationStyles = `
  @keyframes kenBurns {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  .animate-ken-burns {
    animation: kenBurns 40s ease-in-out infinite;
  }
`;

interface BannerProps {
  items: SearchProperty[]; 
}

const OPERATIONS = ["ambas", "alquilar", "comprar"] as const;
type OperationType = (typeof OPERATIONS)[number];

const backgroundImages = [bg1, bg2];

export default function Banner({ items }: BannerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  
  const [operation, setOperation] = useState<OperationType>("ambas");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);
  const [pillProps, setPillProps] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const updatePill = () => {
      if (activeBtnRef.current) {
        setPillProps({
          left: activeBtnRef.current.offsetLeft,
          width: activeBtnRef.current.offsetWidth,
        });
      }
    };

    updatePill();
    window.addEventListener("resize", updatePill);

    return () => window.removeEventListener("resize", updatePill);
  }, [operation]);

  useEffect(() => {
    setIsMounted(true);

    const bgInterval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 7000);

    return () => clearInterval(bgInterval);
  }, []);

  return (
    <>
      <style>{animationStyles}</style>

      <div
        className={`relative w-full h-[230px] md:h-[650px] -mb-25 overflow-hidden bg-urbik-black transition-all duration-1000 ease-out ${
          isMounted ? "opacity-100" : "opacity-0"
        }`}
      >
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 z-0 transition-opacity duration-1500 ease-in-out ${
              currentBgIndex === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image}
              alt={`Urbik Background ${index + 1}`}
              fill
              className="object-cover animate-ken-burns"
              priority={index === 0}
            />
          </div>
        ))}

        <div className="absolute inset-0 z-10 bg-linear-to-r from-black/80 via-black/50 to-black/70 backdrop-blur-[2px]" />

        <div className="absolute inset-0 z-20 flex flex-col md:flex-row items-center justify-center px-4 sm:px-6 md:px-16 lg:px-54 py-8 md:py-10">
          
          <div 
            className={`w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0 transition-all duration-1000 delay-300 flex flex-col justify-center ${
              isMounted ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
            }`}
          >
            <h1 className="mb-3 text-2xl font-black tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-2xl">
              Tu próximo hogar<br className="hidden md:block" /> empieza aquí<br className="hidden md:block" />
            </h1>
            <p className="max-w-lg text-sm sm:text-base font-medium text-slate-200 drop-shadow md:text-xl mx-auto md:mx-0 px-2 md:px-0">
              Explorá miles de propiedades en las mejores ubicaciones con la estética que buscás.
            </p>
          </div>

          <div 
            className={`w-full md:w-1/2 max-w-xl flex flex-col items-center md:items-end transition-all duration-1000 delay-500 ${
              isMounted ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            }`}
          >
            <div 
              ref={containerRef}
              className="relative mb-4 hidden md:flex p-1 rounded-full bg-white/20 mr-10 border border-white/20 backdrop-blur-md shadow-lg isolate"
            >
              <div 
                className="absolute top-1 bottom-1 -z-10 rounded-full bg-urbik-white1 transition-all duration-300 ease-out shadow-md"
                style={{ 
                  left: `${pillProps.left}px`, 
                  width: `${pillProps.width}px` 
                }}
              />

              {OPERATIONS.map((op) => (
                <button
                  key={op}
                  ref={operation === op ? activeBtnRef : null}
                  onClick={() => setOperation(op)}
                  className={`px-5 cursor-pointer py-2 md:px-6 md:py-2.5 rounded-full text-sm md:text-base font-semibold capitalize transition-all duration-300 ${
                    operation === op 
                      ? "text-urbik-black"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>

            <div className="w-full relative overflow-hidden rounded-full border border-white/20 bg-white/30 p-1.5 md:p-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-md flex items-center">
              
              <div className="pl-3 md:pl-4 pr-1 md:pr-2 text-white/70">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>

              <input 
                type="text"
                placeholder="Busca por ciudad, barrio o calle..." 
                className="flex-grow bg-transparent px-2 py-1 text-sm md:text-lg text-white placeholder:text-white/60 outline-none w-full"
              />

              <button className="cursor-pointer rounded-full bg-urbik-accent px-4 py-2.5 md:px-8 md:py-3 text-sm md:text-lg font-bold text-white transition-all hover:bg-urbik-accent/80 hover:scale-105 active:scale-95">
                Buscar
              </button>
            </div>
          </div>

        </div>
        
      </div>
    </>
  );
}