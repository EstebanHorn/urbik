"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Scale, ShieldCheck, AlertTriangle, FileText } from "lucide-react";

const glassCard = "md:rounded-[30px] rounded-3xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[30px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";

const TERMS = [
  {
    id: 1,
    title: "1. Objeto",
    icon: <FileText size={18} className="text-geora-black/60" />,
    content: (
      <>
        <p>Los presentes Términos y Condiciones regulan el acceso y uso de la plataforma digital “Geora” (en adelante, la “Plataforma”), operada por Joaquín Menéndez, CUIT 23-40065566-9, con domicilio en la ciudad de La Plata, Provincia de Buenos Aires, República Argentina.</p>
        <p className="mt-2">Geora es una plataforma digital que permite a inmobiliarias publicar inmuebles y a los usuarios acceder a dicha información y establecer contacto con los anunciantes.</p>
        <p className="mt-2 text-geora-black/90 font-bold">Geora no es propietario, desarrollador, comercializador ni intermediario en las operaciones inmobiliarias, ni participa en negociaciones o contratos entre usuarios.</p>
      </>
    )
  },
  {
    id: 2,
    title: "2. Aceptación",
    icon: <ShieldCheck size={18} className="text-geora-black/60" />,
    content: "El acceso, navegación y uso de la Plataforma implica la aceptación plena, expresa e incondicionada de los presentes Términos y Condiciones."
  },
  {
    id: 3,
    title: "3. Usuarios",
    icon: <FileText size={18} className="text-geora-black/60" />,
    content: (
      <>
        <p>El uso de la Plataforma está permitido únicamente a personas mayores de 18 años con capacidad legal para contratar.</p>
        <p className="mt-2">La publicación de inmuebles se encuentra exclusivamente reservada a inmobiliarias debidamente registradas.</p>
      </>
    )
  },
  {
    id: 4,
    title: "4. Registro y verificación",
    icon: <FileText size={18} className="text-geora-black/60" />,
    content: (
      <>
        <p>Para publicar en la Plataforma, las inmobiliarias deberán proporcionar información veraz y actualizada, incluyendo:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-geora-black/80 font-medium">
          <li>Matrícula profesional</li>
          <li>Nombre del matriculado</li>
          <li>Nombre comercial</li>
        </ul>
        <p className="mt-2">Geora se reserva el derecho de aceptar o rechazar solicitudes de registro a su exclusivo criterio, sin necesidad de expresar causa.</p>
      </>
    )
  },
  {
    id: 5,
    title: "5. Uso de la Plataforma",
    icon: <Scale size={18} className="text-geora-black/60" />,
    content: "El Usuario se compromete a utilizar la Plataforma conforme a la ley, la moral y las buenas costumbres, y a no realizar actividades ilícitas o que perjudiquen a terceros."
  },
  {
    id: 6,
    title: "6. Usos prohibidos",
    icon: <AlertTriangle size={18} className="text-geora-black/60" />,
    content: (
      <>
        <p>Se prohíbe explícitamente:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-geora-black/80 font-medium">
          <li>Publicar información falsa, incompleta o engañosa.</li>
          <li>Suplantar identidad.</li>
          <li>Utilizar bots, scraping o herramientas automatizadas.</li>
          <li>Intentar vulnerar la seguridad del sistema.</li>
          <li>Utilizar la Plataforma con fines distintos a los autorizados.</li>
        </ul>
      </>
    )
  },
  {
    id: 7,
    title: "7. Contenido",
    icon: <FileText size={18} className="text-geora-black/60" />,
    content: (
      <>
        <p>Toda la información publicada es responsabilidad exclusiva de las inmobiliarias.</p>
        <p className="mt-2">Geora no garantiza la veracidad, exactitud o actualización de los contenidos.</p>
      </>
    )
  },
  {
    id: 8,
    title: "8. Facultades de Geora",
    icon: <Scale size={18} className="text-geora-black/60" />,
    content: (
      <>
        <p>Geora podrá, a su exclusivo criterio y sin necesidad de notificación previa:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-geora-black/80 font-medium">
          <li>Eliminar publicaciones.</li>
          <li>Suspender o bloquear cuentas.</li>
          <li>Modificar o discontinuar servicios.</li>
        </ul>
      </>
    )
  },
  {
    id: 9,
    title: "9. Limitación de responsabilidad",
    icon: <AlertTriangle size={18} className="text-geora-black/60" />,
    content: (
      <>
        <p>Geora no será responsable por:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-geora-black/80 font-medium">
          <li>Operaciones realizadas entre usuarios.</li>
          <li>Daños directos o indirectos derivados del uso de la Plataforma.</li>
          <li>Errores en publicaciones.</li>
        </ul>
        <p className="mt-2 font-bold text-geora-black/90">La Plataforma actúa únicamente como un espacio de contacto.</p>
      </>
    )
  },
  {
    id: 10,
    title: "10. Funcionamiento técnico",
    icon: <FileText size={18} className="text-geora-black/60" />,
    content: "Geora no garantiza disponibilidad continua ni ausencia de errores o interrupciones en el sistema."
  },
  {
    id: 11,
    title: "11. Propiedad intelectual",
    icon: <ShieldCheck size={18} className="text-geora-black/60" />,
    content: "Todo el contenido, diseño, software y marca de la Plataforma es propiedad de Geora, quedando prohibida su reproducción sin autorización."
  },
  {
    id: 12,
    title: "12. Datos personales",
    icon: <FileText size={18} className="text-geora-black/60" />,
    content: "El uso de la Plataforma implica la aceptación íntegra de nuestra Política de Privacidad."
  },
  {
    id: 13,
    title: "13. Modificaciones",
    icon: <FileText size={18} className="text-geora-black/60" />,
    content: "Geora podrá modificar en cualquier momento los presentes Términos y Condiciones. Las modificaciones entrarán en vigencia desde su publicación en la Plataforma."
  },
  {
    id: 14,
    title: "14. Jurisdicción",
    icon: <Scale size={18} className="text-geora-black/60" />,
    content: (
      <>
        <p>Los presentes Términos se rigen por las leyes de la República Argentina.</p>
        <p className="mt-2">Cualquier controversia será sometida a los Tribunales Ordinarios de la ciudad de La Plata.</p>
      </>
    )
  }
];

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen mt-15 bg-geora-white py-10 px-4 sm:px-6 lg:px-8 pb-28 flex flex-col items-center">
      
      <div className="w-full max-w-4xl flex items-center mb-10 mt-5 relative z-10 animate-fade-in-up">
        <Link 
          href="/" 
          className="w-10 h-10 flex items-center justify-center  cursor-pointer border-black/10 text-geora-black/80 hover:scale-105 transition duration-200 absolute left-0"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="w-full text-center text-2xl md:text-3xl font-black text-geora-black/90 uppercase tracking-tighter">
          Términos y Condiciones
        </h1>
      </div>

      <div className={`relative w-full max-w-4xl p-6 md:p-12 animate-fade-in-up ${glassCard}`} style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <div className="relative z-10">
          <div className="space-y-8">
            {TERMS.map((term, index) => (
              <div 
                key={term.id} 
                className="group animate-fade-in-up"
                style={{
                  animationDelay: `${(index + 2) * 50}ms`,
                  animationFillMode: "both"
                }}
              >
                <div className="flex items-center gap-3 ml-15 mb-2">
                  <h3 className="text-lg font-black tracking-tight text-geora-black uppercase">
                    {term.title}
                  </h3>
                </div>
                <div className="pl-11 text-sm md:text-base font-medium text-geora-black/70 leading-relaxed">
                  {term.content}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
                  <p className="text-sm font-semibold text-geora-muted mt-10">
              Última actualización: {new Date().toLocaleDateString('es-AR')}
            </p>
    </div>
  );
}