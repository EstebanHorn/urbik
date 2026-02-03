/*
Este código define un componente de React llamado CurrencySelector que funciona como un
interruptor visual o "toggle" para seleccionar entre dos divisas, USD y ARS. Utiliza la
librería Framer Motion para animar un fondo oscuro que se desliza horizontalmente según la
opción activa, proporcionando una transición suave entre los estados. El componente recibe
por "props" el valor seleccionado y una función para actualizarlo, gestionando la interfaz 
mediante dos botones posicionados sobre un contenedor con bordes redondeados donde los estilos
de texto cambian dinámicamente para resaltar la moneda elegida.
*/

import React from "react";
import { motion } from "framer-motion";

interface CurrencySelectorProps {
  value: "USD" | "ARS";
  onChange: (val: "USD" | "ARS") => void;
}

export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  return (
          <div className="relative flex bg-urbik-white rounded-full w-fit overflow-hidden  border border-black/50 focus:border-urbik-black outline-none transition-all">
      <motion.div
        className="absolute top-0 bottom-0 left-0 bg-urbik-dark rounded-full border border-black/50"
        initial={false}
        animate={{ x: value === "USD" ? "0%" : "100%" }}
        style={{ width: "50%" }}
      />
      <button
        type="button"
        onClick={() => onChange("USD")}
        className={`relative z-10 px-8 cursor-pointer py-2.5 font-bold text-sm rounded-full transition-colors flex-1  ${
          value === "USD" ? "text-urbik-g100" : "text-urbik-dark/50 hover:bg-urbik-g400/50 "
        }`}
      >
        USD
      </button>
      <button
        type="button"
        onClick={() => onChange("ARS")}
        className={`relative z-10 cursor-pointer px-8 py-2.5 font-bold text-sm rounded-full transition-colors flex-1 ${
          value === "ARS" ? "text-urbik-g100" : "text-urbik-muted hover:bg-urbik-g400/50"
        }`}
      >
        ARS
      </button>
    </div>
  );
}