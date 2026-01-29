/*
Este código define un componente de React para un tablero de estadísticas que muestra métricas
inmobiliarias mediante una cuadrícula responsiva de cuatro tarjetas informativas llamadas Chip.
El componente principal, DashboardStats, recibe como propiedades valores numéricos para el total
de propiedades, disponibles, ventas y alquileres, y los organiza utilizando un sistema de columnas
que se adapta al tamaño de la pantalla (de una a cuatro columnas). Cada Chip es un subcomponente
interno que estructura visualmente una etiqueta en negrita, un valor numérico destacado y un icono
circular decorativo importado de la librería lucide-react, aplicando estilos personalizados de
Tailwind CSS como bordes redondeados, fondos blancos y tipografías específicas para lograr una
interfaz de usuario limpia y profesional orientada al análisis de datos.
*/

"use client";

import React from "react";
import { Home, TrendingUp, BadgeDollarSign, KeyRound } from "lucide-react";

function Chip({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div>
          <div className="text-sm font-bold tracking-wider text-urbik-black/60 italic ml-7">
          {label}
        </div>
        <div className="rounded-full border border-urbik-black/10 bg-urbik-white px-8 py-2  flex items-center justify-between gap-3">
      
      <div className="min-w-0 ">

        <div className="mt-1 text-2xl font-black text-urbik-black/80">{value}</div>
      </div>

      <div className="w-13 h-13 rounded-full bg-urbik-black border flex items-center justify-center text-urbik-white -mr-5">
        {icon}
      </div>
    </div>
    </div>
    
  );
}

export default function DashboardStats({
  total,
  active,
  sale,
  rent,
}: {
  total: number;
  active: number;
  sale: number;
  rent: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
      <Chip
        label="Propiedades"
        value={total}
        icon={<Home className="w-5 h-5" />}
      />
      <Chip
        label="Disponibles"
        value={active}
        icon={<TrendingUp className="w-5 h-5" />}
      />
      <Chip
        label="Ventas"
        value={sale}
        icon={<BadgeDollarSign className="w-5 h-5" />}
      />
      <Chip
        label="Alquileres"
        value={rent}
        icon={<KeyRound className="w-5 h-5" />}
      />
    </div>
  );
}
