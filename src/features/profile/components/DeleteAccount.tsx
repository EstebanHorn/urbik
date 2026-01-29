/*
Este componente de React, llamado DangerZone, implementa una interfaz de seguridad para la eliminación
de cuentas utilizando Framer Motion para animaciones y Lucide para iconos. Su función principal es
mostrar una advertencia visual ("Zona de Eliminación") que, al activarse, despliega un modal interactivo
donde el usuario debe escribir manualmente la frase exacta "ELIMINAR MI CUENTA" para habilitar el botón
de borrado definitivo, asegurando así que la acción sea totalmente consciente e irreversible antes de
ejecutar la función onDelete.
*/

"use client";
import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DangerZoneProps {
  itemName: string;
  onDelete: () => void;
}

const DangerZone = ({ itemName, onDelete }: DangerZoneProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const DELETE_KEYWORD = "ELIMINAR MI CUENTA";

  return (
    <>
      <div className="bg-red-50 p-5 pl-10 rounded-[3rem] border border-red-200">
        <div className="flex items-center gap-3 text-urbik-rose">
          <AlertTriangle size={24} />
          <h3 className="font-display font-bold text-lg uppercase tracking-tight">Zona de Eliminación</h3>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-urbik-rose/70 font-medium max-w-md">
            Si eliminas tu cuenta, se perderán todas tus publicaciones activas. Esta acción es irreversible.
          </p>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="whitespace-nowrap px-5 py-2 border-2 border-urbik-rose text-urbik-rose font-bold rounded-full hover:bg-urbik-rose hover:text-white transition-all shadow-sm"
          >
            Eliminar Cuenta
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowDeleteModal(false)} 
              className="absolute inset-0 bg-urbik-black/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative bg-white w-full max-w-lg p-10 rounded-[3rem] shadow-2xl"
            >
              <div className="" />
              <button onClick={() => setShowDeleteModal(false)} className="absolute top-8 right-8 text-urbik-muted hover:text-urbik-black">
                <X size={28} />
              </button>
              <h3 className="text-2xl text-center font-display font-bold mb-4 text-urbik-black">¿Absolutamente seguro?</h3>
              <div className="bg-red-50 p-5 rounded-2xl border border-red-100 mb-8 text-sm text-urbik-rose font-medium">
                Escribe <span className="text-urbik-rose font-black">"{DELETE_KEYWORD}"</span> para confirmar la eliminación de <span className="font-bold underline">{itemName}</span>.
              </div>
              <input 
                type="text" 
                value={confirmText} 
                onChange={(e) => setConfirmText(e.target.value)} 
                className="w-full px-6 py-4 rounded-2xl border-2 border-red-100 focus:border-urbik-rose outline-none font-bold text-center text-urbik-rose mb-8" 
                placeholder="Escribe aquí..."
              />
              <button 
                disabled={confirmText !== DELETE_KEYWORD} 
                onClick={() => {
                   onDelete();
                   setShowDeleteModal(false);
                }} 
                className={`w-full py-4 rounded-full font-black tracking-tighter transition-all ${confirmText === DELETE_KEYWORD ? "bg-urbik-rose text-white shadow-xl shadow-red-200" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}
              >
                SÍ, ELIMINAR DEFINITIVAMENTE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DangerZone;