"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Menu,
  Home,
  Key,
  PlusCircle,
  User,
  Shield,
  Network,
  Search,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

import GeoraLogo from "@/assets/Geora_Logo.svg";
import GeoraLogo2 from "@/assets/Geora_Logo_Mini.svg";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { createClient } from "@/lib/supabase/client";

// Punto de notificación pulsante (verde Urbik). z-20 + overflow-visible en
// los contenedores que lo usan para que no quede recortado por el botón
// redondeado del dropdown de perfil.
function NotificationDot({ className = "" }: { className?: string }) {
  return (
    <span className={`absolute z-9999 flex h-1.5 w-1.5 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-geora-emerald opacity-75" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-geora-emerald ring-2 ring-geora-black" />
    </span>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarInner />
    </Suspense>
  );
}

function NavbarInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);

  const excludedPaths = ["/auth/login", "/auth/register"];
  const isExcluded = excludedPaths.includes(pathname);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          setRole(data.role || "USER");
        } else {
          setRole("USER");
        }
      } catch {
        setRole("USER");
      }
    };

    const fetchSession = async () => {
      const {
        data: { session: activeSession },
      } = await supabase.auth.getSession();
      setSession(activeSession);
      if (activeSession) await fetchRole();
      setLoading(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await fetchRole();
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Punto de notificación: hay notificaciones (o consultas) sin leer.
  useEffect(() => {
    if (!session) {
      setHasUnread(false);
      return;
    }
    let active = true;
    const check = async () => {
      try {
        const [nRes, iRes] = await Promise.all([
          fetch("/api/notifications"),
          fetch("/api/inquiries"),
        ]);
        const notif = nRes.ok ? await nRes.json() : [];
        const inq = iRes.ok ? await iRes.json() : [];
        const count =
          (Array.isArray(notif)
            ? notif.filter((n: { status?: string }) => n.status === "UNREAD").length
            : 0) +
          (Array.isArray(inq)
            ? inq.filter((i: { status?: string }) => i.status === "UNREAD").length
            : 0);
        if (active) setHasUnread(count > 0);
      } catch {
        if (active) setHasUnread(false);
      }
    };
    check();
    return () => {
      active = false;
    };
  }, [session]);

  if (isExcluded) return null;

  if (loading) {
    return (
      <nav className="fixed z-[1001] bottom-0 top-auto md:bottom-auto md:top-0 left-0 right-0 w-full py-4 px-6 bg-geora-black text-geora-white flex items-center justify-between h-16 md:h-[76px] box-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-xl">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="h-5 w-24 rounded animate-pulse bg-white/10" />
          <div className="flex-1 max-w-2xl h-10 rounded-full animate-pulse bg-white/10" />
          <div className="h-9 w-9 md:w-28 rounded-full animate-pulse bg-white/10" />
        </div>
      </nav>
    );
  }

  const profileOptions = session
    ? [{ label: "Cerrar Sesión", value: "logout" }]
    : [
        { label: "Iniciar Sesión", value: "/auth/login" },
        { label: "Registrarse", value: "/auth/register" },
      ];

  const handleProfileClick = async (value: string) => {
    if (value === "logout") {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } else {
      router.push(value);
    }
  };

  const dropdownLabel = (
    <span className="relative flex items-center gap-2 overflow-visible">
      <span className="hidden md:block">
        {session ? "Mi Perfil" : "Ingresar"}
      </span>
      <Menu className="block md:hidden w-6 h-6" />
    </span>
  );

  type NavItem = {
    href: string;
    label: string;
    short?: string;
    Icon: LucideIcon;
  };

  const getNavItems = (): NavItem[] => {
    if (!session) {
      return [
        { href: "/?operationType=SALE", label: "Comprar", Icon: Home },
        { href: "/?operationType=RENT", label: "Alquilar", Icon: Key },
        { href: "/dashboard?nueva=1", label: "Publicar", Icon: PlusCircle },
      ];
    }

    if (role === "ADMIN" || role === "admin") {
      return [
        {
          href: "/administrate",
          label: "Administrate",
          short: "Admin",
          Icon: Shield,
        },
      ];
    }

    if (role === "REALESTATE") {
      return [
        { href: `/dashboard?nueva=1`, label: "Publicar", Icon: PlusCircle },
        { href: "/dashboard", label: "Mi Perfil", short: "Perfil", Icon: User },
        { href: "/connections", label: "Bolsa", short: "Bolsa", Icon: Network },
        { href: "/", label: "Buscar", Icon: Search },
      ];
    }

    return [
      { href: "/?operationType=SALE", label: "Comprar", Icon: Home },
      { href: "/?operationType=RENT", label: "Alquilar", Icon: Key },
      { href: "/dashboard", label: "Mi Perfil", short: "Perfil", Icon: User },
    ];
  };

  const isNavActive = (href: string) => {
    const [path, qs] = href.split("?");
    if (pathname !== path) return false;
    if (!qs) return !searchParams.toString();
    const params = new URLSearchParams(qs);
    for (const [k, v] of params.entries()) {
      if (searchParams.get(k) !== v) return false;
    }
    return true;
  };

  const renderNavLinks = () => {
    const linkClass =
      "text-sm md:text-base text-geora-white hover:text-white/70 font-semibold transition-colors";
    return getNavItems().map((item) => {
      const showDot = hasUnread && item.href === "/dashboard";
      return (
        <Link key={item.label} href={item.href} className={`relative  overflow-visible ${linkClass}`}>
          {item.label}
          {showDot && <NotificationDot className="-top-0.5 -right-2.5" />}
        </Link>
      );
    });
  };

  const renderMobileNavIcons = () => {
    return getNavItems().map((item) => {
      const active = isNavActive(item.href);
      const Icon = item.Icon;
      const showDot = hasUnread && item.href === "/dashboard";
      return (
        <Link
          key={item.label}
          href={item.href}
          className={`flex flex-col items-center justify-center gap-1 px-1 min-w-0 transition-colors ${
            active ? "text-geora-white" : "text-white/55 hover:text-white/80"
          }`}
        >
          <span className="relative overflow-visible">
            <Icon className="w-[22px] h-[22px] shrink-0" />
            {showDot && <NotificationDot className="-top-0.5 -right-2.5" />}
          </span>
          <span className="text-[10px] font-medium leading-none truncate max-w-full">
            {item.short ?? item.label}
          </span>
        </Link>
      );
    });
  };

  return (
    <>
      <nav className="fixed z-[1001] bottom-0 top-auto md:bottom-auto md:top-0 left-0 right-0 w-full py-3 px-4 md:py-4 md:px-6 bg-geora-black text-geora-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-xl flex items-center h-[60px] md:h-[76px] box-border">
        <div className="relative z-10 max-w-7xl mx-auto w-full md:px-10 h-full flex items-center justify-between gap-2 md:gap-6">
          <div className="shrink-0 flex items-center">
            <Link href="/">
              <Image
                src={GeoraLogo}
                alt="Geora Logo"
                className="hidden md:block w-auto h-5 md:h-7 antialiased subpixel-antialiased"
              />
              <Image
                src={GeoraLogo2}
                alt="Geora Logo Mini"
                className="block md:hidden w-auto h-5 md:h-7 ml-1"
              />
            </Link>
          </div>

          <div className="flex-1 flex justify-center px-1 md:px-4 w-full max-w-3xl mx-auto">
            <div className="flex md:hidden items-center w-full gap-1">
              <div className="flex-1 flex items-center justify-around min-w-0">
                {renderMobileNavIcons()}
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center gap-4 md:gap-8 no-scrollbar whitespace-nowrap px-2 w-full">
              {renderNavLinks()}
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            <CustomDropdown
              label={dropdownLabel}
              value=""
              options={profileOptions}
              onChange={handleProfileClick}
              className="shrink-0"
              variant="white"
            />
          </div>
        </div>
      </nav>
    </>
  );
}