"use client";

import React from "react";
import type { ModuleDefinition, ModuleStatus, PropertyUploadFormData } from "./types";

interface CompletionIndicatorProps {
  modules: ModuleDefinition[];
  form: PropertyUploadFormData;
  activeModuleId: number | null;
  onModuleClick: (id: number) => void;
}

const STATUS_STYLES: Record<ModuleStatus, { dot: string; text: string; bg: string }> = {
  empty: {
    dot: "bg-red-400",
    text: "text-red-500",
    bg: "bg-red-50 border-red-200",
  },
  partial: {
    dot: "bg-amber-400",
    text: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  complete: {
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
};

const STATUS_LABEL: Record<ModuleStatus, string> = {
  empty: "Incompleto",
  partial: "Parcial",
  complete: "Completo",
};

export function CompletionIndicator({
  modules,
  form,
  activeModuleId,
  onModuleClick,
}: CompletionIndicatorProps) {
  const statuses = modules.map((m) => m.getStatus(form));
  const completeCount = statuses.filter((s) => s === "complete").length;
  const percentage = modules.length > 0 ? Math.round((completeCount / modules.length) * 100) : 0;

  const overallStatus: ModuleStatus =
    percentage === 100 ? "complete" : percentage > 0 ? "partial" : "empty";

  const progressColor =
    percentage === 100
      ? "bg-emerald-500"
      : percentage >= 50
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Overall progress bar */}
      <div className="mb-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-urbik-black/50">
            Completitud SEO
          </span>
          <span
            className={`text-[11px] font-black ${
              STATUS_STYLES[overallStatus].text
            }`}
          >
            {percentage}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Module list */}
      <div className="flex flex-col gap-1 overflow-y-auto flex-1 pr-1">
        {modules.map((mod, idx) => {
          const status = statuses[idx];
          const styles = STATUS_STYLES[status];
          const isActive = activeModuleId === mod.id;

          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onModuleClick(mod.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all
                ${
                  isActive
                    ? "border-urbik-black bg-urbik-black text-white shadow-md"
                    : `${styles.bg} hover:opacity-80`
                }
              `}
            >
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isActive ? "bg-white" : styles.dot
                }`}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[11px] font-bold truncate ${
                    isActive ? "text-white" : "text-urbik-black/80"
                  }`}
                >
                  <span
                    className={`mr-1 ${isActive ? "text-white/60" : "text-urbik-black/30"}`}
                  >
                    {String(mod.id).padStart(2, "0")}.
                  </span>
                  {mod.label}
                </p>
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-wider shrink-0 ${
                  isActive ? "text-white/70" : styles.text
                }`}
              >
                {STATUS_LABEL[status]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
