/*
Este componente de React, denominado DashboardHeader, es un encabezado visual para un panel
de control en Next.js que utiliza la directiva "use client" para habilitar interactividad en
el lado del cliente. Su función principal es mostrar un perfil de usuario o agencia de forma
estilizada, extrayendo las iniciales del nombre proporcionado para generar un avatar circular
y aplicando un fondo de imagen con degradados oscuros mediante clases de Tailwind CSS. El código
adapta dinámicamente un mensaje de bienvenida según el booleano isAgency, muestra un estado de
cuenta "Activo" y proporciona un botón de navegación hacia la edición del perfil, manteniendo una
estructura responsiva que ajusta la disposición de los elementos entre dispositivos móviles y de
escritorio.
*/

"use client";

import React from "react";
import Link from "next/link";
import bgImage from "../../../assets/login_bg.png";

export default function DashboardHeader({
  name,
  isAgency,
}: {
  name: string;
  isAgency: boolean;
}) {
  const initials = (name ?? "Urbik")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="mb-8">
      <div className="relative overflow-hidden rounded-full border border-gray-100 p-5 shadow-sm group">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage.src})` }}
        />

        <div className="absolute inset-0 z-10 bg-linear-to-l from-urbik-black via-urbik-black/90 to-transparent" />

        <div className="relative z-20 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-6 min-w-0 w-full">
            <div className="w-24 h-24 shrink-0 rounded-full bg-black text-[#00F0FF] flex items-center justify-center font-black text-2xl shadow-lg">
              {initials || "U"}
            </div>

            <div className="min-w-0 w-full flex flex-col items-center ml-15">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-4xl font-black text-urbik-white italic">
                  {name}
                </h1>
              </div>

              <p className="mt-2 text-base text-urbik-white font-medium max-w-sm text-center">
                {isAgency
                  ? "Gestioná publicaciones, medí rendimiento y mantené tus propiedades al día."
                  : "Gestioná tus propiedades y revisá tu actividad."}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 justify-end md:mr-8 mt-2 w-1/6">
            <div className="text-md font-bold text-urbik-white/80">
              Estado: <span className="text-urbik-emerald">Activo</span>
            </div>
            <Link href={`/profile`} className="w-full">
              <button className="rounded-full  bg-urbik-white1 w-full px-5 py-2 text-md font-bold text-urbik-black hover:text-urbik-black/60 cursor-pointer hover:bg-urbik-dark2 transition-colors shadow-lg">
                Editar Perfil
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
