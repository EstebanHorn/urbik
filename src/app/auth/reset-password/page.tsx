"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    } else {
      setMessage({ type: "success", text: "¡Contraseña actualizada! Redirigiendo..." });
      setTimeout(() => router.push("/dashboard"), 1800);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image src="/Geora_Logo_Negro.svg" alt="Geora" width={120} height={40} priority />
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/60 backdrop-blur-2xl shadow-[0_10px_60px_rgba(0,0,0,0.08)] p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-geora-black/5">
              <Lock size={20} className="text-geora-black" />
            </div>
            <div>
              <h1 className="text-xl font-black text-geora-black uppercase tracking-tight">
                Nueva contraseña
              </h1>
              <p className="text-xs text-geora-black/50">Ingresá tu nueva contraseña para continuar.</p>
            </div>
          </div>

          {!ready ? (
            <div className="text-center py-10">
              <div className="text-sm text-geora-black/40 animate-pulse">Verificando link de seguridad...</div>
              <p className="text-xs text-geora-black/30 mt-3">
                Si llegaste aquí por error, volvé al{" "}
                <Link href="/" className="underline">inicio</Link>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-xs font-bold text-geora-black/70 uppercase mb-2 ml-1">
                  Nueva contraseña
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/50 border border-white shadow-sm focus:ring-2 focus:ring-geora-black/20 outline-none text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-9 text-geora-black/40 hover:text-geora-black transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-geora-black/70 uppercase mb-2 ml-1">
                  Confirmar contraseña
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repetí la contraseña"
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/50 border border-white shadow-sm focus:ring-2 focus:ring-geora-black/20 outline-none text-sm font-medium"
                />
              </div>

              {message && (
                <p className={`text-sm font-semibold text-center ${message.type === "error" ? "text-red-500" : "text-green-600"}`}>
                  {message.text}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-geora-black text-white font-bold text-sm hover:opacity-85 transition-opacity disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? "Guardando..." : "Guardar nueva contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
