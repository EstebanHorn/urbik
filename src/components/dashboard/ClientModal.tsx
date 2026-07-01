"use client";

import React, { useState, useEffect } from "react";
import { Network, X, Loader2 } from "lucide-react";
import LocationSelectors from "@/components/ui/LocationSelectors";
import {
  type ClientData,
  type ClientRole,
  type SearchParams,
  ROLE_LABELS,
  OPERATION_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  RADIUS_OPTIONS,
  EMPTY_SEARCH,
} from "@/components/dashboard/clientTypes";

export default function ClientModal({ isOpen, onClose, client, properties, onSave }: any) {
  const [formData, setFormData] = useState<Partial<ClientData>>(
    client || { name: "", phone: "", email: "", notes: "", role: "BUYER", linkedPropertyId: "", searchParams: EMPTY_SEARCH }
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormData(
      client
        ? { ...client, searchParams: client.searchParams || EMPTY_SEARCH }
        : { name: "", phone: "", email: "", notes: "", role: "BUYER", linkedPropertyId: "", searchParams: EMPTY_SEARCH }
    );
  }, [isOpen, client]);

  const sp: SearchParams = formData.searchParams || EMPTY_SEARCH;
  const setSp = (patch: Partial<SearchParams>) =>
    setFormData((prev) => ({ ...prev, searchParams: { ...(prev.searchParams || EMPTY_SEARCH), ...patch } }));
  const isRural = sp.propertyType === "FIELD" || sp.propertyType === "LAND";

  // Cambiar el tipo ajusta la unidad de superficie y limpia campos según sea rural/urbano.
  const setPropertyType = (value: string) => {
    const rural = value === "FIELD" || value === "LAND";
    setSp({
      propertyType: value,
      areaUnit: rural ? "HA" : "M2",
      ...(rural ? { minBedrooms: "", minBathrooms: "" } : { radius: "" }),
    });
  };

  // LocationSelectors emite province / city (=departamento) / locality.
  // Mantenemos city = localidad || departamento para el matching.
  const handleLocation = (name: string, value: string) => {
    setFormData((prev) => {
      const cur = prev.searchParams || EMPTY_SEARCH;
      if (name === "province")
        return { ...prev, searchParams: { ...cur, province: value, department: "", locality: "", city: "" } };
      if (name === "city")
        return { ...prev, searchParams: { ...cur, department: value, locality: "", city: value } };
      // locality
      return { ...prev, searchParams: { ...cur, locality: value, city: value || cur.department || "" } };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-0 md:pt-20 md:px-6 md:pb-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full h-full max-w-none rounded-none md:max-w-xl md:h-[80vh] md:rounded-3xl bg-white/70 border border-white flex flex-col shadow-2xl overflow-hidden">
        <div className="flex flex-col shrink-0 bg-white/70">
          <div className="flex items-center justify-between px-8 py-5">
            <h2 className="text-lg font-black text-geora-black">{client ? "Editar cliente" : "Cargar cliente"}</h2>
            <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"><X size={16} /></button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
            <div className="space-y-8 animate-fade-in-up">
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-geora-black/50 uppercase tracking-wider border-b border-geora-black/10 pb-2">Datos Personales</h3>
                <div>
                  <label className="block text-xs font-bold text-geora-black/80 mb-1.5 ml-2">Nombre completo</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-white bg-white/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-geora-black/30 transition-colors shadow-sm" placeholder="Ej. Juan Pérez" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-geora-black/80 mb-1.5 ml-2">Teléfono</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-white bg-white/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-geora-black/30 transition-colors shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-geora-black/80 mb-1.5 ml-2">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border border-white bg-white/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-geora-black/30 transition-colors shadow-sm" />
                  </div>
                </div>

                <div className="bg-white/40 border border-white p-4 rounded-2xl shadow-sm mt-2">
                  <div className="flex items-start gap-3">
                    <div className="bg-geora-black/5 p-2 rounded-full shrink-0"><Network size={16} className="text-geora-black/60" /></div>
                    <div>
                      <p className="text-xs font-bold text-geora-black/80 mb-1">Conexión con Geora automatizada</p>
                      <p className="text-[11px] font-medium text-geora-black/60 leading-relaxed">
                        Al guardar, validaremos si el email ingresado ya posee una cuenta en Geora.
                        De ser así, se enviará una solicitud y el cliente quedará en estado <span className="font-bold text-amber-600">PENDIENTE</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-geora-black/50 uppercase tracking-wider border-b border-geora-black/10 pb-2">Tipo y Relación</h3>
                <div>
                  <label className="block text-xs font-bold text-geora-black/80 mb-1.5 ml-2">Rol del Cliente</label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-white/40 rounded-2xl border border-white">
                    {(["BUYER", "OWNER", "RENTER"] as ClientRole[]).map((role) => (
                      <button key={role} type="button" onClick={() => setFormData({ ...formData, role })} className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${formData.role === role ? "bg-geora-black text-white shadow-md" : "bg-transparent text-geora-black/60 hover:bg-white/50"}`}>
                        {ROLE_LABELS[role]}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.role === "OWNER" && (
                  <div className="bg-white/40 p-4 rounded-2xl border border-white">
                    <label className="block text-[10px] font-bold text-geora-black/50 mb-1.5 ml-2 uppercase">Propiedad Asociada</label>
                    <select value={formData.linkedPropertyId || ""} onChange={(e) => { const prop = properties.find((p: any) => p.id === e.target.value); setFormData({ ...formData, linkedPropertyId: e.target.value, linkedPropertyTitle: prop ? prop.title : "" }); }} className="w-full border border-white bg-white/60 rounded-xl px-4 py-3 text-sm focus:outline-none appearance-none shadow-sm">
                      <option value="">Seleccionar propiedad de la cartera...</option>
                      {properties.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                )}
              </section>

              {(formData.role === "BUYER" || formData.role === "RENTER") && (
                <section className="space-y-4">
                  <div className="border-b border-geora-black/10 pb-2">
                    <h3 className="text-sm font-bold text-geora-black/50 uppercase tracking-wider">Parámetros de Búsqueda</h3>
                    <p className="text-[11px] font-medium text-geora-black/50 mt-1">Al guardar, buscamos coincidencias en tu propio stock.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-geora-black/60 uppercase mb-1.5 ml-1">Operación</label>
                      <select value={sp.operationType} onChange={(e) => setSp({ operationType: e.target.value })} className="w-full border border-white bg-white/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none shadow-sm">
                        {OPERATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-geora-black/60 uppercase mb-1.5 ml-1">Tipo</label>
                      <select value={sp.propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full border border-white bg-white/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none shadow-sm">
                        {PROPERTY_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-geora-black/60 uppercase mb-1.5 ml-1">Zona de búsqueda</label>
                    <LocationSelectors
                      provinceValue={sp.province || ""}
                      cityValue={sp.department || ""}
                      localityValue={sp.locality || ""}
                      onChange={handleLocation}
                      showLocality
                      provinceLabel="Provincia"
                      cityLabel="Departamento"
                      localityLabel="Ciudad / Localidad"
                    />
                  </div>

                  {isRural && (
                    <div>
                      <label className="block text-[10px] font-bold text-geora-black/60 uppercase mb-2 ml-1">Radio de búsqueda (rural)</label>
                      <div className="flex flex-wrap gap-2">
                        {RADIUS_OPTIONS.map((o) => (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() => setSp({ radius: o.value })}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                              (sp.radius || "") === o.value
                                ? "bg-geora-black text-white border-geora-black"
                                : "bg-white/60 text-geora-black/60 border-white hover:border-geora-black/30"
                            }`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isRural && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-geora-black/60 uppercase mb-1.5 ml-1">Dormitorios (mín.)</label>
                        <select value={sp.minBedrooms || ""} onChange={(e) => setSp({ minBedrooms: e.target.value })} className="w-full border border-white bg-white/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none shadow-sm">
                          <option value="">Indistinto</option>
                          {["1", "2", "3", "4", "5"].map((n) => <option key={n} value={n}>{n}+</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-geora-black/60 uppercase mb-1.5 ml-1">Baños (mín.)</label>
                        <select value={sp.minBathrooms || ""} onChange={(e) => setSp({ minBathrooms: e.target.value })} className="w-full border border-white bg-white/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none shadow-sm">
                          <option value="">Indistinto</option>
                          {["1", "2", "3", "4"].map((n) => <option key={n} value={n}>{n}+</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-geora-black/60 uppercase mb-1.5 ml-1">Superficie ({isRural ? "ha" : "m²"})</label>
                    <div className="flex gap-2">
                      <input type="number" value={sp.minArea} onChange={(e) => setSp({ minArea: e.target.value })} placeholder="Desde" className="w-1/3 border border-white bg-white/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none shadow-sm" />
                      <input type="number" value={sp.maxArea} onChange={(e) => setSp({ maxArea: e.target.value })} placeholder="Hasta" className="w-1/3 border border-white bg-white/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none shadow-sm" />
                      <select value={sp.areaUnit} onChange={(e) => setSp({ areaUnit: e.target.value })} className="w-1/3 border border-white bg-white/60 rounded-xl px-2 py-2.5 text-sm focus:outline-none shadow-sm">
                        <option value="M2">m²</option>
                        <option value="HA">ha</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-geora-black/60 uppercase mb-1.5 ml-1">Rango de precio</label>
                    <div className="flex gap-2">
                      <input type="number" value={sp.minPrice} onChange={(e) => setSp({ minPrice: e.target.value })} placeholder="Desde" className="w-1/3 border border-white bg-white/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none shadow-sm" />
                      <input type="number" value={sp.maxPrice} onChange={(e) => setSp({ maxPrice: e.target.value })} placeholder="Hasta" className="w-1/3 border border-white bg-white/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none shadow-sm" />
                      <select value={sp.currency} onChange={(e) => setSp({ currency: e.target.value })} className="w-1/3 border border-white bg-white/60 rounded-xl px-2 py-2.5 text-sm focus:outline-none shadow-sm">
                        <option value="USD">USD</option>
                        <option value="ARS">ARS</option>
                      </select>
                    </div>
                  </div>
                </section>
              )}

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-geora-black/50 uppercase tracking-wider border-b border-geora-black/10 pb-2">Notas Internas</h3>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={4} className="w-full border border-white bg-white/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-geora-black/30 resize-none transition-colors shadow-sm custom-scrollbar" placeholder="Preferencias o disponibilidad..." />
              </section>
            </div>
          </div>
        </div>

        <div className="px-8 py-4 shrink-0 flex items-center justify-between gap-4 bg-white/70 border-t border-white/40">
          <button type="button" onClick={onClose} disabled={saving} className="px-6 py-3 text-geora-black/80 font-bold hover:text-geora-black transition-colors cursor-pointer text-left w-auto disabled:opacity-50">CANCELAR</button>
          <button type="button" disabled={saving} onClick={async () => { setSaving(true); try { await onSave(formData); } finally { setSaving(false); } }} className="px-6 py-3 text-geora-black/80 font-bold hover:text-geora-black transition-colors cursor-pointer text-right w-auto disabled:opacity-50 flex items-center gap-2">{saving && <Loader2 size={15} className="animate-spin" />}{saving ? "GUARDANDO..." : "GUARDAR CLIENTE"}</button>
        </div>
      </div>
    </div>
  );
}
