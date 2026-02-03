"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CurrencySelector } from "./CurrencySelector";
import { CustomDropdown } from "../../../../components/CustomDropdown";

interface FormFieldsProps {
  form: any;
  setForm: (val: any) => void;
}

export function PropertyFormFields({ form, setForm }: FormFieldsProps) {
  const [opPill, setOpPill] = useState({ width: 0, x: 0 });
  const opRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const val = e.target.type === "number" ? parseFloat(value) : value;
    setForm((prev: any) => ({ ...prev, [name]: val }));
  };

  const updatePill = (id: string, refs: React.MutableRefObject<{[key: string]: HTMLButtonElement | null}>, setter: (val: {width: number, x: number}) => void) => {
    const node = refs.current[id];
    if (node) {
      setter({ width: node.offsetWidth, x: node.offsetLeft });
    }
  };

  useEffect(() => {
    updatePill(form.operationType, opRefs, setOpPill);
  }, [form.operationType]);

  const operationOptions = [
    { id: "SALE", label: "VENTA" },
    { id: "RENT", label: "ALQUILER" },
    { id: "SALE_RENT", label: "AMBOS" },
  ];

  const propertyTypes = [
    { value: "HOUSE", label: "Casa" },
    { value: "APARTMENT", label: "Departamento" },
    { value: "LAND", label: "Terreno" },
    { value: "COMMERCIAL_PROPERTY", label: "Local" },
    { value: "OFFICE", label: "Oficina" },
  ];

  const showSalePrice = form.operationType === "SALE" || form.operationType === "SALE_RENT";
  const showRentPrice = form.operationType === "RENT" || form.operationType === "SALE_RENT";

  return (
    <div className="space-y-8">
      <div className="flex flex-col">
        <label className="block text-md font-bold text-urbik-black/50 mb-2 ml-5">Título del Aviso</label>
        <input
          type="text"
          name="title"
          value={form.title || ""}
          onChange={handleChange}
          placeholder="Ej: Hermoso departamento en Recoleta"
          className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-5 items-end justify-between">
        <div className="flex flex-col w-full md:w-[45%]">
          <label className="block text-md font-bold text-urbik-black/50 mb-3 ml-5">Tipo de Propiedad</label>
          <CustomDropdown
            label="Seleccionar tipo"
            options={propertyTypes}
            value={form.type || ""}
            onChange={(val) => setForm((prev: any) => ({ ...prev, type: val }))}
            className="w-full"
            variant="white2" 
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-md font-bold text-urbik-black/50 mb-3 ml-5">Operación</label>
          <div className="relative flex bg-urbik-white rounded-full w-fit overflow-hidden border border-black/50 focus:border-urbik-black outline-none transition-all">
            <motion.div
              className="absolute top-0 bottom-0 bg-urbik-dark rounded-full border border-black/50"
              initial={false}
              animate={{ width: opPill.width, x: opPill.x }}
            />                     
            {operationOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                ref={(el) => { opRefs.current[opt.id] = el; }}
                onClick={() => setForm((prev: any) => ({ ...prev, operationType: opt.id }))}
                className={`relative cursor-pointer z-10 px-7 py-2.5 text-xs font-bold transition-colors rounded-full ${
                  form.operationType === opt.id ? "text-white" : "text-urbik-black/50 hover:bg-urbik-g400/50"
                }`}
              > 
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        
        {showRentPrice && (
          <div className="flex flex-col w-full">
            <label className="block text-md ml-5 font-bold text-urbik-black/50 mb-2">Precio Alquiler</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="rentPrice"
                value={form.rentPrice || ""}
                onChange={handleChange}
                placeholder="0"
                className="bg-urbik-white text-urbik-black/50 border border-black/50 flex-1 px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
              />
              <CurrencySelector 
                value={form.rentCurrency || ""} 
                onChange={(val) => setForm({ ...form, rentCurrency: val })} 
              />
            </div>
          </div>
        )}

        {showSalePrice && (
          <div className="flex flex-col w-full">
            <label className="block text-md ml-5 font-bold text-urbik-black/50 mb-2">Precio Venta</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="salePrice"
                value={form.salePrice || ""}
                onChange={handleChange}
                placeholder="0"
                className="bg-urbik-white text-urbik-black/50 border border-black/50 flex-1 px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
              />
              <CurrencySelector 
                value={form.saleCurrency || ""} 
                onChange={(val) => setForm({ ...form, saleCurrency: val })} 
              />
            </div>
          </div>
        )}

        <div className="flex flex-col w-full md:w-1/3 mt-2">
          <label className="block text-md ml-5 font-bold text-urbik-black/50 mb-2">M² Totales</label>
          <input
            type="number"
            name="areaM2"
            value={form.areaM2 || ""}
            onChange={handleChange}
            className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-3 rounded-full focus:border-urbik-black outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-md ml-5 font-bold text-urbik-black/50">Ambientes</label>
          <input
            type="number"
            name="rooms"
            value={form.rooms || ""}
            onChange={handleChange}
            className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-2 rounded-full focus:border-urbik-black outline-none transition-all"
          />
        </div>
        <div className="flex-1">
          <label className="block text-md ml-5 font-bold text-urbik-black/50">Baños</label>
          <input
            type="number"
            name="bathrooms"
            value={form.bathrooms || ""}
            onChange={handleChange}
            className="bg-urbik-white text-urbik-black/50 border border-black/50 w-full px-5 py-2 rounded-full focus:border-urbik-black outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full py-4 space-y-1">
        {showSalePrice && form.salePrice > 0 && (
          <span className="text-xl font-black text-urbik-black/70 italic">
            VENTA: {form.saleCurrency} {Number(form.salePrice).toLocaleString()}
          </span>
        )}
        {showRentPrice && form.rentPrice > 0 && (
          <span className="text-xl font-black text-urbik-black/70 italic">
            ALQ: {form.rentCurrency} {Number(form.rentPrice).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}