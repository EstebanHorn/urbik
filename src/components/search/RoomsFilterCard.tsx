"use client";

const COUNTS = ["1+", "2+", "3+", "4+", "5+"];

type RoomsFilterCardProps = {
  rooms: string[];
  bedrooms: string[];
  bathrooms: string[];
  onChange: (field: "rooms" | "bedrooms" | "bathrooms", value: string | null) => void;
};

function CountGroup({
  label,
  selected,
  field,
  onChange,
}: {
  label: string;
  selected: string[];
  field: "rooms" | "bedrooms" | "bathrooms";
  onChange: (field: "rooms" | "bedrooms" | "bathrooms", value: string | null) => void;
}) {
  const active = selected[0] ?? null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {COUNTS.map((val) => {
          const isActive = active === val;
          return (
            <button
              key={val}
              onClick={() => onChange(field, isActive ? null : val)}
              className={`h-8 min-w-[40px] px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-urbik-black text-white shadow-sm"
                  : "bg-white/50 text-slate-600 hover:bg-white hover:shadow-sm"
              }`}
            >
              {val}
            </button>
          );
        })}
        {active && (
          <button
            onClick={() => onChange(field, null)}
            className="h-8 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default function RoomsFilterCard({ rooms, bedrooms, bathrooms, onChange }: RoomsFilterCardProps) {
  return (
    <div className="flex flex-col gap-5">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ambientes / Habitaciones / Baños</span>
      <CountGroup label="Ambientes" selected={rooms} field="rooms" onChange={onChange} />
      <CountGroup label="Habitaciones" selected={bedrooms} field="bedrooms" onChange={onChange} />
      <CountGroup label="Baños" selected={bathrooms} field="bathrooms" onChange={onChange} />
    </div>
  );
}
