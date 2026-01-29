/*
Este código implementa un componente para una página de contacto moderna y
animada, que utiliza Next.js (indicado por "use client"), Framer Motion para transiciones
fluidas y Lucide React para la iconografía. Su funcionalidad principal consiste en un
formulario interactivo que permite a los usuarios enviar mensajes, incluyendo la validación
de campos, un menú desplegable personalizado para seleccionar el asunto y un manejo de
estado que simula el envío del mensaje para mostrar una pantalla de confirmación tras el
éxito de la operación. Además, el diseño es responsivo y presenta información de contacto
estática (email, teléfono y oficina) con un estilo visual coherente basado en clases de
Tailwind CSS.
*/

"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Send, MapPin, Phone, Mail, CheckCircle2, ChevronDown } from "lucide-react";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("Consulta General");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = ["Consulta General", "Publicar Propiedad", "Soporte Técnico", "Otros"];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  return (
    <div className="bg-urbik-white min-h-screen pt-16 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-10">
        
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl font-display font-bold text-urbik-black leading-[0.8] tracking-tighter mb-8"
          >
            <span>Ponete en</span><br />
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-black italic text-7xl text-urbik-black">contacto.</span>
            </div>
          </motion.h1>

          <p className="text-urbik-dark2 mb-12 max-w-md font-medium text-lg">
            ¿Tenés dudas sobre una propiedad o querés publicar con nosotros? 
            Nuestro equipo de expertos está listo para ayudarte.
          </p>

          <div className="space-y-4">
            <div className="flex items-center w-sm bg-urbik-white2 w-fit px-3 py-1 rounded-full">
              <div className="bg-urbik-black p-2 rounded-full text-white"><Mail size={18} /></div>
              <div className="ml-5">
                <p className="text-xmd font-medium text-urbik-dark opacity-40 tracking-wide italic">Email</p>
                <p className="font-bold text-urbik-dark">hola@urbik.com</p>
              </div>
            </div>

            <div className="flex items-center w-sm bg-urbik-white2 w-fit px-3 py-1 rounded-full">
              <div className="bg-urbik-black p-2 rounded-full text-white">
                <Phone size={18} />
              </div>
              <div className="ml-5">
                <p className="text-xmd font-medium text-urbik-dark opacity-40 tracking-wide italic">Teléfono</p>
                <p className="font-bold text-urbik-dark">+54 11 1234-5678</p>
              </div>
            </div>

            <div className="flex items-center w-sm bg-urbik-white2 w-fit px-3 py-1 rounded-full">
              <div className="bg-urbik-black p-2 rounded-full text-white">
                <MapPin size={18} />
              </div>
              <div className="ml-5">
                <p className="text-xmd font-medium text-urbik-dark opacity-40 tracking-wide italic">Oficina</p>
                <p className="font-bold text-urbik-dark">La Plata, Argentina</p>
              </div>
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-urbik-emerald/10 p-6 rounded-full mb-6">
                <CheckCircle2 size={64} className="text-urbik-emerald" />
              </motion.div>
              <h2 className="text-3xl font-display font-bold mb-2">¡Mensaje enviado!</h2>
              <button onClick={() => setSubmitted(false)} className="px-8 py-3 rounded-full bg-urbik-black text-white font-bold hover:bg-urbik-emerald transition-all">
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="ml-10 text-xmd font-medium text-urbik-black opacity-40">Nombre</label>
                  <input required type="text" className="w-full px-6 py-4 rounded-full bg-urbik-white border border-gray-300 focus:ring-2 focus:ring-urbik-black outline-none transition-all font-medium" placeholder="Tu nombre" />
                </div>
                <div className="space-y-2">
                  <label className="ml-10 text-xmd font-medium text-urbik-black opacity-40">Email</label>
                  <input required type="email" className="w-full px-6 py-4 rounded-full bg-urbik-white border border-gray-300 focus:ring-2 focus:ring-urbik-black outline-none transition-all font-medium" placeholder="tu@email.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-10 text-xmd font-medium text-urbik-black opacity-40">Asunto</label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-6 py-4 rounded-full bg-urbik-white border border-gray-300 focus:ring-2 focus:ring-urbik-black outline-none flex items-center justify-between font-medium transition-all"
                  >
                    <span>{subject}</span>
                    <ChevronDown className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} size={20} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 rounded-2xl bg-urbik-dark2 border border-white/10 shadow-2xl overflow-hidden"
                      >
                        {options.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setSubject(option);
                              setIsOpen(false);
                            }}
                            className="w-full text-left px-6 py-4 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                          >
                            {option}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-10 text-xmd font-medium text-urbik-black opacity-40">Mensaje</label>
                <textarea required rows={9} className="w-full px-6 py-5 rounded-[2rem] bg-urbik-white border border-gray-300 focus:ring-2 focus:ring-urbik-black outline-none transition-all font-medium resize-none" placeholder="¿En qué podemos ayudarte?"></textarea>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-10 py-4 rounded-full font-bold transition-all flex items-center gap-3 active:scale-95 ${isSubmitting ? "bg-urbik-g300 text-urbik-muted cursor-not-allowed" : "bg-urbik-black text-white hover:bg-urbik-emerald hover:shadow-lg hover:shadow-urbik-emerald/20"}`}
                >
                  {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                  
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}