"use client";
import { motion } from "framer-motion";
import { Eye, TrendingUp, Heart } from "lucide-react";

export default function AboutUs() {
  const values = [
    {
      icon: <Eye size={24} strokeWidth={1.5} className="text-neutral-800" />,
      title: "Transparencia",
      desc: "Creemos que la confianza se construye con información clara, haciendo cada operación más accesible y segura.",
    },
    {
      icon: <TrendingUp size={24} strokeWidth={1.5} className="text-neutral-800" />,
      title: "Evolución",
      desc: "Ayudamos a las inmobiliarias a potenciar su trabajo con soluciones modernas y análisis de datos precisos.",
    },
    {
      icon: <Heart size={24} strokeWidth={1.5} className="text-neutral-800" />,
      title: "Propósito",
      desc: "La innovación debe resolver problemas concretos. La tecnología importa cuando mejora la vida de las personas.",
    },
  ];

  return (
    <div className="bg-white min-h-screen text-neutral-900 font-sans selection:bg-neutral-200">
      
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-32">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-light tracking-tight leading-tight mb-16"
        >
          Transformando la <br className="hidden md:block" />
          <span className="font-semibold">experiencia inmobiliaria.</span>
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="grid md:grid-cols-2 gap-10 md:gap-16 text-lg text-neutral-600 leading-relaxed font-light"
        >
          <div>
            <p className="mb-6">
              En un mundo donde la tecnología transforma industrias a una velocidad cada vez mayor, el sector inmobiliario enfrenta el desafío de adaptarse a nuevas formas de trabajar, comunicar y tomar decisiones. <strong>Urbik nace para acompañar esa evolución.</strong>
            </p>
            <p>
              Creemos que comprar, vender o alquilar una propiedad debería ser una experiencia más transparente, eficiente y basada en información confiable. 
            </p>
          </div>
          <div>
            <p className="mb-6">
              Desarrollamos una plataforma que combina tecnología y datos para acercar a inmobiliarias, propietarios e interesados de una manera más simple y efectiva.
            </p>
            <p>
              Aspiramos a construir mucho más que un portal. Queremos desarrollar un ecosistema que integre información de mercado, herramientas profesionales y servicios que aporten valor real a cada etapa del proceso.
            </p>
          </div>
        </motion.div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px w-full bg-neutral-100" />
      </div>

      <section className="max-w-5xl mx-auto px-6 py-20 md:py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Ese es el camino que elegimos recorrer.</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {values.map((value, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex flex-col group"
            >
              <div className="mb-6 p-4 bg-white border border-white shadow-sm rounded-2xl w-fit group-hover:bg-neutral-100 group-hover:scale-105 transition-all duration-300">
                {value.icon}
              </div>
              <h3 className="text-xl font-medium mb-3">{value.title}</h3>
              <p className="text-neutral-500 font-light leading-relaxed">
                {value.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}