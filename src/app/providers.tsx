/*
Componente de envoltura que utiliza la directiva "use client" para habilitar el estado y los
hooks del lado del cliente en aplicaciones de Next.js. Su función principal es centralizar la
gestión de contextos globales mediante la composición de proveedores, envolviendo a los
componentes hijos (children) con el SessionProvider de NextAuth para manejar la autenticación
y un MapSettingsProvider personalizado para la configuración de mapas. Al implementar este patrón,
se garantiza que toda la jerarquía de componentes que herede de esta función tenga acceso compartido
tanto a la sesión del usuario como a los parámetros del mapa de forma eficiente y organizada.
*/

"use client";

import { SessionProvider } from "next-auth/react";
import { MapSettingsProvider } from "@/features/map/context/MapSettingsProvider";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MapSettingsProvider>{children}</MapSettingsProvider>
    </SessionProvider>
  );
}
