"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, Cell, ResponsiveContainer } from "recharts";

type Bucket = { from: number; to: number; count: number };

type PriceFilterCardProps = {
  minPrice: string;
  maxPrice: string;
  currency: string;
  operationType: string;
  propertyType: string;
  onChangeMin: (v: string) => void;
  onChangeMax: (v: string) => void;
  onChangeCurrency: (v: string) => void;
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

const THUMB =
  "appearance-none bg-transparent cursor-pointer absolute w-full " +
  "[&::-webkit-slider-runnable-track]:bg-transparent " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 " +
  "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white " +
  "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-urbik-black " +
  "[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab " +
  "[&::-webkit-slider-thumb]:active:cursor-grabbing " +
  "[&::-moz-range-track]:bg-transparent " +
  "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 " +
  "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white " +
  "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-urbik-black [&::-moz-range-thumb]:shadow-md";

export default function PriceFilterCard({
  minPrice,
  maxPrice,
  currency,
  operationType,
  propertyType,
  onChangeMin,
  onChangeMax,
  onChangeCurrency,
}: PriceFilterCardProps) {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [absMin, setAbsMin] = useState(0);
  const [absMax, setAbsMax] = useState(0);

  const fetchHistogram = useCallback(async () => {
    try {
      const params = new URLSearchParams({ currency });
      if (operationType) params.set("operationType", operationType);
      if (propertyType) params.set("propertyType", propertyType);
      const res = await fetch(`/api/properties/price-histogram?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setBuckets(data.buckets ?? []);
      setAbsMin(data.min ?? 0);
      setAbsMax(data.max ?? 0);
    } catch {}
  }, [currency, operationType, propertyType]);

  useEffect(() => { fetchHistogram(); }, [fetchHistogram]);

  const activeMin = minPrice ? Number(minPrice) : absMin;
  const activeMax = maxPrice ? Number(maxPrice) : absMax;

  const hasRange = absMax > absMin;
  const step = hasRange ? Math.max(1, Math.round((absMax - absMin) / 100)) : 1;
  const minPct = hasRange ? ((activeMin - absMin) / (absMax - absMin)) * 100 : 0;
  const maxPct = hasRange ? ((activeMax - absMin) / (absMax - absMin)) * 100 : 100;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val >= activeMax) return;
    onChangeMin(val <= absMin ? "" : String(val));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val <= activeMin) return;
    onChangeMax(val >= absMax ? "" : String(val));
  };

  const minZ = minPct > 95 ? "z-20" : "z-10";
  const maxZ = minPct > 95 ? "z-10" : "z-20";

  const currencySymbol = currency === "USD" ? "USD" : "$";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-urbik-black/70 uppercase">Precio</span>
        <div className="flex gap-1 p-0.5">
          {["ARS", "USD"].map((c) => (
            <button
              key={c}
              onClick={() => onChangeCurrency(currency === c ? "" : c)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                currency === c
                  ? "bg-urbik-black text-white shadow-sm"
                  : "text-urbik-black/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {buckets.length > 0 && (
        <div className="h-16 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap="10%">
              <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={24}>
                {buckets.map((b, i) => (
                  <Cell key={i} fill={b.from >= activeMin && b.to <= activeMax ? "#000000" : "#000000"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {hasRange ? (
        <div className="px-1">
          <div className="relative h-6 flex items-center">
            <div className="absolute w-full h-1.5 bg-slate-200 rounded-full" />
            <div
              className="absolute h-1.5 bg-urbik-black/80 rounded-full pointer-events-none"
              style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
            />
            <input
              type="range"
              min={absMin}
              max={absMax}
              step={step}
              value={activeMin}
              onChange={handleMinChange}
              className={`${THUMB} ${minZ}`}
            />
            <input
              type="range"
              min={absMin}
              max={absMax}
              step={step}
              value={activeMax}
              onChange={handleMaxChange}
              className={`${THUMB} ${maxZ}`}
            />
          </div>

          <div className="flex justify-between mt-3 gap-2">
            <div className="flex flex-col items-start min-w-[8rem]">
              <span className="text-[10px] font-bold text-urbik-black/60 uppercase">Desde</span>
              <span className="text-xs font-black text-urbik-black/80 tabular-nums whitespace-nowrap">
                {currencySymbol} {fmt(activeMin)}
              </span>
            </div>
            <div className="flex flex-col items-end min-w-[8rem]">
              <span className="text-[10px] font-bold text-urbik-black/60 uppercase">Hasta</span>
              <span className="text-xs font-black text-urbik-black/80 tabular-nums whitespace-nowrap">
                {currencySymbol} {fmt(activeMax)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        absMin === 0 && absMax === 0 && (
          <p className="text-[11px] text-slate-400 text-center">Seleccioná moneda para ver el rango</p>
        )
      )}
    </div>
  );
}