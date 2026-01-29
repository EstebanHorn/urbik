/*
Define la configuración y la tipografía de las capas base de un mapa en un entorno TypeScript,
estableciendo una estructura estricta para gestionar diferentes proveedores visuales como Carto,
OpenStreetMap y Esri. A través de la definición del tipo BaseLayerId y el objeto mapBaseLayers,
el código centraliza los metadatos necesarios (URLs de los tiles, etiquetas descriptivas y
créditos de autoría) para cada estilo visual, facilitando su implementación segura. Finalmente,
incluye una constante para la capa predeterminada y un protector de tipo (type guard) llamado
isBaseLayerId que permite validar en tiempo de ejecución si una cadena de texto corresponde a
una de las capas configuradas, garantizando así la integridad de los datos en el resto de la aplicación.
*/

export type BaseLayerId = "cartoLight" | "osm" | "satellite" | "darkMatter";

type BaseLayerConfig = {
  id: BaseLayerId;
  label: string;
  description: string;
  url: string;
  attribution: string;
};

export const mapBaseLayers: Record<BaseLayerId, BaseLayerConfig> = {
  cartoLight: {
    id: "cartoLight",
    label: "Callejero limpio",
    description: "Carto Light, ideal para resaltar capas y datos.",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
  osm: {
    id: "osm",
    label: "Clásico OSM",
    description: "OpenStreetMap estándar, balanceado y familiar.",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    id: "satellite",
    label: "Satelital",
    description: "Fotografía aérea de Esri, ideal para revisar el terreno.",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, IGN y otros",
  },
  darkMatter: {
    id: "darkMatter",
    label: "Oscuro",
    description: "Carto Dark Matter, contraste alto para mapas nocturnos.",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
};

export const defaultBaseLayerId: BaseLayerId = "cartoLight";

export function isBaseLayerId(value: string): value is BaseLayerId {
  return value in mapBaseLayers;
}
