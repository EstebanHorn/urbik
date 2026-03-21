/* eslint-disable @next/next/no-img-element */

"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRegisterForm } from "../hooks/useRegister";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import LocationSelectors from "../../../components/LocationSelectors";
import { getJurisdictionsByProvince } from "@/libs/jurisdictions";

export default function RegisterForm() {
  const {
    form,
    handleInputChange,
    handleSubmit,
    handleRoleSelection,
    isLoading,
    updateLicense,
    addLicense,
    removeLicense,
    updateOffice,
    addOffice,
    removeOffice,
  } = useRegisterForm();

  const isAgency = form.role === "REALESTATE";
  const [dialCode, setDialCode] = useState("54");

  const inputStyles =
    "w-full rounded-full px-5 py-3 text-sm outline-none bg-linear-to-r from-gray-100 via-gray-100 to-white focus:ring-2 focus:ring-black/20";
  const labelStyles = "block text-md font-medium mb-2 ml-5 text-urbik-muted";
  const cardTitle = "text-sm font-black text-urbik-black/70 mb-3 uppercase tracking-wider";

  const handleTextOnlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "");

    handleInputChange({
      ...e,
      target: { ...e.target, name, value: filteredValue },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const filteredValue = value.replace(/\D/g, "");
    handleInputChange({
      ...e,
      target: { ...e.target, name, value: filteredValue },
    });
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center text-center mb-10">
        <Link href="/" className="relative w-48 h-20 lg:w-64 lg:h-28 -mb-3">
          <img
            src="/Urbik_Logo_Negro.svg"
            alt="Logo Urbik"
            className="object-contain w-full h-full"
          />
        </Link>
        <h2 className="text-3xl font-display font-bold mb-2">
          {isAgency ? "Registrar Inmobiliaria" : "Crear cuenta"}
        </h2>
        <p className="text-urbik-muted text-sm">Completá tus datos para continuar</p>
      </div>

      <form onSubmit={onFormSubmit} className="space-y-6">
        <div className={isAgency ? "block" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
          <div>
            <label className={labelStyles}>
              {isAgency ? "Nombre de la Inmobiliaria" : "Nombre"}
            </label>
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
                placeholder="Perez"
                required
              />
            </div>
          )}
        </div>

        {isAgency && (
          <div className="space-y-6">
            <div>
              <p className={cardTitle}>Datos de contacto</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyles}>Teléfono</label>
                  <div className="flex gap-2">
                    <div className="w-12">
                      <PhoneInput
                        country={"ar"}
                        value={dialCode}
                        onChange={setDialCode}
                        containerClass="!h-[46px]"
                        inputClass="!hidden"
                        buttonClass="!w-full !h-full !rounded-full !bg-gray-100 !border-none"
                      />
                    </div>
                    <div className="relative flex-1">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        +{dialCode}
                      </span>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleNumericChange}
                        className={`${inputStyles} pl-14`}
                        placeholder="12345678"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className={cardTitle}>Matrículas</p>
              <div className="space-y-4">
                {form.licenses.map((license, index) => {
                  const jurisdictions = getJurisdictionsByProvince(license.province);
                  return (
                    <div key={`license-${index}`} className="border border-gray-200 rounded-3xl p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          value={license.licenseNumber}
                          onChange={(e) => updateLicense(index, "licenseNumber", e.target.value.replace(/\D/g, ""))}
                          placeholder="Número de matrícula"
                          className={inputStyles}
                          required
                        />
                        <input
                          value={license.responsibleName}
                          onChange={(e) => updateLicense(index, "responsibleName", e.target.value)}
                          placeholder="Responsable"
                          className={inputStyles}
                          required
                        />
                      </div>

                      <LocationSelectors
                        provinceValue={license.province}
                        cityValue=""
                        cityLabel="SIN CIUDAD"
                        onChange={(name, val) => {
                          if (name === "province") {
                            updateLicense(index, "province", val);
                            updateLicense(index, "jurisdiction", "");
                          }
                        }}
                      />

                      {jurisdictions.length > 0 && (
                        <select
                          value={license.jurisdiction}
                          onChange={(e) => updateLicense(index, "jurisdiction", e.target.value)}
                          className="w-full rounded-full px-5 py-3 text-sm outline-none bg-linear-to-r from-gray-100 via-gray-100 to-white focus:ring-2 focus:ring-black/20"
                        >
                          <option value="">Seleccionar jurisdicción</option>
                          {jurisdictions.map((jurisdiction) => (
                            <option key={jurisdiction} value={jurisdiction}>
                              {jurisdiction}
                            </option>
                          ))}
                        </select>
                      )}

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs font-bold text-urbik-black/60">
                          <input
                            type="radio"
                            checked={Boolean(license.isPrimary)}
                            onChange={() => updateLicense(index, "isPrimary", true)}
                          />
                          Matrícula principal
                        </label>
                        {form.licenses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLicense(index)}
                            className="text-xs font-bold text-red-500"
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <button type="button" onClick={addLicense} className="text-sm font-bold text-urbik-cyan">
                  + Agregar matrícula
                </button>
              </div>
            </div>

            <div>
              <p className={cardTitle}>Oficinas</p>
              <div className="space-y-4">
                {form.offices.map((office, index) => (
                  <div key={`office-${index}`} className="border border-gray-200 rounded-3xl p-4 space-y-3">
                    <input
                      value={office.name}
                      onChange={(e) => updateOffice(index, "name", e.target.value)}
                      placeholder="Nombre de oficina"
                      className={inputStyles}
                      required
                    />

                    <LocationSelectors
                      provinceValue={office.province}
                      cityValue={office.city}
                      onChange={(name, val) => {
                        if (name === "province") updateOffice(index, "province", val);
                        if (name === "city") updateOffice(index, "city", val);
                      }}
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <input
                        value={office.street}
                        onChange={(e) => updateOffice(index, "street", e.target.value)}
                        placeholder="Calle"
                        className={`${inputStyles} col-span-2`}
                        required
                      />
                      <input
                        value={office.number}
                        onChange={(e) => updateOffice(index, "number", e.target.value)}
                        placeholder="N°"
                        className={inputStyles}
                        required
                      />
                    </div>

                    <input
                      value={office.phone}
                      onChange={(e) => updateOffice(index, "phone", e.target.value.replace(/\D/g, ""))}
                      placeholder="Teléfono oficina"
                      className={inputStyles}
                    />

                    {form.offices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOffice(index)}
                        className="text-xs font-bold text-red-500"
                      >
                        Quitar oficina
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addOffice} className="text-sm font-bold text-urbik-cyan">
                  + Agregar oficina
                </button>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className={labelStyles}>Correo electrónico</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder="email@ejemplo.com"
            className={inputStyles}
            required
          />
        </div>

        <div>
          <label className={labelStyles}>Contraseña</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleInputChange}
            placeholder="********"
            className={inputStyles}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full font-bold py-3 cursor-pointer rounded-full text-lg shadow-sm transition-all mt-10 bg-urbik-cyan text-white hover:opacity-90 disabled:opacity-60"
        >
          {isLoading
            ? "Procesando..."
            : isAgency
              ? "REGISTRAR INMOBILIARIA"
              : "CREAR CUENTA"}
        </button>

        <div className="text-center mt-10">
          <button
            type="button"
            onClick={() => handleRoleSelection(isAgency ? "USER" : "REALESTATE")}
            className="text-urbik-cyan cursor-pointer text-sm font-medium hover:underline"
          >
            {isAgency
              ? "Quiero registrarme como usuario particular"
              : "¿Sos una inmobiliaria? Registrate acá"}
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

