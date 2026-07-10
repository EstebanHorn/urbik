"use client";

import Image from "next/image";
import Link from "next/link";
import { Instagram, Twitter, Facebook, Phone, MapPin } from "lucide-react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function Footer() {
  const pathname = usePathname();
  const supabase = createClient();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        setRole(profile?.role || "USER");
      }
    };
    fetchRole();
  }, [supabase]);

  if (pathname === "/map") return null;

  return (
    <footer className="w-full bg-geora-black2 text-white py-10 sm:py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-4">
          <div className="relative h-12 w-32">
            <Image src="/Geora_Logo_Mini.svg" alt="Geora Logo" fill className="object-contain object-left" priority />
          </div>
          <div className="flex gap-4 mt-2">
            <a href="https://www.instagram.com/geora.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">
              <Instagram size={20} />
            </a>
            <a href="https://x.com/georaapp" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">
              <Twitter size={20} />
            </a>
            <a href="https://www.facebook.com/geora.ar" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">
              <Facebook size={20} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-4 uppercase text-sm tracking-widest text-gray-400">Cuenta</h3>
          <ul className="space-y-2">
            <li><Link href="/dashboard" className="hover:underline">Mi Perfil</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4 uppercase text-sm tracking-widest text-gray-400">Plataforma</h3>
          <ul className="space-y-2">
            {(role === "REALESTATE" || role === "ADMIN" || role === "AGENT") && (
              <li><Link href="/dashboard" className="hover:underline">Mis Propiedades</Link></li>
            )}
            {role === "USER" && (
              <li><Link href="/?operationType=SALE" className="hover:underline">Buscar</Link></li>
            )}
            <li><Link href="/map" className="hover:underline">Mapa</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4 uppercase text-sm tracking-widest text-gray-400">Soporte</h3>
          <ul className="space-y-2">
            <li><Link href="/about-us" className="hover:underline">Sobre Nosotros</Link></li>
            <li><Link href="/contact" className="hover:underline">Contacto</Link></li>
            <li><Link href="/help" className="hover:underline">Ayuda</Link></li>
          </ul>
        </div>
      </div>

      <hr className="my-8 border-white/20" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6 text-sm text-gray-400">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <span className="flex items-center gap-2"><Phone size={16} /> +54 2920 486430</span>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">Términos</Link>
            <Link href="/conditions" className="hover:text-white transition-colors">Condiciones</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
          </div>
          <p>© 2026 Geora. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}