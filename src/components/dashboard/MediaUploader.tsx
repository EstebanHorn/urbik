"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Loader2, Trash2, ImagePlus } from "lucide-react";

interface MediaUploaderProps {
  currentUrl?: string | null;
  onImageChange: (url: string) => void;
  disabled?: boolean;
}

export default function MediaUploader({ currentUrl, onImageChange, disabled = false }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Archivo inválido");
    if (file.size > 5 * 1024 * 1024) return alert("Máximo 5MB");

    setIsUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", "logos"); 
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Error ${res.status}`);
      onImageChange(json.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Hubo un error al subir la imagen.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerClick = () => { if (!isUploading && !disabled) fileInputRef.current?.click(); };

  return (
    <div onClick={triggerClick} className={`relative w-full h-full rounded-full border-2 border-urbik-g100 border-dashed shadow-lg overflow-hidden group cursor-pointer bg-urbik-white z-20 ${isUploading ? "pointer-events-none" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} disabled={disabled || isUploading} />
      {isUploading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
          <Loader2 className="animate-spin text-urbik-emerald" size={24} />
        </div>
      ) : currentUrl ? (
        <>
          <Image src={currentUrl} alt="Logo" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
          {!disabled && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <Camera className="text-white" size={20} />
              <button onClick={(e) => { e.stopPropagation(); onImageChange(""); }} className="p-1.5 bg-white/20 hover:bg-red-500/80 rounded-full text-white transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-urbik-muted hover:bg-urbik-g100 transition-colors z-200">
          <ImagePlus size={24} className="mb-1 opacity-50" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Logo</span>
        </div>
      )}
    </div>
  );
}