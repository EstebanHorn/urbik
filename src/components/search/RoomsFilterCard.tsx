"use client";

const COUNTS = ["1", "2", "3", "4", "+5"];

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
      <span className="text-sm font-bold text-geora-black/80 uppercase">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {COUNTS.map((val) => {
          const isActive = active === val;
          return (
            <button
              key={val}
              onClick={() => onChange(field, isActive ? null : val)}
              className={`h-8 min-w-10 px-3 text-xs transition-all duration-200 cursor-pointer ${
                isActive
                  ? " text-geora-black font-black text-sm"
                  : " text-geora-black/60 font-bold"
              }`}
            >
              {val}
            </button>
          );
        })}
        {active && (
          <button
            onClick={() => onChange(field, null)}
            className="h-8 px-3 text-xs font-bold text-geora-black transition-colors cursor-pointer"
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
      <CountGroup label="Ambientes" selected={rooms} field="rooms" onChange={onChange} />
      <CountGroup label="Habitaciones" selected={bedrooms} field="bedrooms" onChange={onChange} />
      <CountGroup label="Baños" selected={bathrooms} field="bathrooms" onChange={onChange} />
    </div>
  );
}
