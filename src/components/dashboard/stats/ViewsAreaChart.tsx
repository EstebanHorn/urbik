"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type Point = { day: string; views: number };

function formatDay(day: string) {
  const [, m, d] = day.split("-");
  return `${d}/${m}`;
}

export default function ViewsAreaChart({
  data,
  color = "#374151",
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
            <stop offset="5%" stopColor={color} stopOpacity={0} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        
        <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.03)" vertical={false} />
        
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#A1A1AA", fontSize: 11, fontWeight: 500 }}
          interval={Math.max(0, Math.floor(formatted.length / 8) - 1)}
          dy={10}
        />
        
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#A1A1AA", fontSize: 11, fontWeight: 500 }}
          allowDecimals={false}
          width={32}
          dx={-10}
        />
        
        <Tooltip
          content={() => null}
          cursor={{ stroke: "rgba(0,0,0,0.1)", strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        
        <Area
          type="monotone"
          dataKey="views"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          activeDot={{ r: 4, fill: color, stroke: "#ffffff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}