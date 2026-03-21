"use client";

import React, { useState } from "react";
import SecuritySection from "./ChangePassword";
import DangerZone from "./DeleteAccount";
import PauseAccountZone from "./PauseAccount";
import LocationSelectors from "../../../components/LocationSelectors";
import ProfileMediaUploader from "./ProfileMediaUploader";
import { toggleAccountPause } from "@/features/profile/service/profileService";
import { getJurisdictionsByProvince } from "@/libs/jurisdictions";
import { Globe, Instagram, MapPin, Save, Phone } from "lucide-react";

export interface RealEstateFormData {
  agencyName: string;
  phone: string;
  address: string;
  license: string;
  bio: string;
  website: string;
  instagram: string;
  province: string;
  city: string;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  licenses?: Array<{
    id?: number;
    licenseNumber: string;
    province: string;
    jurisdiction?: string;
    responsibleName: string;
    isPrimary?: boolean;
  }>;
  offices?: Array<{
    id?: number;
    name: string;
    province: string;
    city: string;
    street: string;
    number: string;
    phone?: string;
  }>;
  isActive: boolean;
  [key: string]: unknown;
}

interface RealEstateFormProps {
  form: RealEstateFormData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleManualChange?: (
    name: string,
    value:
      | string
      | boolean
      | number
      | null
      | Array<{
          id?: number;
          licenseNumber: string;
          province: string;
          jurisdiction?: string;
          responsibleName: string;
          isPrimary?: boolean;
        }>
      | Array<{
          id?: number;
          name: string;
          province: string;
          city: string;
          street: string;
          number: string;
          phone?: string;
        }>,
  ) => void;
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
  const [isPausing, setIsPausing] = useState(false);

  const inputBaseClasses =
    "italic w-full px-6 py-4 rounded-full bg-urbik-white border border-gray-300 focus:ring-2 focus:ring-urbik-black outline-none transition-all font-medium text-urbik-black placeholder:text-gray-400";
  const textareaClasses =
    "w-full px-6 py-4 rounded-4xl bg-urbik-white border border-gray-300 focus:ring-2 focus:ring-urbik-black outline-none transition-all font-medium resize-none text-urbik-black";

  const licenses = form.licenses || [];
  const offices = form.offices || [];

  const handleTogglePause = async (isRequestingPause: boolean) => {
    const nextActiveState = !isRequestingPause;
    setIsPausing(true);
    try {
      const response = await toggleAccountPause(nextActiveState);
      if (response && typeof response.isActive !== "undefined") {
        handleManualChange?.("isActive", response.isActive);
      }
    } catch (error) {
      console.error("Error en toggle:", error);
      alert("No se pudo cambiar el estado de la cuenta");
    } finally {
      setIsPausing(false);
    }
  };

  const onLocationChange = (name: string, value: string) => {
    handleManualChange?.(name, value);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10">
      <div className="p-8 md:p-12">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 text-urbik-black"
        >
          <div className="bg-white rounded-[2rem] border border-urbik-g200 shadow-sm overflow-hidden relative mb-4">
            <div className="h-48 md:h-64 w-full bg-urbik-g50 relative">
              <ProfileMediaUploader
                variant="banner"
                currentUrl={form.bannerUrl || ""}
                onImageChange={(url) => handleManualChange?.("bannerUrl", url)}
                disabled={loading}
              />
            </div>

            <div className="px-8 pb-6 relative">
              <div className="relative -mt-16 mb-4 w-32 h-32 md:w-40 md:h-40 z-10">
                <ProfileMediaUploader
                  variant="logo"
                  currentUrl={form.logoUrl || ""}
                  onImageChange={(url) => handleManualChange?.("logoUrl", url)}
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-display font-bold text-urbik-black">
                    {form.agencyName || "Tu Inmobiliaria"}
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

          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
              Nombre Comercial
            </label>
            <input
              name="agencyName"
              value={form.agencyName || ""}
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

          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
              Ubicación
            </label>
            <LocationSelectors
              provinceValue={form.province || ""}
              cityValue={form.city || ""}
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
              <MapPin className="absolute left-6 top-5 text-urbik-black opacity-40" size={18} />
              <input
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                className={`${inputBaseClasses} pl-14`}
                placeholder="Calle y número..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
              Matrículas
            </label>
            <div className="space-y-3">
              {licenses.map((license, index) => {
                const jurisdictions = getJurisdictionsByProvince(license.province);
                return (
                  <div key={`license-${index}`} className="rounded-3xl border border-gray-200 p-4 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        className={inputBaseClasses}
                        value={license.licenseNumber}
                        onChange={(e) =>
                          handleManualChange?.(
                            "licenses",
                            licenses.map((item, i) =>
                              i === index ? { ...item, licenseNumber: e.target.value } : item,
                            ),
                          )
                        }
                        placeholder="Número de matrícula"
                      />
                      <input
                        className={inputBaseClasses}
                        value={license.responsibleName}
                        onChange={(e) =>
                          handleManualChange?.(
                            "licenses",
                            licenses.map((item, i) =>
                              i === index ? { ...item, responsibleName: e.target.value } : item,
                            ),
                          )
                        }
                        placeholder="Responsable"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        className={inputBaseClasses}
                        value={license.province}
                        onChange={(e) =>
                          handleManualChange?.(
                            "licenses",
                            licenses.map((item, i) =>
                              i === index
                                ? { ...item, province: e.target.value, jurisdiction: "" }
                                : item,
                            ),
                          )
                        }
                        placeholder="Provincia"
                      />

                      {jurisdictions.length > 0 ? (
                        <select
                          className={inputBaseClasses}
                          value={license.jurisdiction || ""}
                          onChange={(e) =>
                            handleManualChange?.(
                              "licenses",
                              licenses.map((item, i) =>
                                i === index ? { ...item, jurisdiction: e.target.value } : item,
                              ),
                            )
                          }
                        >
                          <option value="">Seleccionar jurisdicción</option>
                          {jurisdictions.map((jurisdiction) => (
                            <option key={jurisdiction} value={jurisdiction}>
                              {jurisdiction}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className={inputBaseClasses}
                          value={license.jurisdiction || ""}
                          onChange={(e) =>
                            handleManualChange?.(
                              "licenses",
                              licenses.map((item, i) =>
                                i === index ? { ...item, jurisdiction: e.target.value } : item,
                              ),
                            )
                          }
                          placeholder="Jurisdicción (opcional)"
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                className="text-sm font-bold text-urbik-cyan"
                onClick={() =>
                  handleManualChange?.("licenses", [
                    ...licenses,
                    {
                      licenseNumber: "",
                      province: form.province || "",
                      jurisdiction: "",
                      responsibleName: "",
                      isPrimary: licenses.length === 0,
                    },
                  ])
                }
              >
                + Agregar matrícula
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
              Oficinas
            </label>
            <div className="space-y-3">
              {offices.map((office, index) => (
                <div key={`office-${index}`} className="rounded-3xl border border-gray-200 p-4 space-y-2">
                  <input
                    className={inputBaseClasses}
                    value={office.name}
                    onChange={(e) =>
                      handleManualChange?.(
                        "offices",
                        offices.map((item, i) =>
                          i === index ? { ...item, name: e.target.value } : item,
                        ),
                      )
                    }
                    placeholder="Nombre oficina"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={inputBaseClasses}
                      value={office.province}
                      onChange={(e) =>
                        handleManualChange?.(
                          "offices",
                          offices.map((item, i) =>
                            i === index ? { ...item, province: e.target.value } : item,
                          ),
                        )
                      }
                      placeholder="Provincia"
                    />
                    <input
                      className={inputBaseClasses}
                      value={office.city}
                      onChange={(e) =>
                        handleManualChange?.(
                          "offices",
                          offices.map((item, i) =>
                            i === index ? { ...item, city: e.target.value } : item,
                          ),
                        )
                      }
                      placeholder="Ciudad"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="text-sm font-bold text-urbik-cyan"
                onClick={() =>
                  handleManualChange?.("offices", [
                    ...offices,
                    {
                      name: "Sucursal",
                      province: form.province || "",
                      city: form.city || "",
                      street: "",
                      number: "",
                      phone: "",
                    },
                  ])
                }
              >
                + Agregar oficina
              </button>
            </div>
          </div>

          <SecuritySection />

          <div className="space-y-2">
            <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
              Sobre nosotros
            </label>
            <textarea
              name="bio"
              value={form.bio || ""}
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
                <Globe className="absolute left-6 top-5 text-urbik-black opacity-40" size={18} />
                <input
                  name="website"
                  value={form.website || ""}
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
                <Instagram className="absolute left-6 top-5 text-urbik-black opacity-40" size={18} />
                <input
                  name="instagram"
                  value={form.instagram || ""}
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

      <div className={isPausing ? "opacity-50 pointer-events-none transition-opacity" : ""}>
        <PauseAccountZone
          isPaused={form.isActive === false}
          onTogglePause={(newState) => handleTogglePause(newState)}
        />
      </div>

      <DangerZone
        itemName={`la inmobiliaria ${form?.agencyName || "sin nombre"}`}
        onDelete={() => console.log("Cuenta eliminada")}
      />
    </div>
  );
};

export default RealEstateForm;
