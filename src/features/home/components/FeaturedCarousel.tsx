/*
Este código define un componente de React llamado FeaturedCarousel que renderiza un
carrusel animado para mostrar propiedades inmobiliarias destacadas utilizando Framer
Motion para las transiciones y Next.js para la navegación. El componente gestiona
diferentes estados (carga, lista vacía o visualización de datos), formatea etiquetas
de tipo de propiedad y especificaciones técnicas (como metros cuadrados y ambientes),
y presenta la información detallada de cada propiedad —incluyendo imagen, precio,
ubicación y descripción— permitiendo además que los usuarios con sesión iniciada
marquen propiedades como favoritas mediante un botón interactivo.
*/

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { FeaturedProperty } from "../service/propertyService";

interface Props {
  properties: FeaturedProperty[];
  loading: boolean;
  currentIndex: number;
  session: any;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

export function FeaturedCarousel({ properties, loading, currentIndex, session, onToggleFavorite }: Props) {
  const getPropertyLabel = (type: string) => {
    const labels: Record<string, string> = {
      HOUSE: "Casa", APARTMENT: "Departamento", LAND: "Terreno",
      COMMERCIAL_PROPERTY: "Local", OFFICE: "Oficina", COMMERCIAL: "Local Comercial"
    };
    return labels[type] || type;
  };

  const getSpecsLabel = (p: FeaturedProperty) => {
    const parts = [];
    if (p.area) parts.push(`Cuenta con ${p.area} m²`);
    if (p.rooms) parts.push(`${p.rooms} ambientes`);
    return parts.join(" repartidos en ") || "Consultar detalles";
  };

  if (loading) return <div className="w-full h-[500px] bg-urbik-g300 animate-pulse rounded-md" />;
  if (properties.length === 0) return (
    <div className="w-full h-[500px] flex items-center justify-center border rounded-md">
      <p className="text-urbik-muted font-bold">No hay propiedades destacadas.</p>
    </div>
  );

  const current = properties[currentIndex];

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <h2 className="text-2xl font-display font-bold text-urbik-muted text-right mr-12 italic">Propiedades destacadas.</h2>
      <p className="text-urbik-black opacity-50 text-md font-med mb-3 text-right mr-10">Oportunidades seleccionadas por nuestro algoritmo.</p>
      
      <div className="relative overflow-hidden w-full h-[500px] rounded-md border border-urbik-g200 bg-white hover:scale-105 hover:brightness-105 transition-all">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <Link href={`/property/${current.id}`} className="flex flex-col md:flex-row h-full group">
              <div className="relative w-full md:w-1/2 h-64 md:h-full overflow-hidden bg-urbik-g200">
                <img src={current.images[0]} alt={current.title} className="w-full h-full object-cover" />
              </div>

              <div className="w-full md:w-1/2 p-10 flex flex-col bg-urbik-white2 relative">
                {session && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => onToggleFavorite(e, current.id)}
                    className={`absolute top-6 right-6 z-30 p-3 backdrop-blur-sm rounded-full shadow-md ${current.isFavorite ? "bg-urbik-rose" : "bg-urbik-black"}`}
                  >
                    <Heart size={20} className={`text-white ${current.isFavorite ? "fill-white" : "fill-transparent"}`} />
                  </motion.button>
                )}

                <div className="flex items-center gap-2 mb-6">
                  <span className="bg-urbik-black text-white text-[11px] px-4 py-1.5 rounded-full font-bold uppercase">
                    {getPropertyLabel(current.type)}
                  </span>
                  <span className="bg-urbik-cyan text-urbik-muted text-[11px] px-4 py-1.5 rounded-full font-black uppercase">
                    {current.operationType === "SALE" ? "VENTA" : "ALQUILER"}
                  </span>
                </div>

                <h3 className="text-4xl font-black mb-2 text-urbik-dark uppercase leading-none tracking-tighter">
                  {current.title}
                </h3>

                <div className="flex items-center gap-1 text-urbik-dark/60 mb-6">
                  <MapPin size={16} strokeWidth={3} />
                  <p className="text-sm font-bold text-urbik-dark uppercase tracking-tight">
                    {current.city} — <span className="opacity-70">{current.address}</span>
                  </p>
                </div>

                <p className="text-urbik-muted text-md line-clamp-4 font-medium mb-8 max-w-sm">
                  {current.description || "Una oportunidad única seleccionada por nuestro algoritmo."}
                </p>

                <div className="flex flex-col text-right mt-18">
                  <span className="text-md font-medium italic mr-2 text-urbik-black/50">Especificaciones</span>
                  <span className="text-lg font-bold text-urbik-muted">{getSpecsLabel(current)}</span>
                </div>

                <div className="mt-auto">
                  <hr className="border-urbik-g100 mb-6" />
                  <div className="text-right w-full">
                    <span className="text-5xl font-black text-urbik-dark">
                      ${current.price?.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}