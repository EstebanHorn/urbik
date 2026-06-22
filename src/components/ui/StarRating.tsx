"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readonly?: boolean;
  className?: string;
}

export default function StarRating({
  value,
  onChange,
  size = 20,
  readonly = false,
  className = "",
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const display = !readonly && hover > 0 ? hover : value;

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= display;
        if (readonly) {
          return (
            <Star
              key={n}
              size={size}
              className={
                active
                  ? "fill-amber-400 text-amber-400"
                  : "fill-geora-g200 text-geora-g400"
              }
              aria-hidden
            />
          );
        }

        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 cursor-pointer hover:scale-110 transition-transform"
            aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
          >
            <Star
              size={size}
              className={
                active
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-geora-g400"
              }
            />
          </button>
        );
      })}
    </div>
  );
}
