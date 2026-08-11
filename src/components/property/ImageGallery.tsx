"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Building2, MapPin, X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropertyParcelMap from "./PropertyParcelMap";
import { GeoJsonObject } from "geojson";

interface ImageGalleryProps {
  images: string[];
  title: string;
  parcelGeom?: unknown;
  latitude?: number | null;
  longitude?: number | null;
  youtubeUrl?: string | null;
}

type Slide =
  | { type: "image"; src: string }
  | { type: "video"; videoId: string };

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

export default function ImageGallery({ images = [], title, parcelGeom, latitude, longitude, youtubeUrl }: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const videoId = youtubeUrl ? getYouTubeId(youtubeUrl) : null;
  const slides: Slide[] = [
    ...images.map((src) => ({ type: "image" as const, src })),
    ...(videoId ? [{ type: "video" as const, videoId }] : []),
  ];

  const openModal = (index: number) => { setCurrentIndex(index); setIsOpen(true); document.body.style.overflow = "hidden"; };
  const closeModal = () => { setIsOpen(false); document.body.style.overflow = "unset"; };

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

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

  const getVisibleThumbnails = () => {
    if (slides.length === 0) return [];
    if (slides.length <= 5) return slides.map((slide, i) => ({ slide, originalIndex: i }));

    const thumbs = [];
    for (let i = -2; i <= 2; i++) {
        let idx = (currentIndex + i) % slides.length;
        if (idx < 0) idx += slides.length;
        thumbs.push({ slide: slides[idx], originalIndex: idx });
    }
    return thumbs;
  };

  const visibleThumbnails = getVisibleThumbnails();
  const currentSlide = slides[currentIndex];

  return (
    <>
      <div className="relative w-full h-[480px] md:h-[650px] mb-12 bg-white rounded-2xl flex flex-col justify-end shadow-[0_-15px_40px_rgba(0,0,0,0.05)]">

        <div
          className="absolute inset-0 w-full h-full cursor-pointer overflow-hidden"
          onClick={() => slides.length > 0 && openModal(currentIndex)}
        >
          {slides.length > 0 && currentSlide ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                {currentSlide.type === "image" ? (
                  <Image
                    src={currentSlide.src}
                    fill
                    alt={`${title} - Vista ${currentIndex + 1}`}
                    className="object-cover transition-transform duration-1000 hover:scale-105 [mask:linear-gradient(to_bottom,transparent_0%,black_0%,black_50%,transparent_90%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_80%,transparent_100%)]"
                    priority
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={`https://img.youtube.com/vi/${currentSlide.videoId}/maxresdefault.jpg`}
                      fill
                      alt={`${title} - Video`}
                      className="object-cover [mask:linear-gradient(to_bottom,transparent_0%,black_0%,black_50%,transparent_90%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_80%,transparent_100%)]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="bg-white/90 rounded-full p-5 shadow-lg">
                        <Play size={32} className="text-geora-black fill-geora-black ml-1" />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex items-center justify-center h-full text-geora-g300 flex-col gap-2 bg-gray-50 [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_80%,transparent_100%)]">
              <Building2 size={64} />
              <span className="text-sm font-bold">Sin imágenes</span>
            </div>
          )}
        </div>

        {!!parcelGeom && latitude != null && longitude != null && (
          <div className="absolute top-6 right-6 z-20 w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-white hidden sm:block opacity-80 hover:opacity-100 transition-opacity">
            <PropertyParcelMap lat={latitude} lon={longitude} selectedGeom={parcelGeom as GeoJsonObject} allProperties={[]} />
            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-bold rounded shadow flex items-center gap-1 z-40 text-geora-black">
              <MapPin size={10} className="text-geora-emerald" /> Mapa
            </div>
          </div>
        )}

        {slides.length > 1 && (
            <>
                <button onClick={prevImage} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 bg-white/30 backdrop-blur hover:bg-white/60 rounded-full text-geora-black transition-all hover:scale-110 shadow-lg hidden sm:flex">
                    <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </button>
                <button onClick={nextImage} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 bg-white/30 backdrop-blur hover:bg-white/60 rounded-full text-geora-black transition-all hover:scale-110 shadow-lg hidden sm:flex">
                    <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                </button>
            </>
        )}

        {slides.length > 1 && (
          <div className="relative z-20 pb-8 w-full flex justify-center items-center px-4 pointer-events-none">
            <div className="flex items-center justify-center gap-3 sm:gap-6 pointer-events-auto min-h-[100px] sm:min-h-[140px]">
              <AnimatePresence mode="popLayout">
                {visibleThumbnails.map((thumb) => {
                  const isActive = thumb.originalIndex === currentIndex;

                  return (
                    <motion.button
                      layout
                      initial={{ opacity: 0, scale: 0.8, x: 20 }}
                      animate={{
                        opacity: isActive ? 1 : 0.6,
                        scale: isActive ? 1.15 : 1,
                        x: 0
                      }}
                      exit={{ opacity: 0, scale: 0.8, x: -20 }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      key={thumb.originalIndex}
                      onClick={(e) => { e.stopPropagation(); setCurrentIndex(thumb.originalIndex); }}
                      className={`relative overflow-hidden shadow-sm cursor-pointer hover:opacity-100 z-10 ${
                        isActive ? "w-24 sm:w-40 aspect-video z-30 shadow-sm" : "w-20 sm:w-32 aspect-video"
                      }`}
                    >
                      <Image
                        src={thumb.slide.type === "image" ? thumb.slide.src : `https://img.youtube.com/vi/${thumb.slide.videoId}/hqdefault.jpg`}
                        fill
                        className="object-cover"
                        alt={thumb.slide.type === "image" ? `Miniatura ${thumb.originalIndex + 1}` : "Video"}
                        sizes="(max-width: 768px) 150px, 200px"
                      />
                      {thumb.slide.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play size={18} className="text-white fill-white" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={closeModal}>
            <button onClick={closeModal} className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"><X size={32} /></button>
            <button onClick={prevImage} className="absolute left-2 md:left-8 z-50 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110 active:scale-95"><ChevronLeft className="w-5 h-5 md:w-10 md:h-10" /></button>

            <div className="relative w-full h-full max-w-7xl max-h-[85vh] p-4 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                {currentSlide?.type === "video" ? (
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full h-full max-w-5xl aspect-video max-h-full"
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${currentSlide.videoId}?autoplay=1`}
                      className="w-full h-full rounded-sm shadow-2xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full h-full flex items-center justify-center"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, { offset, velocity }) => { const swipe = Math.abs(offset.x) * velocity.x; if (swipe < -100) nextImage(); else if (swipe > 100) prevImage(); }}
                  >
                    {currentSlide && (
                      <Image src={currentSlide.src} alt={`Imagen ${currentIndex + 1}`} fill className="object-contain shadow-2xl rounded-sm select-none" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 font-medium bg-black/50 px-4 py-1 rounded-full backdrop-blur-md text-sm z-50">{currentIndex + 1} / {slides.length}</div>
            </div>

            <button onClick={nextImage} className="absolute right-2 md:right-8 z-50 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110 active:scale-95"><ChevronRight className="w-5 h-5 md:w-10 md:h-10" /></button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex gap-2 max-w-[80vw] overflow-x-auto pb-2 scrollbar-hide z-50" onClick={(e) => e.stopPropagation()}>
              {slides.map((slide, idx) => (
                <button key={idx} onClick={() => setCurrentIndex(idx)} className={`relative w-20 aspect-video rounded-lg overflow-hidden transition-all shadow-md ${idx === currentIndex ? "scale-110 opacity-100" : "opacity-50 hover:opacity-100"}`}>
                  <Image src={slide.type === "image" ? slide.src : `https://img.youtube.com/vi/${slide.videoId}/hqdefault.jpg`} fill className="object-cover" alt="thumbnail" />
                  {slide.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play size={14} className="text-white fill-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
