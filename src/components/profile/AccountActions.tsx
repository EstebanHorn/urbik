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
      <div className="bg-white p-8 rounded-4xl border border-gray-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-black p-3 rounded-full text-white"><Lock size={24} /></div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Seguridad de la cuenta</h3>
            <p className="text-sm text-gray-500">Cambia tu contraseña periódicamente</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(true)} className="px-6 py-3 cursor-pointer bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all">Cambiar Contraseña</button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-50 w-full max-w-lg rounded-4xl p-8 md:p-12 shadow-2xl relative">
              <button onClick={() => setIsOpen(false)} className="absolute cursor-pointer right-8 top-8 text-gray-400 hover:text-black"><X size={24} /></button>
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-black p-2 rounded-full text-white"><Lock size={20} /></div>
                <h2 className="text-2xl font-bold text-gray-800">Actualizar Contraseña</h2>
              </div>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2 relative">
                  <label className="ml-4 text-xs font-bold text-black opacity-40 uppercase tracking-widest">Nueva Contraseña</label>
                  <input type={showPassword ? "text" : "password"} required className="w-full px-6 py-4 rounded-full bg-white border border-gray-300 focus:ring-2 focus:ring-black outline-none font-medium text-black" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute cursor-pointer right-6 top-[3.2rem] text-gray-400 hover:text-black">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {message.text && <p className={`text-center text-sm font-bold ${message.type === "error" ? "text-red-500" : "text-green-600"}`}>{message.text}</p>}
                <div className="pt-4">
                  <button type="submit" disabled={loading} className="w-full cursor-pointer py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 disabled:bg-gray-400">{loading ? "Procesando..." : "Guardar Cambios"}</button>
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
      <div className={`p-5 pl-10 rounded-[3rem] border ${isPaused ? 'bg-green-50 border-green-200' : 'bg-urbik-black/10 border-urbik-black/20'}`}>
        <div className="flex items-center gap-3 mb-2">
          {isPaused ? <Play className="text-urbik-emerald" size={24} /> : <Pause className="text-urbik-black/50" size={24} />}
          <h3 className={`font-display font-bold text-lg uppercase tracking-tight ${isPaused ? 'text-urbik-emerald' : 'text-urbik-black/50'}`}>{isPaused ? "Reactivar Cuenta" : "Pausar Cuenta"}</h3>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className={`text-sm font-medium max-w-md ${isPaused ? 'text-green-700/80' : 'text-urbik-black/80'}`}>
            {isPaused ? "Tu cuenta está pausada. Actívala para volver a operar." : "Al pausar, tu perfil dejará de ser visible temporalmente."}
          </p>
          <button onClick={() => setShowModal(true)} className={`whitespace-nowrap cursor-pointer px-5 py-2 border-2 font-bold rounded-full transition-all shadow-sm ${isPaused ? "border-urbik-emerald text-urbik-emerald hover:bg-urbik-emerald hover:text-white" : "border-urbik-black/50 text-urbik-black/50 hover:bg-urbik-black/50 hover:text-white"}`}>
            {isPaused ? "Reactivar Ahora" : "Pausar Cuenta"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl text-center">
              <button onClick={() => setShowModal(false)} className="absolute cursor-pointer top-8 right-8 text-gray-400 hover:text-black"><X size={28} /></button>
              <h3 className="text-2xl font-display font-bold mb-4">{isPaused ? "¿Reactivar tu presencia?" : "¿Quieres pausar tu cuenta?"}</h3>
              <button onClick={handleToggle} className={`w-full py-4 cursor-pointer rounded-full font-black transition-all ${isPaused ? "bg-urbik-emerald text-white" : "bg-urbik-black/50 text-white"}`}>
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
      <div className="bg-red-50 p-5 pl-10 rounded-[3rem] border border-red-200 mt-10">
        <div className="flex items-center gap-3 text-urbik-rose">
          <AlertTriangle size={24} />
          <h3 className="font-display font-bold text-lg uppercase tracking-tight">Zona de Eliminación</h3>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-urbik-rose/70 font-medium max-w-md">Esta acción es irreversible.</p>
          <button onClick={() => setShowModal(true)} className="whitespace-nowrap cursor-pointer px-5 py-2 border-2 border-urbik-rose text-urbik-rose font-bold rounded-full hover:bg-urbik-rose hover:text-white transition-all shadow-sm">Eliminar Cuenta</button>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-lg p-10 rounded-[3rem] shadow-2xl">
              <button onClick={() => setShowModal(false)} className="absolute cursor-pointer top-8 right-8 text-urbik-muted hover:text-urbik-black"><X size={28} /></button>
              <h3 className="text-2xl text-center font-display font-bold mb-4 text-urbik-black">¿Absolutamente seguro?</h3>
              <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-red-100 focus:border-urbik-rose outline-none font-bold text-center text-urbik-rose mb-8" placeholder="Escribe ELIMINAR MI CUENTA" />
              <button disabled={confirmText !== "ELIMINAR MI CUENTA"} onClick={handleDelete} className={`w-full cursor-pointer py-4 rounded-full font-black tracking-tighter transition-all ${confirmText === "ELIMINAR MI CUENTA" ? "bg-urbik-rose text-white shadow-xl shadow-red-200" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}>SÍ, ELIMINAR DEFINITIVAMENTE</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}