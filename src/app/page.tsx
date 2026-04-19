/*
Componente principal de la página de inicio, el cual integra un buscador avanzado con filtros de operación
(venta/alquiler) y tipo de propiedad, un carrusel dinámico que obtiene propiedades destacadas desde una API
interna permitiendo gestionarlas como favoritas, y secciones informativas que resaltan el uso de datos
catastrales y herramientas de inteligencia artificial para el análisis de inversiones. El componente utiliza
Next.js y Framer Motion para lograr una interfaz interactiva y animada, gestionando estados complejos para
la ubicación, la sincronización de elementos visuales en el buscador y la visualización detallada de
especificaciones técnicas y precios de los inmuebles.
*/

"use client";
import { useSession } from "next-auth/react";
import { useHomeSearch } from "@/features/home/hooks/useHomeSearch";
import { SearchSection } from "@/features/home/components/SearchSection";
import { FeaturedCarousel } from "@/features/home/components/FeaturedCarousel";
import { PrecisionSection } from "@/features/home/components/PrecisionSection";
import Link from "next/link";

export default function HomePage() {
  const { data: session } = useSession();
  const search = useHomeSearch();

  return (
    <div className="bg-urbik-white min-h-screen pt-16 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <SearchSection {...search} onSearch={search.handleSearch} />
      </div>

      <FeaturedCarousel
        properties={search.featuredProperties}
        loading={search.loadingFeatured}
        currentIndex={search.currentIndex}
        session={session}
        onToggleFavorite={search.handleToggleFavorite}
      />

      <PrecisionSection />

      <section className="bg-urbik-black text-white py-24 px-6">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <h2 className="text-4xl font-display font-bold tracking-tight">
            Urbik, la plataforma de las inmobiliarias
          </h2>
          <p className="text-gray-300 text-lg font-medium max-w-2xl">
            Si estás buscando dar el salto con tu inmobiliaria es necesario adaptarte a las nuevas
            tecnologías. Registrate y obtené tu sitio para publicar propiedades en todo el país de
            forma gratuita. Obtené tu verificación y empezá a recibir consultas y nuevas propiedades.
          </p>
          <Link
            href="/register"
            className="mt-2 inline-block bg-urbik-emerald text-white font-bold px-10 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all"
          >
            Registrarse como inmobiliaria
          </Link>
        </div>
      </section>
    </div>
  );
}
