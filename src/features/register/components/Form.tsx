/*
Este código define un componente de React para un formulario de registro dinámico que
adapta sus campos y validaciones según si el usuario es un particular o una inmobiliaria
("REALESTATE"). Utiliza hooks personalizados para gestionar la lógica del estado,
permitiendo filtrar entradas de texto (solo letras) o numéricas en tiempo real, e integra
componentes específicos para la selección de ubicación y el ingreso de números telefónicos
internacionales. Al enviar los datos, el componente concatena el código de país con el
teléfono y procesa el registro, ofreciendo además una interfaz visual pulida con Tailwind
CSS que permite alternar fácilmente entre los dos tipos de roles de usuario.
*/

"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRegisterForm } from "../hooks/useRegister";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import LocationSelectors from "../../../components/LocationSelectors";

export default function RegisterForm() {
  const { form, handleInputChange, handleSubmit, handleRoleSelection } = useRegisterForm();
  const isAgency = form.role === "REALESTATE";
  const [dialCode, setDialCode] = useState("54");

  const isFormInvalid = isAgency && (
    !form.province || 
    !form.city || 
    !form.street?.trim() || 
    !form.address?.trim() ||
    !form.name?.trim() ||
    !form.email?.trim() ||
    !form.password?.trim() ||
    !form.license?.trim() ||
    !form.phone?.trim()
  );

  const inputStyles = "w-full rounded-full px-5 py-3 text-sm outline-none bg-linear-to-r from-gray-100 via-gray-100 to-white focus:ring-2 focus:ring-black/20";
  const labelStyles = "block text-md font-medium mb-2 ml-5 text-urbik-muted";

  const handleTextOnlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "");
    
    handleInputChange({
      ...e,
      target: { ...e.target, name, value: filteredValue }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const filteredValue = value.replace(/\D/g, "");
    handleInputChange({
      ...e,
      target: { ...e.target, name, value: filteredValue }
    } as any);
  };

  const OnFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid) return;

    form.phone = `${dialCode}${form.phone}`;
    handleSubmit(e);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center text-center mb-10">
        <Link href="/" className="relative w-48 h-20 lg:w-64 lg:h-28 -mb-3">
          <Image src="/Urbik_Logo_Negro.svg" alt="Logo Urbik" fill priority className="object-contain" />
        </Link>
        <h2 className="text-3xl font-display font-bold mb-2">
          {isAgency ? "Registrar Inmobiliaria" : "Crear cuenta"}
        </h2>
        <p className="text-urbik-muted text-sm">Completá tus datos para continuar</p>
      </div>

      <form onSubmit={OnFormSubmit} className="space-y-4">
        <div className={isAgency ? "block" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
          <div>
            <label className={labelStyles}>{isAgency ? "Nombre de la Inmobiliaria" : "Nombre"}</label>
            <input 
              name="name" 
              value={form.name} 
              onChange={handleTextOnlyChange} 
              className={inputStyles}
              placeholder={isAgency ? "Urbik Propiedades" : "Juan"} 
              required 
            />
          </div>
          {!isAgency && (
            <div>
              <label className={labelStyles}>Apellido</label>
              <input 
                name="lastName" 
                value={form.lastName || ""} 
                onChange={handleTextOnlyChange} 
                className={inputStyles}
                placeholder="Pérez" 
                required 
              />
            </div>
          )}
        </div>

        {isAgency && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelStyles}>Matrícula</label>
                <input name="license" value={form.license} onChange={handleNumericChange} className={inputStyles} placeholder="12345" required />
              </div>
              <div>
                <label className={labelStyles}>Teléfono</label>
                <div className="flex gap-2">
                  <div className="w-12">
                    <PhoneInput country={"ar"} value={dialCode} onChange={setDialCode} containerClass="!h-[46px]" inputClass="!hidden" buttonClass="!w-full !h-full !rounded-full !bg-gray-100 !border-none" />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+{dialCode}</span>
                    <input name="phone" value={form.phone} onChange={handleNumericChange} className={`${inputStyles} pl-14`} placeholder="12345678" required />
                  </div>
                </div>
              </div>
            </div>
            
            <LocationSelectors 
              provinceValue={form.province} 
              cityValue={form.city} 
              onChange={(name, val) => handleInputChange({ target: { name, value: val } } as any)} 
            />

            <div>
              <label className={labelStyles}>Dirección</label>
              <div className="grid grid-cols-3 gap-2">
                <input 
                  name="street" 
                  value={form.street} 
                  onChange={handleInputChange} 
                  placeholder="Calle" 
                  className={`${inputStyles} col-span-2`} 
                  required
                />
                <input 
                  name="address" 
                  value={form.address} 
                  onChange={handleNumericChange} 
                  placeholder="N°" 
                  className={inputStyles} 
                  required
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className={labelStyles}>Correo electrónico</label>
          <input name="email" type="email" value={form.email} onChange={handleInputChange} placeholder="email@ejemplo.com" className={inputStyles} required />
        </div>
        <div>
          <label className={labelStyles}>Contraseña</label>
          <input name="password" type="password" value={form.password} onChange={handleInputChange} placeholder="********" className={inputStyles} required />
        </div>

        <button 
          type="submit" 
          disabled={isFormInvalid}
          className={`w-full font-bold py-3 cursor-pointer rounded-full text-lg shadow-sm transition-all mt-16 
            ${isFormInvalid 
              ? "bg-gray-300 cursor-not-allowed opacity-70" 
              : "bg-[#00deff] text-white hover:opacity-90"}`}
        >
          {isAgency ? "REGISTRAR INMOBILIARIA" : "CREAR CUENTA"}
        </button>

        <div className="text-center mt-10">
          <button type="button" onClick={() => handleRoleSelection(isAgency ? "USER" : "REALESTATE")} className="text-urbik-cyan cursor-pointer text-sm font-medium hover:underline">
            {isAgency ? "Quiero registrarme como usuario particular" : "¿Sos una inmobiliaria? Registrate acá"}
          </button>
        </div>
        <div className="text-center text-sm text-gray-500">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-urbik-cyan font-medium hover:underline">
            Iniciá sesión
          </Link>
        </div>
      </form>
    </div>
  );
}