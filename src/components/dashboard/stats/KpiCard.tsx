import React from "react";

type Props = {
  label: string;
  value: number | string;
  hint?: string;
  icon?: React.ReactNode;
};

const glassCardStyles = 
  "relative md:rounded-[30px] rounded-3xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[30px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";

export default function KpiCard({ label, value, hint, icon }: Props) {
  return (
    <div className={`flex flex-col gap-2 p-6 ${glassCardStyles}`}>
      
      <div className="relative z-10 flex items-center justify-between h-10">
        <span className="text-xs font-bold uppercase tracking-wide text-urbik-black/50">
          {label}
        </span>
        {icon && <div className="text-urbik-black/50">{icon}</div>}
      </div>

      <div className="relative z-10 text-4xl font-black text-urbik-black/70 leading-none">
        {value}
      </div>

      {hint && (
        <div className="relative z-10 text-xs font-medium text-gray-500">
          {hint}
        </div>
      )}
      
    </div>
  );
}