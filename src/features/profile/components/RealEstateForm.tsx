/*
Este componente de React es un formulario de edición de perfil profesional para una
inmobiliaria que permite gestionar toda su identidad digital, desde datos básicos
como nombre, teléfono y ubicación (mediante selectores dinámicos), hasta elementos
visuales como logo y banner. Además de centralizar la configuración de redes sociales
y seguridad, el código integra funcionalidades críticas de gestión de cuenta,
permitiendo pausar la actividad del perfil o eliminar la cuenta a través de secciones
especializadas y servicios asíncronos. 
*/

"use client";

import React, { useState, useEffect } from 'react';
import SecuritySection from './ChangePassword';
import DangerZone from './DeleteAccount';
import PauseAccountZone from './PauseAccount';
import LocationSelectors from '../../../components/LocationSelectors';
import { toggleAccountPause } from "@/features/profile/service/profileService";
import { useRouter } from "next/navigation";
import { 
  Building2, Globe, Instagram, ShieldCheck, MapPin, 
  Save, Camera, Lock, Phone 
} from 'lucide-react';

interface RealEstateFormProps {
  form: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleManualChange?: (name: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const RealEstateForm: React.FC<RealEstateFormProps> = ({ form, handleChange, handleSubmit, loading, handleManualChange }) => {
  const router = useRouter();
  const [isPausing, setIsPausing] = useState(false);
useEffect(() => {
  console.log("El estado de la cuenta cambió en el formulario:", form.isActive);
}, [form.isActive]);
  const inputBaseClasses = "italic w-full px-6 py-4 rounded-full bg-urbik-white border border-gray-300 focus:ring-2 focus:ring-urbik-black outline-none transition-all font-medium text-urbik-black placeholder:text-gray-400";
  const readonlyClasses = "bg-urbik-black w-full px-6 py-4 rounded-full bg-urbik-g300 font-bold text-urbik-white cursor-not-allowed select-none";
  const textareaClasses = "w-full px-6 py-4 rounded-[2rem] bg-urbik-white border border-gray-300 focus:ring-2 focus:ring-urbik-black outline-none transition-all font-medium resize-none text-urbik-black";

const handleTogglePause = async (isRequestingPause: boolean) => {
  const nextActiveState = !isRequestingPause; 
  
  setIsPausing(true);
  try {
    const response = await toggleAccountPause(nextActiveState);
    
    if (response && typeof response.isActive !== 'undefined') {
      if (handleManualChange) {
        handleManualChange('isActive', response.isActive);
      }
    }
  } catch (error) {
    console.error("Error en toggle:", error);
    alert("No se pudo cambiar el estado de la cuenta");
  } finally {
    setIsPausing(false);
  }
};

  const onLocationChange = (name: string, value: string) => {
    if (handleManualChange) {
      handleManualChange(name, value);
    } else {
      handleChange({ target: { name, value } } as any);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10">
      
      <div className="p-8 md:p-12 ">
        

        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-urbik-black">
          
          {/* Fila: Nombre Comercial */}
          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">Nombre Comercial</label>
            <input name="name" value={form.name} onChange={handleChange} className={inputBaseClasses} placeholder="Nombre de la inmobiliaria" required />
          </div>

          {/* Fila: Teléfono de Contacto */}
          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">Teléfono de Contacto</label>
            <div className="relative">
              <Phone className="absolute left-6 top-5 text-urbik-black opacity-40" size={18} />
              <input 
                type="tel"
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                className={`${inputBaseClasses} pl-14`} 
                placeholder="+54 9 11 ..." 
              />
            </div>
          </div>

          {/* Fila: Provincia y Ciudad */}
          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">Ubicación</label>
            <LocationSelectors 
              provinceValue={form.province} 
              cityValue={form.city} 
              onChange={onLocationChange} 
            />
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">Dirección de la Oficina</label>
            <div className="relative">
              <MapPin className="absolute left-6 top-5 text-urbik-black opacity-40" size={18} />
              <input name="address" value={form.address} onChange={handleChange} className={`${inputBaseClasses} pl-14`} placeholder="Calle y número..." />
            </div>
          </div>

          {/* Matrícula */}
          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">Matrícula</label>
            <div className="relative">
              <input value={form.license || "MAT-7829-X"} readOnly className={readonlyClasses} />
              <Lock className="absolute right-6 top-5 text-gray-400" size={18} />
            </div>
          </div>
      <SecuritySection />

          {/* Sobre nosotros */}
          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">Sobre nosotros</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} className={textareaClasses} placeholder="Contanos más sobre vos..." />
          </div>

          {/* Redes Sociales en una sola fila para ahorrar espacio si prefieres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">Sitio Web</label>
                <div className="relative">
                  <Globe className="absolute left-6 top-5 text-urbik-black opacity-40" size={18} />
                  <input name="website" value={form.website} onChange={handleChange} className={`${inputBaseClasses} pl-14`} placeholder="www.tuagencia.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">Instagram</label>
                <div className="relative">
                  <Instagram className="absolute left-6 top-5 text-urbik-black opacity-40" size={18} />
                  <input name="instagram" value={form.instagram} onChange={handleChange} className={`${inputBaseClasses} pl-14`} placeholder="@tu.inmo" />
                </div>
              </div>
          </div>
                      <label className="text-right -mb-12 mr-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">Foto de Perfil y Banner</label>

                    {/* --- VISTA PREVIA DE IMÁGENES ACTUALES --- */}
<div className="flex flex-col md:flex-row gap-6 ">
  
  {/* Logo Actual */}
  <div className="flex flex-col items-center gap-3">
    <span className="text-sm font-bold opacity-40 uppercase tracking-widest">Foto Actual</span>
    <div className="w-24 h-24 rounded-full  overflow-hidden bg-urbik-g200 flex items-center justify-center">
      {form.logoUrl ? (
        <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
      ) : (
        <Building2 className="text-urbik-muted opacity-30" size={32} />
      )}
    </div>
  </div>

  {/* Banner Actual */}
  <div className="flex-1 flex flex-col items-center md:items-start gap-3">
    <span className="text-sm font-bold opacity-40 ml-10 uppercase tracking-widest">Banner Actual</span>
    <div className="w-full h-24 rounded-full  overflow-hidden bg-urbik-g200 flex items-center justify-center">
      {form.bannerUrl ? (
        <img src={form.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
      ) : (
        <div className="flex items-center gap-2 text-urbik-muted opacity-30">
          <Camera size={20} />
          <span className="text-xs font-bold">Sin banner configurado</span>
        </div>
      )}
    </div>
  </div>
</div>

          {/* Botones de Imagen */}

          <div className=" flex flex-col sm:flex-row gap-4">
            <button type="button" className="flex-1 py-3 bg-urbik-white border border-dashed border-urbik-black/20 rounded-full text-xs font-bold text-urbik-muted hover:bg-urbik-black hover:text-white transition-all flex items-center justify-center gap-2">
              <Camera size={16} /> Subir Logo
            </button>
            <button type="button" className="flex-1 py-3 bg-urbik-white border border-dashed border-urbik-black/20 rounded-full text-xs font-bold text-urbik-muted hover:bg-urbik-black hover:text-white transition-all flex items-center justify-center gap-2">
              <Camera size={16} /> Banner Perfil
            </button>
          </div>

<div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="px-10 py-5 bg-urbik-black text-white font-bold rounded-full transition-all flex items-center justify-center gap-3 active:scale-95 hover:bg-urbik-emerald shadow-xl"
            >
              {loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
              {!loading && <Save size={20} />}
            </button>
          </div>
        </form>
      </div>
<div className='w-full h-100'></div>
{/* --- NUEVA SECCIÓN DE PAUSA --- */}
      <div className={isPausing ? "opacity-50 pointer-events-none transition-opacity" : ""}>
{/* SECCIÓN DE PAUSA */}
      <div className={`transition-all duration-500 ${isPausing ? "opacity-50 pointer-events-none scale-[0.98]" : "opacity-100"}`}>
<PauseAccountZone
  isPaused={form.isActive === false}
  onTogglePause={(newState) => handleTogglePause(newState)}
/>
      </div>

      </div>
      <DangerZone 
        itemName={`la inmobiliaria ${form?.name || 'sin nombre'}`} 
        onDelete={() => console.log("Cuenta eliminada")} 
      />

    </div>
  );
};

export default RealEstateForm;