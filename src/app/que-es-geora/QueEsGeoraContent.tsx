"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Search, Briefcase, Map, MapPin, Users, Sparkles, Globe } from "lucide-react";
import { faqs } from "./faqs";

const audiences = [
  {
    icon: <Search size={22} strokeWidth={1.5} className="text-neutral-800" />,
    title: "Quienes buscan una propiedad",
    desc: "Buscá y explorá inmuebles para comprar o alquilar mediante una experiencia basada en mapas y territorio.",
  },
  {
    icon: <Briefcase size={22} strokeWidth={1.5} className="text-neutral-800" />,
    title: "Martilleros, corredores e inmobiliarias",
    desc: "Herramientas para publicar propiedades, gestionar clientes y generar conexiones profesionales.",
  },
  {
    icon: <Map size={22} strokeWidth={1.5} className="text-neutral-800" />,
    title: "Desarrolladores e inversores",
    desc: "Información y herramientas para explorar el territorio, identificar oportunidades y tomar mejores decisiones.",
  },
];

const tools = [
  {
    title: "Publicación de propiedades",
    desc: "Las inmobiliarias pueden publicar sus propiedades dentro de Geora y ponerlas a disposición de quienes buscan comprar o alquilar.",
  },
  {
    title: "Agenda de clientes",
    desc: "Cada inmobiliaria cuenta con una agenda propia de clientes, integrada dentro de la plataforma, para organizar y gestionar sus contactos.",
  },
  {
    title: "Bolsa de Conexiones",
    desc: "Permite generar conexiones entre profesionales e inmobiliarias, facilitando oportunidades de colaboración y de negocio.",
  },
  {
    title: "Publicaciones con respaldo profesional",
    desc: "La publicación de propiedades está destinada a martilleros y corredores matriculados, jerarquizando la actividad y dando mayor respaldo a quienes buscan una propiedad.",
  },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay }}
    >
      {children}
    </motion.div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-100 py-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <span className="text-base md:text-lg font-medium text-neutral-900">{q}</span>
        <ChevronDown
          size={20}
          strokeWidth={1.5}
          className={`shrink-0 text-neutral-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"}`}
        style={{ display: "grid" }}
      >
        <div className="overflow-hidden">
          <p className="text-neutral-500 font-light leading-relaxed pr-6">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function QueEsGeoraContent() {
  return (
    <div className="bg-white min-h-screen text-neutral-900 font-sans selection:bg-neutral-200">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24">
        <FadeIn>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-tight mb-10">
            ¿Qué es <span className="font-semibold">Geora?</span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-lg md:text-xl text-neutral-600 leading-relaxed font-light max-w-3xl">
            Geora es una plataforma tecnológica para el mercado inmobiliario argentino que reúne en un mismo lugar herramientas, información y tecnologías para las personas y profesionales que forman parte del sector.
          </p>
        </FadeIn>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px w-full bg-neutral-100" />
      </div>

      {/* Para quién */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <FadeIn>
          <h2 className="text-2xl font-semibold tracking-tight mb-16">Una plataforma para todo el ecosistema inmobiliario.</h2>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {audiences.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.1}>
              <div className="flex flex-col group">
                <div className="mb-6 p-4 bg-white border border-white shadow-sm rounded-2xl w-fit group-hover:bg-neutral-100 group-hover:scale-105 transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                <p className="text-neutral-500 font-light leading-relaxed">{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px w-full bg-neutral-100" />
      </div>

      {/* Problema que resuelve */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <FadeIn>
            <h2 className="text-2xl font-semibold tracking-tight mb-6">¿Qué problema busca resolver Geora?</h2>
            <p className="text-neutral-600 leading-relaxed font-light mb-6">
              El mercado inmobiliario reúne cada vez más información, profesionales, propiedades y herramientas tecnológicas. Sin embargo, gran parte de estos recursos se encuentran dispersos en diferentes plataformas y servicios.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-neutral-600 leading-relaxed font-light mb-6">
              Geora nace con el objetivo de concentrar progresivamente esas herramientas en un mismo lugar, facilitando el acceso a la información y a la tecnología tanto para quienes buscan una propiedad como para quienes trabajan profesionalmente en el sector.
            </p>
            <p className="text-neutral-600 leading-relaxed font-light">
              La plataforma está pensada para evolucionar junto con las necesidades del mercado y con los avances tecnológicos.
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px w-full bg-neutral-100" />
      </div>

      {/* Mapa parcelario */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <FadeIn>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white border border-white shadow-sm rounded-2xl">
              <MapPin size={22} strokeWidth={1.5} className="text-neutral-800" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Un nuevo enfoque para explorar el mercado inmobiliario</h2>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="text-neutral-600 leading-relaxed font-light max-w-3xl space-y-6">
            <p>
              Geora permite buscar y explorar propiedades para comprar o alquilar, pero su visión va más allá de la publicación de inmuebles.
            </p>
            <p>
              Uno de sus principales diferenciales es su <strong className="text-neutral-800 font-medium">mapa inmobiliario basado en parcelas</strong>, que permite visualizar la estructura real del territorio y explorar no solamente departamentos y casas, sino también terrenos, lotes, campos y otros tipos de inmuebles.
            </p>
            <p>
              Esta forma de representar el territorio facilita la búsqueda para los usuarios y abre nuevas posibilidades para profesionales como desarrolladores inmobiliarios e inversores. La intención es que Geora permita explorar el mercado inmobiliario desde la propiedad y también desde el territorio.
            </p>
          </div>
        </FadeIn>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px w-full bg-neutral-100" />
      </div>

      {/* Herramientas profesionales */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <FadeIn>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white border border-white shadow-sm rounded-2xl">
              <Users size={22} strokeWidth={1.5} className="text-neutral-800" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Herramientas para los profesionales inmobiliarios</h2>
          </div>
          <p className="text-neutral-600 leading-relaxed font-light max-w-3xl mb-16">
            Geora está especialmente pensada para acompañar a martilleros, corredores e inmobiliarias en la transformación tecnológica que atraviesa el sector.
          </p>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
          {tools.map((tool, i) => (
            <FadeIn key={tool.title} delay={i * 0.08}>
              <h3 className="text-lg font-medium mb-2">{tool.title}</h3>
              <p className="text-neutral-500 font-light leading-relaxed">{tool.desc}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px w-full bg-neutral-100" />
      </div>

      {/* Diferencial */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <FadeIn>
            <h2 className="text-2xl font-semibold tracking-tight mb-6">¿Qué diferencia a Geora de otros portales inmobiliarios?</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="text-neutral-600 leading-relaxed font-light space-y-6">
              <p>
                Geora parte de la posibilidad de buscar y publicar propiedades, pero su propuesta busca ser más amplia. La plataforma integra publicación de inmuebles, agenda de clientes, Bolsa de Conexiones, información territorial y nuevas herramientas tecnológicas dentro de un mismo ecosistema.
              </p>
              <p>
                El objetivo no es limitarse a conectar una propiedad con una persona interesada, sino construir progresivamente una plataforma que acompañe todo el ecosistema inmobiliario.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px w-full bg-neutral-100" />
      </div>

      {/* Tecnología / IA */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <FadeIn>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white border border-white shadow-sm rounded-2xl">
              <Sparkles size={22} strokeWidth={1.5} className="text-neutral-800" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Tecnología para un mercado que está cambiando</h2>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="text-neutral-600 leading-relaxed font-light max-w-3xl space-y-6">
            <p>
              La inteligencia artificial, la automatización, los datos, los mapas digitales y otras tecnologías están transformando rápidamente la actividad inmobiliaria. Geora nace en este contexto con una premisa: la tecnología debe acompañar al profesional inmobiliario y facilitar su trabajo.
            </p>
            <p>
              Por eso, la plataforma busca mantenerse permanentemente a la vanguardia e incorporar las nuevas herramientas que puedan aportar valor al sector. La inteligencia artificial tendrá un papel cada vez más importante dentro de esta evolución, tanto en las herramientas destinadas a profesionales como en las experiencias de búsqueda, análisis e información para los usuarios.
            </p>
          </div>
        </FadeIn>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px w-full bg-neutral-100" />
      </div>

      {/* Dónde está disponible */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <FadeIn>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white border border-white shadow-sm rounded-2xl">
              <Globe size={22} strokeWidth={1.5} className="text-neutral-800" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">¿Dónde está disponible Geora?</h2>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="text-neutral-600 leading-relaxed font-light max-w-3xl space-y-6">
            <p>
              Geora se encuentra actualmente en etapa de lanzamiento en <strong className="text-neutral-800 font-medium">La Plata, provincia de Buenos Aires</strong>. La plataforma tiene como objetivo expandirse progresivamente a otras ciudades y regiones de la Argentina durante los próximos meses.
            </p>
            <p>
              La expansión permitirá incorporar nuevos mercados, profesionales, propiedades y herramientas, manteniendo una plataforma común para todo el país.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* Visión */}
      <section className="bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
          <FadeIn>
            <h2 className="text-2xl font-semibold tracking-tight mb-6">La visión de Geora</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="text-neutral-600 leading-relaxed font-light max-w-3xl space-y-6">
              <p>
                Geora no pretende quedar definida por una única herramienta. El mapa, las parcelas, la publicación de propiedades, la agenda de clientes y la Bolsa de Conexiones forman parte de lo que la plataforma ofrece actualmente. Pero la visión es más amplia: reunir en un mismo lugar las herramientas, la información y las tecnologías que permitan a las personas y a los profesionales aprovechar mejor el mercado inmobiliario.
              </p>
              <p className="text-neutral-800 font-medium">
                Porque la tecnología va a seguir cambiando. Y Geora busca evolucionar con ella.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-10 text-xl md:text-2xl font-light text-neutral-900">
              Geora. <span className="font-semibold">Tecnología para todo el ecosistema inmobiliario.</span>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-20 md:py-28">
        <FadeIn>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Preguntas frecuentes</h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="mt-10">
            {faqs.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
