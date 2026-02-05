/*
Este código define un componente de React llamado CustomDropdown, un selector desplegable personalizado
y animado que permite al usuario elegir una opción de una lista mediante una interfaz moderna. Utiliza
Framer Motion para gestionar las transiciones de apertura y cierre, Tailwind CSS para un diseño estilizado
con soporte para múltiples variantes visuales, y hooks como useRef y useEffect para detectar clics fuera
del componente y cerrarlo automáticamente, garantizando así una experiencia de usuario fluida y funcional.
*/

"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
  variant?: "white" | "white2";
}

export function CustomDropdown({
  label,
  value,
  options,
  onChange,
  className,
  variant = "white",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(
    (opt) => opt.value === value && opt.value !== "",
  );

  const variantStyles = {
    white: "bg-urbik-white1 text-urbik-black hover:bg-urbik-white",
    white2:
      "bg-urbik-white text-urbik-black/50 border border-black/50 hover:bg-urbik-dark/20",
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${variantStyles[variant]} h-10 cursor-pointer px-5 py-2 rounded-full font-extrabold tracking-wide transition flex items-center gap-2 min-w-[120px] justify-between`}
      >
        <span className="text-md tracking-wider">
          {selectedOption ? selectedOption.label : label}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-3 w-56 rounded-2xl bg-urbik-dark border border-white/10 shadow-2xl z-1001 overflow-hidden"
          >
            {options
              .filter((opt) => opt.value !== "")
              .map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left cursor-pointer px-5 py-3 text-sm font-medium transition ${
                    opt.value === "logout"
                      ? "text-urbik-rose hover:bg-urbik-rose/90 hover:text-urbik-white"
                      : "text-urbik-white hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
