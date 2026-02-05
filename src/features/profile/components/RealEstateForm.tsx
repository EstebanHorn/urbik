"use client";

import React, { useState, useEffect } from "react";
import SecuritySection from "./ChangePassword";
import DangerZone from "./DeleteAccount";
import PauseAccountZone from "./PauseAccount";
import LocationSelectors from "../../../components/LocationSelectors";
import ProfileMediaUploader from "./ProfileMediaUploader"; // <--- IMPORTAR EL NUEVO COMPONENTE
import { toggleAccountPause } from "@/features/profile/service/profileService";
import { useRouter } from "next/navigation";
import { Globe, Instagram, MapPin, Save, Lock, Phone } from "lucide-react";

interface RealEstateFormProps {
  form: any;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleManualChange?: (name: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const RealEstateForm: React.FC<RealEstateFormProps> = ({
  form,
  handleChange,
  handleSubmit,
  loading,
  handleManualChange,
}) => {
  const router = useRouter();
  const [isPausing, setIsPausing] = useState(false);

  useEffect(() => {
    console.log("Status changed:", form.isActive);
  }, [form.isActive]);

  const inputBaseClasses =
    "italic w-full px-6 py-4 rounded-full bg-urbik-white border border-gray-300 focus:ring-2 focus:ring-urbik-black outline-none transition-all font-medium text-urbik-black placeholder:text-gray-400";
  const readonlyClasses =
    "bg-urbik-black w-full px-6 py-4 rounded-full bg-urbik-g300 font-bold text-urbik-white cursor-not-allowed select-none";
  const textareaClasses =
    "w-full px-6 py-4 rounded-[2rem] bg-urbik-white border border-gray-300 focus:ring-2 focus:ring-urbik-black outline-none transition-all font-medium resize-none text-urbik-black";

  const handleTogglePause = async (isRequestingPause: boolean) => {
    const nextActiveState = !isRequestingPause;
    setIsPausing(true);
    try {
      const response = await toggleAccountPause(nextActiveState);
      if (response && typeof response.isActive !== "undefined") {
        if (handleManualChange) {
          handleManualChange("isActive", response.isActive);
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
      <div className="p-8 md:p-12">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 text-urbik-black"
        >
          {/* --- SECCIÓN VISUAL (BANNER + LOGO) --- */}
          {/* Contenedor principal con estilo de tarjeta */}
          <div className="bg-white rounded-[2rem] border border-urbik-g200 shadow-sm overflow-hidden relative mb-4">
            {/* 1. AREA DEL BANNER */}
            <div className="h-48 md:h-64 w-full bg-urbik-g50 relative">
              <ProfileMediaUploader
                variant="banner"
                currentUrl={form.bannerUrl}
                onImageChange={(url) => handleManualChange?.("bannerUrl", url)}
                disabled={loading}
              />
            </div>

            {/* 2. AREA DEL LOGO (Superpuesta) */}
            <div className="px-8 pb-6 relative">
              <div className="relative -mt-16 mb-4 w-32 h-32 md:w-40 md:h-40 z-10">
                <ProfileMediaUploader
                  variant="logo"
                  currentUrl={form.logoUrl}
                  onImageChange={(url) => handleManualChange?.("logoUrl", url)}
                  disabled={loading}
                />
              </div>

              {/* Información de cabecera */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-display font-bold text-urbik-black">
                    {form.name || "Tu Inmobiliaria"}
                  </h2>
                  <div className="text-urbik-muted font-medium flex items-center gap-2 mt-1 text-sm">
                    <span
                      className={`w-2 h-2 rounded-full ${form.isActive ? "bg-green-500" : "bg-yellow-500"}`}
                    />
                    {form.isActive ? "Perfil Visible" : "Perfil Oculto"}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* --- FIN SECCIÓN VISUAL --- */}

          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
              Nombre Comercial
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputBaseClasses}
              placeholder="Nombre de la inmobiliaria"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
              Teléfono de Contacto
            </label>
            <div className="relative">
              <Phone
                className="absolute left-6 top-5 text-urbik-black opacity-40"
                size={18}
              />
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

          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
              Ubicación
            </label>
            <LocationSelectors
              provinceValue={form.province}
              cityValue={form.city}
              onChange={onLocationChange}
              provinceLabel="Provincia"
              cityLabel={form.city}
            />
          </div>

          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
              Dirección de la Oficina
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-6 top-5 text-urbik-black opacity-40"
                size={18}
              />
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className={`${inputBaseClasses} pl-14`}
                placeholder="Calle y número..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
              Matrícula
            </label>
            <div className="relative">
              <input
                value={form.license || "MAT-7829-X"}
                readOnly
                className={readonlyClasses}
              />
              <Lock
                className="absolute right-6 top-5 text-gray-400"
                size={18}
              />
            </div>
          </div>

          <SecuritySection />

          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
              Sobre nosotros
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className={textareaClasses}
              placeholder="Contanos más sobre vos..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
                Sitio Web
              </label>
              <div className="relative">
                <Globe
                  className="absolute left-6 top-5 text-urbik-black opacity-40"
                  size={18}
                />
                <input
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className={`${inputBaseClasses} pl-14`}
                  placeholder="www.tuagencia.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
                Instagram
              </label>
              <div className="relative">
                <Instagram
                  className="absolute left-6 top-5 text-urbik-black opacity-40"
                  size={18}
                />
                <input
                  name="instagram"
                  value={form.instagram}
                  onChange={handleChange}
                  className={`${inputBaseClasses} pl-14`}
                  placeholder="@tu.inmo"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-5 bg-urbik-black cursor-pointer text-white font-bold rounded-full transition-all flex items-center justify-center gap-3 active:scale-95 hover:bg-urbik-emerald shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
              {!loading && <Save size={20} />}
            </button>
          </div>
        </form>
      </div>

      <div className="w-full h-24"></div>

      <div
        className={
          isPausing ? "opacity-50 pointer-events-none transition-opacity" : ""
        }
      >
        <div
          className={`transition-all duration-500 ${isPausing ? "opacity-50 pointer-events-none scale-[0.98]" : "opacity-100"}`}
        >
          <PauseAccountZone
            isPaused={form.isActive === false}
            onTogglePause={(newState) => handleTogglePause(newState)}
          />
        </div>
      </div>

      <DangerZone
        itemName={`la inmobiliaria ${form?.name || "sin nombre"}`}
        onDelete={() => console.log("Cuenta eliminada")}
      />
    </div>
  );
};

export default RealEstateForm;
