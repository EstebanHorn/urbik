"use client";
import React from "react";

const COLORS = ["bg-slate-700", "bg-zinc-600", "bg-neutral-700", "bg-stone-600", "bg-gray-700"];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
};

export default function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={`${SIZE_CLASSES[size]} ${colorFor(name || "")} rounded-full flex items-center justify-center font-black text-white shrink-0 ${className}`}
    >
      {initial}
    </div>
  );
}
