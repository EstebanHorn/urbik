"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

type TopProperty = {
  id: string;
  title: string | null;
  favorites: number;
  inquiries: number;
  chats: number;
};

function shortTitle(title: string | null, idx: number) {
  if (!title) return `Propiedad ${idx + 1}`;
  return title.length > 22 ? `${title.slice(0, 20)}…` : title;
}

export default function EngagementBarChart({ data }: { data: TopProperty[] }) {
  const chartData = data.map((p, i) => ({
    name: shortTitle(p.title, i),
    Favoritos: p.favorites,
    Consultas: p.inquiries,
    Chats: p.chats,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#9CA3AF", fontSize: 11 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#9CA3AF", fontSize: 11 }}
          allowDecimals={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Favoritos" fill="#FB7185" radius={[6, 6, 0, 0]} />
        <Bar dataKey="Consultas" fill="#10B981" radius={[6, 6, 0, 0]} />
        <Bar dataKey="Chats" fill="#06B6D4" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
