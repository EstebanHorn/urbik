"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X } from "lucide-react";
import Link from "next/link";

export default function LoginToast({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="fixed bottom-6 right-4 z-[9999] max-w-xs w-full pointer-events-auto"
        >
          <div className="relative flex items-start gap-3 rounded-2xl border border-urbik-rose/20 bg-white/80 backdrop-blur-xl px-4 py-3.5 shadow-[0_8px_32px_rgba(255,0,119,0.12)]">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-urbik-rose/10">
              <Lock size={15} className="text-urbik-rose" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-urbik-black leading-snug">
                Iniciá sesión para guardar
              </p>
              <p className="text-xs text-urbik-black/50 mt-0.5">
                Guardá propiedades y accedé a tus favoritos desde cualquier dispositivo.
              </p>
              <Link
                href="/auth/login"
                className="mt-2 inline-block text-xs font-bold text-urbik-black underline underline-offset-2 hover:text-urbik-rose transition-colors"
              >
                Iniciar sesión →
              </Link>
            </div>
            <button
              onClick={onClose}
              className="mt-0.5 shrink-0 text-urbik-black/30 hover:text-urbik-black transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
