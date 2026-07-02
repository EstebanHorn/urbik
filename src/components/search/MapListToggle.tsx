"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Map as MapIcon, List } from "lucide-react";

export default function MapListToggle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isMap = pathname === "/map";
  const isListado = pathname === "/properties";

  if (!isMap && !isListado) return null;

  const query = searchParams.toString();
  const targetHref = `${isMap ? "/properties" : "/map"}${query ? `?${query}` : ""}`;
  const Icon = isMap ? List : MapIcon;
  const label = isMap ? "Listado" : "Mapa";
  const isEyeCatching = label === "Mapa";

  return (
    <Link
      href={targetHref}
      className={`fixed z-[900] bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 group flex items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-black transition-transform duration-300 hover:scale-105 active:scale-95 ${
        isEyeCatching
          ? "bg-linear-to-r from-geora-cyan to-geora-emerald text-geora-black shadow-[0_8px_24px_rgba(0,222,255,0.35)] ring-4 ring-white"
          : "bg-geora-black text-white shadow-2xl"
      }`}
    >
      {isEyeCatching && (
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-geora-cyan/30 opacity-60 group-hover:opacity-0" />
      )}
      <Icon className="h-4 w-4" strokeWidth={2.75} />
      {label}
    </Link>
  );
}
