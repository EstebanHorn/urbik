/*
Este fragmento de código implementa la importación dinámica de un componente de React en Next.js
para forzar su renderizado exclusivamente en el lado del cliente (Client-Side Rendering).
Al utilizar dynamic con la opción { ssr: false }, se evita que el componente InteractiveMapClient
se ejecute en el servidor, lo cual es esencial para librerías de mapas (como Leaflet o Google Maps)
que dependen de objetos globales del navegador como window o document. Además, el archivo actúa como
un puente que reexporta los tipos de TypeScript necesarios, permitiendo que el resto de la aplicación
utilice el componente de forma optimizada sin causar errores de hidratación durante el despliegue inicial.
*/

import dynamic from "next/dynamic";
import type { InteractiveMapProps } from "./InteractiveMapClient";

export const InteractiveMap = dynamic(
  () => import("./InteractiveMapClient").then((m) => m.InteractiveMapClient),
  { ssr: false }
);

export type { InteractiveMapProps };
