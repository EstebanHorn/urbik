/*
Este código define un componente de React para Next.js llamado ImageUpload que permite gestionar
la subida de múltiples imágenes (hasta un máximo de 7) utilizando el widget de Cloudinary; su
función principal es renderizar una cuadrícula con las fotos ya subidas que incluye una opción
para eliminarlas, además de mostrar un botón dinámico que abre el selector de archivos y actualiza
el estado local mediante la función onChange cada vez que se carga con éxito una nueva imagen en
la nube.
*/

"use client";

import React from "react";
import { CldUploadWidget } from "next-cloudinary";

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
  maxFiles = 7,
}: ImageUploadProps) {
const handleUpload = (result: any) => {
  if (result.event === "success") {
    const url = result?.info?.secure_url;
    if (url) {
      onChange([...value, url]);
    }
  }
};

  return (
    <div className="flex flex-col gap-4">
      <div className="text-md font-bold text-urbik-black/50 ml-5">
        Imágenes ({value.length}/{maxFiles})
      </div>

      <div className="grid grid-cols-2 gap-2">
        {value.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative aspect-square rounded-lg overflow-hidden border border-urbik-black/50 group"
          >
            <img
              src={url}
              alt="Propiedad"
              className="object-cover w-full h-full"
            />
            <button
              onClick={() => onRemove(url)}
              type="button"
              className="absolute top-1 cursor-pointer right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-sm z-10"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {value.length < maxFiles && (
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={handleUpload}
          options={{
            maxFiles: maxFiles - value.length,
            clientAllowedFormats: ["image"],
            sources: ["local", "url", "camera"],
          }}
        >
          {({ open }) => {
            return (
              <button
                type="button"
                onClick={() => open?.()}
                className="flex flex-col cursor-pointer items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-[#00F0FF] hover:text-sky-500 hover:bg-sky-50 transition cursor-pointer gap-2"
              >
                <span className="text-2xl">+</span>
                <span className="text-xs font-medium">Subir fotos</span>
              </button>
            );
          }}
        </CldUploadWidget>
      )}
    </div>
  );
}
