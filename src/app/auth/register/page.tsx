"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getJurisdictionsByProvince } from "@/lib/jurisdictions";
import registerBg from "@/assets/register_bg.png";

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
  "w-full rounded-full px-5 py-3 text-sm outline-none bg-linear-to-r from-gray-100 via-gray-100 to-white focus:ring-2 focus:ring-black/20";

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

  const goBack = () => {
    setError(null);
    setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const handleSelectRole = (selected: Role) => {
    setRole(selected);
    setStep(2);
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
        return;
      }

      router.push("/auth/login?registered=1");
    } catch {
      setError("Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealEstateNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (
      !realEstateForm.agencyName ||
      !realEstateForm.phone ||
      !realEstateForm.province ||
      !realEstateForm.city
    ) {
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
        return;
      }

      router.push("/auth/login?pending=1");
    } catch {
      setError("Ocurrió un error inesperado.");
    } finally {
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

  return (
    <div className="flex h-screen bg-white">
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <Image src={registerBg} alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      <div className="w-full lg:w-1/3 flex flex-col items-center justify-center p-12 relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto">
        <div className="w-full max-w-md mx-auto px-4 lg:px-0">
          <div className="flex flex-col items-center text-center mb-8">
            <Link href="/" className="relative w-48 h-20 lg:w-64 lg:h-28 -mb-3">
              <Image
                src="/Urbik_Logo_Negro.svg"
                alt="Logo Urbik"
                fill
                priority
                className="object-contain"
              />
            </Link>

            <h2 className="text-3xl font-display font-bold mb-2">
              Crear cuenta
            </h2>

            <p className="text-urbik-muted text-sm">
              {stepSubtitles[subtitleKey]}
            </p>
          </div>

          {step > 1 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i + 1 === step
                      ? "w-6 bg-urbik-cyan"
                      : i + 1 < step
                      ? "w-2 bg-urbik-cyan/50"
                      : "w-2 bg-gray-200"
                  }`}
                />
              ))}
            </div>
          )}

          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-100 text-center">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <button
                onClick={() => handleSelectRole("USER")}
                className="w-full text-left border-2 border-gray-100 hover:border-urbik-cyan rounded-2xl p-5 transition-colors group"
              >
                <p className="font-bold text-base group-hover:text-urbik-cyan transition-colors">
                  Soy particular
                </p>
                <p className="text-sm text-urbik-muted mt-1">
                  Buscá propiedades y guardá tus favoritas
                </p>
              </button>

              <button
                onClick={() => handleSelectRole("REALESTATE")}
                className="w-full text-left border-2 border-gray-100 hover:border-urbik-cyan rounded-2xl p-5 transition-colors group"
              >
                <p className="font-bold text-base group-hover:text-urbik-cyan transition-colors">
                  Soy inmobiliaria
                </p>
                <p className="text-sm text-urbik-muted mt-1">
                  Publicá y administrá propiedades desde tu panel
                </p>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400">
                    o registrate con
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full cursor-pointer bg-linear-to-r from-[#3E3E3E] via-black to-[#2E2E2E] text-white font-medium py-3 rounded-full text-md shadow-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-3 disabled:opacity-60"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>
            </div>
          )}

          {step === 2 && role === "USER" && (
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-4 text-urbik-muted">
                    Nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Juan"
                    value={userForm.firstName}
                    onChange={(e) =>
                      setUserForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                    required
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-4 text-urbik-muted">
                    Apellido
                  </label>
                  <input
                    type="text"
                    placeholder="Pérez"
                    value={userForm.lastName}
                    onChange={(e) =>
                      setUserForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                    required
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 ml-4 text-urbik-muted">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@gmail.com"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 ml-4 text-urbik-muted">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 ml-4 text-urbik-muted">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  placeholder="Repetí tu contraseña"
                  value={userForm.confirmPassword}
                  onChange={(e) =>
                    setUserForm((f) => ({
                      ...f,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                  className={INPUT_CLASS}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="w-1/3 cursor-pointer border border-gray-200 text-gray-600 font-medium py-3 rounded-full text-sm hover:bg-gray-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 cursor-pointer bg-urbik-cyan text-white font-bold py-3 rounded-full text-base shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {isLoading ? "Registrando..." : "CREAR CUENTA"}
                </button>
              </div>
            </form>
          )}

          {step === 2 && role === "REALESTATE" && (
            <form onSubmit={handleRealEstateNext} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 ml-4 text-urbik-muted">
                  Nombre de la inmobiliaria
                </label>
                <input
                  type="text"
                  placeholder="Ej: Inmobiliaria del Sur"
                  value={realEstateForm.agencyName}
                  onChange={(e) =>
                    setRealEstateForm((f) => ({
                      ...f,
                      agencyName: e.target.value,
                    }))
                  }
                  required
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 ml-4 text-urbik-muted">
                  Teléfono
                </label>
                <input
                  type="tel"
                  placeholder="+54 9 11 1234-5678"
                  value={realEstateForm.phone}
                  onChange={(e) =>
                    setRealEstateForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  required
                  className={INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-4 text-urbik-muted">
                    Provincia
                  </label>
                  <select
                    value={realEstateForm.province}
                    onChange={(e) =>
                      setRealEstateForm((f) => ({
                        ...f,
                        province: e.target.value,
                      }))
                    }
                    required
                    className={`${INPUT_CLASS} appearance-none`}
                  >
                    <option value="">Seleccionar</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-4 text-urbik-muted">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    placeholder="Buenos Aires"
                    value={realEstateForm.city}
                    onChange={(e) =>
                      setRealEstateForm((f) => ({
                        ...f,
                        city: e.target.value,
                      }))
                    }
                    required
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-4 text-urbik-muted">
                    Calle
                  </label>
                  <input
                    type="text"
                    placeholder="Av. Corrientes"
                    value={realEstateForm.street}
                    onChange={(e) =>
                      setRealEstateForm((f) => ({
                        ...f,
                        street: e.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-4 text-urbik-muted">
                    Número
                  </label>
                  <input
                    type="text"
                    placeholder="1234"
                    value={realEstateForm.address}
                    onChange={(e) =>
                      setRealEstateForm((f) => ({
                        ...f,
                        address: e.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="w-1/3 cursor-pointer border border-gray-200 text-gray-600 font-medium py-3 rounded-full text-sm hover:bg-gray-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="flex-1 cursor-pointer bg-urbik-cyan text-white font-bold py-3 rounded-full text-base shadow-sm hover:opacity-90 transition-opacity"
                >
                  Continuar
                </button>
              </div>
            </form>
          )}

          {step === 3 && role === "REALESTATE" && (
            <form onSubmit={handleRealEstateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 ml-4 text-urbik-muted">
                  Número de matrícula
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1234"
                  value={realEstateForm.licenseNumber}
                  onChange={(e) =>
                    setRealEstateForm((f) => ({
                      ...f,
                      licenseNumber: e.target.value,
                    }))
                  }
                  required
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 ml-4 text-urbik-muted">
                  Nombre del responsable
                </label>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={realEstateForm.responsibleName}
                  onChange={(e) =>
                    setRealEstateForm((f) => ({
                      ...f,
                      responsibleName: e.target.value,
                    }))
                  }
                  required
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 ml-4 text-urbik-muted">
                  Provincia de la matrícula
                </label>
                <select
                  value={realEstateForm.licenseProvince}
                  onChange={(e) =>
                    setRealEstateForm((f) => ({
                      ...f,
                      licenseProvince: e.target.value,
                      licenseJurisdiction: "",
                    }))
                  }
                  required
                  className={`${INPUT_CLASS} appearance-none`}
                >
                  <option value="">Seleccionar</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {getJurisdictionsByProvince(realEstateForm.licenseProvince).length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-4 text-urbik-muted">
                    Circunscripción
                  </label>
                  <select
                    value={realEstateForm.licenseJurisdiction}
                    onChange={(e) =>
                      setRealEstateForm((f) => ({
                        ...f,
                        licenseJurisdiction: e.target.value,
                      }))
                    }
                    className={`${INPUT_CLASS} appearance-none`}
                  >
                    <option value="">Seleccionar (opcional)</option>
                    {getJurisdictionsByProvince(realEstateForm.licenseProvince).map(
                      (j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-xs text-urbik-muted ml-1">
                  Credenciales de acceso
                </p>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={realEstateForm.email}
                  onChange={(e) =>
                    setRealEstateForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                  className={INPUT_CLASS}
                />
                <input
                  type="password"
                  placeholder="Contraseña (mín. 6 caracteres)"
                  value={realEstateForm.password}
                  onChange={(e) =>
                    setRealEstateForm((f) => ({
                      ...f,
                      password: e.target.value,
                    }))
                  }
                  required
                  className={INPUT_CLASS}
                />
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={realEstateForm.confirmPassword}
                  onChange={(e) =>
                    setRealEstateForm((f) => ({
                      ...f,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                  className={INPUT_CLASS}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="w-1/3 cursor-pointer border border-gray-200 text-gray-600 font-medium py-3 rounded-full text-sm hover:bg-gray-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 cursor-pointer bg-urbik-cyan text-white font-bold py-3 rounded-full text-base shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {isLoading ? "Enviando..." : "ENVIAR SOLICITUD"}
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-8 text-sm text-gray-500">
            ¿Ya tenés cuenta?{" "}
            <Link
              href="/auth/login"
              className="text-urbik-cyan font-semibold hover:underline"
            >
              Iniciá sesión
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 text-gray-400 text-xs font-medium">
          © 2026 Urbik. Todos los derechos reservados.
        </div>
      </div>

      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <Image
          src={registerBg}
          alt=""
          fill
          priority
          className="object-cover -scale-x-100"
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>
    </div>
  );
}
