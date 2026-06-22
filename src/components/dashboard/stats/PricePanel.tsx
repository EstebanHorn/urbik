"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const glassCardStyles = 
  "relative border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";

type PriceEntry = {
  id: string;
  sale_price: number | null;
  sale_currency: string | null;
  rent_price: number | null;
  rent_currency: string | null;
  changed_at: string;
};

type PropertyLite = {
  id: string;
  title?: string;
  city?: string;
  province?: string;
};

function formatPrice(value: number | null, currency: string | null) {
  if (value == null) return null;
  const sym = currency === "USD" ? "USD" : currency === "ARS" ? "ARS" : (currency ?? "");
  return `${sym} ${value.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function PriceRow({ history }: { history: PriceEntry[] }) {
  const hasSale = history.some((h) => h.sale_price != null);
  const hasRent = history.some((h) => h.rent_price != null);

  const chartData = history.map((h) => ({
    label: formatDate(h.changed_at),
    sale: h.sale_price,
    rent: h.rent_price,
  }));

  const first = history[0];
  const last = history[history.length - 1];
  const saleDelta =
    first?.sale_price != null && last?.sale_price != null
      ? last.sale_price - first.sale_price
      : null;

  return (
    <div className="space-y-4">
      {history.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/50 bg-white/40 p-3 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-geora-muted uppercase">Primer registro</p>
            <p className="text-sm font-black text-geora-black mt-1">
              {formatPrice(first.sale_price, first.sale_currency) ??
                formatPrice(first.rent_price, first.rent_currency) ?? "—"}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">{formatDate(first.changed_at)}</p>
          </div>
          <div className="rounded-lg border border-white/50 bg-white/40 p-3 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-geora-muted uppercase">Actual</p>
            <p className="text-sm font-black text-geora-black mt-1 flex items-center gap-2">
              {formatPrice(last.sale_price, last.sale_currency) ??
                formatPrice(last.rent_price, last.rent_currency) ?? "—"}
              {saleDelta != null && saleDelta !== 0 && (
                <span
                  className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    saleDelta < 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {saleDelta < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                  {saleDelta < 0 ? "" : "+"}
                  {saleDelta.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                </span>
              )}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">{formatDate(last.changed_at)}</p>
          </div>
        </div>
      )}

      {history.length >= 2 && (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} width={50} />
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.5)",
                backgroundColor: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(8px)",
                fontSize: 11,
              }}
            />
            {hasSale && <Line type="monotone" dataKey="sale" name="Venta" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />}
            {hasRent && <Line type="monotone" dataKey="rent" name="Alquiler" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3 }} />}
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="rounded-lg border border-white/50 overflow-hidden bg-white/30 backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[10px] uppercase text-geora-black/50 font-bold border-b border-white/50 bg-white/40">
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2 text-right">Venta</th>
              <th className="px-3 py-2 text-right">Alquiler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/50">
            {[...history].reverse().map((h) => (
              <tr key={h.id} className="hover:bg-white/20 transition-colors">
                <td className="px-3 py-2 text-xs text-gray-600">{formatDate(h.changed_at)}</td>
                <td className="px-3 py-2 text-right text-xs font-bold text-geora-black">
                  {formatPrice(h.sale_price, h.sale_currency) ?? "—"}
                </td>
                <td className="px-3 py-2 text-right text-xs font-bold text-geora-black">
                  {formatPrice(h.rent_price, h.rent_currency) ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PropertyAccordion({ property }: { property: PropertyLite }) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<PriceEntry[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || history !== null) return;
    setLoading(true);
    fetch(`/api/stats/property/${property.id}/price-history`)
      .then((r) => r.json())
      .then((data) => setHistory(data.history ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [open, property.id, history]);

  return (
    <div className={`rounded-xl overflow-hidden ${glassCardStyles}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative z-10 w-full px-5 py-4 flex items-center justify-between hover:bg-white/30 transition-colors cursor-pointer"
      >
        <div className="text-left min-w-0">
          <p className="font-bold text-geora-black text-sm truncate">
            {property.title ?? "Sin título"}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {property.city ?? "—"}, {property.province ?? "—"}
          </p>
        </div>
        <div className="text-geora-black/60">
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </button>
      
      {open && (
        <div className="relative z-10 px-5 py-4 border-t border-white/40">
          {loading && <div className="text-sm text-gray-500">Cargando historial...</div>}
          {!loading && history && history.length === 0 && (
            <div className="text-sm text-gray-500">Sin cambios de precio registrados.</div>
          )}
          {!loading && history && history.length > 0 && <PriceRow history={history} />}
        </div>
      )}
    </div>
  );
}

export default function PricePanel({ properties }: { properties: PropertyLite[] }) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12 text-sm font-medium text-gray-500">
        Cargá alguna propiedad para ver su historial de precios.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {properties.map((p) => (
        <PropertyAccordion key={p.id} property={p} />
      ))}
    </div>
  );
}