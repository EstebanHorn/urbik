"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Building2, MapPin, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropertyParcelWrapper from "../../property/PropertyParcelWrapper";
import { GeoJsonObject } from "geojson";

interface ImageGalleryProps {
  images: string[];
  title: string;
  parcelGeom?: unknown;
  latitude?: number | null;
  longitude?: number | null;
}

export default function ImageGallery({
  images = [],
  title,
  parcelGeom,
  latitude,
  longitude,
}: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const extraImagesCount = images.length > 4 ? images.length - 4 : 0;

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsOpen(false);
    document.body.style.overflow = "unset";
  };

  const nextImage = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % images.length);
    },
    [images.length],
  );

  const prevImage = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, nextImage, prevImage]);

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[400px] md:h-[600px] mb-12 rounded-2xl overflow-hidden">
        {/* 1. IMAGEN PRINCIPAL (Grande - Izquierda) */}
        <div
          className="col-span-4 md:col-span-2 row-span-2 relative group overflow-hidden bg-gray-100 cursor-pointer"
          onClick={() => images[0] && openModal(0)}
        >
          {images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[0]}
              alt={`Principal ${title}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-urbik-g300 flex-col gap-2">
              <Building2 size={64} />
              <span className="text-sm font-bold">Sin imágenes</span>
            </div>
          )}
        </div>

        {/* 2. SEGUNDA IMAGEN (Arriba Centro) */}
        <div
          className="hidden md:block col-span-1 row-span-1 relative overflow-hidden bg-gray-100 cursor-pointer group"
          onClick={() => images[1] && openModal(1)}
        >
          {images[1] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[1]}
              className="w-full h-full object-cover group-hover:opacity-90 transition duration-300 group-hover:scale-105"
              alt="Vista 2"
            />
          ) : (
            <div className="w-full h-full bg-urbik-g100/50" />
          )}
        </div>

        {/* 3. TERCERA IMAGEN (Arriba Derecha) */}
        <div
          className="hidden md:block col-span-1 row-span-1 relative overflow-hidden bg-gray-100 cursor-pointer group"
          onClick={() => images[2] && openModal(2)}
        >
          {images[2] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[2]}
              className="w-full h-full object-cover group-hover:opacity-90 transition duration-300 group-hover:scale-105"
              alt="Vista 3"
            />
          ) : (
            <div className="w-full h-full bg-urbik-g100/50" />
          )}
        </div>

        {/* 4. CUARTA IMAGEN + OVERLAY (Abajo Centro) */}
        <div
          className="hidden md:block col-span-1 row-span-1 relative overflow-hidden bg-gray-100 cursor-pointer group"
          onClick={() => images[3] && openModal(3)}
        >
          {images[3] ? (
            <div className="relative w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[3]}
                className={`w-full h-full object-cover transition duration-300 group-hover:scale-105 ${
                  extraImagesCount > 0 ? "brightness-50" : "hover:opacity-90"
                }`}
                alt="Vista 4"
              />
              {extraImagesCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-white font-black text-2xl drop-shadow-md pointer-events-none">
                  +{extraImagesCount}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-urbik-g100/50" />
          )}
        </div>

        {/* 5. MAPA (Abajo Derecha - SIEMPRE VISIBLE) */}
        <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden bg-urbik-dark2/5 border border-urbik-dark2/10">
          {parcelGeom && latitude && longitude ? (
            <div className="w-full h-full opacity-90 hover:opacity-100 transition-opacity relative">
              <PropertyParcelWrapper
                lat={latitude}
                lon={longitude}
                selectedGeom={parcelGeom as GeoJsonObject}
                allProperties={[]}
              />
              <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 text-[10px] font-bold rounded shadow flex items-center gap-1 pointer-events-none z-400">
                <MapPin size={10} /> Ubicación
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-xs uppercase flex-col gap-2">
              <MapPin size={24} />
              <span>Sin ubicación</span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={closeModal}
          >
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X size={32} />
            </button>

            <button
              onClick={prevImage}
              className="absolute left-4 md:left-8 z-50 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all hover:scale-110 active:scale-95 hidden md:block"
            >
              <ChevronLeft size={40} />
            </button>

            <div
              className="relative w-full h-full max-w-7xl max-h-[85vh] p-4 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={images[currentIndex]}
                  alt={`Imagen ${currentIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-sm select-none"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = Math.abs(offset.x) * velocity.x;
                    if (swipe < -100) nextImage();
                    else if (swipe > 100) prevImage();
                  }}
                />
              </AnimatePresence>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 font-medium bg-black/50 px-4 py-1 rounded-full backdrop-blur-md text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </div>

            <button
              onClick={nextImage}
              className="absolute right-4 md:right-8 z-50 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all hover:scale-110 active:scale-95 hidden md:block"
            >
              <ChevronRight size={40} />
            </button>

            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex gap-2 max-w-[80vw] overflow-x-auto pb-2 scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentIndex
                      ? "border-urbik-emerald scale-110"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    className="w-full h-full object-cover"
                    alt="thumbnail"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
