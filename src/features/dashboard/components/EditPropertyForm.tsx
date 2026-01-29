/*
Este componente de React define un formulario para la edición de propiedades inmobiliarias
que gestiona dinámicamente sus opciones de estado mediante la función getStatusOptions, la
cual adapta las etiquetas disponibles (como "Vendida" o "Alquilada") según el tipo de operación
seleccionado (Venta, Alquiler o ambos). El código utiliza un patrón de estado y acciones recibidos
por props para vincular campos de selección, entradas numéricas de características físicas (precio,
metros cuadrados, ambientes) y áreas de texto con la lógica de negocio de la aplicación. Visualmente,
el formulario emplea Tailwind CSS para aplicar un diseño responsivo de dos columnas con validación
visual simple, como el cambio de color de fondo en el selector de estado cuando la propiedad está
marcada como disponible.
*/

import React from "react";

export const EditPropertyForm = ({ state, actions }: any) => {
  const getStatusOptions = () => {
    const base = [{ val: "AVAILABLE", label: "Disponible" }, { val: "PAUSED", label: "Pausada" }];
    if (state.operationType === "SALE") return [...base, { val: "SOLD", label: "Vendida" }];
    if (state.operationType === "RENT") return [...base, { val: "RENTED", label: "Alquilada" }];
    return [...base, { val: "SOLD", label: "Vendida" }, { val: "RENTED", label: "Alquilada" }];
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 grid grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2">TIPO DE OPERACIÓN</label>
          <select value={state.operationType} onChange={(e) => actions.setOperationType(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 bg-white font-bold text-sm outline-none focus:border-[#00F0FF]">
            <option value="SALE">Venta</option>
            <option value="RENT">Alquiler</option>
            <option value="SALE_RENT">Venta y Alquiler</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2">ESTADO ACTUAL</label>
          <select value={state.status} onChange={(e) => actions.setStatus(e.target.value)} className={`w-full p-3 rounded-xl border border-gray-200 font-bold text-sm outline-none focus:border-[#00F0FF] ${state.status === "AVAILABLE" ? "text-green-600 bg-green-50" : "text-gray-900 bg-white"}`}>
            {getStatusOptions().map((opt) => (
              <option key={opt.val} value={opt.val}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-4">
        <input value={state.title} onChange={(e) => actions.setTitle(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Título" />
        <div className="grid grid-cols-2 gap-4">
          <input type="number" value={state.price} onChange={(e) => actions.setPrice(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Precio (USD)" />
          <input type="number" value={state.areaM2} onChange={(e) => actions.setAreaM2(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Superficie (m²)" />
          <input type="number" value={state.rooms} onChange={(e) => actions.setRooms(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Ambientes" />
          <input type="number" value={state.bathrooms} onChange={(e) => actions.setBathrooms(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Baños" />
        </div>
        <textarea value={state.description} onChange={(e) => actions.setDescription(e.target.value)} className="w-full p-3 border rounded-xl min-h-[120px]" placeholder="Descripción" />
      </div>
    </div>
  );
};