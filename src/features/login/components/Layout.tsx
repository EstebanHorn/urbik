/*
Este código define un componente de diseño para una pantalla de inicio de sesión en React
que organiza el contenido en una estructura de tres columnas para pantallas grandes: una
sección central blanca y elevada mediante sombras donde se renderiza el formulario (children),
flanqueada por dos paneles laterales con imágenes de fondo que utilizan un efecto de espejo
para mantener la simetría visual. El diseño es responsivo, de modo que en dispositivos móviles
las imágenes laterales desaparecen y el formulario ocupa todo el ancho de la pantalla,
manteniendo un pie de página con el copyright de la marca.
*/

import React from "react";
import loginBg from "../../../assets/login_bg.png";

const ImageSidebar = ({ src, mirror = false }: { src: string; mirror?: boolean }) => (
  <div className="hidden lg:block w-1/4 relative overflow-hidden">
    <img
      src={src}
      alt="Auth Background"
      className={`absolute inset-0 w-full h-full object-cover ${mirror ? "-scale-x-100" : ""}`}
    />
    <div className="absolute inset-0 bg-black/5" />
  </div>
);

export function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-white">
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img
          src={loginBg.src}
          alt="Background Left"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      <div className="w-full lg:w-1/3 flex flex-col items-center justify-center p-12 relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="w-full max-w-sm">
          {children}
        </div>
        <div className="absolute bottom-8 text-gray-400 text-xs font-medium">
          © 2025 Urbik. Todos los derechos reservados.
        </div>
      </div>

      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img
          src={loginBg.src}
          alt="Background Right"
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>
    </div>
  );
}