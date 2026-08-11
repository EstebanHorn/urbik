"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { MapPin, Mail, CheckCircle2, ChevronDown } from "lucide-react";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

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
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "No pudimos enviar tu mensaje.");
      }

      setName("");
      setEmail("");
      setMessage("");
      setSubject("Consulta General");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos enviar tu mensaje.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-geora-white min-h-screen pt-16 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-10">
        
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl font-display font-bold text-geora-black leading-[0.8] tracking-tighter mb-8"
          >
            <span>Ponete en</span><br />
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-black text-7xl text-geora-black">contacto.</span>
            </div>
          </motion.h1>

          <p className="text-geora-black/60 font-medium text-lg">
            ¿Tenés dudas sobre una propiedad o querés publicar con nosotros? 
          </p>
          <p className="text-geora-black/80 mb-12 max-w-md font-bold text-lg">
            Nuestro equipo de expertos está listo para ayudarte.
          </p>

          <div className="space-y-4">
            <div className="flex items-center bg-white border border-black/10 shadow-sm w-fit px-4 py-2 rounded-full">
              <div className="text-geora-black/80"><Mail size={18} /></div>
              <div className="ml-5">
                <p className="font-bold text-geora-dark">hola@geora.com</p>
              </div>
            </div>

            <div className="flex items-center bg-white border border-black/10 shadow-sm w-fit px-4 py-2 rounded-full">
              <div className="text-geora-black/80">
                <MapPin size={18} />
              </div>
              <div className="ml-5">
                <p className="font-bold text-geora-dark">La Plata, Argentina</p>
              </div>
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-geora-emerald/10 p-6 rounded-full mb-6">
                <CheckCircle2 size={64} className="text-geora-emerald" />
              </motion.div>
              <h2 className="text-3xl font-display font-bold mb-2">¡Mensaje enviado!</h2>
              <button onClick={() => setSubmitted(false)} className="px-8 cursor-pointer py-3 rounded-full bg-geora-black text-white font-bold hover:bg-geora-emerald transition-all">
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="ml-10 text-xmd font-medium text-geora-black opacity-40">Nombre</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 rounded-full bg-geora-white border border-gray-300 focus:ring-2 focus:ring-geora-black outline-none transition-all font-medium"
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <label className="ml-10 text-xmd font-medium text-geora-black opacity-40">Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 rounded-full bg-geora-white border border-gray-300 focus:ring-2 focus:ring-geora-black outline-none transition-all font-medium"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-10 text-xmd font-medium text-geora-black opacity-40">Asunto</label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-6 py-4 rounded-full cursor-pointer bg-geora-white border border-gray-300 focus:ring-2 focus:ring-geora-black outline-none flex items-center justify-between font-medium transition-all"
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
                        className="absolute z-50 w-full mt-2 rounded-2xl bg-geora-dark2 border border-white/10 shadow-2xl overflow-hidden"
                      >
                        {options.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setSubject(option);
                              setIsOpen(false);
                            }}
                            className="w-full text-left px-6 py-4 text-sm  cursor-pointer font-medium text-white hover:bg-white/10 transition-colors"
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
                <label className="ml-10 text-xmd font-medium text-geora-black opacity-40">Mensaje</label>
                <textarea
                  required
                  rows={9}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-6 py-5 rounded-4xl bg-geora-white border border-gray-300 focus:ring-2 focus:ring-geora-black outline-none transition-all font-medium resize-none"
                  placeholder="¿En qué podemos ayudarte?"
                ></textarea>
              </div>

              {error && (
                <p className="text-sm font-bold text-red-500 ml-4">{error}</p>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-10 py-4 rounded-full font-bold transition-all  cursor-pointer flex items-center gap-3 active:scale-95 ${isSubmitting ? "bg-geora-g300 text-geora-muted cursor-not-allowed" : "bg-geora-black text-white hover:bg-geora-emerald hover:shadow-lg hover:shadow-geora-emerald/20"}`}
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