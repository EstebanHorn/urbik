export const JURISDICTIONS_BY_PROVINCE: Record<string, string[]> = {
  "Buenos Aires": [
    "Azul",
    "Bahia Blanca",
    "Dolores",
    "Junin",
    "La Matanza",
    "La Plata",
    "Lomas de Zamora",
    "Mar del Plata",
    "Mercedes",
    "Moreno-General Rodriguez",
    "Moron",
    "Necochea",
    "Pergamino",
    "Quilmes",
    "San Isidro",
    "San Martin",
    "San Nicolas",
    "Trenque Lauquen",
    "Zarate-Campana",
    "Avellaneda-Lanus",
  ],
  "Ciudad Autonoma de Buenos Aires": ["CABA"],
  "Ciudad Autónoma de Buenos Aires": ["CABA"],
};

export function getJurisdictionsByProvince(province?: string | null) {
  if (!province) return [];
  return JURISDICTIONS_BY_PROVINCE[province] ?? [];
}
