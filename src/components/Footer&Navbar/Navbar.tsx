"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import Image from "next/image";
import UrbikLogo from "../../assets/Urbik_Logo.svg";
import { motion, AnimatePresence } from "framer-motion";
import { CustomDropdown } from "../CustomDropdown";

function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const excludedPaths = ["/login", "/register"];
  const isExcluded = excludedPaths.includes(pathname);

  const isHome = pathname === "/";

  if (isExcluded) return null;

  if (status === "loading") {
    return (
      <nav className="bg-urbik-black text-urbik-white py-4 px-6 fixed w-full top-0 z-1001 h-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Image src={UrbikLogo} alt="Urbik Logo" className="h-5 w-auto" />
          <div className="flex items-center gap-6">
            <div className="h-9 w-44 bg-white/10 rounded-full animate-pulse" />
            <div className="h-9 w-28 bg-white/10 rounded-full animate-pulse" />
          </div>
        </div>
      </nav>
    );
  }

  const getNavLinks = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return [{ label: "Administrar", href: "/administrate" }];
      case "REALESTATE":
        return [
          { label: "Mis Propiedades", href: "/dashboard" },
          { label: "Propiedades Guardadas", href: "/saved" },
        ];
      case "USER":
        return [{ label: "Propiedades Guardadas", href: "/saved" }];
      default:
        return [{ label: "Mis Propiedades", href: "/dashboard" }];
    }
  };

  const navLinks = getNavLinks(session?.user?.role);

  const profileOptions = session
    ? [
        ...(session.user?.role !== "ADMIN"
          ? [{ label: "Editar Perfil", value: "/profile" }]
          : []),
        { label: "Configuración", value: "/settings" },
        { label: "Cerrar Sesión", value: "logout" },
      ]
    : [
        { label: "Iniciar Sesión", value: "/login" },
        { label: "Registrarse", value: "/register" },
      ];

  const handleProfileClick = (value: string) => {
    if (value === "logout") {
      signOut();
    } else {
      router.push(value);
    }
  };

  return (
    <nav className="bg-urbik-black text-urbik-white py-4 px-6 fixed w-full top-0 z-1001 h-15 flex items-center">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between relative">
        <div className="z-20">
          <Link href="/" className="shrink-0">
            <Image src={UrbikLogo} alt="Urbik Logo" className="h-5 w-auto" />
          </Link>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-8 pointer-events-auto">
            <AnimatePresence mode="wait">
              {!isHome && session && (
                <motion.div
                  initial={{ opacity: 0, width: 0, x: -20 }}
                  animate={{ opacity: 1, width: "320px", x: 0 }}
                  exit={{ opacity: 0, width: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="hidden md:flex relative bg-urbik-gray1 rounded-full"
                >
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-urbik-muted opacity-50" />
                  </div>
                  <div className="w-full py-2 pl-10">
                    <div className="h-4" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="hidden md:flex items-center gap-8 text-sm font-bold tracking-wide">
              {session && (
                <Link
                  href="/"
                  className={`transition-colors duration-300 ${isHome ? "text-urbik-white" : "text-white/40 hover:text-urbik-white"}`}
                >
                  Inicio
                </Link>
              )}

              {session &&
                navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors duration-300 ${pathname === link.href ? "text-urbik-white" : "text-white/40 hover:text-urbik-white"}`}
                  >
                    {link.label}
                  </Link>
                ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 z-20">
          <CustomDropdown
            label={session ? "Mi Perfil" : "Ingresar"}
            value=""
            options={profileOptions}
            onChange={handleProfileClick}
            className="shrink-0"
          />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
