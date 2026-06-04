import React from "react";

type Props = {
  label: string;
  value: number | string;
  hint?: string;
  icon?: React.ReactNode;
  accent?: "cyan" | "emerald" | "rose" | "neutral";
};

const ACCENT: Record<NonNullable<Props["accent"]>, string> = {
  cyan: "bg-urbik-cyan/10 text-urbik-black",
  emerald: "bg-emerald-50 text-urbik-emerald",
  rose: "bg-rose-50 text-urbik-rose",
  neutral: "bg-gray-100 text-gray-600",
};

export default function KpiCard({ label, value, hint, icon, accent = "neutral" }: Props) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-urbik-black/50">
          {label}
        </span>
        {icon && (
          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${ACCENT[accent]}`}>
            {icon}
          </span>
        )}
      </div>
      <div className="text-3xl font-black text-urbik-black leading-none">{value}</div>
      {hint && <div className="text-xs font-medium text-gray-500">{hint}</div>}
    </div>
  );
}
