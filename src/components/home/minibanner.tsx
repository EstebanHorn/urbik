import React from "react";
import Image from "next/image";

export default function Banners() {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
      
      <div className="relative flex flex-col bg-geora-black rounded-4xl overflow-hidden shadow-lg border border-gray-100 transition-transform hover:-translate-y-1">
        
        <Image 
          src="/crearcuentagratis.png" 
          alt="Crear cuenta gratis" 
          fill 
          className="object-cover opacity-5"
          priority
        />

        <div className="relative z-10 p-6 md:p-8 flex flex-col flex-grow text-white">
          <span className="text-white/80 font-bold uppercase text-sm tracking-wider">
            Para vos
          </span>
          <h2 className="text-4xl font-bold mt-2 leading-tight">
            Encontrá tu próxima propiedad sin perderte nada
          </h2>
          <p className="text-white/90 mt-3">
            Guardá las propiedades que te interesan y recibí alertas cuando aparezcan nuevas opciones que se ajusten a tu búsqueda.
          </p>
          
          <ul className="mt-5 space-y-3 flex-grow">
            <li className="flex items-start gap-2">
              <span className="text-white font-bold">✓</span>
              <span>Guardá propiedades favoritas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white font-bold">✓</span>
              <span>Recibí alertas de nuevas publicaciones</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white font-bold">✓</span>
              <span>Consultá a los profesionales</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white font-bold">✓</span>
              <span>Mirá más de lo que te interesa</span>
            </li>
          </ul>
          
          <button className="relative cursor-pointer hover:scale-101 hover:bg-white/50 z-20 mt-8 w-full bg-white/30 backdrop-blur-2xl border border-white/30 text-white font-semibold py-3 px-4 rounded-full transition-colors shadow-sm">
            Crear cuenta gratis
          </button>
        </div>
      </div>

      <div className="relative flex flex-col bg-white border border-white rounded-4xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1">
        
        <Image 
          src="/registrarmiinmobiliaria.png" 
          alt="Registrar mi inmobiliaria" 
          fill 
          className="object-cover opacity-5"
        />

        <div className="relative z-10 p-6 md:p-8 flex flex-col flex-grow text-geora-black">
          <span className="text-geora-black/60 font-bold uppercase text-sm tracking-wider">
            Para inmobiliarias
          </span>
          <h2 className="text-4xl font-bold mt-2 leading-tight">
            Publicá y empezá a recibir consultas hoy mismo
          </h2>
          <p className="text-geora-black/70 mt-3">
            Sumá tu inmobiliaria a Geora sin costo. Accedé a compradores reales que buscan activamente en el portal.
          </p>
          
          <ul className="mt-5 space-y-3 text-geora-black/60 flex-grow">
            <li className="flex items-start gap-2">
              <span className="text-geora-black font-bold">✓</span>
              <span>Registrá tu inmobiliaria y verificala gratis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-geora-black font-bold">✓</span>
              <span>Publicá ilimitadamente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-geora-black font-bold">✓</span>
              <span>Recibí consultas y nuevas propiedades</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-geora-black font-bold">✓</span>
              <span>Obtené tu sitio web</span>
            </li>
          </ul>
          
          <button className="relative z-20 mt-8 w-full hover:scale-101 hover:bg-white/50 cursor-pointer bg-white backdrop-blur-2xl text-black font-semibold py-3 px-4 rounded-full transition-colors shadow-sm">
            Registrar mi inmobiliaria
          </button>
        </div>
      </div>

    </div>
  );
}