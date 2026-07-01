"use client";
import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, type LucideIcon } from "lucide-react";

export interface KebabMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface KebabMenuProps {
  items: KebabMenuItem[];
  className?: string;
}

export default function KebabMenu({ items, className = "" }: KebabMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`relative ${className}`}
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-geora-black/40 hover:bg-gray-100 hover:text-geora-black transition-colors cursor-pointer"
      >
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-2xl bg-white border border-gray-100 shadow-xl py-1.5 overflow-hidden">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  setIsOpen(false);
                  item.onClick();
                }}
                className={`w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                  item.danger
                    ? "text-geora-rose hover:bg-geora-rose/10"
                    : "text-geora-black hover:bg-gray-50"
                }`}
              >
                {Icon && <Icon size={15} className="shrink-0" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
