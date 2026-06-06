"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, X, AlertTriangle, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SecuritySection() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [newPassword, setNewPassword] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "¡Contraseña actualizada!" });
      setTimeout(() => setIsOpen(false), 2000);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-10 md:mb-30">
        <div className="flex items-center gap-4">
          <div className="text-urbik-black"><Lock size={24} /></div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Seguridad de la cuenta</h3>
            <p className="text-sm text-gray-500">Cambia tu contraseña periódicamente</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(true)} className="px-6 py-3 cursor-pointer bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all">Cambiar Contraseña</button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 h-full z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white/70 backdrop-blur-2xl border border-white/60 w-full rounded-xl p-8 md:p-12 shadow-2xl relative">
              <button onClick={() => setIsOpen(false)} className="absolute cursor-pointer right-8 top-8 text-urbik-black/70 hover:text-black"><X size={24} /></button>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 text-urbik-black/80"><Lock size={22} /></div>
                <h2 className="text-2xl font-bold text-urbik-black/80">Actualizar Contraseña</h2>
              </div>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold ml-5 text-urbik-black/80 uppercase">Nueva Contraseña</label>
                  <motion.input 
                    whileFocus={{ scale: 1.02, boxShadow: "0px 4px 15px rgba(0,0,0,0.05)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    type={showPassword ? "text" : "password"} 
                    required 
                    className="w-full px-6 py-4 rounded-full bg-white/50 border border-white shadow-sm focus:ring-2 focus:ring-black outline-none font-medium text-black transition-colors" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Mínimo 6 caracteres" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute cursor-pointer right-6 top-[2.7rem] text-urbik-black/50 hover:text-black">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {message.text && <p className={`text-center text-sm font-bold ${message.type === "error" ? "text-red-500" : "text-green-600"}`}>{message.text}</p>}
                <div className="pt-4">
                  <button type="submit" disabled={loading} className="w-full cursor-pointer py-4 bg-black text-white font-bold rounded-full hover:bg-urbik-black/70 disabled:bg-gray-400">{loading ? "Procesando..." : "Guardar Cambios"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export function PauseAccountZone({ isPaused, userId, onToggleSuccess }: { isPaused: boolean, userId: string, onToggleSuccess: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const supabase = createClient();

  const handleToggle = async () => {
    await supabase.from('profiles').update({ is_active: !isPaused }).eq('id', userId);
    onToggleSuccess();
    setShowModal(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-10 md:mb-20">
        <div className="flex items-center gap-4">
          <div className={isPaused ? "text-urbik-emerald" : "text-urbik-black"}><Pause size={24} /></div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{isPaused ? "Reactivar Cuenta" : "Pausar Cuenta"}</h3>
            <p className="text-sm text-gray-500">
              {isPaused ? "Tu cuenta está pausada. Actívala para volver a operar." : "Al pausar, tu perfil dejará de ser visible temporalmente."}
            </p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className={`px-6 py-3 cursor-pointer font-bold rounded-full transition-all ${isPaused ? "bg-urbik-emerald text-white hover:bg-green-600" : "border-2 border-black text-black hover:bg-black hover:text-white"}`}>
          {isPaused ? "Reactivar Ahora" : "Pausar Cuenta"}
        </button>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 h-full z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white/70 backdrop-blur-2xl border border-white/60 w-full rounded-xl p-8 md:p-12 shadow-2xl relative text-center">
              <button onClick={() => setShowModal(false)} className="absolute cursor-pointer right-8 top-8 text-urbik-black/70 hover:text-black"><X size={24} /></button>
              
              <div className="flex justify-center mb-6">
                {isPaused ? <Play className="text-urbik-emerald" size={48} /> : <Pause className="text-urbik-black/80" size={48} />}
              </div>
              
              <h3 className="text-2xl font-bold text-urbik-black/80 mb-2">{isPaused ? "¿Reactivar tu presencia?" : "¿Quieres pausar tu cuenta?"}</h3>
              <p className="text-gray-500 mb-8">{isPaused ? "Volverás a ser visible para todos los usuarios." : "Podrás reactivarla en cualquier momento."}</p>
              
              <button onClick={handleToggle} className={`w-full py-4 cursor-pointer rounded-full font-bold transition-all ${isPaused ? "bg-urbik-emerald text-white hover:bg-green-600" : "bg-black text-white hover:bg-gray-800"}`}>
                SÍ, {isPaused ? "REACTIVAR" : "PAUSAR"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export function DangerZone({ userId }: { itemName: string, userId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleDelete = async () => {
    await supabase.from('profiles').delete().eq('id', userId);
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      <div className="flex items-center justify-between mb-10 md:mb-20">
        <div className="flex items-center gap-4">
          <div className="text-red-500"><AlertTriangle size={24} /></div>
          <div>
            <h3 className="text-xl font-bold text-red-500">Zona de Eliminación</h3>
            <p className="text-sm text-gray-500">Esta acción es permanente e irreversible.</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="px-6 py-3 cursor-pointer bg-red-50 text-red-600 border border-red-200 font-bold rounded-full hover:bg-red-500 hover:text-white transition-all">
          Eliminar Cuenta
        </button>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 h-full z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white/70 backdrop-blur-2xl border border-white/60 w-full rounded-xl p-8 md:p-12 shadow-2xl relative text-center">
              <button onClick={() => setShowModal(false)} className="absolute cursor-pointer right-8 top-8 text-urbik-black/70 hover:text-black"><X size={24} /></button>
              
              <div className="flex justify-center mb-6 text-red-500">
                <AlertTriangle size={48} />
              </div>

              <h3 className="text-2xl font-bold text-urbik-black/80 mb-2">¿Absolutamente seguro?</h3>
              <p className="text-sm text-gray-500 mb-6">Para confirmar, escribe <strong>ELIMINAR MI CUENTA</strong> a continuación:</p>
              
              <div className="relative mb-8">
                <motion.input 
                  whileFocus={{ scale: 1.02, boxShadow: "0px 4px 15px rgba(239,68,68,0.15)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  type="text" 
                  value={confirmText} 
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())} 
                  className="w-full px-6 py-4 rounded-full bg-white/50 border border-red-200 focus:border-red-500 outline-none font-bold text-center text-transparent focus:text-transparent selection:bg-red-200 relative z-10" 
                  placeholder="ELIMINAR MI CUENTA" 
                />
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                  {!confirmText && <span className="text-gray-400 font-bold">ELIMINAR MI CUENTA</span>}
                  <AnimatePresence mode="popLayout">
                    {confirmText.split("").map((char, i) => (
                      <motion.span
                        key={`${i}-${char}`}
                        initial={{ opacity: 0, y: 15, scale: 0.5, rotate: -10 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className="font-black text-red-500 text-lg tracking-widest"
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <button disabled={confirmText !== "ELIMINAR MI CUENTA"} onClick={handleDelete} className={`w-full py-4 cursor-pointer rounded-full font-bold transition-all ${confirmText === "ELIMINAR MI CUENTA" ? "bg-red-500 text-white shadow-lg shadow-red-200/50" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                SÍ, ELIMINAR DEFINITIVAMENTE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}