"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isPending = searchParams.get("pending") === "1";
  const isRegistered = searchParams.get("registered") === "1";

  useEffect(() => {
    router.prefetch("/");
    const savedEmail = localStorage.getItem("geora_remember_email");

    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage("Credenciales incorrectas.");
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "REALESTATE" && profile?.status === "PENDING") {
        await supabase.auth.signOut();
        setErrorMessage("Tu cuenta está en revisión. Te avisaremos cuando sea habilitada.");
        setIsLoading(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem("geora_remember_email", email);
      } else {
        localStorage.removeItem("geora_remember_email");
      }

      document.documentElement.style.backgroundColor = "#ffffff";
      document.body.style.backgroundColor = "#ffffff";

      setIsSuccess(true);
      router.refresh();
      
      setTimeout(() => {
        router.push("/?fromAuth=true");
      }, 500);

    } catch {
      setErrorMessage("Ocurrió un error inesperado.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  const animClass = isSuccess ? "animate-slide-down" : "animate-slide-up";
  const getAnimStyle = (delay: string) => isSuccess ? { animationDelay: '0s' } : { animationDelay: delay };

  return (
    <div className={`flex min-h-screen relative overflow-hidden transition-colors duration-500 ease-in-out ${isSuccess ? 'bg-white' : 'bg-[#0a0a0a]'}`}>
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
          to { opacity: 0; transform: translateY(100px); }
        }
        .animate-slide-down {
          pointer-events: none;
          animation: slideDownFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className={`absolute top-[-10%] left-[-10%] w-200 h-200 bg-geora-black/20 mix-blend-screen filter blur-[128px] opacity-70 pointer-events-none z-0 ${animClass}`} style={getAnimStyle('0s')}></div>
      <div className={`absolute -bottom-10 right-[-10%] w-200 h-200 bg-white/10 mix-blend-screen filter blur-[128px] opacity-70 pointer-events-none z-0 ${animClass}`} style={getAnimStyle('0.1s')}></div>

      <div className={`absolute opacity-50 -bottom-10 -left-10 w-240 h-160 bg-linear-to-tr from-white/5 to-transparent backdrop-blur-md border border-white/10 rounded-3xl pointer-events-none z-0 hidden md:block ${animClass}`} style={getAnimStyle('0.2s')}></div>
      <div className={`absolute opacity-50 -bottom-10 right-60 w-280 h-180 bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl pointer-events-none z-0 hidden md:block ${animClass}`} style={getAnimStyle('0.3s')}></div>
      <div className={`absolute opacity-50 -bottom-10 right-[10%] w-160 h-120 bg-white/1 backdrop-blur-xl border border-white/10 rounded-3xl pointer-events-none z-0 shadow-2xl hidden lg:block ${animClass}`} style={getAnimStyle('0.4s')}></div>
      <div className={`absolute opacity-50 -bottom-10 -left-60 w-220 h-120 bg-white/3 backdrop-blur-xl border border-white/20 rounded-3xl pointer-events-none z-0 shadow-2xl hidden lg:block ${animClass}`} style={getAnimStyle('0.5s')}></div>

      <div className="w-full flex flex-col items-center justify-center p-6 lg:p-12 relative z-10">
        <div className={`w-full max-w-xl mx-auto p-8 lg:p-10 bg-white/3 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] ${animClass}`} style={getAnimStyle('0.15s')}>
          
          <div className={`flex flex-col items-center text-center mb-10 ${!isSuccess ? 'animate-slide-up' : ''}`} style={getAnimStyle('0.25s')}>
            <Link href="/" className="relative w-48 h-16 lg:w-56 lg:h-20 mb-4 transition-transform hover:scale-105">
              <Image src="/Geora_Logo_Negro.svg" alt="Logo Geora" fill priority className="object-contain invert opacity-50" />
            </Link>
            <h2 className="text-2xl font-display font-semibold text-white mb-2 tracking-wide">Iniciar sesión</h2>
            <p className="text-white/80 text-sm font-light">Ingresá tus credenciales para continuar</p>
          </div>

          <div className={`${!isSuccess ? 'animate-slide-up' : ''}`} style={getAnimStyle('0.35s')}>
            {isPending && (
              <div className="mb-6 p-4 rounded-full bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-sm text-amber-200 font-medium">Tu cuenta está pendiente de aprobación. Te avisaremos por email cuando esté habilitada.</p>
              </div>
            )}
            {isRegistered && (
              <div className="mb-6 p-4 rounded-full bg-green-500/10 border border-green-500/20 text-center">
                <p className="text-sm text-green-200 font-medium">¡Cuenta creada con éxito! Ya podés iniciar sesión.</p>
              </div>
            )}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-full bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-sm text-red-300 font-medium">{errorMessage}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleLogin} className={`space-y-5 ${!isSuccess ? 'animate-slide-up' : ''}`} style={getAnimStyle('0.45s')}>
            <div>
              <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Correo electrónico</label>
              <input type="email" placeholder="ejemplo@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading || isSuccess} className="w-full rounded-full px-5 py-3.5 text-sm outline-none bg-white/10 border border-white/30 text-white placeholder-white/30 focus:bg-white/10 focus:border-geora-black/50 focus:ring-1 focus:ring-geora-black/50 shadow-sm transition-all" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 ml-2 text-white/80">Contraseña</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading || isSuccess} className="w-full rounded-full px-5 py-3.5 text-sm outline-none bg-white/10 border border-white/30 text-white placeholder-white/30 focus:bg-white/10 focus:border-geora-black/50 focus:ring-1 focus:ring-geora-black/50 shadow-sm transition-all" required />
            </div>

            <div className="flex items-center justify-between px-1 pt-1">
              <Link href="/forgot-password" className="text-sm text-geora-white/90 font-medium hover:text-geora-black hover:underline transition-colors">¿Olvidaste tu contraseña?</Link>
            </div>

            <button type="submit" disabled={isLoading || isSuccess} className="w-full cursor-pointer bg-geora-white2 text-[#0a0a0a] font-bold py-3.5 rounded-full text-md shadow-[0_0_15px_rgba(var(--geora-black-rgb),0.3)] hover:shadow-[0_0_25px_rgba(var(--geora-black-rgb),0.5)] transition-all mt-6 disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading && !isSuccess ? "Ingresando..." : (isSuccess ? "Ingresando..." : "INGRESAR")}
            </button>
          </form>



          <div className={`text-center mt-8 text-sm text-white/50 ${!isSuccess ? 'animate-slide-up' : ''}`} style={getAnimStyle('0.75s')}>
            ¿No tenés una cuenta?{" "}
            <Link href="/auth/register" className="text-geora-white/90 font-medium hover:text-geora-black hover:underline transition-colors">Registrate</Link>
          </div>
        </div>

        <div className={`absolute bottom-6 text-white/30 text-xs font-light ${!isSuccess ? 'animate-slide-up' : ''}`} style={getAnimStyle('0.85s')}>
          © 2026 Geora. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}