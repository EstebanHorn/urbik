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
      className={`z-[900] group flex items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-bold transition-transform duration-300 ${
        isEyeCatching
          ? "bg-white  text-geora-black/70 hover:text-black"
          : "bg-white  text-geora-black/70 hover:text-black"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={2.75} />
      {label}
    </Link>
  );
}
