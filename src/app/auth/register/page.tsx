"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getJurisdictionsByProvince } from "@/lib/jurisdictions";

const PROVINCES = [
  "Buenos Aires",
  "Capital Federal",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

const INPUT_CLASS =
  "w-full rounded-full px-5 py-3.5 text-sm outline-none bg-white/10 border border-white/30 text-white placeholder-white/30 focus:bg-white/10 focus:border-urbik-black/50 focus:ring-1 focus:ring-urbik-black/50 shadow-sm transition-all";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

type Role = "USER" | "REALESTATE";

interface UserFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RealEstateFields {
  agencyName: string;
  phone: string;
  province: string;
  city: string;
  street: string;
  address: string;
  licenseNumber: string;
  responsibleName: string;
  licenseProvince: string;
  licenseJurisdiction: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [userForm, setUserForm] = useState<UserFields>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [realEstateForm, setRealEstateForm] = useState<RealEstateFields>({
    agencyName: "",
    phone: "",
    province: "",
    city: "",
    street: "",
    address: "",
    licenseNumber: "",
    responsibleName: "",
    licenseProvince: "",
    licenseJurisdiction: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    router.prefetch("/auth/login");
  }, [router]);

  const goBack = () => {
    setError(null);
    setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const handleSelectRole = (selected: Role) => {
    setRole(selected);
    setStep(2);
  };

  const triggerTransition = (url: string) => {
    document.documentElement.style.backgroundColor = "#0a0a0a";
    document.body.style.backgroundColor = "#0a0a0a";
    setIsSuccess(true);
    router.refresh();
    setTimeout(() => {
      router.push(url);
    }, 450);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (userForm.password !== userForm.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (userForm.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "USER",
          email: userForm.email,
          password: userForm.password,
          name: userForm.firstName,
          lastName: userForm.lastName,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Error al registrarse.");
        setIsLoading(false);
        return;
      }

      triggerTransition("/auth/login?registered=1");
    } catch {
      setError("Ocurrió un error inesperado.");
      setIsLoading(false);
    }
  };

  const handleRealEstateNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!realEstateForm.agencyName || !realEstateForm.phone || !realEstateForm.province || !realEstateForm.city) {
      setError("Completá todos los campos requeridos.");
      return;
    }
    setStep(3);
  };

  const handleRealEstateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (realEstateForm.password !== realEstateForm.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (realEstateForm.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "REALESTATE",
          email: realEstateForm.email,
          password: realEstateForm.password,
          name: realEstateForm.agencyName,
          phone: realEstateForm.phone,
          province: realEstateForm.province,
          city: realEstateForm.city,
          street: realEstateForm.street,
          address: realEstateForm.address,
          licenses: [
            {
              licenseNumber: realEstateForm.licenseNumber,
              province: realEstateForm.licenseProvince || realEstateForm.province,
              jurisdiction: realEstateForm.licenseJurisdiction || undefined,
              responsibleName: realEstateForm.responsibleName,
            },
          ],
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Error al registrarse.");
        setIsLoading(false);
        return;
      }

      triggerTransition("/auth/login?pending=1");
    } catch {
      setError("Ocurrió un error inesperado.");
      setIsLoading(false);
    }
  };

  const totalSteps = role === "REALESTATE" ? 3 : 2;

  const stepSubtitles: Record<string, string> = {
    "1": "Elegí el tipo de cuenta",
    "2-USER": "Tus datos personales",
    "2-REALESTATE": "Datos de tu inmobiliaria",
    "3-REALESTATE": "Matrícula y acceso",
  };
  const subtitleKey = step === 1 ? "1" : `${step}-${role}`;

  const animClass = isSuccess ? "animate-slide-down" : "animate-slide-up";
  const getAnimStyle = (delay: string) => isSuccess ? { animationDelay: '0s' } : { animationDelay: delay };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          opacity: 0;
          animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideDownFade {
          to { opacity: 0; transform: translateY(50px); }
        }
        .animate-slide-down {
          pointer-events: none;
          animation: slideDownFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className={`absolute top-[-10%] left-[-10%] w-200 h-200 bg-urbik-black/20 mix-blend-screen filter blur-[128px] opacity-70 pointer-events-none z-0 ${animClass}`} style={getAnimStyle('0s')}></div>
      <div className={`absolute -bottom-10 right-[-10%] w-200 h-200 bg-white/10 mix-blend-screen filter blur-[128px] opacity-70 pointer-events-none z-0 ${animClass}`} style={getAnimStyle('0.1s')}></div>

      <div className={`absolute opacity-50 -bottom-10 -left-10 w-240 h-160 bg-linear-to-tr from-white/5 to-transparent backdrop-blur-md border border-white/10 rounded-3xl pointer-events-none z-0 hidden md:block ${animClass}`} style={getAnimStyle('0.2s')}></div>
      <div className={`absolute opacity-50 -bottom-10 right-60 w-280 h-180 bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl pointer-events-none z-0 hidden md:block ${animClass}`} style={getAnimStyle('0.3s')}></div>
      <div className={`absolute opacity-50 -bottom-10 right-[10%] w-160 h-120 bg-white/1 backdrop-blur-xl border border-white/10 rounded-3xl pointer-events-none z-0 shadow-2xl hidden lg:block ${animClass}`} style={getAnimStyle('0.4s')}></div>
      <div className={`absolute opacity-50 -bottom-10 -left-60 w-220 h-120 bg-white/3 backdrop-blur-xl border border-white/20 rounded-3xl pointer-events-none z-0 shadow-2xl hidden lg:block ${animClass}`} style={getAnimStyle('0.5s')}></div>

      <div className="w-full flex flex-col items-center justify-center p-6 lg:p-12 relative z-10 py-12 overflow-y-auto">
        <div className={`w-full max-w-xl mx-auto p-8 lg:p-10 bg-white/3 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] ${animClass}`} style={getAnimStyle('0.15s')}>
          
          <div className={`flex flex-col items-center text-center mb-8 ${!isSuccess ? 'animate-slide-up' : ''}`} style={getAnimStyle('0.25s')}>
            <Link href="/" className="relative w-48 h-16 lg:w-56 lg:h-20 mb-4 transition-transform hover:scale-105">
              <Image
                src="/Urbik_Logo_Negro.svg"
                alt="Logo Urbik"
                fill
                priority
                className="object-contain invert opacity-50"
              />
            </Link>

            <h2 className="text-2xl font-display font-semibold text-white mb-2 tracking-wide">
              Crear cuenta
            </h2>

            <p className="text-white/80 text-sm font-light">
              {stepSubtitles[subtitleKey]}
            </p>
          </div>

          <div className={`${!isSuccess ? 'animate-slide-up' : ''}`} style={getAnimStyle('0.35s')}>
            {step > 1 && (
              <div className="flex items-center justify-center gap-2 mb-6">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i + 1 === step
                        ? "w-6 bg-white"
                        : i + 1 < step
                        ? "w-2 bg-white/60"
                        : "w-2 bg-white/20"
                    }`}
                  />
                ))}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-full bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-sm text-red-300 font-medium">{error}</p>
              </div>
            )}
          </div>

          <div className={`${!isSuccess ? 'animate-slide-up' : ''}`} style={getAnimStyle('0.45s')}>
            {step === 1 && (
              <div className="space-y-4">
                <button
                  onClick={() => handleSelectRole("USER")}
                  className="w-full text-left border border-white/20 hover:border-white/50 bg-white/5 rounded-2xl p-5 transition-all group"
                >
                  <p className="font-bold text-base text-white group-hover:text-white/90 transition-colors">
                    Soy particular
                  </p>
                  <p className="text-sm text-white/50 mt-1">
                    Buscá propiedades y guardá tus favoritas
                  </p>
                </button>

                <button
                  onClick={() => handleSelectRole("REALESTATE")}
                  className="w-full text-left border border-white/20 hover:border-white/50 bg-white/5 rounded-2xl p-5 transition-all group"
                >
                  <p className="font-bold text-base text-white group-hover:text-white/90 transition-colors">
                    Soy inmobiliaria
                  </p>
                  <p className="text-sm text-white/50 mt-1">
                    Publicá y administrá propiedades desde tu panel
                  </p>
                </button>

                <div className="flex items-center my-8">
                  <div className="flex-1 border-t border-white/10" />
                  <span className="px-4 text-xs tracking-wider text-white/40 uppercase font-medium">
                    o registrate con
                  </span>
                  <div className="flex-1 border-t border-white/10" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || isSuccess}
                  className="w-full cursor-pointer bg-white/5 border border-white/10 text-white font-medium py-3 rounded-full text-sm hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <GoogleIcon />
                  <span>Google</span>
                </button>
              </div>
            )}

            {step === 2 && role === "USER" && (
              <form onSubmit={handleUserSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Nombre</label>
                    <input
                      type="text"
                      placeholder="Juan"
                      value={userForm.firstName}
                      onChange={(e) => setUserForm((f) => ({ ...f, firstName: e.target.value }))}
                      required
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Apellido</label>
                    <input
                      type="text"
                      placeholder="Pérez"
                      value={userForm.lastName}
                      onChange={(e) => setUserForm((f) => ({ ...f, lastName: e.target.value }))}
                      required
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
                    required
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Contraseña</label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={userForm.password}
                    onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
                    required
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Confirmar contraseña</label>
                  <input
                    type="password"
                    placeholder="Repetí tu contraseña"
                    value={userForm.confirmPassword}
                    onChange={(e) => setUserForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    required
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={goBack}
                    className="w-1/3 cursor-pointer bg-white/5 border border-white/10 text-white font-medium py-3.5 rounded-full text-sm hover:bg-white/10 transition-all"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || isSuccess}
                    className="flex-1 cursor-pointer bg-urbik-white2 text-[#0a0a0a] font-bold py-3.5 rounded-full text-md shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all disabled:opacity-60"
                  >
                    {isLoading ? "Creando..." : "CREAR CUENTA"}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && role === "REALESTATE" && (
              <form onSubmit={handleRealEstateNext} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Nombre de la inmobiliaria</label>
                  <input
                    type="text"
                    placeholder="Ej: Inmobiliaria del Sur"
                    value={realEstateForm.agencyName}
                    onChange={(e) => setRealEstateForm((f) => ({ ...f, agencyName: e.target.value }))}
                    required
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="+54 9 11 1234-5678"
                    value={realEstateForm.phone}
                    onChange={(e) => setRealEstateForm((f) => ({ ...f, phone: e.target.value }))}
                    required
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Provincia</label>
                    <select
                      value={realEstateForm.province}
                      onChange={(e) => setRealEstateForm((f) => ({ ...f, province: e.target.value }))}
                      required
                      className={`${INPUT_CLASS} appearance-none`}
                    >
                      <option value="" className="bg-[#0a0a0a] text-white">Seleccionar</option>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p} className="bg-[#0a0a0a] text-white">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Ciudad</label>
                    <input
                      type="text"
                      placeholder="Buenos Aires"
                      value={realEstateForm.city}
                      onChange={(e) => setRealEstateForm((f) => ({ ...f, city: e.target.value }))}
                      required
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Calle</label>
                    <input
                      type="text"
                      placeholder="Av. Corrientes"
                      value={realEstateForm.street}
                      onChange={(e) => setRealEstateForm((f) => ({ ...f, street: e.target.value }))}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Número</label>
                    <input
                      type="text"
                      placeholder="1234"
                      value={realEstateForm.address}
                      onChange={(e) => setRealEstateForm((f) => ({ ...f, address: e.target.value }))}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={goBack}
                    className="w-1/3 cursor-pointer bg-white/5 border border-white/10 text-white font-medium py-3.5 rounded-full text-sm hover:bg-white/10 transition-all"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    className="flex-1 cursor-pointer bg-urbik-white2 text-[#0a0a0a] font-bold py-3.5 rounded-full text-md shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all"
                  >
                    Continuar
                  </button>
                </div>
              </form>
            )}

            {step === 3 && role === "REALESTATE" && (
              <form onSubmit={handleRealEstateSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Número de matrícula</label>
                  <input
                    type="text"
                    placeholder="Ej: 1234"
                    value={realEstateForm.licenseNumber}
                    onChange={(e) => setRealEstateForm((f) => ({ ...f, licenseNumber: e.target.value }))}
                    required
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Nombre del responsable</label>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={realEstateForm.responsibleName}
                    onChange={(e) => setRealEstateForm((f) => ({ ...f, responsibleName: e.target.value }))}
                    required
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Provincia de la matrícula</label>
                  <select
                    value={realEstateForm.licenseProvince}
                    onChange={(e) => setRealEstateForm((f) => ({ ...f, licenseProvince: e.target.value, licenseJurisdiction: "" }))}
                    required
                    className={`${INPUT_CLASS} appearance-none`}
                  >
                    <option value="" className="bg-[#0a0a0a] text-white">Seleccionar</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p} className="bg-[#0a0a0a] text-white">{p}</option>
                    ))}
                  </select>
                </div>

                {getJurisdictionsByProvince(realEstateForm.licenseProvince).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Circunscripción</label>
                    <select
                      value={realEstateForm.licenseJurisdiction}
                      onChange={(e) => setRealEstateForm((f) => ({ ...f, licenseJurisdiction: e.target.value }))}
                      className={`${INPUT_CLASS} appearance-none`}
                    >
                      <option value="" className="bg-[#0a0a0a] text-white">Seleccionar (opcional)</option>
                      {getJurisdictionsByProvince(realEstateForm.licenseProvince).map((j) => (
                        <option key={j} value={j} className="bg-[#0a0a0a] text-white">{j}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="border-t border-white/10 pt-6 space-y-4">
                  <p className="text-xs tracking-wider text-white/40 uppercase font-medium ml-2">
                    Credenciales de acceso
                  </p>
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={realEstateForm.email}
                    onChange={(e) => setRealEstateForm((f) => ({ ...f, email: e.target.value }))}
                    required
                    className={INPUT_CLASS}
                  />
                  <input
                    type="password"
                    placeholder="Contraseña (mín. 6 caracteres)"
                    value={realEstateForm.password}
                    onChange={(e) => setRealEstateForm((f) => ({ ...f, password: e.target.value }))}
                    required
                    className={INPUT_CLASS}
                  />
                  <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={realEstateForm.confirmPassword}
                    onChange={(e) => setRealEstateForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    required
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={goBack}
                    className="w-1/3 cursor-pointer bg-white/5 border border-white/10 text-white font-medium py-3.5 rounded-full text-sm hover:bg-white/10 transition-all"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || isSuccess}
                    className="flex-1 cursor-pointer bg-urbik-white2 text-[#0a0a0a] font-bold py-3.5 rounded-full text-md shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all disabled:opacity-60"
                  >
                    {isLoading ? "Enviando..." : "ENVIAR SOLICITUD"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className={`text-center mt-8 text-sm text-white/50 ${!isSuccess ? 'animate-slide-up' : ''}`} style={getAnimStyle('0.65s')}>
            ¿Ya tenés cuenta?{" "}
            <Link href="/auth/login" className="text-urbik-white/90 font-medium hover:text-white hover:underline transition-colors">
              Iniciá sesión
            </Link>
          </div>
        </div>

        <div className={`absolute bottom-6 text-white/30 text-xs font-light ${!isSuccess ? 'animate-slide-up' : ''}`} style={getAnimStyle('0.75s')}>
          © 2026 Urbik. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}