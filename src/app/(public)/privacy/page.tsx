"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, Lock, Scale, Eye } from "lucide-react";

const glassCard = "md:rounded-[30px] rounded-3xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[30px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";

const POLICIES = [
  {
    id: 1,
    title: "1. Datos recopilados",
    icon: <Eye size={18} className="text-urbik-black/60" />,
    content: (
      <>
        <p>Urbik podrá recopilar:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-urbik-black/80 font-medium">
          <li>Nombre y apellido</li>
          <li>Correo electrónico</li>
          <li>Teléfono</li>
          <li>Datos de inmobiliaria</li>
          <li>Información de uso de la plataforma</li>
        </ul>
      </>
    )
  },
  {
    id: 2,
    title: "2. Finalidad",
    icon: <FileText size={18} className="text-urbik-black/60" />,
    content: (
      <>
        <p>Los datos serán utilizados para:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-urbik-black/80 font-medium">
          <li>Operar la Plataforma</li>
          <li>Permitir el contacto entre usuarios e inmobiliarias</li>
          <li>Gestionar servicios y suscripciones</li>
          <li>Enviar comunicaciones comerciales</li>
        </ul>
      </>
    )
  },
  {
    id: 3,
    title: "3. Consentimiento",
    icon: <ShieldCheck size={18} className="text-urbik-black/60" />,
    content: "El Usuario presta su consentimiento libre, expreso e informado para el tratamiento de sus datos."
  },
  {
    id: 4,
    title: "4. Cesión de datos",
    icon: <FileText size={18} className="text-urbik-black/60" />,
    content: (
      <>
        <p>Los datos podrán ser compartidos con:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-urbik-black/80 font-medium">
          <li>Inmobiliarias</li>
          <li>Proveedores de servicios necesarios para el funcionamiento de la Plataforma</li>
        </ul>
      </>
    )
  },
  {
    id: 5,
    title: "5. Derechos del titular",
    icon: <Scale size={18} className="text-urbik-black/60" />,
    content: (
      <>
        <p>El Usuario podrá:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-urbik-black/80 font-medium">
          <li>Acceder a sus datos</li>
          <li>Solicitar su rectificación</li>
          <li>Solicitar su eliminación</li>
        </ul>
        <p className="mt-2 text-urbik-black/90 font-bold">Conforme a la Ley 25.326.</p>
      </>
    )
  },
  {
    id: 6,
    title: "6. Seguridad",
    icon: <Lock size={18} className="text-urbik-black/60" />,
    content: "Urbik adopta medidas de seguridad razonables para proteger la información."
  },
  {
    id: 7,
    title: "7. Autoridad de control",
    icon: <ShieldCheck size={18} className="text-urbik-black/60" />,
    content: "La Dirección Nacional de Protección de Datos Personales es el órgano de control de la Ley N° 25.326."
  },
  {
    id: 8,
    title: "8. Modificaciones",
    icon: <FileText size={18} className="text-urbik-black/60" />,
    content: "Urbik podrá modificar esta política en cualquier momento."
  }
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen mt-15 bg-urbik-white py-10 px-4 sm:px-6 lg:px-8 pb-28 flex flex-col items-center">
      
      <div className="w-full max-w-4xl flex items-center mb-10 mt-5 relative z-10 animate-fade-in-up">
        <Link 
          href="/" 
          className="w-10 h-10 flex items-center justify-center cursor-pointer border-black/10 text-urbik-black/80 hover:scale-105 transition duration-200 absolute left-0"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="w-full text-center text-2xl md:text-3xl font-black text-urbik-black/90 uppercase tracking-tighter">
          Política de Privacidad
        </h1>
      </div>

      <div className={`relative w-full max-w-4xl p-6 md:p-12 animate-fade-in-up ${glassCard}`} style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <div className="relative z-10">
          <div className="space-y-8">
            {POLICIES.map((policy, index) => (
              <div 
                key={policy.id} 
                className="group animate-fade-in-up"
                style={{
                  animationDelay: `${(index + 2) * 50}ms`,
                  animationFillMode: "both"
                }}
              >
                <div className="flex items-center gap-3 mb-2 ml-10">
                  <h3 className="text-lg font-black tracking-tight text-urbik-black uppercase">
                    {policy.title}
                  </h3>
                </div>
                <div className="pl-8 text-sm md:text-base font-medium text-urbik-black/70 leading-relaxed">
                  {policy.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm font-semibold text-urbik-muted mt-10">
        Última actualización: {new Date().toLocaleDateString('es-AR')}
      </p>
    </div>
  );
}