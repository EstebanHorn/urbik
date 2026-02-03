/*
Este componente de React, denominado AmenitiesGrid, genera una interfaz interactiva de cuadrícula
para seleccionar y deseleccionar servicios básicos (como agua, luz o internet) mediante botones de
tipo conmutador. Utiliza TypeScript para definir una estructura de datos booleana y recibe a través
de sus "props" el estado actual de estos servicios y una función onChange para actualizarlos.
Internamente, define una función toggle que invierte el valor de una propiedad específica sin mutar
el objeto original, y renderiza un subcomponente Item para cada servicio que cambia dinámicamente su
apariencia visual (colores de fondo, bordes y un indicador circular) basándose en si el servicio está
activo o no.
*/

import React from "react";

interface Amenities {
  agua: boolean;
  luz: boolean;
  gas: boolean;
  internet: boolean;
  cochera: boolean;
  pileta: boolean;
}

interface AmenitiesGridProps {
  value: Amenities;
  onChange: (next: Amenities) => void;
}

export function AmenitiesGrid({ value, onChange }: AmenitiesGridProps) {
  const toggle = (k: keyof Amenities) => {
    onChange({ ...value, [k]: !value[k] });
  };

  const Item = ({ k, label }: { k: keyof Amenities; label: string }) => (
    <button
      type="button"
      onClick={() => toggle(k)}
      className={`rounded-full border cursor-pointer  w-full focus:border-urbik-black outline-none transition-all px-4 py-2.5 text-left text-sm font-medium transition flex justify-between items-center group ${
        value[k]
          ? "border-black/50 bg-urbik-black text-white shadow-md"
          : "border-black/20 bg-urbik-white text-urbik-black/50 hover:bg-gray-50"
      }`}
    >
          

      <span>{label}</span>
      <div
        className={`w-2 h-2 rounded-full ${
          value[k] ? "bg-urbik-rose" : "bg-gray-200 group-hover:bg-gray-300"
        }`}
      />
    </button>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      
      <Item k="agua" label="Agua Corriente" />
      <Item k="luz" label="Luz Eléctrica" />
      <Item k="gas" label="Gas Natural" />
      <Item k="internet" label="Internet" />
      <Item k="cochera" label="Cochera" />
      <Item k="pileta" label="Pileta" />
    </div>
  );
}