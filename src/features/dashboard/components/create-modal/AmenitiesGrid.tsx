import React from "react";

type LegacyAmenities = {
  agua: boolean;
  luz: boolean;
  gas: boolean;
  internet: boolean;
  cochera: boolean;
  pileta: boolean;
  [key: string]: boolean;
};

type FeatureGroups = Record<string, Record<string, boolean>>;

interface AmenitiesGridProps {
  value: LegacyAmenities;
  featureGroups?: FeatureGroups;
  onChange: (next: LegacyAmenities) => void;
  onFeatureGroupsChange?: (next: FeatureGroups) => void;
}

const GROUPS: Array<{ key: string; label: string; items: string[] }> = [
  {
    key: "ambientes",
    label: "Ambientes",
    items: ["Suite", "Escritorio", "Toilette", "Playroom"],
  },
  {
    key: "exteriores",
    label: "Exteriores",
    items: ["Patio", "Terraza", "Balcón", "Jardín"],
  },
  {
    key: "instalaciones",
    label: "Instalaciones",
    items: ["Calefacción", "Aire acondicionado", "Losa radiante", "Ascensor"],
  },
  {
    key: "infraestructura",
    label: "Infraestructura",
    items: ["Seguridad 24h", "SUM", "Gimnasio", "Laundry"],
  },
  {
    key: "materiales",
    label: "Materiales",
    items: ["Aberturas DVH", "Pisos de madera", "Mesada de granito", "Parrilla"],
  },
];

export function AmenitiesGrid({
  value,
  featureGroups = {},
  onChange,
  onFeatureGroupsChange,
}: AmenitiesGridProps) {
  const toggleLegacy = (k: keyof LegacyAmenities) => {
    onChange({ ...value, [k]: !value[k] });
  };

  const toggleGroup = (groupKey: string, item: string) => {
    if (!onFeatureGroupsChange) return;

    const currentGroup = featureGroups[groupKey] || {};
    onFeatureGroupsChange({
      ...featureGroups,
      [groupKey]: {
        ...currentGroup,
        [item]: !currentGroup[item],
      },
    });
  };

  const LegacyItem = ({ k, label }: { k: keyof LegacyAmenities; label: string }) => (
    <button
      type="button"
      onClick={() => toggleLegacy(k)}
      className={`rounded-full border cursor-pointer w-full focus:border-urbik-black outline-none transition-all px-4 py-2.5 text-left text-sm font-medium flex justify-between items-center group ${
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
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-urbik-black/60 mb-2">
          Servicios básicos
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <LegacyItem k="agua" label="Agua Corriente" />
          <LegacyItem k="luz" label="Luz Eléctrica" />
          <LegacyItem k="gas" label="Gas Natural" />
          <LegacyItem k="internet" label="Internet" />
          <LegacyItem k="cochera" label="Cochera" />
          <LegacyItem k="pileta" label="Pileta" />
        </div>
      </div>

      {onFeatureGroupsChange && (
        <div className="space-y-3">
          {GROUPS.map((group) => {
            const groupValue = featureGroups[group.key] || {};
            return (
              <div key={group.key} className="rounded-2xl border border-gray-200 p-3">
                <p className="text-[11px] font-black uppercase tracking-wider text-urbik-black/60 mb-2">
                  {group.label}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {group.items.map((item) => {
                    const isActive = Boolean(groupValue[item]);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleGroup(group.key, item)}
                        className={`rounded-full border px-3 py-2 text-xs font-bold transition-all ${
                          isActive
                            ? "bg-urbik-emerald text-white border-urbik-emerald"
                            : "border-gray-300 text-urbik-black/70 bg-white"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
