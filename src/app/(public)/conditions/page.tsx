"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Scale, ShieldCheck, AlertTriangle, FileText } from "lucide-react";

const glassCard = "md:rounded-[30px] rounded-3xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[30px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";

const CONDITIONS = [
  {
    id: 1,
    title: "1. Servicios",
    icon: <FileText size={18} className="text-urbik-black/60" />,
    content: "Urbik ofrece planes de suscripción pagos para inmobiliarias que deseen publicar propiedades en la Plataforma."
  },
  {
    id: 2,
    title: "2. Planes",
    icon: <FileText size={18} className="text-urbik-black/60" />,
    content: (
      <>
        <p>Urbik podrá ofrecer distintos planes, incluyendo:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-urbik-black/80 font-medium">
          <li>Plan Base</li>
          <li>Plan Equipo</li>
          <li>Plan Empresa</li>
          <li>Plan Promocional</li>
        </ul>
        <p className="mt-2">Cada plan podrá tener límites de publicaciones y funcionalidades específicas.</p>
      </>
    )
  },
  {
    id: 3,
    title: "3. Período de prueba",
    icon: <ShieldCheck size={18} className="text-urbik-black/60" />,
    content: (
      <>
        <p>Urbik podrá otorgar un período de prueba gratuito de 30 días.</p>
        <p className="mt-2">Finalizado el mismo, la suscripción se convertirá automáticamente en un plan pago, salvo cancelación previa.</p>
        <p className="mt-2">Asimismo, Urbik podrá otorgar planes promocionales gratuitos por tiempo limitado.</p>
      </>
    )
  },
  {
    id: 4,
    title: "4. Renovación",
    icon: <FileText size={18} className="text-urbik-black/60" />,
    content: "Las suscripciones son mensuales y se renovarán automáticamente."
  },
  {
    id: 5,
    title: "5. Pagos",
    icon: <Scale size={18} className="text-urbik-black/60" />,
    content: (
      <>
        <p>Los pagos podrán realizarse mediante:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-urbik-black/80 font-medium">
          <li>Mercado Pago</li>
          <li>Transferencia bancaria</li>
          <li>Tarjeta de crédito</li>
        </ul>
        <p className="mt-2 text-urbik-black/90 font-bold">Urbik no será responsable por fallas en sistemas de terceros.</p>
      </>
    )
  },
  {
    id: 6,
    title: "6. Facturación",
    icon: <FileText size={18} className="text-urbik-black/60" />,
    content: "Urbik emitirá las facturas correspondientes conforme a la normativa vigente en la República Argentina."
  },
  {
    id: 7,
    title: "7. Mora y falta de pago",
    icon: <AlertTriangle size={18} className="text-urbik-black/60" />,
    content: (
      <>
        <p>En caso de falta de pago:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1 text-urbik-black/80 font-medium">
          <li>Se generará un vencimiento de la obligación.</li>
          <li>El Usuario contará con un plazo adicional de 7 días hábiles desde el vencimiento.</li>
          <li>Durante dicho período se podrá aplicar un interés por mora.</li>
        </ul>
        <p className="mt-2">Si transcurrido ese plazo no se regulariza la deuda:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1 text-urbik-black/80 font-medium">
          <li>Se mantendrá el servicio activo hasta el siguiente período.</li>
        </ul>
        <p className="mt-2">Si al vencimiento del siguiente período el Usuario continúa en mora:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1 text-urbik-black/80 font-medium">
          <li>Se otorgará un nuevo plazo de 7 días hábiles.</li>
        </ul>
        <p className="mt-2">Finalizado dicho plazo sin regularización:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1 text-urbik-black/80 font-medium">
          <li>Urbik podrá bloquear la cuenta.</li>
          <li>Se eliminarán las publicaciones.</li>
          <li>Se restringirá el acceso a la plataforma.</li>
        </ul>
        <p className="mt-2 font-bold text-urbik-black/90">Todo ello sin derecho a reclamo ni indemnización alguna.</p>
      </>
    )
  },
  {
    id: 8,
    title: "8. Cancelación",
    icon: <Scale size={18} className="text-urbik-black/60" />,
    content: (
      <>
        <p>El Usuario podrá cancelar su suscripción en cualquier momento.</p>
        <p className="mt-2 text-urbik-black/90 font-bold">La cancelación no dará derecho a reembolsos.</p>
      </>
    )
  },
  {
    id: 9,
    title: "9. Límites de publicación",
    icon: <AlertTriangle size={18} className="text-urbik-black/60" />,
    content: (
      <>
        <p>Cada plan podrá establecer un límite de publicaciones.</p>
        <p className="mt-2">En caso de alcanzarse dicho límite:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1 text-urbik-black/80 font-medium">
          <li>El sistema impedirá nuevas publicaciones.</li>
          <li>Se sugerirá la contratación de un plan superior.</li>
        </ul>
      </>
    )
  },
  {
    id: 10,
    title: "10. Modificaciones",
    icon: <FileText size={18} className="text-urbik-black/60" />,
    content: "Urbik podrá modificar precios, planes, condiciones y servicios en cualquier momento, incluyendo la incorporación de otros servicios inmobiliarios."
  },
  {
    id: 11,
    title: "11. Responsabilidad",
    icon: <ShieldCheck size={18} className="text-urbik-black/60" />,
    content: <p className="font-bold text-urbik-black/90">El uso del servicio se realiza bajo exclusiva responsabilidad del Usuario.</p>
  }
];

export default function ContractingConditions() {
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
          Condiciones de Contratación
        </h1>
      </div>

      <div className={`relative w-full max-w-4xl p-6 md:p-12 animate-fade-in-up ${glassCard}`} style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <div className="relative z-10">
          <div className="space-y-8">
            {CONDITIONS.map((condition, index) => (
              <div 
                key={condition.id} 
                className="group animate-fade-in-up"
                style={{
                  animationDelay: `${(index + 2) * 50}ms`,
                  animationFillMode: "both"
                }}
              >
                <div className="flex items-center gap-3 mb-2 ml-10">
                  
                  <h3 className="text-lg font-black tracking-tight text-urbik-black uppercase">
                    {condition.title}
                  </h3>
                </div>
                <div className="pl-8 text-sm md:text-base font-medium text-urbik-black/70 leading-relaxed">
                  {condition.content}
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