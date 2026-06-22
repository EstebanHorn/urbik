"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  maxFiles?: number;
}

export default function ImageUpload({
  value = [],
  onChange,
  onRemove,
  maxFiles = 10,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remaining = maxFiles - value.length;

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", "properties");
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Error ${res.status}`);
      return json.url as string;
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      return null;
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    setIsUploading(true);
    const validFiles: File[] = [];
    const newUrls: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/") && validFiles.length < remaining) {
        validFiles.push(file);
      }
    });

    if (validFiles.length === 0) {
      setIsUploading(false);
      return;
    }

    try {
      const uploadPromises = validFiles.map((file) => uploadFile(file));
      const results = await Promise.all(uploadPromises);

      results.forEach((url) => {
        if (url) newUrls.push(url);
      });

      onChange([...value, ...newUrls]);
    } catch (error) {
      console.error(error);
      alert("Error al subir algunas imágenes.");
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); if (e.dataTransfer.types.includes("Files")) setIsDragActive(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragActive(false); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragActive(false); if (e.dataTransfer.files?.length > 0) handleFiles(e.dataTransfer.files); };
  
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.length) handleFiles(e.target.files); if (fileInputRef.current) fileInputRef.current.value = ""; };
  const handleImageDragStart = (e: React.DragEvent, index: number) => { setDraggedIndex(index); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(index)); };
  const handleImageDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); e.stopPropagation(); if (draggedIndex !== null && draggedIndex !== index) setDragOverIndex(index); };
  const handleImageDrop = (e: React.DragEvent, index: number) => { e.preventDefault(); e.stopPropagation(); if (draggedIndex === null || draggedIndex === index) return; const reordered = [...value]; const [moved] = reordered.splice(draggedIndex, 1); reordered.splice(index, 0, moved); onChange(reordered); setDraggedIndex(null); setDragOverIndex(null); };
  const handleImageDragEnd = () => { setDraggedIndex(null); setDragOverIndex(null); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-end px-1">
        <span className="text-[10px] text-geora-black/40 font-medium">{value.length} / {maxFiles} IMÁGENES</span>
      </div>

      {value.length > 0 && (
        <>
          <p className="text-[10px] text-gray-400 font-medium px-1">Arrastrá las fotos para reordenarlas. La posición 1 será la foto de portada.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {value.map((url, index) => (
              <div key={`${url}-${index}`} draggable onDragStart={(e) => handleImageDragStart(e, index)} onDragOver={(e) => handleImageDragOver(e, index)} onDrop={(e) => handleImageDrop(e, index)} onDragEnd={handleImageDragEnd} className={`relative aspect-square rounded-xl overflow-hidden border group bg-white/30 shadow-sm animate-in fade-in zoom-in duration-300 cursor-grab active:cursor-grabbing transition-all ${dragOverIndex === index && draggedIndex !== index ? "border-emerald-400 scale-105 shadow-md" : draggedIndex === index ? "border-geora-black/30 opacity-50" : "border-geora-black/10"}`}>
                {index === 0 && <span className="absolute top-2 left-2 z-10 bg-geora-black text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Portada</span>}
                
                <Image 
                  src={url} 
                  alt={`Imagen ${index + 1}`} 
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110" 
                  draggable={false} 
                />
                
                <button type="button" onClick={() => onRemove(url)} className="absolute top-2 right-2 bg-white/90 text-red-500 hover:text-red-600 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-10 cursor-pointer">✕</button>
              </div>
            ))}
          </div>
        </>
      )}

      {remaining > 0 && (
        <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => !isUploading && fileInputRef.current?.click()} className={`group relative flex flex-col shadow-md items-center justify-center w-full h-32 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${isDragActive ? "border-white scale-[1.02]" : "border-white hover:border-black"} ${isUploading ? "pointer-events-none opacity-80" : ""}`}>
          <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={onInputChange} disabled={isUploading} />
          <div className="flex flex-col items-center gap-2 z-10">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2"><div className="w-8 h-8 border border-white rounded-full animate-spin" /><span className="text-xs font-bold text-geora-black animate-pulse">Subiendo...</span></div>
            ) : (
              <>
                <div className="text-center">
                  <span className={`text-sm font-bold transition-colors ${isDragActive ? "text-geora-black" : "text-geora-black/60 group-hover:text-geora-black"}`}>{isDragActive ? "¡Soltá las fotos acá!" : "Hacé click o arrastrá fotos"}</span>
                  <p className="text-[10px] text-geora-black/60 mt-1 uppercase ">JPG, PNG, WEBP · Máx 10MB</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}