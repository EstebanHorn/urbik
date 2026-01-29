/*
Este código define un componente funcional de React llamado Footer para una aplicación Next.js,
el cual renderiza un pie de página responsivo con información de contacto, redes sociales y
enlaces de navegación organizados por categorías. El componente utiliza el hook usePathname para
ocultarse completamente cuando el usuario se encuentra en la ruta /map, emplea useSession de
NextAuth para mostrar condicionalmente ciertos enlaces (como "Mis Propiedades" o "Guardados")
según el rol del usuario (ADMIN, REALESTATE, AGENT o USER), y utiliza Tailwind CSS para el diseño
visual junto con iconos de la librería lucide-react.
*/

"use client";

import Image from "next/image";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
function Footer() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const pathname = usePathname();
if (pathname === "/map") {
    return null;
  }
  return (
    <footer className="w-full bg-urbik-black text-white py-12 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div className="flex flex-col gap-4">
          <div className="relative h-12 w-32">
            <Image 
              src="/Urbik_Logo_Mini.svg" 
              alt="Urbik Logo" 
              fill 
              className="object-contain object-left"
              priority
            />
          </div>
          <div className="flex gap-4 mt-2">
            <a href="#" className="hover:text-gray-400"><Instagram size={20} /></a>
            <a href="mailto:contacto@tuempresa.com" className="hover:text-gray-400"><Mail size={20} /></a>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-4 uppercase text-sm tracking-widest text-gray-400">Cuenta</h3>
          <ul className="space-y-2">
            <li><a href="/profile" className="hover:underline">Mi Perfil</a></li>
            <li><a href="/settings" className="hover:underline">Configuración</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4 uppercase text-sm tracking-widest text-gray-400">Plataforma</h3>
          <ul className="space-y-2">
            {(userRole === "REALESTATE" || userRole === "ADMIN" || userRole === "AGENT") && (
              <li><a href="/dashboard" className="hover:underline">Mis Propiedades</a></li>
            )}

            {userRole === "USER" && (
              <li><a href="/saved" className="hover:underline">Guardados</a></li>
            )}

            <li><a href="/map" className="hover:underline">Mapa</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4 uppercase text-sm tracking-widest text-gray-400">Soporte</h3>
          <ul className="space-y-2">
            <li><a href="/about-us" className="hover:underline">Sobre Nosotros</a></li>
            <li><a href="/contact" className="hover:underline">Contacto</a></li>
            <li><a href="/help" className="hover:underline">Ayuda</a></li>
          </ul>
        </div>
      </div>

      <hr className="my-8 border-white/50" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <span className="flex items-center gap-2">
            <MapPin size={16} /> Calle 7 #1234, La Plata, Buenos Aires
          </span>
          <span className="flex items-center gap-2">
            <Phone size={16} /> +54 221 123-4567
          </span>
        </div>
        <p>© 2026 Urbik. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;