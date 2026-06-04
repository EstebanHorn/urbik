"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type Point = { day: string; views: number };

function formatDay(day: string) {
  const [, m, d] = day.split("-");
  return `${d}/${m}`;
}

export default function ViewsAreaChart({
  data,
  color = "#00F0FF",
  gradientId = "colorViews",
  height = 280,
}: {
  data: Point[];
  color?: string;
  gradientId?: string;
  height?: number;
}) {
  const formatted = data.map((p) => ({ ...p, label: formatDay(p.day) }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#9CA3AF", fontSize: 11 }}
          interval={Math.max(0, Math.floor(formatted.length / 8) - 1)}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#9CA3AF", fontSize: 11 }}
          allowDecimals={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            fontSize: 12,
          }}
          labelStyle={{ fontWeight: 800 }}
        />
        <Area
          type="monotone"
          dataKey="views"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
