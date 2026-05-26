"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label: React.ReactNode;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
  variant?: "white" | "white2" | "map-layer" | "black" | "mobile-black"; 
}

export function CustomDropdown({
  label,
  value,
  options,
  onChange,
  className = "",
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
    black: "text-urbik-white",
    white3: "text-urbik-black/60",
    white: "bg-urbik-white1 text-urbik-black hover:bg-urbik-white border border-black/70",
    white2:
      "bg-urbik-white text-urbik-black/70 border border-black/70 hover:bg-urbik-dark hover:text-urbik-white",
    "map-layer":
      "bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm",
    "mobile-black": 
      "text-urbik-white md:bg-urbik-white1 md:text-urbik-black md:hover:bg-urbik-white",
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${variantStyles[variant]} h-10 cursor-pointer px-3 md:px-5 py-2 rounded-full tracking-wide transition flex items-center justify-center md:justify-between gap-2 min-w-10 md:min-w-[120px] ${
          variant !== "map-layer" ? "font-extrabold" : ""
        }`}
      >
        <span className="text-md tracking-wider flex items-center justify-center">
          {selectedOption ? selectedOption.label : label}
        </span>
        
        <svg
          className={`hidden md:block w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`absolute w-56 rounded-2xl bg-urbik-dark border border-white/10 shadow-2xl z-[2000] overflow-hidden bottom-full mb-3 md:bottom-auto md:top-full md:mt-3 right-0 md:left-0 md:right-auto`}
          >
            {options
              .filter((opt) => opt.value !== "")
              .map((opt) => (
                <button
                  key={opt.value}
                  type="button"
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