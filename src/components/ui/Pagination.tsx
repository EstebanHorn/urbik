"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ page, totalPages, onChange, className = "" }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-geora-black/60 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-xs font-bold text-geora-black/60">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-geora-black/60 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
