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
  variant?: "white" | "white1" | "white2" | "white3" | "map-layer" | "black" | "mobile-black";
  direction?: "up" | "down" | "responsive";
}

export function CustomDropdown({
  label,
  value,
  options,
  onChange,
  className = "",
  variant = "white",
  direction = "responsive",
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
    black: "text-geora-white",
    white3: "text-geora-black/60",
    white: "bg-geora-white1 text-geora-black hover:bg-geora-white border border-black/70",
    white1: "bg-white/50 text-geora-black/70 hover:bg-white hover:border-black/30 border border-white/70 shadow-md",
    white2:
      "bg-geora-white text-geora-black/70 border border-black/70 hover:bg-geora-dark hover:text-geora-white",
    "map-layer":
      "bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm",
    "mobile-black": 
      "text-geora-white md:bg-geora-white1 md:text-geora-black md:hover:bg-geora-white",
  };

  // Field-style dropdowns (used in forms): full width, left aligned, open downward.
  const isField = variant === "white2" || variant === "white3";

  let positionClasses = "";
  if (isField) {
    positionClasses = "top-full mt-2 left-0 right-0";
  } else if (direction === "up") {
    positionClasses = "bottom-full mb-3 right-0";
  } else if (direction === "down") {
    positionClasses = "top-full mt-3 right-0 md:left-0 md:right-auto";
  } else {
    positionClasses = "bottom-full mb-3 md:bottom-auto md:top-full md:mt-3 right-0 md:left-0 md:right-auto";
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${variantStyles[variant]} h-10 cursor-pointer px-3 md:px-5 py-2 rounded-full tracking-wide transition flex items-center gap-2 ${
          isField
            ? "w-full justify-between min-w-0"
            : "justify-center md:justify-between min-w-10 md:min-w-[120px]"
        } ${variant !== "map-layer" ? "font-bold" : ""}`}
      >
        <span
          className={`text-md tracking-wider flex items-center ${
            isField ? "justify-start text-left truncate" : "justify-center"
          }`}
        >
          {selectedOption ? selectedOption.label : label}
        </span>

        <svg
          className={`${isField ? "block" : "hidden md:block"} w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
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
            className={`absolute ${isField ? "w-full" : "w-56"} rounded-2xl bg-geora-dark border border-white/10 shadow-2xl z-[2000] overflow-hidden ${positionClasses}`}
          >
            {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left cursor-pointer px-5 py-3 text-sm font-medium transition ${
                    opt.value === "logout"
                      ? "text-geora-rose hover:bg-geora-rose/90 hover:text-geora-white"
                      : "text-geora-white hover:bg-white/10"
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