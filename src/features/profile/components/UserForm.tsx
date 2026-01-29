/*
Define un formulario de edición de perfil profesional y minimalista que permite gestionar
la información personal del usuario (nombre, apellido y teléfono) mediante inputs estilizados,
incluyendo además una sección de seguridad, un botón de guardado con estado de carga y una
"zona de peligro" para acciones críticas como eliminar la cuenta.
*/

import React from 'react';
import { Save, User, UserPlus, Phone, ShieldCheck } from 'lucide-react';
import SecuritySection from './ChangePassword';
import DangerZone from './DeleteAccount';

const UserForm = ({ form, handleChange, handleSubmit, loading }) => {
  const inputBaseClasses = 
    "italic w-full px-6 py-4 rounded-full bg-urbik-white border border-gray-300 " +
    "focus:ring-2 focus:ring-urbik-black outline-none transition-all font-medium text-urbik-black placeholder:text-gray-400";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10">
      <div className="p-8 md:p-12">
        
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-urbik-black p-2 rounded-full text-white">
              <User size={22} />
            </div>
            <h2 className="text-2xl font-display font-bold text-urbik-muted tracking-tight">
              Información Personal
            </h2>
          </div>

        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-urbik-black">
          
          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
              Nombre
            </label>
            <div className="relative">
              <UserPlus className="absolute left-6 top-5 text-urbik-black opacity-40" size={18} />
              <input 
                name="firstName" 
                value={form.firstName || ""} 
                onChange={handleChange} 
                className={`${inputBaseClasses} pl-14`}
                required 
                placeholder="Tu nombre"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
              Apellido
            </label>
            <div className="relative">
              <UserPlus className="absolute left-6 top-5 text-urbik-black opacity-40" size={18} />
              <input 
                name="lastName" 
                value={form.lastName || ""} 
                onChange={handleChange} 
                className={`${inputBaseClasses} pl-14`}
                required 
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
              Teléfono de Contacto
            </label>
            <div className="relative">
              <Phone className="absolute left-6 top-5 text-urbik-black opacity-40" size={18} />
              <input 
                type="tel"
                name="phone" 
                value={form.phone || ""} 
                onChange={handleChange} 
                className={`${inputBaseClasses} pl-14`} 
                placeholder="+54 9 11 ..." 
              />
            </div>
          </div>

          <div className="mt-4">
            <SecuritySection />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`
                px-10 py-5 font-bold rounded-full transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl
                ${loading 
                  ? 'bg-urbik-g300 text-urbik-muted cursor-not-allowed' 
                  : 'bg-urbik-black text-white hover:bg-urbik-emerald'
                }
              `}
            >
              {loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
              {!loading && <Save size={20} />}
            </button>
          </div>
        </form>
      </div>

      <div className="pt-10">
        <DangerZone 
          itemName="tu cuenta personal" 
          onDelete={() => console.log("Usuario eliminado")} 
        />
      </div>
    </div>
  );
};

export default UserForm;