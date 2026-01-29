/*
Este código define un componente para la sección Quiénes Somos (AboutUs), utilizando Next.js
con la directiva "use client" para permitir interactividad y animaciones. El componente emplea
Tailwind CSS para el diseño visual, Framer Motion para añadir efectos de entrada y transiciones
suaves en los elementos, y la librería Lucide-react para mostrar íconos representativos de los
valores de la empresa. Su estructura organiza dinámicamente información sobre transparencia,
innovación y seguridad, presentando una narrativa visual que combina una sección de introducción
con imágenes, tarjetas de pilares fundamentales y descripciones detalladas de los procesos de
la marca.
*/

"use client";
import { motion } from "framer-motion";
import { Users, Eye, Target, Zap, ShieldCheck, Globe, ChevronRight } from "lucide-react";

export default function AboutUs() {
  const stats = [
    { label: "Propiedades", value: "+15k" },
    { label: "Inmobiliarias", value: "200+" },
    { label: "Localidades", value: "45" },
  ];

  const values = [
    {
      icon: <Eye className="text-urbik-white" size={24} />,
      title: "Transparencia",
      desc: "Visualizamos datos catastrales reales para que sepas exactamente qué estás comprando.",
      longDesc: "En un mercado históricamente opaco, Urbik rompe las barreras de información. No solo listamos propiedades; integramos capas de datos públicos y privados para que el comprador entienda el entorno, la distribución de los metros cuadrados y el valor real proyectado.",
    },
    {
      icon: <Zap className="text-urbik-white" size={24} />,
      title: "Innovación",
      desc: "Cambiamos la forma de buscar hogar mediante algoritmos inteligentes y mapas avanzados.",
      longDesc: "Ademas de la búsqueda tradicional por filtros, utilizamos el modelo de recomendación Urbik Smart Zone® basado en comportamiento y geolocalización avanzada.",
    },
    {
      icon: <ShieldCheck className="text-urbik-white" size={24} />,
      title: "Seguridad",
      desc: "Validamos cada agente inmobiliario para garantizar una experiencia confiable y segura.",
      longDesc: "Tu tranquilidad es nuestro activo más valioso. Implementamos un proceso de verificación individual estricto para cada inmobiliaria que opera en nuestra red, asegurando que cada operación sea respaldada por profesionales certificados.",
    },
  ];

  return (
    <div className="bg-urbik-white min-h-screen pt-16 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mt-10">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-display font-bold text-urbik-black leading-[0.8] tracking-tighter mb-8"
          >
            <span className="ml-5">Redefiniendo el</span>
            <br />
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-black italic text-9xl text-urbik-black">futuro</span>
              <span className="ml-5">inmobiliario.</span>
            </div>
          </motion.h1>

          <p className="text-urbik-dark2 mb-10 max-w-lg font-medium text-lg">
            Urbik nació de una frustración común: la falta de claridad en el mercado. 
            Creamos la primera herramienta que no solo te muestra fotos, sino la 
            realidad del suelo y el potencial de cada inversión.
          </p>
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-md overflow-hidden aspect-[1/1] relative z-10"
          >
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
              alt="Oficina Urbik" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </motion.div>
        </div>
      </div>

      <div className="bg-urbik-white2 py-24 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-2xl font-display font-bold text-urbik-muted ml-2">Nuestros Pilares</h2>
              <p className="text-urbik-black opacity-50 text-md font-medium mt-2">Lo que nos hace diferentes al resto.</p>
            </div>
            <div className="hidden md:block h-[1px] bg-urbik-g300 flex-1 mx-10 mb-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="bg-urbik-white p-10 rounded-md border border-urbik-g200 shadow-sm hover:shadow-xl transition-all h-full cursor-default"
              >
                <div className="bg-urbik-black w-14 h-14 rounded-full flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-display font-bold mb-4">{value.title}</h3>
                <p className="text-urbik-muted font-medium leading-relaxed">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-32 space-y-20 mb-50">
            {values.map((value, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-urbik-g200 pt-16"
              >
                <div className="md:col-span-1">
                  <span className="text-5xl font-black italic text-urbik-black opacity-10">
                    0{index + 1}
                  </span>
                </div>

                <div className="md:col-span-4">
                  <h3 className="text-4xl font-display font-bold text-urbik-black tracking-tighter">
                    {value.title}
                  </h3>
                </div>

                <div className="md:col-span-7">
                  <p className="text-xl text-urbik-muted font-medium leading-relaxed mb-6">
                    {value.longDesc}
                  </p>
                  
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}