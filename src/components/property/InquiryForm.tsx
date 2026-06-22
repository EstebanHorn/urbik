"use client";

import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

interface InquiryFormProps {
  propertyId: string;
}

interface FormState {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  message: string;
}

interface FormErrors {
  senderName?: string;
  senderEmail?: string;
  senderPhone?: string;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!values.senderName.trim()) errors.senderName = "El nombre es obligatorio.";
  if (!values.senderEmail.trim()) {
    errors.senderEmail = "El email es obligatorio.";
  } else if (!EMAIL_REGEX.test(values.senderEmail)) {
    errors.senderEmail = "Ingresá un email válido.";
  }
  if (!values.senderPhone.trim()) errors.senderPhone = "El teléfono es obligatorio.";
  if (!values.message.trim()) errors.message = "La consulta es obligatoria.";
  return errors;
}

export default function InquiryForm({ propertyId }: InquiryFormProps) {
  const [form, setForm] = useState<FormState>({ senderName: "", senderEmail: "", senderPhone: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, ...form }),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Error al enviar la consulta.");
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError("No se pudo conectar con el servidor. Intentá más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mt-20 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-geora-emerald/10 rounded-full flex items-center justify-center">
            <CheckCircle2 size={36} className="text-geora-emerald" />
          </div>
        </div>
        <h4 className="text-xl font-black text-geora-black">Consulta enviada</h4>
        <p className="text-geora-muted text-sm font-medium leading-relaxed">La inmobiliaria se pondrá en contacto con vos.</p>
      </div>
    );
  }

  return (
    <div className="mt-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 bg-geora-cyan/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="relative z-10">
        <h4 className="text-xl font-black text-geora-black mb-1">Envianos una consulta</h4>
        <p className="text-xs font-bold text-geora-muted uppercase tracking-widest mb-6">Te respondemos a la brevedad</p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 flex flex-col items-end justify-end">
          <div className="w-full">
            <label htmlFor="senderName" className="block text-xs font-bold text-geora-muted uppercase tracking-wider mb-1">Nombre</label>
            <input id="senderName" name="senderName" type="text" value={form.senderName} onChange={handleChange} placeholder="Tu nombre completo" className={`w-full px-4 py-3 rounded-xl text-sm font-medium bg-white text-geora-black placeholder:text-geora-muted/50 outline-none transition-colors focus:border-geora-emerald ${errors.senderName ? "border-red-400" : "border-geora-g100 hover:border-geora-g200"}`} />
            {errors.senderName && <p className="mt-1 text-xs text-red-500 font-medium">{errors.senderName}</p>}
          </div>

          <div className="w-full">
            <label htmlFor="senderEmail" className="block text-xs font-bold text-geora-muted uppercase tracking-wider mb-1">Email</label>
            <input id="senderEmail" name="senderEmail" type="email" value={form.senderEmail} onChange={handleChange} placeholder="tu@email.com" className={`w-full px-4 py-3 rounded-xl text-sm font-medium bg-white text-geora-black placeholder:text-geora-muted/50 outline-none transition-colors focus:border-geora-emerald ${errors.senderEmail ? "border-red-400" : "border-geora-g100 hover:border-geora-g200"}`} />
            {errors.senderEmail && <p className="mt-1 text-xs text-red-500 font-medium">{errors.senderEmail}</p>}
          </div>

          <div className="w-full">
            <label htmlFor="senderPhone" className="block text-xs font-bold text-geora-muted uppercase tracking-wider mb-1">Teléfono</label>
            <input id="senderPhone" name="senderPhone" type="tel" value={form.senderPhone} onChange={handleChange} placeholder="+54 9 11 0000-0000" className={`w-full px-4 py-3 rounded-xl text-sm font-medium bg-white text-geora-black placeholder:text-geora-muted/50 outline-none transition-colors focus:border-geora-emerald ${errors.senderPhone ? "border-red-400" : "border-geora-g100 hover:border-geora-g200"}`} />
            {errors.senderPhone && <p className="mt-1 text-xs text-red-500 font-medium">{errors.senderPhone}</p>}
          </div>

          <div className="w-full">
            <label htmlFor="message" className="block text-xs font-bold text-geora-muted uppercase tracking-wider mb-1">Consulta</label>
            <textarea id="message" name="message" rows={4} value={form.message} onChange={handleChange} placeholder="Escribí tu consulta sobre esta propiedad..." className={`w-full px-4 py-3 rounded-xl text-sm font-medium bg-white text-geora-black placeholder:text-geora-muted/50 outline-none transition-colors focus:border-geora-emerald resize-none ${errors.message ? "border-red-400" : "border-geora-g100 hover:border-geora-g200"}`} />
            {errors.message && <p className="mt-1 text-xs text-red-500 font-medium">{errors.message}</p>}
          </div>

          {serverError && <p className="text-xs text-red-500 font-bold bg-red-50 px-4 py-3 rounded-xl border border-red-100">{serverError}</p>}

          <button type="submit" disabled={isSubmitting} className="px-14 bg-geora-black hover:bg-geora-dark2 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-5 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
            <span>{isSubmitting ? "Enviando..." : "Enviar consulta"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}