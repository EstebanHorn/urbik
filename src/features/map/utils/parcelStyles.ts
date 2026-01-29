/*
Este código define una serie de configuraciones visuales y una función lógica para
estilizar parcelas geográficas en un mapa utilizando la biblioteca Leaflet. A través de
constantes estáticas (normalParcelStyle, loadedParcelStyle, activeParcelStyle), establece
apariencias predefinidas para diferentes estados de interacción (como una parcela activa
con bordes punteados cian), mientras que la función getDynamicParcelStyle permite asignar
colores de forma dinámica basándose en los datos del modelo de Prisma. Dependiendo del
parámetro colorMode, la función aplica una paleta específica según el tipo de operación
(venta o alquiler) o el tipo de propiedad (casa, departamento, terreno, etc.), devolviendo
un objeto de configuración que Leaflet utiliza para renderizar el polígono en el mapa con
el color correspondiente.
*/

import type { PathOptions } from "leaflet";
import { Property } from "@prisma/client";
export const normalParcelStyle: PathOptions = {
  color: "#00ff8e",
  weight: 0.5,
  fillColor: "transparent",
  fillOpacity: 0,
};

export const loadedParcelStyle: PathOptions = {
  color: "#00ff8e", 
  weight: 2, 
  fillColor: "#00ff8e", 
  fillOpacity: 0.6, 
};

export const activeParcelStyle: PathOptions = {
  color: "#00ff8e",
  weight: 3,
  fillColor: "#00ff8e",
  fillOpacity: 0.5,
  dashArray: "5, 5",
};

export const getDynamicParcelStyle = (
  property: Property, 
  colorMode: "uniform" | "operation" | "propertyType"
): PathOptions => {
  let fillColor = "#00ff8e";

  if (colorMode === "operation") {
    switch (property.operationType) {
      case "SALE": fillColor = "#00ff8e"; break;
      case "RENT": fillColor = "#00deff"; break; 
      case "SALE_RENT": fillColor = "#ff0077"; break;
    }
  } else if (colorMode === "propertyType") {
    switch (property.type) {
      case "HOUSE": fillColor = "#10b981"; break;
      case "APARTMENT": fillColor = "#f59e0b"; break;   
      case "LAND": fillColor = "#84cc16"; break; 
      case "COMMERCIAL_PROPERTY": fillColor = "#ec4899"; break; 
      case "OFFICE": fillColor = "#06b6d4"; break; 
    }
  }

  return {
    color: fillColor, 
    fillColor: fillColor,
    weight: 2,
    fillOpacity: 0.6,
  };
};