"use client";

import React, { useState, useRef, useCallback } from "react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remaining = maxFiles - value.length;

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    // 1. Validación de variables de entorno
    if (!cloudName || !uploadPreset) {
      console.error("🚨 FALTAN VARIABLES DE ENTORNO: Chequeá .env.local");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      // 2. Manejo de error detallado
      if (!response.ok) {
        console.error("🚨 Error de Cloudinary:", data);
        alert(`Error al subir: ${data.error?.message || "Revisá la consola"}`);
        throw new Error(data.error?.message || "Error en la subida");
      }

      return data.secure_url;
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
      // Validar tipo y que no sea gigante (>10MB)
      if (file.type.startsWith("image/") && validFiles.length < remaining) {
        validFiles.push(file);
      }
    });

    if (validFiles.length === 0) {
      setIsUploading(false);
      return;
    }

    try {
      const uploadPromises = validFiles.map((file) => uploadToCloudinary(file));
      const results = await Promise.all(uploadPromises);

      results.forEach((url) => {
        if (url) newUrls.push(url);
      });

      onChange([...value, ...newUrls]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [remaining],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end px-1">
        <div className="text-xs font-bold text-urbik-black/50 uppercase tracking-widest">
          Galería de la Propiedad
        </div>
        <span className="text-[10px] text-urbik-black/40 font-medium">
          {value.length} / {maxFiles} IMÁGENES
        </span>
      </div>

      {/* GRILLA */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-square rounded-xl overflow-hidden border border-urbik-black/10 group bg-gray-50 shadow-sm animate-in fade-in zoom-in duration-300"
            >
              <img
                src={url}
                alt={`Imagen ${index + 1}`}
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="absolute top-2 right-2 bg-white/90 text-red-500 hover:text-red-600 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-10 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* DROP ZONE */}
      {remaining > 0 && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`
            group relative flex flex-col items-center justify-center w-full h-32 
            rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
            ${
              isDragActive
                ? "border-emerald-500 bg-emerald-50/50 scale-[1.02]"
                : "border-gray-300 bg-gray-50/50 hover:bg-emerald-50/30 hover:border-emerald-500/50"
            }
            ${isUploading ? "pointer-events-none opacity-80" : ""}
          `}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={onInputChange}
            disabled={isUploading}
          />

          <div className="flex flex-col items-center gap-2 z-10">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                <span className="text-xs font-bold text-emerald-600 animate-pulse">
                  Subiendo...
                </span>
              </div>
            ) : (
              <>
                <div
                  className={`p-3 bg-white rounded-full shadow-sm border border-gray-100 transition-all duration-300 ${isDragActive ? "scale-110 shadow-md" : "group-hover:scale-110 group-hover:shadow-md"}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`w-6 h-6 transition-colors ${isDragActive ? "text-emerald-500" : "text-gray-400 group-hover:text-emerald-500"}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <span
                    className={`text-sm font-bold transition-colors ${isDragActive ? "text-emerald-700" : "text-gray-500 group-hover:text-emerald-600"}`}
                  >
                    {isDragActive
                      ? "¡Soltá las fotos acá!"
                      : "Hacé click o arrastrá fotos"}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
                    JPG, PNG, WEBP · Máx 10MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
