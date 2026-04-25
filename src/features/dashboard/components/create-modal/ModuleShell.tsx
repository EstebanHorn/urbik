"use client";

import React from "react";
import type { ModuleStatus } from "./types";

interface ModuleShellProps {
  id: number;
  label: string;
  status: ModuleStatus;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const STATUS_ACCENT: Record<ModuleStatus, string> = {
  empty: "border-l-red-400",
  partial: "border-l-amber-400",
  complete: "border-l-emerald-500",
};

const STATUS_DOT: Record<ModuleStatus, string> = {
  empty: "bg-red-400",
  partial: "bg-amber-400",
  complete: "bg-emerald-500",
};

export function ModuleShell({
  id,
  label,
  status,
  isOpen,
  onToggle,
  children,
}: ModuleShellProps) {
  return (
    <div
      id={`module-${id}`}
      className={`rounded-2xl border border-gray-200 border-l-4 overflow-hidden transition-all ${STATUS_ACCENT[status]}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-urbik-black text-white flex items-center justify-center text-[10px] font-black shrink-0">
            {id}
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-urbik-black/80">
            {label}
          </span>
          <div className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
        </div>
        <span className="text-gray-400 font-bold text-sm select-none">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div className="px-5 pb-6 pt-2 space-y-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}
