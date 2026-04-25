"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import ImageUpload from "@/components/ImageUpload";
import type { PropertyUploadFormData } from "./types";

interface Props {
  rhf: UseFormReturn<PropertyUploadFormData>;
}

export function Module12Multimedia({ rhf }: Props) {
  const { watch, setValue } = rhf;
  const images = watch("images") ?? [];

  return (
    <div className="space-y-6">
      <ImageUpload
        value={images}
        onChange={(urls) => setValue("images", urls)}
        onRemove={(url) =>
          setValue(
            "images",
            images.filter((i) => i !== url),
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
            Video de YouTube
          </label>
          <input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={watch("youtubeUrl") ?? ""}
            onChange={(e) => setValue("youtubeUrl", e.target.value)}
            className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-urbik-black/50 mb-2 ml-1">
            Tour 360
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={watch("tour360Url") ?? ""}
            onChange={(e) => setValue("tour360Url", e.target.value)}
            className="bg-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all text-sm"
          />
        </div>
      </div>

      <p className="text-[10px] text-gray-400 font-medium ml-1">
        Publicaciones con 5 o más fotos tienen mejor posicionamiento en los resultados de búsqueda.
      </p>
    </div>
  );
}
