"use client";
import React from "react";

export type BadgeVariant = "neutral" | "emerald" | "cyan" | "amber" | "rose" | "black";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "bg-gray-100 text-geora-black/70",
  emerald: "bg-geora-emerald/10 text-geora-emerald",
  cyan: "bg-geora-cyan/10 text-geora-cyan",
  amber: "bg-amber-500/10 text-amber-600",
  rose: "bg-geora-rose/10 text-geora-rose",
  black: "bg-geora-black text-white",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  className?: string;
  uppercase?: boolean;
}

export default function Badge({
  children,
  variant = "neutral",
  icon,
  className = "",
  uppercase = true,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
        uppercase ? "uppercase tracking-wide" : ""
      } ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
