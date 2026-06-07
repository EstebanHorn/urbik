"use client";
import { motion } from "framer-motion";
import { Eye, Zap, ShieldCheck } from "lucide-react";
import Image from "next/image";

const glassCard = "relative md:rounded-[30px] rounded-3xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[30px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";

export default function AboutUs() {
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
      desc: "Cambiamos la forma de buscar hogar mediante mapas avanzados y datos catastrales en tiempo real.",
      longDesc: "Más allá de la búsqueda por filtros, integramos cartografía catastral, visualización de parcelas y herramientas pensadas para que cada inmobiliaria pueda publicar, gestionar y hacer crecer su cartera desde un solo lugar.",
    },
    {
      icon: <ShieldCheck className="text-urbik-white" size={24} />,
      title: "Seguridad",
      desc: "Validamos cada agente inmobiliario para garantizar una experiencia confiable y segura.",
      longDesc: "Tu tranquilidad es nuestro activo más valioso. Implementamos un proceso de verificación individual estricto para cada inmobiliaria que opera en nuestra red, asegurando que cada operación sea respaldada por profesionales certificados.",
    },
  ];

  return (
    <div className="relative bg-[#f8fafc] min-h-screen pt-16 font-sans overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gray-200/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gray-200/30 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mt-10">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-display font-bold text-urbik-black leading-[0.8] tracking-tighter mb-8"
          >
            <span className="ml-5">Redefiniendo el</span>
            <br />
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-black text-9xl text-urbik-black">futuro</span>
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
            className="rounded-[30px] overflow-hidden aspect-square relative z-10 shadow-2xl shadow-black/10"
          >
            <Image
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
              alt="Oficina Urbik" 
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 py-24 mt-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-2xl font-display font-bold text-urbik-muted ml-2">Nuestros Pilares</h2>
              <p className="text-urbik-black opacity-50 text-md font-medium mt-2">Lo que nos hace diferentes al resto.</p>
            </div>
            <div className="hidden md:block h-px bg-urbik-g300/50 flex-1 mx-10 mb-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className={`p-10 transition-all duration-500 h-full cursor-default group hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] ${glassCard}`}
              >
                <div className="relative z-10">
                  <div className="bg-urbik-black w-14 h-14 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-display font-bold mb-4 text-urbik-black">{value.title}</h3>
                  <p className="text-urbik-muted font-medium leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-32 space-y-12 mb-20">
            {values.map((value, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-10 md:p-14 ${glassCard}`}
              >
                <div className="relative z-10 md:col-span-2 flex items-center justify-center md:justify-start">
                  <span className="text-7xl font-black italic text-urbik-black opacity-10 drop-shadow-sm">
                    0{index + 1}
                  </span>
                </div>

                <div className="relative z-10 md:col-span-3">
                  <h3 className="text-3xl font-display font-bold text-urbik-black tracking-tighter">
                    {value.title}
                  </h3>
                </div>

                <div className="relative z-10 md:col-span-7">
                  <p className="text-lg text-urbik-muted font-medium leading-relaxed">
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