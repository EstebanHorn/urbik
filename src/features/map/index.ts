/*
Este fragmento de código actúa como un punto de entrada o archivo de barril (index file)
cuyo propósito es centralizar y reexportar los componentes, proveedores y tipos de una
biblioteca o módulo de mapas. Al consolidar elementos como el proveedor de contexto
(MapLayersProvider), el hook personalizado (useMapLayers) y diversas capas funcionales
(como StaticParcelsLayer o SelectedParcelLayer), el archivo facilita una interfaz limpia
y organizada para que otros desarrolladores puedan importar múltiples funcionalidades
desde una única ruta, promoviendo así la modularidad y simplificando el mantenimiento
del sistema de mapas interactivos.
*/

export * from "./types/types";

export {
  MapLayersProvider,
  useMapLayers,
} from "./components/MapLayersProvider";

export { InteractiveMap } from "./components/InteractiveMap";

export { ClickToCreateProperty } from "./components/ClickToCreateProperty";
export { StaticParcelsLayer } from "./components/StaticParcelsLayer";
export { DbParcelsLayer } from "./components/DbParcelsLayer";
export { SelectedParcelLayer } from "./components/SelectedParcelLayer";