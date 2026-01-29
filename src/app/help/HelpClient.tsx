/*
Este código implementa un componente para una página de centro de ayuda, el cual permite
a los usuarios buscar artículos de soporte en tiempo real mediante un buscador interactivo
que filtra una lista de entradas (initialPosts) según el título ingresado. El componente
gestiona el estado de la búsqueda, incluye una funcionalidad para cerrar automáticamente 
la lista de resultados al hacer clic fuera del área del buscador mediante un ref de useRef,
y presenta una interfaz organizada con navegación por categorías iconográficas, un acceso
directo a un formulario de contacto y un diseño visualmente coherente basado en Tailwind CSS.
*/

"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  Scale, 
  FileSearch, 
  ArrowRight 
} from "lucide-react";

interface Post {
  slug: string;
  titulo: string;
  categoria: string;
}

const CATEGORIES = [
  { name: "Inmobiliarias", slug: "realestates", icon: Building2 },
  { name: "Compradores o Inquilinos", slug: "buyers", icon: Users },
  { name: "Legales", slug: "legal", icon: Scale },
  { name: "Valoraciones", slug: "valuations", icon: FileSearch },
];

export default function HelpClient({ initialPosts }: { initialPosts: Post[] }) {
  const [busqueda, setBusqueda] = useState("");
  const buscadorRef = useRef<HTMLDivElement>(null);

  const resultados = initialPosts.filter((art) =>
    art.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    function handleClickFuera(event: MouseEvent) {
      if (buscadorRef.current && !buscadorRef.current.contains(event.target as Node)) {
        setBusqueda("");
      }
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 pb-20 mt-13">
      <div className="mb-20">
        <Image src="/Urbik_Help_Logo.svg" alt="Logo" width={220} height={40} priority />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 text-center tracking-tight">
        ¿Cómo podemos ayudarte?
      </h1>

      <div className="w-full max-w-3xl relative" ref={buscadorRef}>
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Escribe tu pregunta aquí..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="italic w-full h-14 pl-5 pr-12 border border-gray-300 rounded-full bg-urbik-white2 text-center placeholder:text-urbik-dark font-medium opacity-70 focus:ring-2 focus:ring-urbik-black outline-none transition-all"
            />
          </div>
        </div>

        {busqueda !== "" && (
          <div className="absolute z-50 w-full mb-8 border border-gray-100 rounded-4xl p-2 shadow-xl bg-urbik-black">
            {resultados.length > 0 ? (
              resultados.map((art) => (
                <Link 
                  key={art.slug} 
                  href={`/help/${art.slug}`}
                  className="flex items-center justify-between p-4 hover:bg-urbik-dark rounded-4xl group font-medium hover:font-bold"
                >
                  <span className="text-urbik-white group-hover:text-white">
                    {art.titulo}
                  </span>
                  <span className="text-xs bg-urbik-emerald px-2 py-1 rounded text-urbik-black">
                    {art.categoria}
                  </span>
                </Link>
              ))
            ) : (
              <p className="p-4 text-center text-gray-400">No hay resultados.</p>
            )}
          </div>
        )}

        {/* --- SECCIÓN DE CATEGORÍAS CON ICONOS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link 
                key={cat.slug}
                href={`/help/category/${cat.slug}`}
                className="flex items-center gap-4 p-2 text-center rounded-full bg-urbik-white border border-gray-200 hover:border-urbik-black  transition-all group"
              >
                <div className="bg-urbik-black p-2.5 rounded-full text-white group-hover:bg-urbik-emerald transition-colors">
                  <Icon size={20} />
                </div>
                <span className="text-md font-bold text-urbik-black flex-grow tracking-tight mr-5">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* --- SECCIÓN: CONTACTO --- */}
        <div className="mt-10 pt-10 border-t border-gray-100 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold text-black mb-3 italic">
            Mandanos un mensaje.
          </h2>
          <p className="text-gray-600 mb-8 max-w-sm">
            Comentanos tus inquietudes y en breve te estaremos contestando.
          </p>
          <Link
            href="/contact" 
            className="bg-urbik-black text-white hover:text-urbik-emerald font-bold py-4 px-10 rounded-full transition-all shadow-md active:scale-95"
          >
            Contactanos
          </Link>
        </div>
      </div>
    </div>
  );
}